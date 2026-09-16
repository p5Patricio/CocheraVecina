import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING
from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.spot import ParkingSpot
    from app.models.booking import Booking


class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="check_rating_range"),
    )

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
    spot_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("parking_spots.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    reviewer_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    reviewee_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str] = mapped_column(Text, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    booking: Mapped["Booking"] = relationship("Booking", back_populates="review")
    spot: Mapped["ParkingSpot"] = relationship("ParkingSpot", back_populates="reviews")
    reviewer: Mapped["User"] = relationship("User", back_populates="reviews_written", foreign_keys=[reviewer_id])
    reviewee: Mapped["User"] = relationship("User", back_populates="reviews_received", foreign_keys=[reviewee_id])
