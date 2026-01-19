from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import List
import os
from dotenv import load_dotenv
from app.services.pdf_processor import process_pdf
from app.api.auth import require_roles

load_dotenv()  # โหลดค่า .env ถ้าใช้ python-dotenv

router = APIRouter()

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploaded_files")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload/")
async def upload_files(
    files: List[UploadFile] = File(...),
    current_user=Depends(require_roles(["admin", "staff"])),
):
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")
    
    file_paths = []
    for upload in files:
        if upload.content_type != "application/pdf":
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        filename = os.path.basename(upload.filename)
        file_location = os.path.join(UPLOAD_DIR, filename)
        with open(file_location, "wb") as file_object:
            file_object.write(await upload.read())
        file_paths.append(file_location)
    
    # Process the uploaded PDF files
    for file_path in file_paths:
        process_pdf(file_path)
    
    return {"filenames": [f.filename for f in files]}