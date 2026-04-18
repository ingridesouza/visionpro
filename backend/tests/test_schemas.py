import pytest
from pydantic import ValidationError

from models.schemas import EmotionResponse, FrameMessage


class TestFrameMessage:
    def test_valid_frame(self):
        msg = FrameMessage(frame="A" * 100)
        assert msg.frame == "A" * 100

    def test_empty_frame_rejected(self):
        with pytest.raises(ValidationError):
            FrameMessage(frame="")

    def test_too_short_frame_rejected(self):
        with pytest.raises(ValidationError):
            FrameMessage(frame="abc")

    def test_invalid_base64_chars_rejected(self):
        with pytest.raises(ValidationError):
            FrameMessage(frame="!" * 100 + "###invalid###")

    def test_optional_timestamp(self):
        msg = FrameMessage(frame="A" * 100, timestamp=1234567890.0)
        assert msg.timestamp == 1234567890.0

    def test_data_uri_accepted(self):
        msg = FrameMessage(frame="data:image/jpeg;base64," + "A" * 100)
        assert "data:image/jpeg" in msg.frame


class TestEmotionResponse:
    def test_defaults(self):
        resp = EmotionResponse()
        assert resp.emotion is None
        assert resp.face_detected is False

    def test_confidence_bounds(self):
        resp = EmotionResponse(confidence=0.95)
        assert resp.confidence == 0.95

        with pytest.raises(ValidationError):
            EmotionResponse(confidence=1.5)

        with pytest.raises(ValidationError):
            EmotionResponse(confidence=-0.1)
