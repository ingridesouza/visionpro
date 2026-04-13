from typing import Optional

from pydantic import BaseModel, Field, field_validator


class FrameMessage(BaseModel):
    frame: str = Field(..., min_length=10, max_length=1_000_000)
    timestamp: Optional[float] = None

    @field_validator("frame")
    @classmethod
    def validate_frame_format(cls, v: str) -> str:
        """Ensure frame is plausible base64 data (data URI or raw base64)."""
        content = v.split(",", 1)[-1] if "," in v else v
        if len(content) < 10:
            raise ValueError("Frame data too short")
        # Basic base64 character check (not full decode — that happens in processing)
        allowed = set("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r")
        sample = content[:200]
        if not all(c in allowed for c in sample):
            raise ValueError("Frame contains invalid base64 characters")
        return v


class EmotionResponse(BaseModel):
    emotion: Optional[str] = None
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    all_scores: Optional[dict[str, float]] = None
    face_region: Optional[dict[str, int]] = None
    face_detected: bool = False
    processing_time_ms: int = Field(0, ge=0)
    error: Optional[str] = None
