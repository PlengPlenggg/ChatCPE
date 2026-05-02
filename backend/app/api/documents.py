from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import requests
from bs4 import BeautifulSoup
import logging
from urllib.parse import urljoin

logger = logging.getLogger(__name__)
router = APIRouter()

FORMS_URL = "https://regis.kmutt.ac.th/web/form/"
REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "th-TH,th;q=0.9,en;q=0.8",
}

FALLBACK_FORM_ITEMS = [
    {"code": "สทน. 01 : RO.01", "title": "คำร้องทั่วไป / General Request Form", "url": "https://regis.kmutt.ac.th/service/form/RO-01.pdf"},
    {"code": "สทน. 03 : RO.03", "title": "หนังสือรับรองของผู้ปกครอง / Recommendation Letter of Parent/Guardian", "url": "https://regis.kmutt.ac.th/service/form/RO-03.pdf"},
    {"code": "สทน. 04 : RO.04", "title": "ใบมอบฉันทะ / Authorization Form", "url": "https://regis.kmutt.ac.th/service/form/RO-04.pdf"},
    {"code": "สทน. 08 : RO.08", "title": "คำร้องขอคืนเงินค่าลงทะเบียน / Request Form for Registration Reimbursement", "url": "https://regis.kmutt.ac.th/service/form/RO-08.pdf"},
    {"code": "สทน. 11 : RO.11", "title": "คำร้องขอเลื่อนรับพระราชทานปริญญาบัตร / Request Form for Postponing the Graduation", "url": "https://regis.kmutt.ac.th/service/form/RO-11.pdf"},
    {"code": "สทน. 12 : RO.12", "title": "คำร้องขอลาพักการศึกษา / Request Form for Intermission Leave", "url": "https://regis.kmutt.ac.th/service/form/RO-12Updated.pdf"},
    {"code": "สทน. 13 : RO.13", "title": "คำร้องขอลาออก ***update** / Request Form for Resignation", "url": "https://regis.kmutt.ac.th/service/form/RO-13Updated.pdf"},
    {"code": "สทน. 14 : RO.14", "title": "คำร้องขอเปลี่ยนแปลงข้อมูลในทะเบียนประวัติ / Request Form for Changing Information in Student Record", "url": "https://regis.kmutt.ac.th/service/form/RO-14.pdf"},
    {"code": "สทน. 15 : RO.15", "title": "คำร้องขอทำบัตรนักศึกษา มจธ.- ธนาคารกรุงเทพ / Request Form for KMUTT-BANGKOK Bank Student Id. Card", "url": "https://regis.kmutt.ac.th/service/form/RO-15_160718.pdf"},
    {"code": "สทน. 16 : RO.16", "title": "คำร้องขอลาป่วย/ลากิจ / Request Form for Sick/Business Leave", "url": "https://regis.kmutt.ac.th/service/form/RO-16.pdf"},
    {"code": "สทน. 18 : RO.18", "title": "คำร้องขอลงทะเบียนต่ำกว่า/เกินกว่าหน่วยกิตที่กำหนด / Request Form for Registering Less/More than Required Credits", "url": "https://regis.kmutt.ac.th/service/form/RO-18Updated.pdf"},
    {"code": "สทน. 19 : RO.19", "title": "คำร้องขอลงทะเบียนในรายวิชาที่มีเวลาสอบซ้อน / Permission Form for Registration with Examination Time Conflict", "url": "https://regis.kmutt.ac.th/service/form/RO-19.pdf"},
    {"code": "สทน. 20 : RO.20", "title": "คำร้องขอลงทะเบียนรายวิชานอกหลักสูตร / Request Form for Registration of Non-Requisite Course", "url": "https://regis.kmutt.ac.th/service/form/RO-20.pdf"},
    {"code": "สทน. 21 : RO.21", "title": "คำร้องขอลงทะเบียนเรียนแบบบุคคลภายนอก / Request Form for Degree Registraion forVisitor", "url": "https://regis.kmutt.ac.th/service/form/RO-21.pdf"},
    {"code": "สทน. 22 : RO.22", "title": "คำร้องขอสมัครสอบโดยไม่ต้องเข้าเรียน / Request Form for Examination without Attending Class", "url": "https://regis.kmutt.ac.th/service/form/RO-22.pdf"},
    {"code": "สทน. 23 : RO.23", "title": "คำร้องขอเปลี่ยน/เทียบรายวิชาเรียน / Request Form for Changing to Equivalent Course", "url": "https://regis.kmutt.ac.th/service/form/RO-23.pdf"},
    {"code": "สทน. 25 : RO.25", "title": "ใบลงทะเบียนเรียน / Registration Form", "url": "https://regis.kmutt.ac.th/service/form/RO-25.pdf"},
    {"code": "สทน. 26 : RO.26", "title": "ใบลงทะเบียนเพิ่ม-ลด-ถอน เปลี่ยนกลุ่ม / Additional, Withdrawal Form", "url": "https://regis.kmutt.ac.th/service/form/RO-26Updated.pdf"},
    {"code": "สทน. 27 : RO.27", "title": "คำร้องขอลดรายวิชา / Course Drop Request Form", "url": "https://regis.kmutt.ac.th/service/form/RO.27drop.pdf"},
    {"code": "แบบฟอร์มพิเศษ", "title": "แบบฟอร์มลงเวลาการปฏิบัติงานของนักศึกษาบำเพ็ญประโยชน์", "url": "https://regis.kmutt.ac.th/web/form/"},
    {"code": "แบบฟอร์มพิเศษ", "title": "ใบลงทะเบียนเรียนรายวิชาที่ไม่ผ่านผลลัพธ์การเรียนรู้ โมดูลพื้นฐานคณิตศาสตร์ กลุ่ม 40 ภาคการศึกษาที่ 1/2568 (ระหว่างวันที่ 20-31 ต.ค. 2568 เท่านั้น)", "url": "https://regis.kmutt.ac.th/web/form/"},
]

class FormItem(BaseModel):
    code: str
    title: str
    url: str


def fallback_items() -> List[FormItem]:
    return [FormItem(**item) for item in FALLBACK_FORM_ITEMS]


def normalize_public_url(url: str) -> str:
    if url.startswith("http://regis.kmutt.ac.th/"):
        return "https://" + url[len("http://"):]
    return url


def extract_form_items(html: str) -> List[FormItem]:
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table")
    if not table:
        return []

    items: List[FormItem] = []
    for row in table.find_all("tr"):
        cols = row.find_all("td")
        if len(cols) < 2:
            continue

        code_text = cols[0].get_text(" ", strip=True)
        if not code_text or "แบบฟอร์ม" in code_text:
            continue

        link = cols[1].find("a", href=True)
        if not link:
            continue

        title = link.get_text("\n", strip=True)
        href = link.get("href", "").strip()
        if not href:
            continue

        items.append(FormItem(code=code_text, title=title, url=normalize_public_url(urljoin(FORMS_URL, href))))

    return items

@router.get("/forms", response_model=List[FormItem])
async def get_forms():
    try:
        response = requests.get(FORMS_URL, headers=REQUEST_HEADERS, timeout=10)
        response.raise_for_status()
    except requests.RequestException as exc:
        logger.warning(f"Failed to fetch forms page: {exc}")
        return fallback_items()

    items = extract_form_items(response.text)
    if not items:
        logger.warning("Forms page fetched successfully but no form items were parsed; using fallback catalog")
        return fallback_items()

    return items
