import time
from typing import Any

from fastapi import APIRouter, Request

router = APIRouter(tags=["health"])

_start_time = time.monotonic()


@router.get("/health")
async def health_check(request: Request) -> dict[str, Any]:
    uptime = round(time.monotonic() - _start_time, 1)
    ws_connections = getattr(request.app.state, "ws_connection_count", 0)

    return {
        "status": "ok",
        "service": "visionpro-emotion-detection",
        "uptime_seconds": uptime,
        "active_connections": ws_connections,
    }


@router.get("/health/ready")
async def readiness_check(request: Request) -> dict[str, Any]:
    """Check that detectors are loaded and ready."""
    emotion_ready = hasattr(request.app.state, "emotion_detector")
    drowsiness_ready = hasattr(request.app.state, "drowsiness_detector")

    ready = emotion_ready and drowsiness_ready
    return {
        "ready": ready,
        "detectors": {
            "emotion": emotion_ready,
            "drowsiness": drowsiness_ready,
        },
    }
