import { useState, useRef, useCallback } from "react";
import { useCamera } from "../hooks/useCamera";
import { useWebSocket } from "../hooks/useWebSocket";
import { useFrameCapture } from "../hooks/useFrameCapture";
import { useHandTracking } from "../hooks/useHandTracking";
import { EmotionOverlay } from "./EmotionOverlay";
import { DrawingControls } from "./DrawingControls";
import { PermissionPrompt } from "./PermissionPrompt";
import { ConnectionStatus } from "./ConnectionStatus";
import { WS_URL, CAPTURE_FPS, JPEG_QUALITY } from "../constants/config";

export function CameraFeed() {
  const {
    videoRef,
    status: camStatus,
    error: camError,
    startCamera,
  } = useCamera();
  const {
    status: wsStatus,
    lastResult,
    connect,
    sendFrame,
  } = useWebSocket(WS_URL);

  const landmarksCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const [drawingEnabled, setDrawingEnabled] = useState(false);

  const isActive = camStatus === "active" && wsStatus === "connected";

  useFrameCapture({
    videoRef,
    fps: CAPTURE_FPS,
    quality: JPEG_QUALITY,
    onFrame: sendFrame,
    enabled: isActive,
  });

  const { clearDrawing } = useHandTracking({
    videoRef,
    landmarksCanvasRef,
    drawingCanvasRef,
    enabled: camStatus === "active",
    drawingEnabled,
  });

  const handleAllow = () => {
    startCamera();
    connect();
  };

  const handleToggleDrawing = useCallback(() => {
    setDrawingEnabled((prev) => !prev);
  }, []);

  const handleClearDrawing = useCallback(() => {
    clearDrawing();
  }, [clearDrawing]);

  if (camStatus === "idle" || camStatus === "denied") {
    return <PermissionPrompt onAllow={handleAllow} error={camError} />;
  }

  return (
    <div className="camera-feed-container">
      <ConnectionStatus status={wsStatus} />
      <div className="video-wrapper">
        <video ref={videoRef} autoPlay playsInline muted />
        <canvas ref={landmarksCanvasRef} className="hand-landmarks-canvas" />
        <canvas ref={drawingCanvasRef} className="drawing-canvas" />
        {lastResult && <EmotionOverlay result={lastResult} />}
      </div>
      <DrawingControls
        drawingEnabled={drawingEnabled}
        onToggle={handleToggleDrawing}
        onClear={handleClearDrawing}
      />
    </div>
  );
}
