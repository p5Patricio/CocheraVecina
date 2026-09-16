from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_active_user
from app.core.database import get_db, atomic_transaction
from app.models.booking import Booking
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewOut

router = APIRouter()


@router.post("/", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
):
    """
    Submit a verified review for a completed or paid booking.
    Only the guest of the booking can review the spot and host.
    """
    async with atomic_transaction(session):
        booking_res = await session.execute(
            select(Booking)
            .where(Booking.id == review_in.booking_id)
            .options(selectinload(Booking.spot))
        )
        booking = booking_res.scalars().first()
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found."
            )

        if booking.guest_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the guest of this booking can leave a review."
            )

        if booking.status not in ["paid", "active", "completed"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You can only review after a booking has been confirmed and paid."
            )

        # Check if already reviewed
        existing_review = await session.execute(
            select(Review).where(Review.booking_id == booking.id)
        )
        if existing_review.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A review has already been submitted for this booking."
            )

        review = Review(
            booking_id=booking.id,
            spot_id=booking.spot_id,
            reviewer_id=current_user.id,
            reviewee_id=booking.spot.host_id,
            rating=review_in.rating,
            comment=review_in.comment,
        )
        session.add(review)
        await session.flush()
        await session.refresh(review)

        # Reload with reviewer details
        res = await session.execute(
            select(Review)
            .where(Review.id == review.id)
            .options(selectinload(Review.reviewer))
        )
        return res.scalars().first()


@router.get("/spot/{spot_id}", response_model=List[ReviewOut])
async def get_spot_reviews(
    spot_id: str,
    session: AsyncSession = Depends(get_db),
):
    """List verified reviews for a specific parking spot."""
    query = (
        select(Review)
        .where(Review.spot_id == spot_id)
        .options(selectinload(Review.reviewer))
        .order_by(Review.created_at.desc())
    )
    result = await session.execute(query)
    return list(result.scalars().all())
