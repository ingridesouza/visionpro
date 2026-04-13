import { describe, it, expect } from "vitest";
import { classifyLibrasLetter } from "./librasClassifier";

function makePoint(x: number, y: number, z = 0) {
  return { x, y, z };
}

// Create a basic hand with all fingers curled (fist)
function makeFist() {
  // 21 landmarks, roughly a closed fist
  return [
    makePoint(0.5, 0.8),    // 0: wrist
    makePoint(0.45, 0.7),   // 1: thumb CMC
    makePoint(0.4, 0.6),    // 2: thumb MCP
    makePoint(0.38, 0.55),  // 3: thumb IP
    makePoint(0.42, 0.5),   // 4: thumb TIP (beside, not tucked)
    makePoint(0.45, 0.55),  // 5: index MCP
    makePoint(0.45, 0.6),   // 6: index PIP (curled)
    makePoint(0.46, 0.65),  // 7: index DIP
    makePoint(0.47, 0.68),  // 8: index TIP
    makePoint(0.5, 0.55),   // 9: middle MCP
    makePoint(0.5, 0.6),    // 10: middle PIP
    makePoint(0.51, 0.65),  // 11: middle DIP
    makePoint(0.52, 0.68),  // 12: middle TIP
    makePoint(0.55, 0.55),  // 13: ring MCP
    makePoint(0.55, 0.6),   // 14: ring PIP
    makePoint(0.56, 0.65),  // 15: ring DIP
    makePoint(0.57, 0.68),  // 16: ring TIP
    makePoint(0.6, 0.58),   // 17: pinky MCP
    makePoint(0.6, 0.63),   // 18: pinky PIP
    makePoint(0.61, 0.67),  // 19: pinky DIP
    makePoint(0.62, 0.69),  // 20: pinky TIP
  ];
}

describe("classifyLibrasLetter", () => {
  it("returns null for empty landmarks", () => {
    const result = classifyLibrasLetter([]);
    expect(result.letter).toBeNull();
    expect(result.confidence).toBe(0);
  });

  it("returns null for too few landmarks", () => {
    const result = classifyLibrasLetter([makePoint(0, 0)]);
    expect(result.letter).toBeNull();
  });

  it("returns a result with 21 landmarks", () => {
    const result = classifyLibrasLetter(makeFist());
    // Should match something (A, E, M, N, S, or T depending on geometry)
    expect(result).toHaveProperty("letter");
    expect(result).toHaveProperty("confidence");
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it("recognizes L shape", () => {
    // L = index up + thumb out at 90 degrees
    const lm = makeFist();
    // Extend index up
    lm[6] = makePoint(0.45, 0.45);
    lm[7] = makePoint(0.45, 0.35);
    lm[8] = makePoint(0.45, 0.25);
    // Extend thumb out to the side
    lm[3] = makePoint(0.3, 0.6);
    lm[4] = makePoint(0.2, 0.6);
    const result = classifyLibrasLetter(lm);
    expect(result.letter).toBe("L");
    expect(result.confidence).toBeGreaterThan(0.6);
  });

  it("recognizes V shape", () => {
    const lm = makeFist();
    // Extend index up
    lm[6] = makePoint(0.42, 0.45);
    lm[7] = makePoint(0.40, 0.35);
    lm[8] = makePoint(0.38, 0.25);
    // Extend middle up and spread
    lm[10] = makePoint(0.55, 0.45);
    lm[11] = makePoint(0.57, 0.35);
    lm[12] = makePoint(0.60, 0.25);
    const result = classifyLibrasLetter(lm);
    expect(result.letter).toBe("V");
    expect(result.confidence).toBeGreaterThan(0.6);
  });

  it("recognizes Y shape", () => {
    const lm = makeFist();
    // Extend thumb out far
    lm[3] = makePoint(0.25, 0.55);
    lm[4] = makePoint(0.15, 0.55);
    // Extend pinky up
    lm[18] = makePoint(0.65, 0.48);
    lm[19] = makePoint(0.67, 0.38);
    lm[20] = makePoint(0.70, 0.28);
    const result = classifyLibrasLetter(lm);
    expect(result.letter).toBe("Y");
    expect(result.confidence).toBeGreaterThan(0.6);
  });
});
