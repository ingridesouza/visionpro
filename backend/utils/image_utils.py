import base64
import logging

import cv2
import numpy as np

logger = logging.getLogger(__name__)


def decode_base64_frame(data: str) -> np.ndarray | None:
    """Decode a base64 JPEG string into a BGR numpy array."""
    if not data:
        return None
    try:
        if "," in data:
            data = data.split(",", 1)[1]
        img_bytes = base64.b64decode(data, validate=True)
        nparr = np.frombuffer(img_bytes, np.uint8)
        if nparr.size == 0:
            return None
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None or frame.size == 0:
            return None
        return frame
    except (base64.binascii.Error, ValueError) as e:
        logger.debug("Base64 decode failed: %s", e)
        return None
    except Exception as e:
        logger.warning("Frame decode unexpected error: %s", e)
        return None


def resize_frame(frame: np.ndarray, max_width: int = 480) -> np.ndarray:
    """Resize frame maintaining aspect ratio."""
    h, w = frame.shape[:2]
    if w <= max_width:
        return frame
    ratio = max_width / w
    new_h = int(h * ratio)
    return cv2.resize(frame, (max_width, new_h), interpolation=cv2.INTER_AREA)
