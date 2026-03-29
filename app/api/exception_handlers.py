import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.core.exceptions import (
    AppException,
    ExternalServiceAppException,
    NotFoundAppException,
    ValidationAppException,
)

logger = logging.getLogger(__name__)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(ValidationAppException)
    async def handle_validation_exception(_: Request, exc: ValidationAppException):
        return JSONResponse(status_code=400, content={"detail": str(exc)})

    @app.exception_handler(NotFoundAppException)
    async def handle_not_found_exception(_: Request, exc: NotFoundAppException):
        return JSONResponse(status_code=404, content={"detail": str(exc)})

    @app.exception_handler(ExternalServiceAppException)
    async def handle_external_service_exception(_: Request, exc: ExternalServiceAppException):
        return JSONResponse(status_code=502, content={"detail": str(exc)})

    @app.exception_handler(AppException)
    async def handle_app_exception(_: Request, exc: AppException):
        return JSONResponse(status_code=400, content={"detail": str(exc)})

    @app.exception_handler(Exception)
    async def handle_unexpected_exception(request: Request, exc: Exception):
        logger.exception(
            "unhandled_exception",
            extra={"path": str(request.url.path), "method": request.method},
        )
        return JSONResponse(status_code=500, content={"detail": "Internal server error."})