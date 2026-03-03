import asyncio
import time
from typing import Any, Dict

from services.drowsiness_detector import DrowsinessDetector
from services.emotion_detector import EmotionDetector
from utils.image_utils import decode_base64_frame, resize_frame


class FrameProcessor:
    def __init__(
        self,
        emotion_detector: EmotionDetector,
        drowsiness_detector: DrowsinessDetector,
        target_width: int = 480,
    ):
        self.emotion_detector = emotion_detector
        self.drowsiness_detector = drowsiness_detector
        self.target_width = target_width

    async def process_frame(self, frame_base64: str) -> Dict[str, Any]:
        start = time.time()

        frame = decode_base64_frame(frame_base64)
        if frame is None:
            return {"error": "Invalid frame data"}

        frame = resize_frame(frame, max_width=self.target_width)

        loop = asyncio.get_event_loop()
        emotion_result, is_drowsy = await asyncio.gather(
            loop.run_in_executor(None, self.emotion_detector.detect_emotion, frame),
            loop.run_in_executor(None, self.drowsiness_detector.detect, frame),
        )

        elapsed = time.time() - start

        if is_drowsy:
            return {
                "emotion": "sleeping",
                "confidence": 0.85,
                "all_scores": emotion_result.get("emotion_scores", {}) if emotion_result else {},
                "face_region": emotion_result.get("face_region") if emotion_result else None,
                "face_detected": True,
                "processing_time_ms": round(elapsed * 1000),
            }

        if emotion_result:
            return {
                "emotion": emotion_result["dominant_emotion"],
                "confidence": max(emotion_result["emotion_scores"].values()) / 100.0,
                "all_scores": emotion_result["emotion_scores"],
                "face_region": emotion_result["face_region"],
                "face_detected": True,
                "processing_time_ms": round(elapsed * 1000),
            }

        return {
            "emotion": None,
            "face_detected": False,
            "processing_time_ms": round(elapsed * 1000),
        }
