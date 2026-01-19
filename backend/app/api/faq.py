from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.models import FAQ
from app.models.database import get_db
from pydantic import BaseModel
from typing import Optional
from app.api.auth import require_roles

router = APIRouter()

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