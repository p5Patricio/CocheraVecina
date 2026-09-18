import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.core.database import atomic_transaction
from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.schemas.user import UserCreate


class AuthService:
    @staticmethod
    def generate_otp_code() -> str:
        """Generate a cryptographically secure 6-digit OTP code."""
        return f"{secrets.randbelow(900000) + 100000}"

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
    async def register_user(session: AsyncSession, user_in: UserCreate) -> Tuple[User, str]:
        """Register a user and assign an initial 6-digit OTP code valid for 15 minutes."""
        async with atomic_transaction(session):
            existing = await AuthService.get_by_email(session, user_in.email)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Ya existe un usuario registrado con este correo electrónico."
                )

            code = AuthService.generate_otp_code()
            expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)

            user = User(
                email=user_in.email.lower(),
                hashed_password=get_password_hash(user_in.password),
                full_name=user_in.full_name,
                phone=user_in.phone,
                verification_code=code,
                verification_code_expires_at=expires_at,
                is_verified=False,
            )
            session.add(user)
            await session.flush()
            await session.refresh(user)
            return user, code

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

    @staticmethod
    async def verify_code(
        session: AsyncSession,
        code: str,
        user: Optional[User] = None,
        email: Optional[str] = None,
    ) -> User:
        """Verify the 6-digit OTP code for a user."""
        async with atomic_transaction(session):
            target_user = user
            if not target_user and email:
                target_user = await AuthService.get_by_email(session, email)

            if not target_user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Usuario no encontrado.",
                )

            if target_user.is_verified:
                return target_user

            if not target_user.verification_code or target_user.verification_code != code.strip():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El código de verificación es incorrecto.",
                )

            now = datetime.now(timezone.utc)
            if target_user.verification_code_expires_at:
                expires_at = target_user.verification_code_expires_at
                if expires_at.tzinfo is None:
                    expires_at = expires_at.replace(tzinfo=timezone.utc)
                if now > expires_at:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="El código de verificación ha expirado. Solicita un nuevo código.",
                    )

            target_user.is_verified = True
            target_user.email_verified_at = now
            target_user.verification_code = None
            target_user.verification_code_expires_at = None
            session.add(target_user)
            await session.flush()
            await session.refresh(target_user)
            return target_user

    @staticmethod
    async def resend_code(
        session: AsyncSession,
        user: Optional[User] = None,
        email: Optional[str] = None,
    ) -> Tuple[User, str]:
        """Resend a new 6-digit OTP code with a 60-second cooldown rate limit."""
        async with atomic_transaction(session):
            target_user = user
            if not target_user and email:
                target_user = await AuthService.get_by_email(session, email)

            if not target_user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Usuario no encontrado.",
                )

            if target_user.is_verified:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Tu cuenta de correo ya ha sido verificada.",
                )

            now = datetime.now(timezone.utc)
            # Check 60-second rate limit cooldown
            # (OTP has 15 min / 900s total duration. If > 840s remain, it was created < 60s ago)
            if target_user.verification_code_expires_at:
                expires_at = target_user.verification_code_expires_at
                if expires_at.tzinfo is None:
                    expires_at = expires_at.replace(tzinfo=timezone.utc)
                remaining = (expires_at - now).total_seconds()
                if remaining > 840:
                    wait_time = int(remaining - 840)
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail=f"Por favor espera {wait_time} segundos antes de solicitar otro código.",
                    )

            new_code = AuthService.generate_otp_code()
            target_user.verification_code = new_code
            target_user.verification_code_expires_at = now + timedelta(minutes=15)
            session.add(target_user)
            await session.flush()
            await session.refresh(target_user)
            return target_user, new_code
