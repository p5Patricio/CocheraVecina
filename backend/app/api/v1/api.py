from fastapi import APIRouter
from app.api.v1.endpoints import auth, spots, bookings, payments, reviews

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(spots.router, prefix="/spots", tags=["Parking Spots"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["Bookings"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments & Stripe"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])
