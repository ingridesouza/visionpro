import base64
from unittest.mock import MagicMock

import numpy as np
import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture()
def client():
    """FastAPI test client."""
    return TestClient(app)


@pytest.fixture()
def dummy_frame_b64() -> str:
    """A valid 10x10 JPEG encoded as base64."""
    import cv2
    img = np.zeros((10, 10, 3), dtype=np.uint8)
    _, buf = cv2.imencode(".jpg", img)
    return base64.b64encode(buf.tobytes()).decode()


@pytest.fixture()
def mock_emotion_detector():
    detector = MagicMock()
    detector.detect_emotion.return_value = {
        "dominant_emotion": "happy",
        "emotion_scores": {"happy": 95.0, "sad": 2.0, "neutral": 3.0},
        "face_region": {"x": 10, "y": 10, "w": 50, "h": 50},
    }
    return detector


@pytest.fixture()
def mock_drowsiness_detector():
    detector = MagicMock()
    detector.detect.return_value = False
    return detector
