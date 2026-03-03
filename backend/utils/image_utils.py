import base64
from typing import Optional

import cv2
import numpy as np


def decode_base64_frame(data: str) -> Optional[np.ndarray]:
    """Decode a base64 JPEG string into a BGR numpy array."""
    try:
        if "," in data:
            data = data.split(",", 1)[1]
        img_bytes = base64.b64decode(data)
        nparr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return frame
    except Exception:
        return None


def resize_frame(frame: np.ndarray, max_width: int = 480) -> np.ndarray:
    """Resize frame maintaining aspect ratio."""
    h, w = frame.shape[:2]
    if w <= max_width:
        return frame
    ratio = max_width / w
    new_h = int(h * ratio)
    return cv2.resize(frame, (max_width, new_h))
