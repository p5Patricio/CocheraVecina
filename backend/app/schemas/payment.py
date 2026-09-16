from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class PaymentIntentCreateResponse(BaseModel):
    client_secret: str
    payment_intent_id: str
    amount: int
    currency: str


class StripeAccountLinkResponse(BaseModel):
    url: str


class PaymentOut(BaseModel):
    id: str
    booking_id: str
    stripe_payment_intent_id: str
    stripe_transfer_id: Optional[str] = None
    stripe_refund_id: Optional[str] = None
    amount: int
    platform_fee: int
    status: str
    refunded_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
