import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from services.frame_processor import FrameProcessor

logger = logging.getLogger(__name__)
router = APIRouter()


@router.websocket("/ws/emotion")
async def emotion_websocket(websocket: WebSocket):
    await websocket.accept()
    processor = FrameProcessor(
        emotion_detector=websocket.app.state.emotion_detector,
        drowsiness_detector=websocket.app.state.drowsiness_detector,
    )

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            try:
                result = await processor.process_frame(message.get("frame", ""))
            except Exception as e:
                logger.warning(f"Frame processing error: {e}")
                result = {
                    "emotion": None,
                    "face_detected": False,
                    "error": "Frame processing failed",
                }

            await websocket.send_json(result)
    except WebSocketDisconnect:
        logger.info("Client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close(code=1011, reason=str(e))
