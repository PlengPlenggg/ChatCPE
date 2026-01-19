from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import requests
from app.models.models import Chat, Answer, User
from app.models.database import get_db
from app.config import OPENWEBUI_URL, OPENWEBUI_API_KEY
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class ChatMessage(BaseModel):
    message: str
    user_id: int = None

class ChatResponse(BaseModel):
    chat_id: int
    message: str
    answer: str

@router.post("/send", response_model=ChatResponse)
async def send_message(chat_msg: ChatMessage, db: Session = Depends(get_db)):
    """
    ส่ง message ไปให้ LLM ผ่าน Open WebUI
    บันทึก chat และ answer ลง database
    """
    try:
        logger.info(f"Received message: {chat_msg.message} from user: {chat_msg.user_id}")
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
        
        # เรียก Open WebUI completions API
        response = requests.post(
            f"{OPENWEBUI_URL}/api/chat/completions",
            headers=headers,
            json=payload,
            timeout=60
        )
        
        logger.info(f"Open WebUI response status: {response.status_code}")
        logger.info(f"Open WebUI response: {response.text[:500]}")
        
        if not response.ok:
            logger.error(f"Open WebUI error {response.status_code}: {response.text}")
            # ตอบกลับ error message ที่เข้าใจได้
            if response.status_code == 404:
                raise HTTPException(
                    status_code=503,
                    detail="Open WebUI service not found. Check OPENWEBUI_URL configuration."
                )
            elif response.status_code == 401:
                raise HTTPException(
                    status_code=503,
                    detail="Open WebUI authentication failed. Check OPENWEBUI_API_KEY."
                )
            else:
                raise HTTPException(
                    status_code=503,
                    detail=f"Open WebUI service error: {response.status_code}"
                )
        
        data = response.json()
        logger.info(f"Open WebUI parsed response: {str(data)[:500]}")
        
        # ดึง response จาก Open WebUI
        try:
            llm_response = data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as e:
            logger.error(f"Failed to parse Open WebUI response: {str(e)}")
            llm_response = "Sorry, I couldn't parse the response properly."
        
        # บันทึก chat ลง database เฉพาะเมื่อมี user_id (ไม่ใช่ guest)
        chat_id = None
        if chat_msg.user_id:
            chat = Chat(
                user_id=chat_msg.user_id,
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
            answer=llm_response
        )
        
    except HTTPException:
        raise
    except requests.exceptions.Timeout:
        logger.error("Open WebUI timeout")
        raise HTTPException(
            status_code=504,
            detail="LLM service timeout. Please try again later."
        )
    except requests.exceptions.ConnectionError as e:
        logger.error(f"Connection error to Open WebUI: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail="Cannot connect to Open WebUI. Check if service is running and OPENWEBUI_URL is correct."
        )
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail=f"Error communicating with LLM: {str(e)}"
        )
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


@router.get("/history/{user_id}")
async def get_chat_history(user_id: int, db: Session = Depends(get_db)):
    """
    ดึงประวัติการสนทนาของผู้ใช้
    รวมทั้ง chat messages และ answers จาก LLM
    """
    try:
        chats = db.query(Chat).filter(Chat.user_id == user_id).order_by(Chat.created_at.desc()).all()
        
        result = []
        for chat in chats:
            result.append({
                "id": chat.id,
                "message": chat.message,
                "created_at": chat.created_at.isoformat() if chat.created_at else None,
                "answers": [
                    {
                        "id": ans.id,
                        "answer": ans.answer,
                        "llm_provider": ans.llm_provider,
                        "created_at": ans.created_at.isoformat() if ans.created_at else None
                    }
                    for ans in chat.answers
                ]
            })
        
        return result
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

@router.get("/history/{user_id}")
async def get_chat_history(user_id: int, db: Session = Depends(get_db)):
    """ดึง chat history ของผู้ใช้"""
    chats = db.query(Chat).filter(Chat.user_id == user_id).order_by(Chat.created_at.desc()).all()
    
    # จัดรูปแบบ response เพื่อให้ frontend ใช้ได้
    result = []
    for chat in chats:
        answers = db.query(Answer).filter(Answer.chat_id == chat.id).all()
        chat_data = {
            "id": chat.id,
            "user_id": chat.user_id,
            "message": chat.message,
            "answers": [{"answer": ans.answer, "llm_provider": ans.llm_provider} for ans in answers],
            "created_at": chat.created_at
        }
        result.append(chat_data)
    
    return result