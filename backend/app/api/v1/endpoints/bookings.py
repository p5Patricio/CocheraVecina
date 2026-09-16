from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.booking import (
    BookingCreate,
    BookingOut,
    BookingStatusUpdate,
    BookingCancelRequest,
)
from app.services.booking_service import BookingService
from app.services.stripe_service import StripeService

router = APIRouter()


@router.post("/", response_model=BookingOut, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_in: BookingCreate,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
):
    """
    Request a booking for a parking spot.
    Protected by database row locking to prevent overlapping reservations.
    """
    return await BookingService.create_booking(
        session=session,
        guest_id=current_user.id,
        booking_in=booking_in,
    )


@router.get("/my-bookings", response_model=List[BookingOut])
async def get_my_guest_bookings(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
):
    """List bookings made by the current user as a guest."""
    return await BookingService.list_guest_bookings(session, guest_id=current_user.id)


@router.get("/host-bookings", response_model=List[BookingOut])
async def get_my_host_bookings(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
):
    """List bookings requested for spots owned by the current user."""
    return await BookingService.list_host_bookings(session, host_id=current_user.id)


@router.get("/{booking_id}", response_model=BookingOut)
async def get_booking(
    booking_id: str,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
):
    """Fetch booking details. Only guest or host can view."""
    booking = await BookingService.get_by_id(session, booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found."
        )

    if booking.guest_id != current_user.id and booking.spot.host_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this booking."
        )
    return booking


@router.patch("/{booking_id}/status", response_model=BookingOut)
async def update_booking_status(
    booking_id: str,
    status_in: BookingStatusUpdate,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
):
    """Host approves or rejects a pending booking request."""
    return await BookingService.update_status(
        session=session,
        booking_id=booking_id,
        host_id=current_user.id,
        new_status=status_in.status,
    )


@router.post("/{booking_id}/cancel", response_model=BookingOut)
async def cancel_booking(
    booking_id: str,
    cancel_in: BookingCancelRequest,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
):
    """
    Cancel booking with flexible cancellation policy.
    If cancelled >= 24h prior to check-in or if host cancels, full automatic refund is issued.
    """
    booking = await BookingService.cancel_booking(
        session=session,
        booking_id=booking_id,
        user_id=current_user.id,
        cancel_in=cancel_in,
    )

    # If eligible for refund, trigger Stripe refund
    if booking.refund_amount > 0 and booking.payment:
        await StripeService.process_refund(session, booking)

    return booking
