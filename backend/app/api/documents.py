from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import requests
from bs4 import BeautifulSoup
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

FORMS_URL = "https://regis.kmutt.ac.th/web/form/"

class FormItem(BaseModel):
    code: str
    title: str
    url: str

@router.get("/forms", response_model=List[FormItem])
async def get_forms():
    try:
        response = requests.get(FORMS_URL, timeout=30)
        response.raise_for_status()
    except requests.RequestException as exc:
        logger.error(f"Failed to fetch forms page: {exc}")
        raise HTTPException(status_code=503, detail="Failed to fetch forms page")

    soup = BeautifulSoup(response.text, "html.parser")
    table = soup.find("table")
    if not table:
        return []

    items: List[FormItem] = []
    rows = table.find_all("tr")
    for row in rows:
        cols = row.find_all("td")
        if len(cols) < 2:
            continue

        code_text = cols[0].get_text(" ", strip=True)
        links = cols[1].find_all("a", href=True)
        for link in links:
            title = link.get_text("\n", strip=True)
            url = link.get("href", "").strip()
            if not url:
                continue
            items.append(FormItem(code=code_text, title=title, url=url))

    return items
