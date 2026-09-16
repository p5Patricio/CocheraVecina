from datetime import date, datetime, timezone, timedelta
from typing import List, Optional
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.core.config import settings
from app.core.database import atomic_transaction
from app.models.booking import Booking
from app.models.spot import ParkingSpot
from app.schemas.booking import (
    BookingCreate,
    BookingQuoteResponse,
    BookingCancelRequest,
)


class BookingService:
    @staticmethod
    def calculate_quote(spot: ParkingSpot, start_date: date, end_date: date) -> BookingQuoteResponse:
        total_days = (end_date - start_date).days
        if total_days <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Booking must be at least 1 day."
            )

        daily_rate = spot.price_per_day
        base_amount = daily_rate * total_days
        guest_fee_amount = int(round(base_amount * settings.GUEST_SERVICE_FEE_PERCENTAGE))
        host_fee_amount = int(round(base_amount * settings.HOST_SERVICE_FEE_PERCENTAGE))
        total_amount = base_amount + guest_fee_amount
        host_payout_amount = base_amount - host_fee_amount

        return BookingQuoteResponse(
            spot_id=spot.id,
            start_date=start_date,
            end_date=end_date,
            total_days=total_days,
            daily_rate=daily_rate,
            base_amount=base_amount,
            guest_fee_amount=guest_fee_amount,
            host_fee_amount=host_fee_amount,
            total_amount=total_amount,
            host_payout_amount=host_payout_amount,
            currency="MXN",
        )

    @staticmethod
    async def create_booking(
        session: AsyncSession, guest_id: str, booking_in: BookingCreate
    ) -> Booking:
        async with atomic_transaction(session):
            # 1. Fetch spot with locking if supported
            spot_query = select(ParkingSpot).where(ParkingSpot.id == booking_in.spot_id)
            if not settings.DATABASE_URL.startswith("sqlite"):
                spot_query = spot_query.with_for_update()

            spot_res = await session.execute(spot_query)
            spot = spot_res.scalars().first()

            if not spot or not spot.is_active:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Parking spot not found or inactive."
                )

            if spot.host_id == guest_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Hosts cannot book their own parking spot."
                )

            # 2. Check date collisions with pessimistic row-locking on existing bookings
            collision_query = select(Booking).where(
                and_(
                    Booking.spot_id == spot.id,
                    Booking.status.in_(["pending_host", "approved", "paid", "active"]),
                    Booking.start_date < booking_in.end_date,
                    Booking.end_date > booking_in.start_date,
                )
            )
            if not settings.DATABASE_URL.startswith("sqlite"):
                collision_query = collision_query.with_for_update()

            collision_res = await session.execute(collision_query)
            if collision_res.scalars().first() is not None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="The requested dates are no longer available for this parking spot."
                )

            # 3. Calculate financial breakdown
            quote = BookingService.calculate_quote(
                spot=spot,
                start_date=booking_in.start_date,
                end_date=booking_in.end_date
            )

            # 4. Insert booking atomically
            booking = Booking(
                spot_id=spot.id,
                guest_id=guest_id,
                start_date=booking_in.start_date,
                end_date=booking_in.end_date,
                status="pending_host",
                daily_rate=quote.daily_rate,
                total_days=quote.total_days,
                base_amount=quote.base_amount,
                guest_fee_amount=quote.guest_fee_amount,
                host_fee_amount=quote.host_fee_amount,
                total_amount=quote.total_amount,
                host_payout_amount=quote.host_payout_amount,
                currency="MXN",
            )
            session.add(booking)
            await session.flush()
            booking_id = booking.id

        return await BookingService.get_by_id(session, booking_id)

    @staticmethod
    async def get_by_id(session: AsyncSession, booking_id: str) -> Optional[Booking]:
        query = (
            select(Booking)
            .where(Booking.id == booking_id)
            .options(
                selectinload(Booking.spot).selectinload(ParkingSpot.images),
                selectinload(Booking.spot).selectinload(ParkingSpot.host),
                selectinload(Booking.guest),
                selectinload(Booking.payment),
            )
        )
        result = await session.execute(query)
        return result.scalars().first()

    @staticmethod
    async def list_guest_bookings(session: AsyncSession, guest_id: str) -> List[Booking]:
        query = (
            select(Booking)
            .where(Booking.guest_id == guest_id)
            .options(
                selectinload(Booking.spot).selectinload(ParkingSpot.images),
                selectinload(Booking.spot).selectinload(ParkingSpot.host),
            )
            .order_by(Booking.created_at.desc())
        )
        result = await session.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def list_host_bookings(session: AsyncSession, host_id: str) -> List[Booking]:
        query = (
            select(Booking)
            .join(ParkingSpot, Booking.spot_id == ParkingSpot.id)
            .where(ParkingSpot.host_id == host_id)
            .options(
                selectinload(Booking.spot),
                selectinload(Booking.guest),
                selectinload(Booking.payment),
            )
            .order_by(Booking.created_at.desc())
        )
        result = await session.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def update_status(
        session: AsyncSession, booking_id: str, host_id: str, new_status: str
    ) -> Booking:
        async with atomic_transaction(session):
            booking = await BookingService.get_by_id(session, booking_id)
            if not booking:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Booking not found."
                )

            if booking.spot.host_id != host_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to update this booking."
                )

            if booking.status != "pending_host":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot change status from '{booking.status}' to '{new_status}'."
                )

            booking.status = new_status
            await session.flush()
            b_id = booking.id

        return await BookingService.get_by_id(session, b_id)

    @staticmethod
    async def cancel_booking(
        session: AsyncSession, booking_id: str, user_id: str, cancel_in: BookingCancelRequest
    ) -> Booking:
        async with atomic_transaction(session):
            booking = await BookingService.get_by_id(session, booking_id)
            if not booking:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Booking not found."
                )

            is_guest = booking.guest_id == user_id
            is_host = booking.spot.host_id == user_id

            if not (is_guest or is_host):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to cancel this booking."
                )

            if booking.status in ["cancelled", "completed", "rejected"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Booking is already in '{booking.status}' state."
                )

            now = datetime.now(timezone.utc)
            # Check-in datetime assumed at 00:00 UTC of start_date
            checkin_dt = datetime.combine(booking.start_date, datetime.min.time(), tzinfo=timezone.utc)
            hours_until_checkin = (checkin_dt - now).total_seconds() / 3600.0

            # Flexible policy: full refund if cancelled >= 24h before check-in or if host cancels
            eligible_for_full_refund = is_host or (hours_until_checkin >= 24.0)

            booking.status = "cancelled"
            booking.cancellation_reason = cancel_in.cancellation_reason
            booking.cancelled_at = now
            booking.cancelled_by_id = user_id

            if booking.payment and booking.payment.status == "succeeded" and eligible_for_full_refund:
                booking.refund_amount = booking.total_amount
            else:
                booking.refund_amount = 0

            await session.flush()
            b_id = booking.id

        return await BookingService.get_by_id(session, b_id)
