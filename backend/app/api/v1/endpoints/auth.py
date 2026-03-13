from datetime import timedelta

from fastapi import APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from typing import Annotated

from app.api.deps import CurrentUser, DBSession, Depends
from app.core.config import settings
from app.core.security import create_access_token
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserResponse
from app.services.user import authenticate_user, create_user, get_user_by_email

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: DBSession):
    """Register a new user."""
    existing_user = get_user_by_email(db, user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists",
        )
    user = create_user(db, user_in)
    return user


@router.post("/login", response_model=Token)
def login(
    db: DBSession,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
):
    """Login and get access token."""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(subject=user.id, expires_delta=access_token_expires)
    return Token(access_token=access_token)


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: CurrentUser):
    """Get current user information."""
    return current_user
