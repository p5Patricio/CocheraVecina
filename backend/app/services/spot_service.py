from typing import List, Optional
from sqlalchemy import select, and_, not_, exists
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from app.core.database import atomic_transaction
from app.models.spot import ParkingSpot, SpotImage
from app.models.booking import Booking
from app.schemas.spot import SpotCreate, SpotUpdate, SpotSearchFilter


class SpotService:
    @staticmethod
    async def create_spot(session: AsyncSession, host_id: str, spot_in: SpotCreate) -> ParkingSpot:
        async with atomic_transaction(session):
            spot = ParkingSpot(
                host_id=host_id,
                **spot_in.model_dump(),
            )
            session.add(spot)
            await session.flush()
            spot_id = spot.id

        return await SpotService.get_by_id(session, spot_id)

    @staticmethod
    async def get_by_id(session: AsyncSession, spot_id: str) -> Optional[ParkingSpot]:
        query = (
            select(ParkingSpot)
            .where(ParkingSpot.id == spot_id)
            .options(
                selectinload(ParkingSpot.images),
                selectinload(ParkingSpot.host),
            )
        )
        result = await session.execute(query)
        return result.scalars().first()

    @staticmethod
    async def list_host_spots(session: AsyncSession, host_id: str) -> List[ParkingSpot]:
        query = (
            select(ParkingSpot)
            .where(ParkingSpot.host_id == host_id)
            .options(selectinload(ParkingSpot.images))
            .order_by(ParkingSpot.created_at.desc())
        )
        result = await session.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def search_spots(
        session: AsyncSession, filters: SpotSearchFilter
    ) -> List[ParkingSpot]:
        query = (
            select(ParkingSpot)
            .where(ParkingSpot.is_active == True)
            .options(
                selectinload(ParkingSpot.images),
                selectinload(ParkingSpot.host),
            )
        )

        if filters.city:
            query = query.where(ParkingSpot.city.ilike(f"%{filters.city}%"))

        if filters.vehicle_size:
            query = query.where(ParkingSpot.vehicle_size == filters.vehicle_size)

        if filters.space_type:
            query = query.where(ParkingSpot.space_type == filters.space_type)

        if filters.max_price:
            query = query.where(ParkingSpot.price_per_day <= filters.max_price)

        # Date availability check: exclude spots with overlapping active bookings
        if filters.start_date and filters.end_date:
            overlapping_bookings = select(Booking.id).where(
                and_(
                    Booking.spot_id == ParkingSpot.id,
                    Booking.status.in_(["approved", "paid", "active"]),
                    Booking.start_date < filters.end_date,
                    Booking.end_date > filters.start_date,
                )
            )
            query = query.where(not_(exists(overlapping_bookings)))

        query = query.order_by(ParkingSpot.created_at.desc())
        result = await session.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def add_image(
        session: AsyncSession, host_id: str, spot_id: str, image_url: str, order: int = 0
    ) -> SpotImage:
        async with atomic_transaction(session):
            spot = await SpotService.get_by_id(session, spot_id)
            if not spot or spot.host_id != host_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Not authorized to add images to this spot."
                )

            image = SpotImage(
                spot_id=spot_id,
                url=image_url,
                display_order=order,
            )
            session.add(image)
            await session.flush()
            await session.refresh(image)
            return image
