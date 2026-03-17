from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import requests
import uuid
from datetime import datetime, timedelta
from collections import Counter
import csv
import io
import re
import time
import asyncio
from app.models.models import Chat, Answer, User
from app.models.database import get_db
from app.config import (
    OPENWEBUI_URL,
    OPENWEBUI_API_KEY,
    RAG_SERVICE_URL,
    RAG_REQUEST_TIMEOUT_SECONDS,
    RAG_MAX_RETRIES,
    RAG_RETRY_DELAY_SECONDS,
    RAG_MAX_TOTAL_WAIT_SECONDS,
)
from app.api.auth import get_current_user, get_current_user_optional, require_roles
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


def normalize_question_text(text: str) -> str:
    normalized = (text or "").strip().lower()
    normalized = re.sub(r"\s+", " ", normalized)
    return normalized


def extract_rag_answer(payload: object) -> Optional[str]:
    if isinstance(payload, dict):
        direct_fields = ["answer", "response", "text", "result"]
        for key in direct_fields:
            value = payload.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()

        data_obj = payload.get("data")
        if isinstance(data_obj, dict):
            for key in direct_fields:
                value = data_obj.get(key)
                if isinstance(value, str) and value.strip():
                    return value.strip()

    if isinstance(payload, str) and payload.strip():
        return payload.strip()

    return None


async def request_rag_answer(question: str) -> Optional[str]:
    headers = {"Content-Type": "application/json"}
    payload = {"question": question}

    attempts = max(1, int(RAG_MAX_RETRIES))
    raw_timeout = float(RAG_REQUEST_TIMEOUT_SECONDS)
    timeout_disabled = raw_timeout <= 0
    timeout_per_attempt = None if timeout_disabled else max(2.0, raw_timeout)
    retry_delay = max(0.2, float(RAG_RETRY_DELAY_SECONDS))
    max_total_wait = float(RAG_MAX_TOTAL_WAIT_SECONDS)
    total_timeout_budget = max_total_wait if max_total_wait > 0 else None
    if total_timeout_budget is None and timeout_per_attempt is not None:
        total_timeout_budget = (timeout_per_attempt * attempts) + (retry_delay * max(0, attempts - 1)) + 1.0
    started_at = time.monotonic()

    if timeout_disabled:
        logger.info(
            "RAG config: url=%s timeout=disabled attempts=%s retry_delay=%.1fs max_total_wait=%s",
            RAG_SERVICE_URL,
            attempts,
            retry_delay,
            "disabled" if total_timeout_budget is None else f"{total_timeout_budget:.1f}s",
        )
    else:
        logger.info(
            "RAG config: url=%s timeout_per_attempt=%.1fs attempts=%s retry_delay=%.1fs budget=%s",
            RAG_SERVICE_URL,
            timeout_per_attempt,
            attempts,
            retry_delay,
            "disabled" if total_timeout_budget is None else f"{total_timeout_budget:.1f}s",
        )

    for attempt in range(1, attempts + 1):
        remaining_budget = None
        if total_timeout_budget is not None:
            elapsed = time.monotonic() - started_at
            remaining_budget = total_timeout_budget - elapsed
            if remaining_budget <= 0:
                logger.warning("RAG budget exceeded before attempt %s", attempt)
                break

        per_attempt_timeout = timeout_per_attempt
        if timeout_per_attempt is None and remaining_budget is not None:
            per_attempt_timeout = max(0.1, remaining_budget)
        elif timeout_per_attempt is not None and remaining_budget is not None:
            # Increase timeout window on later attempts for slow queries.
            scaled_timeout = timeout_per_attempt * attempt
            per_attempt_timeout = min(scaled_timeout, max(0.1, remaining_budget))

        try:
            response = requests.post(
                f"{RAG_SERVICE_URL}/rag/answer",
                headers=headers,
                json=payload,
                timeout=per_attempt_timeout,
            )

            logger.info(
                "RAG attempt %s/%s status=%s timeout=%s",
                attempt,
                attempts,
                response.status_code,
                "disabled" if per_attempt_timeout is None else f"{per_attempt_timeout:.1f}s",
            )

            if not response.ok:
                logger.warning("RAG returned non-OK status on attempt %s", attempt)
            else:
                try:
                    parsed = response.json()
                except ValueError:
                    parsed = response.text

                answer = extract_rag_answer(parsed)
                if answer:
                    logger.info("RAG answered successfully on attempt %s", attempt)
                    return answer

                logger.warning("RAG response on attempt %s had no usable answer", attempt)

        except requests.exceptions.Timeout as err:
            timeout_label = "disabled" if per_attempt_timeout is None else f"{per_attempt_timeout:.1f}s"
            budget_label = "disabled" if remaining_budget is None else f"{remaining_budget:.1f}s"
            logger.warning(
                "RAG timeout on attempt %s/%s after %s (remaining budget %s): %s",
                attempt,
                attempts,
                timeout_label,
                budget_label,
                str(err),
            )
        except requests.exceptions.RequestException as err:
            logger.warning("RAG request error on attempt %s/%s: %s", attempt, attempts, str(err))

        if attempt < attempts:
            backoff = retry_delay * attempt
            if total_timeout_budget is None:
                sleep_time = backoff
            else:
                elapsed = time.monotonic() - started_at
                remaining_budget = total_timeout_budget - elapsed
                if remaining_budget <= 0:
                    break
                sleep_time = min(backoff, remaining_budget)
            logger.info("Retrying RAG in %.1f seconds", sleep_time)
            await asyncio.sleep(sleep_time)

    return None

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
        
        logger.info(f"Calling RAG Service at: {RAG_SERVICE_URL}")
        llm_response = await request_rag_answer(chat_msg.message)
        
        # If RAG Service failed, use a mock response
        if not llm_response:
            llm_response = f"ขอบคุณสำหรับคำถาม: '{chat_msg.message}'\n\nขณะนี้ระบบ AI กำลังอยู่ในช่วงปรับปรุง ดังนั้นจึงไม่สามารถตอบคำถามได้ในขณะนี้\n\nกรุณาติดต่อเจ้าหน้าที่เพื่อขอความช่วยเหลือ หรือลองใหม่อีกครั้งในภายหลัง"
            logger.info("Using mock response due to RAG Service unavailability")
        
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
                llm_provider="rag_service",
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


