import { describe, it, expect } from "vitest";
import { classifyLibrasLetter } from "./librasClassifier";

function p(x: number, y: number, z = 0) {
  return { x, y, z };
}

// Build a hand where all four fingers are fully curled (tips near MCPs)
// and thumb is beside the fist (letter A shape)
function makeFist() {
  return [
    p(0.5, 0.8),   // 0: wrist
    p(0.42, 0.7),  // 1: thumb CMC
    p(0.38, 0.6),  // 2: thumb MCP
    p(0.36, 0.55), // 3: thumb IP
    p(0.38, 0.5),  // 4: thumb TIP — beside fist, pointing up
    p(0.45, 0.55), // 5: index MCP
    p(0.46, 0.6),  // 6: index PIP (curled down)
    p(0.47, 0.63), // 7: index DIP
    p(0.46, 0.65), // 8: index TIP (near MCP = curled)
    p(0.50, 0.55), // 9: middle MCP
    p(0.51, 0.6),  // 10: middle PIP
    p(0.52, 0.63), // 11: middle DIP
    p(0.51, 0.65), // 12: middle TIP
    p(0.55, 0.55), // 13: ring MCP
    p(0.56, 0.6),  // 14: ring PIP
    p(0.57, 0.63), // 15: ring DIP
    p(0.56, 0.65), // 16: ring TIP
    p(0.60, 0.58), // 17: pinky MCP
    p(0.61, 0.62), // 18: pinky PIP
    p(0.62, 0.65), // 19: pinky DIP
    p(0.61, 0.67), // 20: pinky TIP
  ];
}

describe("classifyLibrasLetter", () => {
  it("returns null for empty landmarks", () => {
    const result = classifyLibrasLetter([]);
    expect(result.letter).toBeNull();
    expect(result.confidence).toBe(0);
  });

  it("returns null for too few landmarks", () => {
    const result = classifyLibrasLetter([p(0, 0)]);
    expect(result.letter).toBeNull();
  });

  it("returns a result with 21 landmarks", () => {
    const result = classifyLibrasLetter(makeFist());
    expect(result).toHaveProperty("letter");
    expect(result).toHaveProperty("confidence");
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it("recognizes L shape", () => {
    // L = index extended straight up + thumb extended to the side, others curled
    const lm = makeFist();
    // Extend index fully up (tip far above MCP, straight line)
    lm[6] = p(0.45, 0.45); // PIP
    lm[7] = p(0.45, 0.35); // DIP
    lm[8] = p(0.45, 0.25); // TIP — far up
    // Extend thumb far out to the left (L shape = ~90 degrees)
    lm[2] = p(0.35, 0.6);
    lm[3] = p(0.25, 0.6);
    lm[4] = p(0.15, 0.6); // TIP — far left

    const result = classifyLibrasLetter(lm);
    expect(result.letter).toBe("L");
    expect(result.confidence).toBeGreaterThan(0.6);
  });

  it("recognizes V shape", () => {
    // V = index + middle extended and spread apart, others curled
    const lm = makeFist();
    // Extend index up-left
    lm[6] = p(0.40, 0.45);
    lm[7] = p(0.37, 0.35);
    lm[8] = p(0.34, 0.25); // TIP up-left
    // Extend middle up-right (spread from index)
    lm[10] = p(0.56, 0.45);
    lm[11] = p(0.60, 0.35);
    lm[12] = p(0.64, 0.25); // TIP up-right
    // Keep thumb curled
    lm[4] = p(0.44, 0.58);

    const result = classifyLibrasLetter(lm);
    expect(result.letter).toBe("V");
    expect(result.confidence).toBeGreaterThan(0.6);
  });

  it("recognizes Y shape", () => {
    // Y = thumb + pinky extended, index/middle/ring curled
    const lm = makeFist();
    // Extend thumb far out to the left
    lm[2] = p(0.35, 0.6);
    lm[3] = p(0.25, 0.58);
    lm[4] = p(0.15, 0.56); // TIP — far left
    // Extend pinky straight up
    lm[18] = p(0.62, 0.48);
    lm[19] = p(0.64, 0.38);
    lm[20] = p(0.66, 0.28); // TIP — up

    const result = classifyLibrasLetter(lm);
    expect(result.letter).toBe("Y");
    expect(result.confidence).toBeGreaterThan(0.6);
  });
});
