from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user
from app.core.database import get_db, atomic_transaction
from app.core.security import create_access_token
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserOut, Token
from app.services.auth_service import AuthService
from app.services.image_service import ImageService

router = APIRouter()


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    session: AsyncSession = Depends(get_db),
):
    """Register a new user account (can act as both host and guest)."""
    user = await AuthService.register_user(session, user_in)
    return user


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
