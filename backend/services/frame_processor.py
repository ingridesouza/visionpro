import asyncio
import logging
import time
from typing import Any

from services.circuit_breaker import CircuitBreaker, CircuitOpenError
from services.drowsiness_detector import DrowsinessDetector
from services.emotion_detector import EmotionDetector
from utils.image_utils import decode_base64_frame, resize_frame

logger = logging.getLogger(__name__)


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

        self._emotion_circuit = CircuitBreaker("emotion", failure_threshold=5, recovery_timeout=30.0)
        self._drowsiness_circuit = CircuitBreaker("drowsiness", failure_threshold=5, recovery_timeout=30.0)

    def _detect_emotion_safe(self, frame: Any) -> dict[str, Any] | None:
        """Emotion detection with circuit breaker."""
        try:
            return self._emotion_circuit.call(self.emotion_detector.detect_emotion, frame)
        except CircuitOpenError:
            logger.debug("Emotion detection circuit open — skipping")
            return None
        except Exception as e:
            logger.warning("Emotion detection failed: %s", e)
            return None

    def _detect_drowsiness_safe(self, frame: Any) -> bool:
        """Drowsiness detection with circuit breaker."""
        try:
            return self._drowsiness_circuit.call(self.drowsiness_detector.detect, frame)
        except CircuitOpenError:
            logger.debug("Drowsiness detection circuit open — skipping")
            return False
        except Exception as e:
            logger.warning("Drowsiness detection failed: %s", e)
            return False

    async def process_frame(self, frame_base64: str) -> dict[str, Any]:
        start = time.monotonic()

        frame = decode_base64_frame(frame_base64)
        if frame is None:
            return {"error": "Invalid frame data", "emotion": None, "face_detected": False}

        frame = resize_frame(frame, max_width=self.target_width)

        loop = asyncio.get_event_loop()
        emotion_result, is_drowsy = await asyncio.gather(
            loop.run_in_executor(None, self._detect_emotion_safe, frame),
            loop.run_in_executor(None, self._detect_drowsiness_safe, frame),
        )

        elapsed_ms = round((time.monotonic() - start) * 1000)

        if is_drowsy:
            return {
                "emotion": "sleeping",
                "confidence": 0.85,
                "all_scores": emotion_result.get("emotion_scores", {}) if emotion_result else {},
                "face_region": emotion_result.get("face_region") if emotion_result else None,
                "face_detected": True,
                "processing_time_ms": elapsed_ms,
            }

        if emotion_result:
            return {
                "emotion": emotion_result["dominant_emotion"],
                "confidence": max(emotion_result["emotion_scores"].values()) / 100.0,
                "all_scores": emotion_result["emotion_scores"],
                "face_region": emotion_result["face_region"],
                "face_detected": True,
                "processing_time_ms": elapsed_ms,
            }

        return {
            "emotion": None,
            "face_detected": False,
            "processing_time_ms": elapsed_ms,
        }
