import os
from typing import Any, Dict, List, Optional

import mediapipe as mp
import numpy as np
from mediapipe.tasks.python import BaseOptions
from mediapipe.tasks.python.vision import (
    HandLandmarker,
    HandLandmarkerOptions,
    RunningMode,
)

MODEL_PATH = os.path.join(
    os.path.dirname(__file__), "..", "models", "assets", "hand_landmarker.task"
)

INDEX_FINGER_TIP = 8


class HandDetector:
    def __init__(self, num_hands: int = 2):
        options = HandLandmarkerOptions(
            base_options=BaseOptions(model_asset_path=MODEL_PATH),
            running_mode=RunningMode.IMAGE,
            num_hands=num_hands,
            min_hand_detection_confidence=0.5,
            min_hand_presence_confidence=0.5,
            min_tracking_confidence=0.5,
        )
        self.landmarker = HandLandmarker.create_from_options(options)

    def detect(self, frame: np.ndarray) -> Optional[List[Dict[str, Any]]]:
        """Detect hands and return normalized landmarks.

        Returns a list of hand dicts with:
          - landmarks: list of {x, y, z} (21 points, normalized 0-1)
          - handedness: "Left" or "Right"
          - index_finger_tip: {x, y} of landmark 8
        Returns None if no hands detected.
        """
        rgb_frame = frame[:, :, ::-1]
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
        result = self.landmarker.detect(mp_image)

        if not result.hand_landmarks:
            return None

        hands = []
        for i, hand_lms in enumerate(result.hand_landmarks):
            landmarks = [
                {"x": float(lm.x), "y": float(lm.y), "z": float(lm.z)}
                for lm in hand_lms
            ]

            handedness_label = "Unknown"
            if i < len(result.handedness) and result.handedness[i]:
                handedness_label = result.handedness[i][0].category_name

            hands.append({
                "landmarks": landmarks,
                "handedness": handedness_label,
                "index_finger_tip": {
                    "x": landmarks[INDEX_FINGER_TIP]["x"],
                    "y": landmarks[INDEX_FINGER_TIP]["y"],
                },
            })

        return hands
