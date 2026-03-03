import logging
from typing import Any, Dict, Optional

import numpy as np
from deepface import DeepFace

logger = logging.getLogger(__name__)


class EmotionDetector:
    def __init__(self, detector_backend: str = "opencv"):
        self.detector_backend = detector_backend

    def warm_up(self):
        """Force model download and loading on startup."""
        dummy = np.zeros((100, 100, 3), dtype=np.uint8)
        try:
            DeepFace.analyze(
                dummy,
                actions=["emotion"],
                detector_backend=self.detector_backend,
                enforce_detection=False,
                silent=True,
            )
        except Exception:
            pass

    def detect_emotion(self, frame: np.ndarray) -> Optional[Dict[str, Any]]:
        """Analyze a single frame for emotion."""
        try:
            results = DeepFace.analyze(
                frame,
                actions=["emotion"],
                detector_backend=self.detector_backend,
                enforce_detection=False,
                silent=True,
            )
            if results and len(results) > 0:
                result = results[0]
                scores = {k: float(v) for k, v in result["emotion"].items()}
                raw_region = result["region"]
                region = {
                    "x": int(raw_region["x"]),
                    "y": int(raw_region["y"]),
                    "w": int(raw_region["w"]),
                    "h": int(raw_region["h"]),
                }
                return {
                    "dominant_emotion": result["dominant_emotion"],
                    "emotion_scores": scores,
                    "face_region": region,
                }
        except Exception as e:
            logger.error(f"Emotion detection failed: {e}", exc_info=True)
            return None
        return None
