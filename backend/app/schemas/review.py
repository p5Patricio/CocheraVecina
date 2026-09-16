from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.user import UserOut


class ReviewCreate(BaseModel):
    booking_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: str = Field(..., min_length=5, max_length=1000)


class ReviewOut(BaseModel):
    id: str
    booking_id: str
    spot_id: str
    reviewer_id: str
    reviewee_id: str
    rating: int
    comment: str
    created_at: datetime
    reviewer: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)
