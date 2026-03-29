from fastapi import APIRouter

from app.core.config import get_settings

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check() -> dict[str, str]:
    settings = get_settings()
    return {
        "status": "ok",
        "service": settings.app_name,
        "environment": settings.app_env,
    }


@router.get("/health/ready")
async def readiness_check() -> dict[str, str]:
    settings = get_settings()
    settings.ensure_directories()
    return {
        "status": "ready",
        "service": settings.app_name,
    }