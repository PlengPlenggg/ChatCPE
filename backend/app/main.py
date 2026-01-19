from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import os
from app.api import auth, chat, files, faq
from app.config import DATABASE_URL, UPLOAD_DIR
from app.models.database import Base, engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    logger.info(f"Database tables created successfully!")
    yield
    # Shutdown
    logger.info("Application shutting down...")

app = FastAPI(
    title="CPE CHAT System API",
    description="Chat bot with PDF upload, user authentication",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(faq.router, prefix="/faq", tags=["FAQ"])
app.include_router(files.router, prefix="/files", tags=["Documents"])

@app.get("/")
async def root():
    return {"message": "Welcome to CPE CHAT System API", "docs": "/docs"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}