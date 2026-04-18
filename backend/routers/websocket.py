import contextlib
import json
import logging
from uuid import uuid4

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status

from config import settings
from middleware.auth import validate_token
from middleware.rate_limiter import RateLimiter
from models.schemas import FrameMessage
from services.frame_processor import FrameProcessor

logger = logging.getLogger(__name__)
router = APIRouter()


@router.websocket("/ws/emotion")
async def emotion_websocket(websocket: WebSocket):
    client_id = uuid4().hex[:12]

    # --- Connection limit ---
    if websocket.app.state.ws_connection_count >= settings.MAX_WS_CONNECTIONS:
        logger.warning("Connection rejected: max connections reached (%s)", settings.MAX_WS_CONNECTIONS)
        await websocket.close(code=status.WS_1013_TRY_AGAIN_LATER, reason="Server busy")
        return

    # --- Auth check (from query param or first message) ---
    token = websocket.query_params.get("token")
    if not validate_token(token):
        logger.warning("Connection rejected: invalid token from %s", client_id)
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Unauthorized")
        return

    await websocket.accept()
    websocket.app.state.ws_connection_count += 1
    logger.info("Client %s connected (total: %d)", client_id, websocket.app.state.ws_connection_count)

    rate_limiter: RateLimiter = websocket.app.state.rate_limiter
    processor = FrameProcessor(
        emotion_detector=websocket.app.state.emotion_detector,
        drowsiness_detector=websocket.app.state.drowsiness_detector,
        target_width=settings.TARGET_FRAME_WIDTH,
    )

    try:
        while True:
            raw = await websocket.receive_text()

            # --- Size validation ---
            if len(raw) > settings.MAX_FRAME_SIZE:
                logger.warning("Frame too large from %s: %d bytes", client_id, len(raw))
                await websocket.send_json({
                    "emotion": None,
                    "face_detected": False,
                    "error": "Frame too large",
                })
                continue

            # --- Rate limiting ---
            if not rate_limiter.allow(client_id):
                await websocket.send_json({
                    "emotion": None,
                    "face_detected": False,
                    "error": "Rate limited",
                })
                continue

            # --- Parse & validate ---
            try:
                message = json.loads(raw)
            except (json.JSONDecodeError, ValueError):
                logger.warning("Invalid JSON from %s", client_id)
                await websocket.send_json({
                    "emotion": None,
                    "face_detected": False,
                    "error": "Invalid message format",
                })
                continue

            try:
                validated = FrameMessage.model_validate(message)
            except Exception:
                await websocket.send_json({
                    "emotion": None,
                    "face_detected": False,
                    "error": "Invalid message schema",
                })
                continue

            # --- Process ---
            try:
                result = await processor.process_frame(validated.frame)
            except Exception as e:
                logger.warning("Frame processing error for %s: %s", client_id, e)
                result = {
                    "emotion": None,
                    "face_detected": False,
                    "error": "Frame processing failed",
                }

            await websocket.send_json(result)

    except WebSocketDisconnect:
        logger.info("Client %s disconnected", client_id)
    except Exception as e:
        logger.error("WebSocket error for %s: %s", client_id, e, exc_info=True)
        with contextlib.suppress(Exception):
            await websocket.close(code=1011, reason="Internal error")
    finally:
        websocket.app.state.ws_connection_count -= 1
        rate_limiter.remove_client(client_id)
        logger.info("Client %s cleaned up (remaining: %d)", client_id, websocket.app.state.ws_connection_count)
