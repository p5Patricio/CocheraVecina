from datetime import date
import pytest
from app.models.spot import ParkingSpot
from app.services.booking_service import BookingService


def test_booking_financial_split():
    # Mock spot with $150.00 MXN per day (15000 centavos)
    spot = ParkingSpot(
        id="mock-spot-id",
        host_id="mock-host-id",
        title="Cochera techada León Centro",
        description="Espacio seguro y vigilado para estancias cortas.",
        address_line="Calle Madero 123",
        city="León",
        state="Guanajuato",
        country="MX",
        postal_code="37000",
        latitude=21.1221,
        longitude=-101.6822,
        price_per_day=15000,
        vehicle_size="sedan",
        space_type="covered",
    )

    start_date = date(2026, 10, 1)
    end_date = date(2026, 10, 6)  # 5 days

    quote = BookingService.calculate_quote(spot, start_date, end_date)

    assert quote.total_days == 5
    assert quote.daily_rate == 15000
    assert quote.base_amount == 75000  # $750.00 MXN

    # 10% guest fee
    assert quote.guest_fee_amount == 7500  # $75.00 MXN

    # 5% host fee
    assert quote.host_fee_amount == 3750  # $37.50 MXN

    # Total charged to guest = base + guest_fee
    assert quote.total_amount == 82500  # $825.00 MXN

    # Host payout = base - host_fee
    assert quote.host_payout_amount == 71250  # $712.50 MXN

    # Conservation of money: total_amount - host_payout_amount == platform_take
    platform_take = quote.guest_fee_amount + quote.host_fee_amount
    assert quote.total_amount - quote.host_payout_amount == platform_take
    assert platform_take == 11250  # $112.50 MXN
