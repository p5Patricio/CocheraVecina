from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, model_validator
from app.schemas.user import UserOut
from app.schemas.spot import SpotOut


class BookingQuoteRequest(BaseModel):
    spot_id: str
    start_date: date
    end_date: date

    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_date <= self.start_date:
            raise ValueError("end_date must be strictly after start_date")
        return self


class BookingQuoteResponse(BaseModel):
    spot_id: str
    start_date: date
    end_date: date
    total_days: int
    daily_rate: int
    base_amount: int
    guest_fee_amount: int
    host_fee_amount: int
    total_amount: int
    host_payout_amount: int
    currency: str = "MXN"


class BookingCreate(BaseModel):
    spot_id: str
    start_date: date
    end_date: date

    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_date <= self.start_date:
            raise ValueError("end_date must be strictly after start_date")
        return self


class BookingStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(approved|rejected)$")


class BookingCancelRequest(BaseModel):
    cancellation_reason: Optional[str] = Field(None, max_length=500)


class BookingOut(BaseModel):
    id: str
    spot_id: str
    guest_id: str
    start_date: date
    end_date: date
    status: str
    daily_rate: int
    total_days: int
    base_amount: int
    guest_fee_amount: int
    host_fee_amount: int
    total_amount: int
    host_payout_amount: int
    currency: str
    cancellation_reason: Optional[str] = None
    cancelled_at: Optional[datetime] = None
    cancelled_by_id: Optional[str] = None
    refund_amount: int
    created_at: datetime
    updated_at: datetime

    spot: Optional[SpotOut] = None
    guest: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)
