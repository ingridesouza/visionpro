import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from middleware.rate_limiter import RateLimiter
from middleware.security import SecurityHeadersMiddleware
from routers import health, websocket
from services.drowsiness_detector import DrowsinessDetector
from services.emotion_detector import EmotionDetector


def _configure_logging() -> None:
    level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    handler = logging.StreamHandler(sys.stdout)
    if settings.LOG_FORMAT == "json":
        fmt = '{"time":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","message":"%(message)s"}'
    else:
        fmt = "%(asctime)s %(levelname)-8s %(name)s — %(message)s"
    handler.setFormatter(logging.Formatter(fmt))
    logging.root.handlers = [handler]
    logging.root.setLevel(level)


@asynccontextmanager
async def lifespan(app: FastAPI):
    _configure_logging()
    logger = logging.getLogger(__name__)

    logger.info("Starting VisionPro — warming up detectors")
    detector = EmotionDetector(detector_backend=settings.DETECTOR_BACKEND)
    detector.warm_up()
    app.state.emotion_detector = detector
    app.state.drowsiness_detector = DrowsinessDetector()
    app.state.rate_limiter = RateLimiter(
        rate=settings.RATE_LIMIT_FPS,
        burst=settings.RATE_LIMIT_BURST,
    )
    app.state.ws_connection_count = 0
    logger.info("VisionPro ready")
    yield
    logger.info("Shutting down VisionPro")


app = FastAPI(
    title="VisionPro - Emotion Detection",
    lifespan=lifespan,
    docs_url="/docs" if not settings.AUTH_ENABLED else None,
    redoc_url=None,
)

app.add_middleware(SecurityHeadersMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)

app.include_router(health.router)
app.include_router(websocket.router)
