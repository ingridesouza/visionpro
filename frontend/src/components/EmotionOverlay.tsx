import type { EmotionResult } from "../types/emotion";
import { EMOTION_CONFIG } from "../constants/emotions";
import { t } from "../lib/i18n";

interface Props {
  result: EmotionResult;
}

export function EmotionOverlay({ result }: Props) {
  if (!result.face_detected || !result.emotion) {
    return (
      <div className="emotion-overlay no-face" role="status" aria-live="polite">
        {t("emotion.no_face")}
      </div>
    );
  }

  const config = EMOTION_CONFIG[result.emotion] ?? EMOTION_CONFIG.neutral;
  const confidence = result.confidence
    ? Math.round(result.confidence * 100)
    : 0;
  const emotionLabel = t(`emotion.${result.emotion}`) || config.label;

  return (
    <div
      className="emotion-overlay"
      role="status"
      aria-live="polite"
      aria-label={`${emotionLabel} ${confidence}%`}
    >
      <span className="emotion-emoji" aria-hidden="true">{config.emoji}</span>
      <span className="emotion-label" style={{ color: config.color }}>
        {emotionLabel}
      </span>
      <span className="emotion-confidence" aria-label={`${confidence}% confianca`}>
        {confidence}%
      </span>
      <span className="processing-time" aria-hidden="true">
        {result.processing_time_ms}ms
      </span>
    </div>
  );
}
