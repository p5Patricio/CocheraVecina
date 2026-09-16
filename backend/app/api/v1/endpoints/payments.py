import json
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import stripe

from app.api.deps import get_current_active_user
from app.core.config import settings
from app.core.database import get_db, atomic_transaction
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.user import User
from app.schemas.payment import PaymentIntentCreateResponse, StripeAccountLinkResponse
from app.services.booking_service import BookingService
from app.services.stripe_service import StripeService

router = APIRouter()


@router.post("/host/onboard", response_model=StripeAccountLinkResponse)
async def get_host_onboarding_url(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
):
    """Generate Stripe Express onboarding URL for Mexican host payout setup."""
    refresh_url = f"{settings.FRONTEND_URL}/host/stripe/refresh"
    return_url = f"{settings.FRONTEND_URL}/host/stripe/return"

    url = await StripeService.generate_account_link(
        session=session,
        host=current_user,
        refresh_url=refresh_url,
        return_url=return_url,
    )
    return StripeAccountLinkResponse(url=url)


@router.post("/bookings/{booking_id}/create-intent", response_model=PaymentIntentCreateResponse)
async def create_payment_intent(
    booking_id: str,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
):
    """Create Stripe PaymentIntent for an approved booking with Destination Charges."""
    booking = await BookingService.get_by_id(session, booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found."
        )

    if booking.guest_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the guest can initiate payment for this booking."
        )

    return await StripeService.create_booking_payment_intent(session, booking)


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="stripe-signature"),
    session: AsyncSession = Depends(get_db),
):
    """
    Stripe Webhook Listener.
    Processes payment_intent.succeeded to mark booking as paid and active atomically.
    """
    payload = await request.body()

    if settings.STRIPE_WEBHOOK_SECRET and stripe_signature:
        try:
            event = stripe.Webhook.construct_event(
                payload, stripe_signature, settings.STRIPE_WEBHOOK_SECRET
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Webhook signature verification failed: {str(e)}"
            )
    else:
        # Fallback for dev / unconfigured secret
        try:
            event = json.loads(payload.decode("utf-8"))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid payload")

    event_type = event.get("type")
    data_object = event.get("data", {}).get("object", {})

    if event_type == "payment_intent.succeeded":
        payment_intent_id = data_object.get("id")
        async with atomic_transaction(session):
            payment_res = await session.execute(
                select(Payment).where(Payment.stripe_payment_intent_id == payment_intent_id)
            )
            payment = payment_res.scalars().first()
            if payment:
                payment.status = "succeeded"
                booking_res = await session.execute(
                    select(Booking).where(Booking.id == payment.booking_id)
                )
                booking = booking_res.scalars().first()
                if booking:
                    booking.status = "paid"

    return {"status": "success"}
