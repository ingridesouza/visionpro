from typing import Dict, Optional

from pydantic import BaseModel


class FrameMessage(BaseModel):
    frame: str
    timestamp: Optional[float] = None


class EmotionResponse(BaseModel):
    emotion: Optional[str] = None
    confidence: Optional[float] = None
    all_scores: Optional[Dict[str, float]] = None
    face_region: Optional[Dict[str, int]] = None
    face_detected: bool = False
    processing_time_ms: int = 0
