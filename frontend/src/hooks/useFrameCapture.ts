import { useRef, useCallback, useEffect } from "react";

interface UseFrameCaptureOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  fps: number;
  quality: number;
  onFrame: (base64: string) => void;
  enabled: boolean;
}

export function useFrameCapture({
  videoRef,
  fps,
  quality,
  onFrame,
  enabled,
}: UseFrameCaptureOptions) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    onFrame(dataUrl);
  }, [videoRef, quality, onFrame]);

  useEffect(() => {
    if (enabled) {
      const intervalMs = 1000 / fps;
      intervalRef.current = window.setInterval(captureFrame, intervalMs);
    }
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, fps, captureFrame]);
}
