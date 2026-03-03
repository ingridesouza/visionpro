import type { EmotionResult } from "../types/emotion";
import { EMOTION_CONFIG } from "../constants/emotions";

interface Props {
  result: EmotionResult;
}

export function EmotionOverlay({ result }: Props) {
  if (!result.face_detected || !result.emotion) {
    return <div className="emotion-overlay no-face">Nenhum rosto detectado</div>;
  }

  const config = EMOTION_CONFIG[result.emotion] ?? EMOTION_CONFIG.neutral;
  const confidence = result.confidence
    ? Math.round(result.confidence * 100)
    : 0;

  return (
    <div className="emotion-overlay" style={{ borderColor: config.color }}>
      <span className="emotion-emoji">{config.emoji}</span>
      <span className="emotion-label" style={{ color: config.color }}>
        {config.label}
      </span>
      <span className="emotion-confidence">{confidence}%</span>
      <span className="processing-time">{result.processing_time_ms}ms</span>
    </div>
  );
}
