export interface HandLandmarkPoint {
  x: number;
  y: number;
  z: number;
}

export interface HandData {
  landmarks: HandLandmarkPoint[];
  handedness: string;
  index_finger_tip: { x: number; y: number };
}

export interface EmotionResult {
  emotion: string | null;
  confidence: number | null;
  all_scores: Record<string, number> | null;
  face_region: { x: number; y: number; w: number; h: number } | null;
  face_detected: boolean;
  processing_time_ms: number;
  error?: string;
  hands?: HandData[] | null;
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
