from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from typing import List
import os
from dotenv import load_dotenv
from app.services.pdf_processor import process_pdf
from app.api.auth import require_roles

load_dotenv()  # โหลดค่า .env ถ้าใช้ python-dotenv

router = APIRouter()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploaded_files")
os.makedirs(UPLOAD_DIR, exist_ok=True)

TRAINING_CATEGORIES = {
    "curriculum": "หลักสูตร",
    "regulation": "ระเบียบ",
    "course_structure": "โครงสร้างรายวิชา",
}

for folder_name in TRAINING_CATEGORIES.values():
    os.makedirs(os.path.join(UPLOAD_DIR, folder_name), exist_ok=True)


@router.get("/categories")
async def get_categories(current_user=Depends(require_roles(["admin"]))):
    return {
        "categories": [
            {"key": key, "label": label}
            for key, label in TRAINING_CATEGORIES.items()
        ]
    }

@router.post("/upload/")
async def upload_files(
    category: str = Form(...),
    files: List[UploadFile] = File(...),
    current_user=Depends(require_roles(["admin"])),
):
    if category not in TRAINING_CATEGORIES:
        raise HTTPException(status_code=400, detail="Invalid category")

    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    category_folder = TRAINING_CATEGORIES[category]
    target_dir = os.path.join(UPLOAD_DIR, category_folder)
    os.makedirs(target_dir, exist_ok=True)

    file_paths = []
    for upload in files:
        if upload.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")

        filename = os.path.basename(upload.filename)
        file_location = os.path.join(target_dir, filename)
        with open(file_location, "wb") as file_object:
            file_object.write(await upload.read())
        file_paths.append(file_location)

    # Process the uploaded PDF files
    for file_path in file_paths:
        process_pdf(file_path)

    return {
        "category": category,
        "category_label": category_folder,
        "filenames": [f.filename for f in files]
    }