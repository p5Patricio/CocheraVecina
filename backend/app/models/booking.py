import uuid
from datetime import date, datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.spot import ParkingSpot
    from app.models.payment import Payment
    from app.models.review import Review


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    spot_id: Mapped[str] = mapped_column(String(36), ForeignKey("parking_spots.id"), nullable=False, index=True)
    guest_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    start_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    end_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)

    # Status: pending_host, approved, rejected, paid, active, completed, cancelled
    status: Mapped[str] = mapped_column(String(30), default="pending_host", nullable=False, index=True)

    # Financial Breakdown (All values stored in centavos MXN)
    daily_rate: Mapped[int] = mapped_column(Integer, nullable=False)
    total_days: Mapped[int] = mapped_column(Integer, nullable=False)
    base_amount: Mapped[int] = mapped_column(Integer, nullable=False)
    guest_fee_amount: Mapped[int] = mapped_column(Integer, nullable=False)
    host_fee_amount: Mapped[int] = mapped_column(Integer, nullable=False)
    total_amount: Mapped[int] = mapped_column(Integer, nullable=False)  # Charged to guest = base + guest_fee
    host_payout_amount: Mapped[int] = mapped_column(Integer, nullable=False)  # Transferred to host = base - host_fee
    currency: Mapped[str] = mapped_column(String(3), default="MXN", nullable=False)

    # Cancellation & Refund
    cancellation_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    cancelled_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    cancelled_by_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    refund_amount: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

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
    spot: Mapped["ParkingSpot"] = relationship("ParkingSpot", back_populates="bookings")
    guest: Mapped["User"] = relationship("User", back_populates="bookings", foreign_keys=[guest_id])
    cancelled_by: Mapped[Optional["User"]] = relationship("User", foreign_keys=[cancelled_by_id])
    payment: Mapped[Optional["Payment"]] = relationship("Payment", back_populates="booking", uselist=False)
    review: Mapped[Optional["Review"]] = relationship("Review", back_populates="booking", uselist=False)
