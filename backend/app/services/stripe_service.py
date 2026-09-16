from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
import stripe

from app.core.config import settings
from app.core.database import atomic_transaction
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.user import User

if settings.STRIPE_SECRET_KEY:
    stripe.api_key = settings.STRIPE_SECRET_KEY


class StripeService:
    @staticmethod
    async def create_host_express_account(session: AsyncSession, host: User) -> str:
        """Create a Stripe Express account for a Mexican host."""
        if not settings.STRIPE_SECRET_KEY:
            # Stub/dev fallback
            account_id = f"acct_mock_{host.id[:8]}"
            async with atomic_transaction(session):
                host.stripe_account_id = account_id
                session.add(host)
            return account_id

        try:
            account = stripe.Account.create(
                type="express",
                country="MX",
                email=host.email,
                capabilities={"transfers": {"requested": True}},
                business_type="individual",
                metadata={"user_id": str(host.id)},
            )
            async with atomic_transaction(session):
                host.stripe_account_id = account.id
                session.add(host)
            return account.id
        except stripe.StripeError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stripe account creation failed: {str(e)}"
            )

    @staticmethod
    async def generate_account_link(
        session: AsyncSession, host: User, refresh_url: str, return_url: str
    ) -> str:
        """Generate Stripe hosted onboarding link for host KYC and bank payout setup."""
        if not host.stripe_account_id:
            await StripeService.create_host_express_account(session, host)

        if not settings.STRIPE_SECRET_KEY:
            return f"{return_url}?mock_stripe_connected=true"

        try:
            account_link = stripe.AccountLink.create(
                account=host.stripe_account_id,
                refresh_url=refresh_url,
                return_url=return_url,
                type="account_onboarding",
            )
            return account_link.url
        except stripe.StripeError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stripe onboarding link generation failed: {str(e)}"
            )

    @staticmethod
    async def create_booking_payment_intent(
        session: AsyncSession, booking: Booking
    ) -> dict:
        """
        Creates a Stripe PaymentIntent with Destination Charges.
        - Charged to guest: booking.total_amount
        - Platform Fee retained: booking.guest_fee_amount + booking.host_fee_amount
        - Payout routed automatically to host's Stripe Express account.
        """
        if booking.status != "approved":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot pay for booking with status '{booking.status}'. Host must approve first."
            )

        host = booking.spot.host
        if not host.stripe_account_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The host has not completed their Stripe payout setup yet."
            )

        platform_fee = booking.guest_fee_amount + booking.host_fee_amount

        async with atomic_transaction(session):
            # Check if payment intent already exists
            existing_payment = await session.execute(
                select(Payment).where(Payment.booking_id == booking.id)
            )
            payment = existing_payment.scalars().first()

            if payment and payment.status == "succeeded":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Booking is already paid."
                )

            if not settings.STRIPE_SECRET_KEY:
                # Mock response for local development without active Stripe keys
                mock_pi_id = f"pi_mock_{booking.id[:8]}"
                client_secret = f"{mock_pi_id}_secret_test"
                if not payment:
                    payment = Payment(
                        booking_id=booking.id,
                        stripe_payment_intent_id=mock_pi_id,
                        amount=booking.total_amount,
                        platform_fee=platform_fee,
                        status="requires_payment_method",
                    )
                    session.add(payment)
                return {
                    "client_secret": client_secret,
                    "payment_intent_id": mock_pi_id,
                    "amount": booking.total_amount,
                    "currency": booking.currency,
                }

            try:
                payment_intent = stripe.PaymentIntent.create(
                    amount=booking.total_amount,
                    currency="mxn",
                    application_fee_amount=platform_fee,
                    transfer_data={"destination": host.stripe_account_id},
                    metadata={
                        "booking_id": str(booking.id),
                        "spot_id": str(booking.spot_id),
                        "guest_id": str(booking.guest_id),
                        "host_id": str(host.id),
                    },
                )

                if not payment:
                    payment = Payment(
                        booking_id=booking.id,
                        stripe_payment_intent_id=payment_intent.id,
                        amount=booking.total_amount,
                        platform_fee=platform_fee,
                        status="requires_payment_method",
                    )
                    session.add(payment)
                else:
                    payment.stripe_payment_intent_id = payment_intent.id

                return {
                    "client_secret": payment_intent.client_secret,
                    "payment_intent_id": payment_intent.id,
                    "amount": booking.total_amount,
                    "currency": booking.currency,
                }
            except stripe.StripeError as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Stripe PaymentIntent error: {str(e)}"
                )

    @staticmethod
    async def process_refund(session: AsyncSession, booking: Booking) -> bool:
        """Issues full refund with reverse transfer and platform fee return."""
        async with atomic_transaction(session):
            if not booking.payment or booking.payment.status != "succeeded":
                return False

            if not settings.STRIPE_SECRET_KEY:
                booking.payment.status = "refunded"
                booking.payment.refunded_at = datetime.now(timezone.utc)
                session.add(booking.payment)
                return True

            try:
                refund = stripe.Refund.create(
                    payment_intent=booking.payment.stripe_payment_intent_id,
                    reverse_transfer=True,
                    refund_application_fee=True,
                )
                booking.payment.stripe_refund_id = refund.id
                booking.payment.status = "refunded"
                booking.payment.refunded_at = datetime.now(timezone.utc)
                session.add(booking.payment)
                return True
            except stripe.StripeError as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Stripe refund failed: {str(e)}"
                )
