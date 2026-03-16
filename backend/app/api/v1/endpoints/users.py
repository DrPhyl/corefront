from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.api.deps import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class UserMe(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    plan: str
    generations_used: int
    generations_limit: int

    class Config:
        from_attributes = True

@router.get("/me", response_model=UserMe)
def get_me(current_user: User = Depends(get_current_user)):
    if current_user.plan == "free":
        generations_limit = 5
    elif current_user.plan == "pro":
        generations_limit = 59
    else:
        generations_limit = 250
    return UserMe(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        plan=current_user.plan,
        generations_used=current_user.generations_used,
        generations_limit=generations_limit,
    )
