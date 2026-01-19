from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.database import Base

# ตารางผู้ใช้
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    role = Column(String, default="user")
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    files = relationship("File", back_populates="user", cascade="all, delete-orphan")
    chats = relationship("Chat", back_populates="user", cascade="all, delete-orphan")

# ตารางเก็บไฟล์ PDF
class File(Base):
    __tablename__ = "files"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    filename = Column(String, nullable=False)
    filetype = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    raw_path = Column(String, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="files")
    ocr_results = relationship("OCRResult", back_populates="file", cascade="all, delete-orphan")

# ตารางผลลัพธ์ OCR
class OCRResult(Base):
    __tablename__ = "ocr_results"
    
    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    engine = Column(String, nullable=False)  # OCR engine ที่ใช้
    text = Column(Text, nullable=False)
    processed_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    file = relationship("File", back_populates="ocr_results")
    chunks = relationship("Chunk", back_populates="ocr_result", cascade="all, delete-orphan")

# ตารางแบ่งข้อความออกเป็นชิ้น
class Chunk(Base):
    __tablename__ = "chunks"
    
    id = Column(Integer, primary_key=True, index=True)
    ocr_result_id = Column(Integer, ForeignKey("ocr_results.id"), nullable=False)
    content = Column(Text, nullable=False)
    chunk_metadata = Column(JSON, nullable=True)  # เก็บข้อมูลเพิ่มเติม
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    ocr_result = relationship("OCRResult", back_populates="chunks")
    embeddings = relationship("Embedding", back_populates="chunk", cascade="all, delete-orphan")

# ตารางเก็บ Vector Embeddings
class Embedding(Base):
    __tablename__ = "embeddings"
    
    id = Column(Integer, primary_key=True, index=True)
    chunk_id = Column(Integer, ForeignKey("chunks.id"), nullable=False)
    vector = Column(JSON, nullable=False)  # เก็บ vector เป็น JSON array
    embedding_api = Column(String, nullable=False)  # API ที่ใช้สร้าง embedding
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    chunk = relationship("Chunk", back_populates="embeddings")

# ตารางแชท
class Chat(Base):
    __tablename__ = "chats"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    context_chunk_id = Column(Integer, ForeignKey("chunks.id"), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="chats")
    answers = relationship("Answer", back_populates="chat", cascade="all, delete-orphan")

# ตารางคำตอบจาก LLM
class Answer(Base):
    __tablename__ = "answers"
    
    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chats.id"), nullable=False)
    llm_provider = Column(String, nullable=False)  # ชื่อ LLM ที่ใช้
    answer = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    chat = relationship("Chat", back_populates="answers")

# ตารางคำถามที่ถามบ่อย (FAQ)
class FAQ(Base):
    __tablename__ = "faqs"
    
    id = Column(Integer, primary_key=True, index=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    category = Column(String, nullable=True)
    display_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)