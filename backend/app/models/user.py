import uuid
from datetime import datetime, timezone
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.spot import ParkingSpot
    from app.models.booking import Booking
    from app.models.review import Review


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    phone_verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Stripe Connect Identifiers
    stripe_account_id: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)
    stripe_customer_id: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)

    # Identity & Email Verification
    identity_status: Mapped[str] = mapped_column(
        String(20),
        default="unverified",
        nullable=False
    )  # "unverified", "pending", "verified"
    verification_code: Mapped[Optional[str]] = mapped_column(String(6), nullable=True)
    verification_code_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    email_verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    spots: Mapped[List["ParkingSpot"]] = relationship("ParkingSpot", back_populates="host")
    bookings: Mapped[List["Booking"]] = relationship("Booking", back_populates="guest", foreign_keys="Booking.guest_id")
    reviews_written: Mapped[List["Review"]] = relationship("Review", back_populates="reviewer", foreign_keys="Review.reviewer_id")
    reviews_received: Mapped[List["Review"]] = relationship("Review", back_populates="reviewee", foreign_keys="Review.reviewee_id")
