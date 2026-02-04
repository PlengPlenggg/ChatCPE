from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import hashlib
import base64
from app.models.models import User
from app.models.database import get_db
from app.config import SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()

# Password hashing - support argon2 + bcrypt for backward compatibility
pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")

# JWT settings
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/auth/token", auto_error=False)

# Constants
ALLOWED_ROLES = ["admin", "staff", "user"]
ALLOWED_EMAIL_DOMAINS = ["mail.kmutt.ac.th", "kmutt.ac.th"]

# Schemas
class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    confirm_password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserProfile(BaseModel):
    name: str
    email: str
    role: str = "user"


class UserProfileUpdate(BaseModel):
    name: str


class RoleUpdate(BaseModel):
    role: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int

# Helper functions
def hash_password(password: str) -> str:
    # Hash password using argon2 (no byte length limit)
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Verify password against argon2 hash
    return pwd_context.verify(plain_password, hashed_password)


def is_email_allowed(email: str) -> bool:
    domain = email.split("@")[-1].lower()
    return domain in ALLOWED_EMAIL_DOMAINS

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    import sys
    print(f"DEBUG: Received token: {token[:20]}...", file=sys.stderr)
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"DEBUG: JWT payload: {payload}", file=sys.stderr)
        user_id_raw = payload.get("sub")
        if user_id_raw is None:
            raise HTTPException(status_code=401, detail="Invalid token: missing subject")
        # Convert to int in case JWT decoding returns string
        user_id: int = int(user_id_raw) if isinstance(user_id_raw, str) else user_id_raw
        print(f"DEBUG: Extracted user_id: {user_id}", file=sys.stderr)
    except JWTError as e:
        print(f"DEBUG: JWTError: {str(e)}", file=sys.stderr)
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except (ValueError, TypeError) as e:
        print(f"DEBUG: ValueError/TypeError: {str(e)}", file=sys.stderr)
        raise HTTPException(status_code=401, detail="Invalid token: malformed user ID")
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def get_current_user_optional(token: str = Depends(oauth2_scheme_optional), db: Session = Depends(get_db)):
    if not token:
        return None
    return get_current_user(token=token, db=db)


def require_roles(allowed_roles: list[str]):
    """Dependency factory to enforce role-based access control."""
    def _checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user

    return _checker

# Endpoints
@router.post("/register", response_model=Token)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Validate passwords match
    if user_data.password != user_data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    if not is_email_allowed(user_data.email):
        raise HTTPException(status_code=400, detail="Email domain not allowed")
    
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Create new user
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        role="user"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(new_user.id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user_id": new_user.id}

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    # Find user by email
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user_id": user.id}

@router.post("/token", response_model=Token)
async def token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    OAuth2-compatible token endpoint using form data (username=email, password).
    Keeps existing /auth/login (JSON) while enabling Swagger "Authorize" and standard clients.
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer", "user_id": user.id}

@router.get("/profile", response_model=UserProfile)
async def get_profile(current_user: User = Depends(get_current_user)):
    return UserProfile(name=current_user.name, email=current_user.email, role=current_user.role)

@router.put("/profile")
async def update_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.name = profile_data.name
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return {"message": "Profile updated successfully", "user": {"name": current_user.name, "email": current_user.email, "role": current_user.role}}

@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully"}


@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: int,
    payload: RoleUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(require_roles(["admin"]))
):
    if payload.role not in ALLOWED_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = payload.role
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "Role updated", "user_id": user.id, "role": user.role}