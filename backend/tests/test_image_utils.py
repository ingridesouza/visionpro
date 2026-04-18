import base64

import cv2
import numpy as np

from utils.image_utils import decode_base64_frame, resize_frame


class TestDecodeBase64Frame:
    def test_valid_jpeg(self):
        img = np.zeros((50, 50, 3), dtype=np.uint8)
        _, buf = cv2.imencode(".jpg", img)
        b64 = base64.b64encode(buf.tobytes()).decode()
        result = decode_base64_frame(b64)
        assert result is not None
        assert result.shape[0] == 50
        assert result.shape[1] == 50

    def test_data_uri_prefix(self):
        img = np.zeros((20, 20, 3), dtype=np.uint8)
        _, buf = cv2.imencode(".jpg", img)
        b64 = "data:image/jpeg;base64," + base64.b64encode(buf.tobytes()).decode()
        result = decode_base64_frame(b64)
        assert result is not None

    def test_empty_string(self):
        assert decode_base64_frame("") is None

    def test_invalid_base64(self):
        assert decode_base64_frame("not-valid-base64!!!") is None

    def test_valid_base64_but_not_image(self):
        b64 = base64.b64encode(b"hello world").decode()
        assert decode_base64_frame(b64) is None


class TestResizeFrame:
    def test_no_resize_needed(self):
        frame = np.zeros((100, 200, 3), dtype=np.uint8)
        result = resize_frame(frame, max_width=480)
        assert result.shape == (100, 200, 3)

    def test_resize_needed(self):
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        result = resize_frame(frame, max_width=320)
        assert result.shape[1] == 320
        assert result.shape[0] == 240  # aspect ratio preserved

    def test_exact_width(self):
        frame = np.zeros((100, 480, 3), dtype=np.uint8)
        result = resize_frame(frame, max_width=480)
        assert result.shape[1] == 480
