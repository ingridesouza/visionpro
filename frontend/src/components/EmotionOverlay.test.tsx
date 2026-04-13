import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmotionOverlay } from "./EmotionOverlay";
import type { EmotionResult } from "../types/emotion";

describe("EmotionOverlay", () => {
  it("shows no face message when face not detected", () => {
    const result: EmotionResult = {
      emotion: null,
      confidence: null,
      all_scores: null,
      face_region: null,
      face_detected: false,
      processing_time_ms: 50,
    };
    render(<EmotionOverlay result={result} />);
    expect(screen.getByRole("status")).toHaveTextContent("Nenhum rosto detectado");
  });

  it("shows emotion when face detected", () => {
    const result: EmotionResult = {
      emotion: "happy",
      confidence: 0.95,
      all_scores: { happy: 95 },
      face_region: { x: 0, y: 0, w: 100, h: 100 },
      face_detected: true,
      processing_time_ms: 120,
    };
    render(<EmotionOverlay result={result} />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Feliz");
    expect(status).toHaveTextContent("95%");
  });

  it("has proper aria-live attribute", () => {
    const result: EmotionResult = {
      emotion: null,
      confidence: null,
      all_scores: null,
      face_region: null,
      face_detected: false,
      processing_time_ms: 0,
    };
    render(<EmotionOverlay result={result} />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });
});
