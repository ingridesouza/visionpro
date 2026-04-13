import { useState, useRef, useCallback, useEffect } from "react";
import { useCamera } from "../hooks/useCamera";
import { useWebSocket } from "../hooks/useWebSocket";
import { useFrameCapture } from "../hooks/useFrameCapture";
import { useHandTracking } from "../hooks/useHandTracking";
import { useLibrasRecognition } from "../hooks/useLibrasRecognition";
import { classifyLibrasLetter } from "../lib/librasClassifier";
import { EmotionOverlay } from "./EmotionOverlay";
import { FeatureToggles } from "./FeatureToggles";
import { LibrasOverlay } from "./LibrasOverlay";
import { PermissionPrompt } from "./PermissionPrompt";
import { ConnectionStatus } from "./ConnectionStatus";
import { LoadingOverlay } from "./LoadingOverlay";
import { WS_URL, CAPTURE_FPS, JPEG_QUALITY } from "../constants/config";
import { t } from "../lib/i18n";

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

  const [emotionEnabled, setEmotionEnabled] = useState(true);
  const [drawingEnabled, setDrawingEnabled] = useState(false);
  const [librasEnabled, setLibrasEnabled] = useState(false);

  const librasEnabledRef = useRef(librasEnabled);
  useEffect(() => {
    librasEnabledRef.current = librasEnabled;
  }, [librasEnabled]);

  const isActive = camStatus === "active" && wsStatus === "connected";

  useFrameCapture({
    videoRef,
    fps: CAPTURE_FPS,
    quality: JPEG_QUALITY,
    onFrame: sendFrame,
    enabled: isActive && emotionEnabled,
  });

  const libras = useLibrasRecognition({ enabled: librasEnabled });

  const handleLandmarks = useCallback(
    (landmarks: { x: number; y: number; z: number }[][]) => {
      if (librasEnabledRef.current && landmarks[0]) {
        libras.feedResult(classifyLibrasLetter(landmarks[0]));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [libras.feedResult],
  );

  const { clearDrawing } = useHandTracking({
    videoRef,
    landmarksCanvasRef,
    drawingCanvasRef,
    enabled: camStatus === "active",
    drawingEnabled,
    onLandmarks: handleLandmarks,
  });

  const handleAllow = () => {
    startCamera();
    connect();
  };

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case "1":
          setEmotionEnabled((p) => !p);
          break;
        case "2":
          setDrawingEnabled((p) => !p);
          break;
        case "3":
          setLibrasEnabled((p) => !p);
          break;
        case "Escape":
          clearDrawing();
          break;
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clearDrawing]);

  if (camStatus === "idle" || camStatus === "denied") {
    return <PermissionPrompt onAllow={handleAllow} error={camError} />;
  }

  if (camStatus === "requesting") {
    return <LoadingOverlay message={t("loading.camera")} />;
  }

  return (
    <main className="camera-feed-container" role="main" aria-label="Camera feed">
      <ConnectionStatus status={wsStatus} />
      <div className="video-wrapper">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          aria-label="Camera preview"
        />
        <canvas
          ref={landmarksCanvasRef}
          className="hand-landmarks-canvas"
          aria-hidden="true"
        />
        <canvas
          ref={drawingCanvasRef}
          className="drawing-canvas"
          aria-hidden="true"
        />
        {emotionEnabled && lastResult && <EmotionOverlay result={lastResult} />}
        {librasEnabled && (
          <LibrasOverlay
            currentLetter={libras.currentLetter}
            confidence={libras.currentConfidence}
            text={libras.text}
          />
        )}
      </div>
      <FeatureToggles
        emotionEnabled={emotionEnabled}
        drawingEnabled={drawingEnabled}
        librasEnabled={librasEnabled}
        onToggleEmotion={() => setEmotionEnabled((p) => !p)}
        onToggleDrawing={() => setDrawingEnabled((p) => !p)}
        onToggleLibras={() => setLibrasEnabled((p) => !p)}
        onClearDrawing={clearDrawing}
        onClearText={libras.clearText}
        onBackspace={libras.backspace}
      />
    </main>
  );
}
