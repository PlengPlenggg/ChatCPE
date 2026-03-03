from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.models import FAQ
from app.models.database import get_db, SessionLocal
from pydantic import BaseModel
from typing import Optional
from app.api.auth import require_roles
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

def seed_sample_faqs() -> None:
    db = SessionLocal()
    try:
        if db.query(FAQ).count() == 0:
            sample_faqs = [
                FAQ(
                    question="หลักสูตรวิศวกรรมคอมพิวเตอร์แต่ละปี เรียนอะไรบ้าง",
                    answer="โดยภาพรวม ปี 1 จะเป็นวิชาพื้นฐาน เช่น คณิตศาสตร์ วิทยาศาสตร์ และการเขียนโปรแกรมเบื้องต้น\nปี 2 จะเริ่มเรียนวิชาแกนของภาค เช่น โครงสร้างข้อมูล ระบบดิจิทัล และซอฟต์แวร์พื้นฐาน\nปี 3 จะเป็นวิชาเฉพาะทางมากขึ้น รวมถึงวิชาเลือก\nปี 4 จะเน้นวิชาเลือกเชิงลึก การทำโปรเจค",
                    category="Course",
                    display_order=1,
                    is_active=True,
                ),
                FAQ(
                    question="ลง GENxxx เป็นวิชาช่วย / วิชาเลือกเสรี (XXXxxx) ได้หรือไม่",
                    answer="สามารถลงได้ขึ้นอยู่กับโครงสร้างหลักสูตรและแผนการเรียนของนักศึกษาแต่ละคน แนะนำให้ตรวจสอบแผนการเรียนหรือสอบถามภาควิชาก่อนลงทะเบียน",
                    category="Course",
                    display_order=2,
                    is_active=True,
                ),
                FAQ(
                    question="นักศึกษาสามารถติดต่อภาควิชาได้ผ่านช่องทางใด และในเวลาไหน",
                    answer="นักศึกษาสามารถติดต่อภาควิชาได้ที่ชั้น 10 และผ่านช่องทางที่ภาคกำหนด เช่น แชทหรือเพจ ในวันและเวลาราชการ หากติดต่อนอกเวลาสามารถฝากข้อความไว้ได้",
                    category="Contact",
                    display_order=3,
                    is_active=True,
                ),
                FAQ(
                    question="เวลาสอบชนกัน / ทับซ้อน / คาบเกี่ยวกัน ทำเรื่องขอเลื่อนสอบได้หรือไม่",
                    answer="สามารถทำเรื่องขอเลื่อนสอบได้ (สทน.19) ขอลงทะเบียนรายวิชาที่มีเวลาสอบซ้อน โดยต้องรีบแจ้งอาจารย์ผู้สอน พร้อมแนบตารางสอบเป็นหลักฐาน ทั้งนี้การอนุญาตขึ้นอยู่กับดุลยพินิจของอาจารย์ผู้สอน",
                    category="Exam",
                    display_order=4,
                    is_active=True,
                ),
                FAQ(
                    question="ถ้าถอนรายวิชาแล้วจำนวนหน่วยกิตรวมที่ลงทะเบียนต่ำกว่ากำหนด (ป.ตรี ขั้นต่ำ 12 หน่วยกิต) ได้ไหม",
                    answer="สามารถทำเรื่องยื่นคำร้องขอลงทะเบียนต่ำกว่ากำหนด (สทน.18)",
                    category="Withdrawal",
                    display_order=5,
                    is_active=True,
                ),
                FAQ(
                    question="จ่ายค่าเทอมช้าหรือผ่อนผันค่าเทอมได้ไหม",
                    answer="สามารถขอผ่อนผันหรือจ่ายล่าช้าได้ตามเงื่อนไขของมหาวิทยาลัย โดยต้องยื่นคำร้องและดำเนินการตามขั้นตอนที่กำหนด",
                    category="Payment",
                    display_order=6,
                    is_active=True,
                ),
                FAQ(
                    question="บางปีชั่วโมงกิจกรรมไม่ครบ 25 ชม. แต่รวมแล้วเกิน 100 ชม. จะมีปัญหาตอนจบไหม",
                    answer="การพิจารณาชั่วโมงกิจกรรมจะดูตามเกณฑ์ของหลักสูตรเป็นหลัก หากรวมชั่วโมงครบตามที่กำหนดแล้ว โดยปกติจะไม่มีปัญหา",
                    category="Requirements",
                    display_order=7,
                    is_active=True,
                ),
                FAQ(
                    question="ทุกคนต้องสอบ TETET ไหม",
                    answer="ต้องสอบตามเงื่อนไขของหลักสูตร หากไม่เข้าสอบหรือไม่ผ่านเกณฑ์ อาจมีผลต่อการยื่นจบการศึกษา",
                    category="Exam",
                    display_order=8,
                    is_active=True,
                ),
            ]
            db.add_all(sample_faqs)
            db.commit()
            logger.info("Seeded %s sample FAQs", len(sample_faqs))
    finally:
        db.close()

class FAQCreate(BaseModel):
    question: str
    answer: str
    category: Optional[str] = None
    display_order: int = 0
    is_active: bool = True


class FAQUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    category: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None

@router.get("/")
async def get_all_faqs(
    active: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    query = db.query(FAQ)
    if active is not None:
        query = query.filter(FAQ.is_active == active)
    faqs = query.order_by(FAQ.display_order.asc(), FAQ.created_at.asc()).all()
    return faqs

@router.get("/{faq_id}")
async def get_faq(faq_id: int, db: Session = Depends(get_db)):
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    return faq

@router.post("/")
async def create_faq(
    faq: FAQCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["admin", "staff"])),
):
    new_faq = FAQ(
        question=faq.question,
        answer=faq.answer,
        category=faq.category,
        display_order=faq.display_order,
        is_active=faq.is_active,
    )
    db.add(new_faq)
    db.commit()
    db.refresh(new_faq)
    return new_faq


@router.put("/{faq_id}")
async def update_faq(
    faq_id: int,
    payload: FAQUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["admin", "staff"])),
):
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")

    if payload.question is not None:
        faq.question = payload.question
    if payload.answer is not None:
        faq.answer = payload.answer
    if payload.category is not None:
        faq.category = payload.category
    if payload.display_order is not None:
        faq.display_order = payload.display_order
    if payload.is_active is not None:
        faq.is_active = payload.is_active

    db.commit()
    db.refresh(faq)
    return faq

@router.delete("/{faq_id}")
async def delete_faq(
    faq_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["admin", "staff"])),
):
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    db.delete(faq)
    db.commit()
    return {"message": "FAQ deleted"}