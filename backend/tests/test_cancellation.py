from datetime import date, datetime, timezone, timedelta
import pytest
from app.models.user import User
from app.models.spot import ParkingSpot
from app.models.booking import Booking
from app.models.payment import Payment
from app.schemas.booking import BookingCancelRequest
from app.services.booking_service import BookingService


@pytest.mark.asyncio
async def test_flexible_cancellation_refund(db_session):
    host = User(
        id="host-c",
        email="hostc@test.com",
        hashed_password="hash",
        full_name="Host Cancel",
        stripe_account_id="acct_host123",
    )
    guest = User(
        id="guest-c",
        email="guestc@test.com",
        hashed_password="hash",
        full_name="Guest Cancel",
    )
    spot = ParkingSpot(
        id="spot-c",
        host_id=host.id,
        title="Cochera Segura León",
        description="A minutos del centro",
        address_line="Calle Hidalgo 456",
        city="León",
        state="Guanajuato",
        country="MX",
        postal_code="37000",
        latitude=21.12,
        longitude=-101.68,
        price_per_day=15000,
        vehicle_size="sedan",
        space_type="covered",
    )
    db_session.add_all([host, guest, spot])
    await db_session.commit()

    # Booking 5 days in the future (well over 24h)
    start_future = date.today() + timedelta(days=5)
    end_future = start_future + timedelta(days=3)

    booking = Booking(
        id="book-future",
        spot_id=spot.id,
        guest_id=guest.id,
        start_date=start_future,
        end_date=end_future,
        status="approved",
        daily_rate=15000,
        total_days=3,
        base_amount=45000,
        guest_fee_amount=4500,
        host_fee_amount=2250,
        total_amount=49500,
        host_payout_amount=42750,
        currency="MXN",
    )
    payment = Payment(
        id="pay-1",
        booking_id=booking.id,
        stripe_payment_intent_id="pi_test_123",
        amount=49500,
        platform_fee=6750,
        status="succeeded",
    )
    db_session.add_all([booking, payment])
    await db_session.commit()

    # Guest cancels > 24h prior to check-in
    cancelled_booking = await BookingService.cancel_booking(
        db_session,
        booking_id=booking.id,
        user_id=guest.id,
        cancel_in=BookingCancelRequest(cancellation_reason="Trip postponed"),
    )

    assert cancelled_booking.status == "cancelled"
    assert cancelled_booking.refund_amount == 49500  # 100% full refund
    assert cancelled_booking.cancelled_by_id == guest.id
