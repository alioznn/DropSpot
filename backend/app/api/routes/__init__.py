from fastapi import APIRouter

from app.api.routes import auth, drops

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(drops.router, prefix="/drops", tags=["drops"])

