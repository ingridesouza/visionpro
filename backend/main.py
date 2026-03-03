from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers import health, websocket
from services.emotion_detector import EmotionDetector
from services.drowsiness_detector import DrowsinessDetector


@asynccontextmanager
async def lifespan(app: FastAPI):
    detector = EmotionDetector(detector_backend=settings.DETECTOR_BACKEND)
    detector.warm_up()
    app.state.emotion_detector = detector
    app.state.drowsiness_detector = DrowsinessDetector()
    yield


app = FastAPI(title="VisionPro - Emotion Detection", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(websocket.router)
