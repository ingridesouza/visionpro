import { useRef, useEffect, useCallback } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task";
const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";

const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

const INDEX_TIP = 8;

interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
}

interface Options {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  landmarksCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  drawingCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  enabled: boolean;
  drawingEnabled: boolean;
  onLandmarks?: (landmarks: NormalizedLandmark[][]) => void;
}

export function useHandTracking({
  videoRef,
  landmarksCanvasRef,
  drawingCanvasRef,
  enabled,
  drawingEnabled,
  onLandmarks,
}: Options) {
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const rafRef = useRef(0);
  const prevTipRef = useRef<{ x: number; y: number } | null>(null);
  const drawingEnabledRef = useRef(drawingEnabled);
  const enabledRef = useRef(enabled);
  const drawCanvasReadyRef = useRef(false);
  const onLandmarksRef = useRef(onLandmarks);

  drawingEnabledRef.current = drawingEnabled;
  enabledRef.current = enabled;
  onLandmarksRef.current = onLandmarks;

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const vision = await FilesetResolver.forVisionTasks(WASM_URL);
      if (cancelled) return;
      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
        runningMode: "VIDEO",
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      if (!cancelled) landmarkerRef.current = landmarker;
    }
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let lastVideoTime = -1;

    function loop() {
      const video = videoRef.current;
      const landmarker = landmarkerRef.current;

      if (
        enabledRef.current &&
        video &&
        landmarker &&
        video.readyState >= 2 &&
        video.currentTime !== lastVideoTime
      ) {
        lastVideoTime = video.currentTime;
        const result = landmarker.detectForVideo(video, performance.now());
        const w = video.videoWidth;
        const h = video.videoHeight;

        // --- Emit raw landmarks ---
        if (onLandmarksRef.current && result.landmarks?.length) {
          onLandmarksRef.current(result.landmarks as NormalizedLandmark[][]);
        }

        // --- Landmarks canvas ---
        const lmCanvas = landmarksCanvasRef.current;
        if (lmCanvas) {
          if (lmCanvas.width !== w || lmCanvas.height !== h) {
            lmCanvas.width = w;
            lmCanvas.height = h;
          }
          const ctx = lmCanvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, w, h);
            if (result.landmarks) {
              for (const hand of result.landmarks) {
                ctx.strokeStyle = "rgba(0, 255, 0, 0.7)";
                ctx.lineWidth = 2;
                for (const [si, ei] of HAND_CONNECTIONS) {
                  ctx.beginPath();
                  ctx.moveTo(hand[si].x * w, hand[si].y * h);
                  ctx.lineTo(hand[ei].x * w, hand[ei].y * h);
                  ctx.stroke();
                }
                for (const lm of hand) {
                  ctx.beginPath();
                  ctx.arc(lm.x * w, lm.y * h, 4, 0, Math.PI * 2);
                  ctx.fillStyle = "rgba(255, 0, 0, 0.8)";
                  ctx.fill();
                }
                const tip = hand[INDEX_TIP];
                ctx.beginPath();
                ctx.arc(tip.x * w, tip.y * h, 7, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(0, 150, 255, 0.9)";
                ctx.fill();
              }
            }
          }
        }

        // --- Drawing canvas (incremental) ---
        const drawCanvas = drawingCanvasRef.current;
        if (drawCanvas) {
          if (!drawCanvasReadyRef.current && w > 0) {
            drawCanvas.width = w;
            drawCanvas.height = h;
            drawCanvasReadyRef.current = true;
          }

          if (drawingEnabledRef.current) {
            const tip = result.landmarks?.[0]?.[INDEX_TIP];
            if (tip) {
              if (prevTipRef.current) {
                const ctx = drawCanvas.getContext("2d");
                if (ctx) {
                  ctx.strokeStyle = "#ff4444";
                  ctx.lineWidth = 3;
                  ctx.lineCap = "round";
                  ctx.beginPath();
                  ctx.moveTo(
                    prevTipRef.current.x * w,
                    prevTipRef.current.y * h,
                  );
                  ctx.lineTo(tip.x * w, tip.y * h);
                  ctx.stroke();
                }
              }
              prevTipRef.current = { x: tip.x, y: tip.y };
            } else {
              prevTipRef.current = null;
            }
          } else {
            prevTipRef.current = null;
          }
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [videoRef, landmarksCanvasRef, drawingCanvasRef]);

  const clearDrawing = useCallback(() => {
    const canvas = drawingCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    prevTipRef.current = null;
  }, [drawingCanvasRef]);

  return { clearDrawing };
}
