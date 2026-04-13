import os

import mediapipe as mp
import numpy as np
from mediapipe.tasks.python import BaseOptions
from mediapipe.tasks.python.vision import (
    FaceLandmarker,
    FaceLandmarkerOptions,
    RunningMode,
)

MODEL_PATH = os.path.join(
    os.path.dirname(__file__), "..", "models", "assets", "face_landmarker.task"
)


class DrowsinessDetector:
    LEFT_EYE: list[int] = [362, 385, 387, 263, 373, 380]
    RIGHT_EYE: list[int] = [33, 160, 158, 133, 153, 144]
    EAR_THRESHOLD = 0.21
    CONSECUTIVE_FRAMES_THRESHOLD = 6  # ~2 seconds at 3 FPS

    def __init__(self):
        options = FaceLandmarkerOptions(
            base_options=BaseOptions(model_asset_path=MODEL_PATH),
            running_mode=RunningMode.IMAGE,
            num_faces=1,
            min_face_detection_confidence=0.5,
        )
        self.landmarker = FaceLandmarker.create_from_options(options)
        self.drowsy_frame_count = 0

    def _eye_aspect_ratio(self, landmarks, eye_indices, w, h):
        points = [(landmarks[i].x * w, landmarks[i].y * h) for i in eye_indices]
        v1 = np.linalg.norm(np.array(points[1]) - np.array(points[5]))
        v2 = np.linalg.norm(np.array(points[2]) - np.array(points[4]))
        h1 = np.linalg.norm(np.array(points[0]) - np.array(points[3]))
        return (v1 + v2) / (2.0 * h1) if h1 > 0 else 0

    def detect(self, frame: np.ndarray) -> bool:
        """Returns True if drowsiness is detected."""
        rgb_frame = frame[:, :, ::-1]  # BGR to RGB
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
        result = self.landmarker.detect(mp_image)

        if not result.face_landmarks:
            return False

        landmarks = result.face_landmarks[0]
        h, w = frame.shape[:2]

        left_ear = self._eye_aspect_ratio(landmarks, self.LEFT_EYE, w, h)
        right_ear = self._eye_aspect_ratio(landmarks, self.RIGHT_EYE, w, h)
        avg_ear = (left_ear + right_ear) / 2.0

        if avg_ear < self.EAR_THRESHOLD:
            self.drowsy_frame_count += 1
        else:
            self.drowsy_frame_count = 0

        return self.drowsy_frame_count >= self.CONSECUTIVE_FRAMES_THRESHOLD
