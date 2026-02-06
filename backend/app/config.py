import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/chatcpe")
SECRET_KEY = os.getenv("SECRET_KEY", "change_this_to_a_secure_random_value")
DEBUG = os.getenv("DEBUG", "True").lower() in ("1", "true", "yes")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploaded_files")
MAX_UPLOAD_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", "50"))
OPENWEBUI_URL = os.getenv("OPENWEBUI_URL", "http://10.35.29.103:3000")
OPENWEBUI_API_KEY = os.getenv("OPENWEBUI_API_KEY", "")
BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:8000")
APP_BASE_URL = os.getenv("APP_BASE_URL", "http://localhost:8080")
VERIFY_TOKEN_EXPIRE_HOURS = int(os.getenv("VERIFY_TOKEN_EXPIRE_HOURS", "24"))
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER)

class Settings(BaseSettings):
    database_url: str = DATABASE_URL
    secret_key: str = SECRET_KEY
    debug: bool = DEBUG
    access_token_expire_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES
    upload_dir: str = UPLOAD_DIR
    max_upload_size_mb: int = MAX_UPLOAD_SIZE_MB
    openwebui_url: str = OPENWEBUI_URL
    openwebui_api_key: str = OPENWEBUI_API_KEY
    backend_base_url: str = BACKEND_BASE_URL
    app_base_url: str = APP_BASE_URL
    verify_token_expire_hours: int = VERIFY_TOKEN_EXPIRE_HOURS
    smtp_host: str = SMTP_HOST
    smtp_port: int = SMTP_PORT
    smtp_user: str = SMTP_USER
    smtp_pass: str = SMTP_PASS
    smtp_from: str = SMTP_FROM

    class Config:
        env_file = ".env"
        extra = "ignore"  # อนุญาต extra fields จาก .env

settings = Settings()