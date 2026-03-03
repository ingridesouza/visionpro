export interface EmotionResult {
  emotion: string | null;
  confidence: number | null;
  all_scores: Record<string, number> | null;
  face_region: { x: number; y: number; w: number; h: number } | null;
  face_detected: boolean;
  processing_time_ms: number;
  error?: string;
}

export type EmotionLabel =
  | "happy"
  | "sad"
  | "angry"
  | "surprise"
  | "neutral"
  | "sleeping"
  | "fear"
  | "disgust";
