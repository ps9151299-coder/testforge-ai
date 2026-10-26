import os
import json
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    SECRET_KEY,
    ALGORITHM
)
from app.schemas.auth import UserRegister, UserLogin, TokenResponse

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# File-backed user storage path (acts as reliable zero-setup DB)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
USERS_FILE = os.path.join(BASE_DIR, "users_db.json")

def load_users() -> dict:
    if not os.path.exists(USERS_FILE):
        return {}
    try:
        with open(USERS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

def save_users(users: dict):
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2)

@router.post("/register", response_model=TokenResponse)
def register(user_data: UserRegister):
    users = load_users()
    email_key = user_data.email.lower().strip()

    if email_key in users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account with this email already exists"
        )

    hashed_pw = get_password_hash(user_data.password)
    new_user = {
        "id": f"usr-{int(datetime.now().timestamp())}",
        "name": user_data.name.strip(),
        "email": email_key,
        "hashed_password": hashed_pw,
        "tier": "Pro Workspace"
    }

    users[email_key] = new_user
    save_users(users)

    token = create_access_token({"sub": email_key, "name": new_user["name"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "name": new_user["name"],
            "email": new_user["email"],
            "tier": new_user["tier"]
        }
    }

@router.post("/login", response_model=TokenResponse)
def login(creds: UserLogin):
    users = load_users()
    email_key = creds.email.lower().strip()
    user = users.get(email_key)

    if not user or not verify_password(creds.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token({"sub": email_key, "name": user["name"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "name": user["name"],
            "email": user["email"],
            "tier": user.get("tier", "Pro Workspace")
        }
    }

@router.get("/me")
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate token")

    users = load_users()
    user = users.get(email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return {
        "name": user["name"],
        "email": user["email"],
        "tier": user.get("tier", "Pro Workspace")
    }