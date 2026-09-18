from typing import Optional
from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user, get_current_user_optional
from app.core.database import get_db, atomic_transaction
from app.core.security import create_access_token
from app.models.user import User
from app.schemas.user import (
    UserCreate,
    UserLogin,
    UserOut,
    Token,
    VerifyCodeRequest,
    ResendCodeRequest,
)
from app.services.auth_service import AuthService
from app.services.email import EmailService
from app.services.image_service import ImageService

router = APIRouter()


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_db),
):
    """Register a new user account and dispatch 6-digit OTP verification email."""
    user, code = await AuthService.register_user(session, user_in)
    background_tasks.add_task(
        EmailService.send_verification_email_sync,
        user.email,
        code,
        user.full_name,
    )
    return user


@router.post("/verify-code", response_model=UserOut)
async def verify_code(
    payload: VerifyCodeRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: AsyncSession = Depends(get_db),
):
    """
    Verify the 6-digit OTP code sent via email.
    Supports authenticated JWT users or passing { email, code }.
    """
    if not current_user and not payload.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debes iniciar sesión o proporcionar tu correo electrónico.",
        )

    user = await AuthService.verify_code(
        session=session,
        code=payload.code,
        user=current_user,
        email=payload.email,
    )
    return user


@router.post("/resend-code")
async def resend_code(
    background_tasks: BackgroundTasks,
    payload: Optional[ResendCodeRequest] = None,
    current_user: Optional[User] = Depends(get_current_user_optional),
    session: AsyncSession = Depends(get_db),
):
    """
    Resend a new 6-digit verification code with 60-second rate limiting cooldown.
    """
    email = current_user.email if current_user else (payload.email if payload else None)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debes iniciar sesión o proporcionar tu correo electrónico.",
        )

    user, new_code = await AuthService.resend_code(
        session=session,
        user=current_user,
        email=email,
    )
    background_tasks.add_task(
        EmailService.send_verification_email_sync,
        user.email,
        new_code,
        user.full_name,
    )
    return {"message": "Código de verificación reenviado con éxito."}


@router.post("/login", response_model=Token)
async def login(
    login_in: UserLogin,
    session: AsyncSession = Depends(get_db),
):
    """Log in with email and password to receive a JWT access token."""
    user = await AuthService.authenticate_user(session, login_in.email, login_in.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account",
        )

    access_token = create_access_token(subject=user.id)
    return Token(access_token=access_token, user=user)


@router.get("/me", response_model=UserOut)
async def get_me(
    current_user: User = Depends(get_current_active_user),
):
    """Fetch profile of currently authenticated user."""
    return current_user


@router.post("/avatar", response_model=UserOut)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
):
    """
    Upload and optimize profile avatar picture.
    Resizes to 400x400 max, strips EXIF, and converts to WebP.
    """
    url = await ImageService.process_and_save(file, subfolder="avatars", max_dimension=400, quality=85)
    async with atomic_transaction(session):
        current_user.avatar_url = url
        session.add(current_user)
    await session.refresh(current_user)
    return current_user
