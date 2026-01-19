from pydantic import BaseModel
from typing import List, Optional

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True

class ChatMessage(BaseModel):
    user_id: int
    message: str
    timestamp: str

class ChatHistory(BaseModel):
    user_id: int
    messages: List[ChatMessage]

class FileUpload(BaseModel):
    user_id: int
    file_name: str
    file_path: str
    uploaded_at: str

class FileResponse(BaseModel):
    file_id: int
    user_id: int
    file_name: str
    file_path: str
    uploaded_at: str

class LLMResponse(BaseModel):
    response: str
    timestamp: str