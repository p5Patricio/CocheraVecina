import uuid
from datetime import datetime, timezone
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.booking import Booking
    from app.models.review import Review


class ParkingSpot(Base):
    __tablename__ = "parking_spots"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    host_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    # Location
    address_line: Mapped[str] = mapped_column(String(255), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    country: Mapped[str] = mapped_column(String(2), default="MX", nullable=False)
    postal_code: Mapped[str] = mapped_column(String(10), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)

    # Pricing (in centavos MXN: $150 MXN = 15000)
    price_per_day: Mapped[int] = mapped_column(Integer, nullable=False)

    # Vehicle and Space attributes
    vehicle_size: Mapped[str] = mapped_column(String(20), nullable=False)  # "compact", "sedan", "suv", "truck"
    space_type: Mapped[str] = mapped_column(String(20), nullable=False)    # "covered", "uncovered"
    access_instructions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

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
    host: Mapped["User"] = relationship("User", back_populates="spots")
    images: Mapped[List["SpotImage"]] = relationship(
        "SpotImage",
        back_populates="spot",
        cascade="all, delete-orphan",
        order_by="SpotImage.display_order",
    )
    bookings: Mapped[List["Booking"]] = relationship("Booking", back_populates="spot")
    reviews: Mapped[List["Review"]] = relationship("Review", back_populates="spot")


class SpotImage(Base):
    __tablename__ = "spot_images"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    spot_id: Mapped[str] = mapped_column(String(36), ForeignKey("parking_spots.id", ondelete="CASCADE"), nullable=False, index=True)
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    spot: Mapped["ParkingSpot"] = relationship("ParkingSpot", back_populates="images")
