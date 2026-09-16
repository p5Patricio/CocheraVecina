from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.user import UserOut


class SpotImageBase(BaseModel):
    url: str
    display_order: int = 0


class SpotImageCreate(SpotImageBase):
    pass


class SpotImageOut(SpotImageBase):
    id: str
    spot_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SpotBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10)
    address_line: str = Field(..., min_length=5, max_length=255)
    city: str = Field(..., min_length=2, max_length=100)
    state: str = Field(..., min_length=2, max_length=100)
    country: str = Field(default="MX", min_length=2, max_length=2)
    postal_code: str = Field(..., min_length=4, max_length=10)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    price_per_day: int = Field(..., gt=0, description="Price per day in centavos MXN (e.g., 15000 = $150.00 MXN)")
    vehicle_size: str = Field(..., pattern="^(compact|sedan|suv|truck)$")
    space_type: str = Field(..., pattern="^(covered|uncovered)$")
    access_instructions: Optional[str] = None


class SpotCreate(SpotBase):
    pass


class SpotUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=200)
    description: Optional[str] = Field(None, min_length=10)
    price_per_day: Optional[int] = Field(None, gt=0)
    vehicle_size: Optional[str] = Field(None, pattern="^(compact|sedan|suv|truck)$")
    space_type: Optional[str] = Field(None, pattern="^(covered|uncovered)$")
    access_instructions: Optional[str] = None
    is_active: Optional[bool] = None


class SpotOut(SpotBase):
    id: str
    host_id: str
    is_active: bool
    created_at: datetime
    images: List[SpotImageOut] = []
    host: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)


class SpotSearchFilter(BaseModel):
    city: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    vehicle_size: Optional[str] = None
    space_type: Optional[str] = None
    max_price: Optional[int] = None