@router.delete("/threads/{thread_id}")
async def delete_chat_thread(
    thread_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    ลบประวัติการสนทนาเฉพาะ thread_id ของผู้ใช้
    """
    try:
        chats = (
            db.query(Chat)
            .filter(Chat.user_id == current_user.id, Chat.thread_id == thread_id)
            .all()
        )
        if not chats:
            return {"message": "Thread not found"}

        chat_ids = [c.id for c in chats]
        db.query(Answer).filter(Answer.chat_id.in_(chat_ids)).delete(synchronize_session=False)
        db.query(Chat).filter(Chat.id.in_(chat_ids)).delete(synchronize_session=False)
        db.commit()
        return {"message": "Thread deleted successfully"}
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting chat thread: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics")
async def get_chat_analytics(
    db: Session = Depends(get_db),
    days: Optional[int] = Query(default=None, ge=1, le=365),
    current_user: User = Depends(require_roles(["admin"]))
):
    """
    Dashboard analytics สำหรับแอดมิน:
    - คำถามที่ถูกถามบ่อยที่สุด
    - ช่วงเวลาที่มีการใช้งานสูงสุด
    - รองรับ filter ตามจำนวนวันย้อนหลังด้วย query param `days`
    """
    try:
        chats_query = db.query(Chat)
        if days is not None:
            cutoff = datetime.utcnow() - timedelta(days=days)
            chats_query = chats_query.filter(Chat.created_at >= cutoff)

        chats = chats_query.order_by(Chat.created_at.asc()).all()
        daily_window_days = days if days is not None else 30

        if not chats:
            return {
                "total_questions": 0,
                "unique_users": 0,
                "top_questions": [],
                "hourly_usage": [{"hour": h, "count": 0} for h in range(24)],
                "daily_usage": [],
                "weekday_usage": [
                    {"day": day, "count": 0}
                    for day in ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
                ],
                "peak_hour": {"hour": 0, "count": 0, "label": "00:00 - 00:59"},
                "peak_day": {"date": None, "count": 0},
                "generated_at": datetime.utcnow().isoformat(),
                "applied_range_days": days
            }

        question_counter: Counter[str] = Counter()
        hour_counter: Counter[int] = Counter()
        day_counter: Counter[str] = Counter()
        weekday_counter: Counter[int] = Counter()
        distinct_users = set()

        for chat in chats:
            normalized = normalize_question_text(chat.message)
            if normalized:
                question_counter[normalized] += 1

            if chat.created_at:
                hour_counter[chat.created_at.hour] += 1
                day_counter[chat.created_at.date().isoformat()] += 1
                weekday_counter[chat.created_at.weekday()] += 1

            if chat.user_id is not None:
                distinct_users.add(chat.user_id)

        top_questions = [
            {"question": question, "count": count}
            for question, count in question_counter.most_common(10)
        ]

        hourly_usage = [
            {"hour": hour, "count": hour_counter.get(hour, 0)}
            for hour in range(24)
        ]

        today = datetime.utcnow().date()
        daily_usage = []
        for offset in range(daily_window_days - 1, -1, -1):
            date_value = today - timedelta(days=offset)
            date_key = date_value.isoformat()
            daily_usage.append({
                "date": date_key,
                "count": day_counter.get(date_key, 0)
            })

        weekday_labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        weekday_usage = [
            {"day": weekday_labels[idx], "count": weekday_counter.get(idx, 0)}
            for idx in range(7)
        ]

        peak_hour, peak_hour_count = max(hour_counter.items(), key=lambda item: item[1], default=(0, 0))
        peak_day, peak_day_count = max(day_counter.items(), key=lambda item: item[1], default=(None, 0))

        return {
            "total_questions": len(chats),
            "unique_users": len(distinct_users),
            "top_questions": top_questions,
            "hourly_usage": hourly_usage,
            "daily_usage": daily_usage,
            "weekday_usage": weekday_usage,
            "peak_hour": {
                "hour": peak_hour,
                "count": peak_hour_count,
                "label": f"{peak_hour:02d}:00 - {peak_hour:02d}:59"
            },
            "peak_day": {
                "date": peak_day,
                "count": peak_day_count
            },
            "generated_at": datetime.utcnow().isoformat(),
            "applied_range_days": days
        }
    except Exception as e:
        logger.error(f"Error getting chat analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/export-csv")
async def export_chat_logs_csv(
    db: Session = Depends(get_db),
    days: Optional[int] = Query(default=None, ge=1, le=365),
    current_user: User = Depends(require_roles(["admin"]))
):
    """
    Export คำถาม-คำตอบของผู้ใช้ทั้งหมด (ที่บันทึกในระบบ) เป็น CSV
    รองรับ filter ช่วงวันย้อนหลังด้วย query param `days`
    """
    try:
        def normalize_text(value: Optional[str]) -> str:
            if not value:
                return ""
            # Flatten line breaks/tabs to keep row heights compact in Excel.
            cleaned = re.sub(r"[\r\n\t]+", " ", value)
            cleaned = re.sub(r"\s{2,}", " ", cleaned).strip()
            return cleaned

        def safe_csv_cell(value: Optional[str]) -> str:
            text = normalize_text(value)
            # Prevent Excel from interpreting content as formula (#NAME?, CSV injection, etc.).
            if text.startswith(("=", "+", "-", "@")):
                return f"'{text}"
            return text

        query = (
            db.query(Chat, User, Answer)
            .outerjoin(User, Chat.user_id == User.id)
            .outerjoin(Answer, Answer.chat_id == Chat.id)
        )

        if days is not None:
            cutoff = datetime.utcnow() - timedelta(days=days)
            query = query.filter(Chat.created_at >= cutoff)

        rows = query.order_by(Chat.created_at.desc(), Answer.created_at.asc()).all()

        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow([
            "user_id",
            "user_name",
            "user_email",
            "question",
            "answer"
        ])

        def to_utc_iso(value: Optional[datetime]) -> str:
            if not value:
                return ""
            return value.replace(microsecond=0).isoformat() + "Z"

        for chat, user, answer in rows:
            writer.writerow([
                chat.user_id or "",
                safe_csv_cell(user.name if user else ""),
                safe_csv_cell(user.email if user else ""),
                safe_csv_cell(chat.message),
                safe_csv_cell(answer.answer if answer else "")
            ])

        # Prefix UTF-8 BOM so Excel on Windows detects Thai text correctly.
        content = "\ufeff" + output.getvalue()
        output.close()

        generated = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        filename = f"chat_logs_{generated}.csv"

        return StreamingResponse(
            iter([content]),
            media_type="text/csv; charset=utf-8",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        logger.error(f"Error exporting chat logs csv: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))