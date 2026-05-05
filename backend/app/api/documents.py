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

class FormItem(BaseModel):
    code: str
    title: str
    url: str


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

        items.append(FormItem(code=code_text, title=title, url=urljoin(FORMS_URL, href)))

    return items

@router.get("/forms", response_model=List[FormItem])
async def get_forms():
    response = requests.get(FORMS_URL, timeout=10)
    response.raise_for_status()
    
    items = extract_form_items(response.text)
    return items

