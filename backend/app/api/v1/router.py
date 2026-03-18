"""
============================================================
Tarot Web App - API v1 Router
backend/app/api/v1/router.py
============================================================
"""

from fastapi import APIRouter

from app.api.v1.endpoints import cards, draw

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(cards.router)
api_v1_router.include_router(draw.router)
