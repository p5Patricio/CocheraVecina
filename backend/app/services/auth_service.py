from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.core.database import atomic_transaction
from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


class AuthService:
    @staticmethod
    async def get_by_email(session: AsyncSession, email: str) -> Optional[User]:
        query = select(User).where(User.email == email.lower())
        result = await session.execute(query)
        return result.scalars().first()

    @staticmethod
    async def get_by_id(session: AsyncSession, user_id: str) -> Optional[User]:
        query = select(User).where(User.id == user_id)
        result = await session.execute(query)
        return result.scalars().first()

    @staticmethod
    async def register_user(session: AsyncSession, user_in: UserCreate) -> User:
        async with atomic_transaction(session):
            existing = await AuthService.get_by_email(session, user_in.email)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="A user with this email already exists."
                )

            user = User(
                email=user_in.email.lower(),
                hashed_password=get_password_hash(user_in.password),
                full_name=user_in.full_name,
                phone=user_in.phone,
            )
            session.add(user)
            await session.flush()
            await session.refresh(user)
            return user

    @staticmethod
    async def authenticate_user(
        session: AsyncSession, email: str, password: str
    ) -> Optional[User]:
        user = await AuthService.get_by_email(session, email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
