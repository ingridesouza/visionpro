import pytest

from services.frame_processor import FrameProcessor


@pytest.mark.asyncio
async def test_invalid_frame(mock_emotion_detector, mock_drowsiness_detector):
    processor = FrameProcessor(mock_emotion_detector, mock_drowsiness_detector)
    result = await processor.process_frame("")
    assert result["error"] == "Invalid frame data"
    assert result["face_detected"] is False


@pytest.mark.asyncio
async def test_valid_frame_with_emotion(mock_emotion_detector, mock_drowsiness_detector, dummy_frame_b64):
    processor = FrameProcessor(mock_emotion_detector, mock_drowsiness_detector)
    result = await processor.process_frame(dummy_frame_b64)
    assert result["face_detected"] is True
    assert result["emotion"] == "happy"
    assert "processing_time_ms" in result


@pytest.mark.asyncio
async def test_drowsy_overrides_emotion(mock_emotion_detector, mock_drowsiness_detector, dummy_frame_b64):
    mock_drowsiness_detector.detect.return_value = True
    processor = FrameProcessor(mock_emotion_detector, mock_drowsiness_detector)
    result = await processor.process_frame(dummy_frame_b64)
    assert result["emotion"] == "sleeping"


@pytest.mark.asyncio
async def test_no_face_detected(mock_drowsiness_detector, dummy_frame_b64):
    from unittest.mock import MagicMock
    no_face_detector = MagicMock()
    no_face_detector.detect_emotion.return_value = None
    processor = FrameProcessor(no_face_detector, mock_drowsiness_detector)
    result = await processor.process_frame(dummy_frame_b64)
    assert result["face_detected"] is False
    assert result["emotion"] is None
