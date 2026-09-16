from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.spot import SpotCreate, SpotOut, SpotImageCreate, SpotImageOut, SpotSearchFilter
from app.schemas.booking import BookingQuoteRequest, BookingQuoteResponse
from app.services.spot_service import SpotService
from app.services.booking_service import BookingService

router = APIRouter()


@router.get("/", response_model=List[SpotOut])
async def search_spots(
    city: Optional[str] = Query(None, description="City name (e.g. León)"),
    start_date: Optional[date] = Query(None, description="Check-in date"),
    end_date: Optional[date] = Query(None, description="Check-out date"),
    vehicle_size: Optional[str] = Query(None, description="compact, sedan, suv, truck"),
    space_type: Optional[str] = Query(None, description="covered, uncovered"),
    max_price: Optional[int] = Query(None, description="Max price per day in centavos"),
    session: AsyncSession = Depends(get_db),
):
    """Search available parking spots by city, date availability, and vehicle type."""
    filters = SpotSearchFilter(
        city=city,
        start_date=start_date,
        end_date=end_date,
        vehicle_size=vehicle_size,
        space_type=space_type,
        max_price=max_price,
    )
    return await SpotService.search_spots(session, filters)


@router.post("/", response_model=SpotOut, status_code=status.HTTP_201_CREATED)
async def create_spot(
    spot_in: SpotCreate,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
):
    """Publish a new parking spot listing."""
    return await SpotService.create_spot(session, host_id=current_user.id, spot_in=spot_in)


@router.get("/my-spots", response_model=List[SpotOut])
async def get_my_spots(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
):
    """List all spots published by the current authenticated host."""
    return await SpotService.list_host_spots(session, host_id=current_user.id)


@router.get("/{spot_id}", response_model=SpotOut)
async def get_spot(
    spot_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Fetch details of a specific parking spot."""
    spot = await SpotService.get_by_id(session, spot_id)
    if not spot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parking spot not found."
        )
    return spot


@router.post("/{spot_id}/images", response_model=SpotImageOut, status_code=status.HTTP_201_CREATED)
async def add_spot_image(
    spot_id: str,
    image_in: SpotImageCreate,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_db),
):
    """Attach an image URL to a parking spot."""
    return await SpotService.add_image(
        session,
        host_id=current_user.id,
        spot_id=spot_id,
        image_url=image_in.url,
        order=image_in.display_order,
    )


@router.post("/{spot_id}/quote", response_model=BookingQuoteResponse)
async def get_booking_quote(
    spot_id: str,
    quote_in: BookingQuoteRequest,
    session: AsyncSession = Depends(get_db),
):
    """Calculate exact pricing breakdown (base, guest fee, host fee, total) for a date range."""
    spot = await SpotService.get_by_id(session, spot_id)
    if not spot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parking spot not found."
        )
    return BookingService.calculate_quote(
        spot=spot,
        start_date=quote_in.start_date,
        end_date=quote_in.end_date,
    )
