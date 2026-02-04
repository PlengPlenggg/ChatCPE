from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import requests
import uuid
from datetime import datetime
from app.models.models import Chat, Answer, User
from app.models.database import get_db
from app.config import OPENWEBUI_URL, OPENWEBUI_API_KEY
from app.api.auth import get_current_user, get_current_user_optional
from pydantic import BaseModel
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class ChatMessage(BaseModel):
    message: str
    thread_id: str  # ID ของ thread ที่จะส่งข้อความไป
    user_id: Optional[int] = None

class ChatResponse(BaseModel):
    chat_id: Optional[int]
    message: str
    answer: str
    thread_id: str

class ThreadData(BaseModel):
    id: str
    title: str
    created_at: str
    messages: List[dict]

@router.post("/send", response_model=ChatResponse)
async def send_message(
    chat_msg: ChatMessage, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    ส่ง message ไปให้ LLM ผ่าน Open WebUI
    บันทึก chat และ answer ลง database (ถ้า authenticated user)
    รองรับทั้ง guest mode (ไม่บันทึก) และ logged-in mode (บันทึก)
    """
    try:
        user_id_from_msg = chat_msg.user_id or (current_user.id if current_user else None)
        thread_id = chat_msg.thread_id
        logger.info(f"Received message: {chat_msg.message} from user/guest: {user_id_from_msg}, thread: {thread_id}")
        logger.info(f"Calling Open WebUI at: {OPENWEBUI_URL}")
        
        # ส่ง message ไปให้ Open WebUI
        headers = {"Content-Type": "application/json"}
        if OPENWEBUI_API_KEY:
            headers["Authorization"] = f"Bearer {OPENWEBUI_API_KEY}"
        
        payload = {
            "model": "default",
            "messages": [
                {"role": "user", "content": chat_msg.message}
            ],
            "stream": False
        }
        logger.info(f"Payload: {payload}")
        
        # Try to call Open WebUI, but fall back to mock response if unavailable
        llm_response = None
        try:
            response = requests.post(
                f"{OPENWEBUI_URL}/api/chat/completions",
                headers=headers,
                json=payload,
                timeout=5  # Reduced timeout to 5 seconds
            )
            
            logger.info(f"Open WebUI response status: {response.status_code}")
            
            if response.ok:
                data = response.json()
                logger.info(f"Open WebUI parsed response: {str(data)[:500]}")
                try:
                    llm_response = data["choices"][0]["message"]["content"]
                except (KeyError, IndexError, TypeError) as e:
                    logger.error(f"Failed to parse Open WebUI response: {str(e)}")
            else:
                logger.warning(f"Open WebUI returned error {response.status_code}")
                
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout) as e:
            logger.warning(f"Open WebUI unavailable: {str(e)}. Using mock response.")
        
        # If Open WebUI failed, use a mock response
        if not llm_response:
            llm_response = f"ขอบคุณสำหรับคำถาม: '{chat_msg.message}'\n\nขณะนี้ระบบ AI กำลังอยู่ในช่วงปรับปรุง ดังนั้นจึงไม่สามารถตอบคำถามได้ในขณะนี้\n\nกรุณาติดต่อเจ้าหน้าที่เพื่อขอความช่วยเหลือ หรือลองใหม่อีกครั้งในภายหลัง"
            logger.info("Using mock response due to Open WebUI unavailability")
        
        # บันทึก chat ลง database เฉพาะเมื่อมี user_id (logged-in user)
        chat_id = None
        if user_id_from_msg:
            chat = Chat(
                user_id=user_id_from_msg,
                thread_id=thread_id,
                message=chat_msg.message,
            )
            db.add(chat)
            db.flush()  # flush เพื่อให้ได้ chat.id
            
            # บันทึก answer
            answer = Answer(
                chat_id=chat.id,
                llm_provider="open_webui",
                answer=llm_response
            )
            db.add(answer)
            db.commit()
            db.refresh(chat)
            db.refresh(answer)
            chat_id = chat.id
            logger.info(f"Saved chat {chat.id} and answer successfully")
        else:
            logger.info("Guest mode - not saving chat history")
        
        return ChatResponse(
            chat_id=chat_id or 0,
            message=chat_msg.message,
            answer=llm_response,
            thread_id=thread_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Server error: {str(e)}"
        )

@router.get("/health")
async def chat_health():
    """ตรวจสอบการเชื่อมต่อ Open WebUI"""
    try:
        response = requests.get(
            f"{OPENWEBUI_URL}/api/status",
            timeout=5
        )
        if response.ok:
            return {
                "status": "healthy",
                "openwebui_url": OPENWEBUI_URL,
                "openwebui_status": response.status_code
            }
        else:
            return {
                "status": "warning",
                "openwebui_url": OPENWEBUI_URL,
                "openwebui_status": response.status_code,
                "message": "Open WebUI responding but with error"
            }
    except Exception as e:
        return {
            "status": "unhealthy",
            "openwebui_url": OPENWEBUI_URL,
            "error": str(e),
            "message": "Cannot connect to Open WebUI"
        }


@router.post("/threads/create")
async def create_thread(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    สร้าง thread ใหม่สำหรับการสนทนา
    """
    try:
        thread_id = str(uuid.uuid4())
        return {
            "thread_id": thread_id,
            "created_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Error creating thread: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_chat_history(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    ดึงประวัติการสนทนาของผู้ใช้ แยกเป็น threads
    """
    try:
        chats = db.query(Chat).filter(Chat.user_id == current_user.id).order_by(Chat.created_at.asc()).all()
        
        # จัดกลุ่มข้อความตามแต่ละ thread
        threads_dict = {}
        
        for chat in chats:
            thread_id = chat.thread_id
            if thread_id not in threads_dict:
                threads_dict[thread_id] = {
                    "id": thread_id,
                    "messages": [],
                    "created_at": chat.created_at.isoformat() if chat.created_at else None
                }
            
            # เพิ่ม user message
            threads_dict[thread_id]["messages"].append({
                "id": chat.id,
                "role": "user",
                "text": chat.message,
                "created_at": chat.created_at.isoformat() if chat.created_at else None
            })
            
            # เพิ่ม bot answers
            for answer in chat.answers:
                threads_dict[thread_id]["messages"].append({
                    "id": answer.id,
                    "role": "bot",
                    "text": answer.answer,
                    "created_at": answer.created_at.isoformat() if answer.created_at else None
                })
        
        # สร้าง title สำหรับแต่ละ thread จากข้อความแรก
        threads_list = []
        for thread_id, thread_data in threads_dict.items():
            first_message = next((msg for msg in thread_data["messages"] if msg["role"] == "user"), None)
            title = first_message["text"][:50] + "..." if first_message and len(first_message["text"]) > 50 else (first_message["text"] if first_message else "Untitled")
            
            threads_list.append({
                "id": thread_id,
                "title": title,
                "created_at": thread_data["created_at"],
                "messages": thread_data["messages"]
            })
        
        # เรียงลำดับจากล่าสุดมาก่อน
        threads_list.sort(key=lambda x: x["created_at"], reverse=True)
        
        return threads_list
    except Exception as e:
        logger.error(f"Error getting chat history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/test-openwebui")
async def test_openwebui():
    """ทดสอบการเชื่อมต่อและเรียก Open WebUI"""
    try:
        logger.info(f"Testing connection to {OPENWEBUI_URL}/api/chat/completions")
        
        response = requests.post(
            f"{OPENWEBUI_URL}/api/chat/completions",
            json={
                "model": "default",
                "messages": [{"role": "user", "content": "test"}],
                "stream": False
            },
            timeout=10
        )
        
        logger.info(f"Response status: {response.status_code}")
        logger.info(f"Response: {response.text}")
        
        return {
            "success": response.ok,
            "status_code": response.status_code,
            "response": response.json() if response.ok else response.text
        }
    except Exception as e:
        logger.error(f"Test failed: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "openwebui_url": OPENWEBUI_URL
        }


@router.delete("/history")
async def delete_chat_history(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    ลบประวัติการสนทนาของผู้ใช้ (ทั้ง Chat และ Answer)
    """
    try:
        chats = db.query(Chat).filter(Chat.user_id == current_user.id).all()
        if not chats:
            return {"message": "No chat history to delete"}

        chat_ids = [c.id for c in chats]
        db.query(Answer).filter(Answer.chat_id.in_(chat_ids)).delete(synchronize_session=False)
        db.query(Chat).filter(Chat.id.in_(chat_ids)).delete(synchronize_session=False)
        db.commit()
        return {"message": "Chat history deleted successfully"}
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting chat history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))