import uuid
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.booking import Booking


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    booking_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("bookings.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    # Stripe Identifiers
    stripe_payment_intent_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    stripe_transfer_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    stripe_refund_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Financials (in centavos MXN)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    platform_fee: Mapped[int] = mapped_column(Integer, nullable=False)

    # Status: requires_payment_method, processing, succeeded, refunded, failed
    status: Mapped[str] = mapped_column(String(30), default="requires_payment_method", nullable=False)
    refunded_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

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
    booking: Mapped["Booking"] = relationship("Booking", back_populates="payment")
