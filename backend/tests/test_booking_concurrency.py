from datetime import date
import pytest
from fastapi import HTTPException
from app.models.user import User
from app.models.spot import ParkingSpot
from app.schemas.booking import BookingCreate, BookingCancelRequest
from app.services.booking_service import BookingService


@pytest.mark.asyncio
async def test_booking_collision_prevention(db_session):
    # Setup Host
    host = User(
        id="host-1",
        email="host@test.com",
        hashed_password="hash",
        full_name="Host Test",
    )
    # Setup Guests
    guest1 = User(
        id="guest-1",
        email="guest1@test.com",
        hashed_password="hash",
        full_name="Guest 1",
    )
    guest2 = User(
        id="guest-2",
        email="guest2@test.com",
        hashed_password="hash",
        full_name="Guest 2",
    )

    spot = ParkingSpot(
        id="spot-1",
        host_id=host.id,
        title="Cochera Poliforum León",
        description="A 5 mins de Poliforum León.",
        address_line="Blvd Lopez Mateos 100",
        city="León",
        state="Guanajuato",
        country="MX",
        postal_code="37000",
        latitude=21.115,
        longitude=-101.655,
        price_per_day=20000,
        vehicle_size="suv",
        space_type="covered",
    )

    db_session.add_all([host, guest1, guest2, spot])
    await db_session.commit()
    spot_id = spot.id
    guest1_id = guest1.id
    guest2_id = guest2.id

    # 1. Guest 1 books Oct 1 to Oct 5
    b1_in = BookingCreate(
        spot_id=spot_id,
        start_date=date(2026, 10, 1),
        end_date=date(2026, 10, 5),
    )
    booking1 = await BookingService.create_booking(db_session, guest1_id, b1_in)
    assert booking1.id is not None
    assert booking1.status == "pending_host"

    # 2. Guest 2 tries to book overlapping dates: Oct 3 to Oct 8
    b2_in = BookingCreate(
        spot_id=spot_id,
        start_date=date(2026, 10, 3),
        end_date=date(2026, 10, 8),
    )
    with pytest.raises(HTTPException) as exc_info:
        await BookingService.create_booking(db_session, guest2_id, b2_in)
    assert exc_info.value.status_code == 409
    assert "no longer available" in exc_info.value.detail

    # 3. Guest 2 books contiguous non-overlapping dates: Oct 5 to Oct 10 -> Should succeed!
    b3_in = BookingCreate(
        spot_id=spot_id,
        start_date=date(2026, 10, 5),
        end_date=date(2026, 10, 10),
    )
    booking2 = await BookingService.create_booking(db_session, guest2_id, b3_in)
    assert booking2.id is not None
    assert booking2.total_days == 5


@pytest.mark.asyncio
async def test_host_cannot_book_own_spot(db_session):
    host = User(
        id="host-self",
        email="host_self@test.com",
        hashed_password="hash",
        full_name="Self Host",
    )
    spot = ParkingSpot(
        id="spot-self",
        host_id=host.id,
        title="Own Spot",
        description="Description",
        address_line="Address",
        city="León",
        state="Guanajuato",
        country="MX",
        postal_code="37000",
        latitude=21.1,
        longitude=-101.6,
        price_per_day=10000,
        vehicle_size="compact",
        space_type="uncovered",
    )
    db_session.add_all([host, spot])
    await db_session.commit()

    with pytest.raises(HTTPException) as exc_info:
        await BookingService.create_booking(
            db_session,
            host.id,
            BookingCreate(
                spot_id=spot.id,
                start_date=date(2026, 11, 1),
                end_date=date(2026, 11, 4),
            )
        )
    assert exc_info.value.status_code == 400
