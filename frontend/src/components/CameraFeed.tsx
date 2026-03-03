import { useCamera } from "../hooks/useCamera";
import { useWebSocket } from "../hooks/useWebSocket";
import { useFrameCapture } from "../hooks/useFrameCapture";
import { EmotionOverlay } from "./EmotionOverlay";
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

  const isActive = camStatus === "active" && wsStatus === "connected";

  useFrameCapture({
    videoRef,
    fps: CAPTURE_FPS,
    quality: JPEG_QUALITY,
    onFrame: sendFrame,
    enabled: isActive,
  });

  const handleAllow = () => {
    startCamera();
    connect();
  };

  if (camStatus === "idle" || camStatus === "denied") {
    return <PermissionPrompt onAllow={handleAllow} error={camError} />;
  }

  return (
    <div className="camera-feed-container">
      <ConnectionStatus status={wsStatus} />
      <div className="video-wrapper">
        <video ref={videoRef} autoPlay playsInline muted />
        {lastResult && <EmotionOverlay result={lastResult} />}
      </div>
    </div>
  );
}
