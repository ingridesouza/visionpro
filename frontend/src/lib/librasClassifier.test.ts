import { describe, it, expect } from "vitest";
import { classifyLibrasLetter } from "./librasClassifier";

function p(x: number, y: number, z = 0) {
  return { x, y, z };
}

/**
 * Build a base hand where ALL fingers are fully curled.
 * Key: PIP angle must be small (tip curled back toward MCP).
 * The curl ratio = 1 - (pipAngle / PI), so we need tips CLOSE to MCPs
 * with PIPs bent sharply.
 */
function makeFist() {
  return [
    p(0.50, 0.80),  // 0: wrist
    p(0.43, 0.70),  // 1: thumb CMC
    p(0.38, 0.62),  // 2: thumb MCP
    p(0.40, 0.58),  // 3: thumb IP (curled back)
    p(0.43, 0.56),  // 4: thumb TIP (near index MCP = curled)
    p(0.46, 0.56),  // 5: index MCP
    p(0.47, 0.60),  // 6: index PIP
    p(0.46, 0.58),  // 7: index DIP (back toward MCP)
    p(0.45, 0.57),  // 8: index TIP (near MCP)
    p(0.50, 0.55),  // 9: middle MCP
    p(0.51, 0.59),  // 10: middle PIP
    p(0.50, 0.57),  // 11: middle DIP
    p(0.49, 0.56),  // 12: middle TIP
    p(0.54, 0.56),  // 13: ring MCP
    p(0.55, 0.60),  // 14: ring PIP
    p(0.54, 0.58),  // 15: ring DIP
    p(0.53, 0.57),  // 16: ring TIP
    p(0.58, 0.58),  // 17: pinky MCP
    p(0.59, 0.62),  // 18: pinky PIP
    p(0.58, 0.60),  // 19: pinky DIP
    p(0.57, 0.59),  // 20: pinky TIP
  ];
}

/**
 * Helper: extend a finger by placing PIP-DIP-TIP in a straight line above MCP.
 * This gives pipAngle close to PI (straight), so curlRatio ≈ 0.
 */
function extendFinger(
  lm: ReturnType<typeof makeFist>,
  mcp: number,
  pip: number,
  dip: number,
  tip: number,
  dx: number,
  dy: number,
) {
  const base = lm[mcp];
  lm[pip] = p(base.x + dx * 0.33, base.y + dy * 0.33);
  lm[dip] = p(base.x + dx * 0.66, base.y + dy * 0.66);
  lm[tip] = p(base.x + dx, base.y + dy);
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
  });

  it("recognizes L shape", () => {
    // L = index extended up + thumb extended sideways at ~90°
    const lm = makeFist();
    // Extend index straight up
    extendFinger(lm, 5, 6, 7, 8, 0, -0.30);
    // Extend thumb far to the left
    lm[2] = p(0.35, 0.62);
    lm[3] = p(0.25, 0.62);
    lm[4] = p(0.15, 0.62);

    const result = classifyLibrasLetter(lm);
    expect(result.letter).toBe("L");
  });

  it("recognizes V shape", () => {
    // V = index + middle extended and spread apart
    const lm = makeFist();
    // Extend index up-left (spread)
    extendFinger(lm, 5, 6, 7, 8, -0.08, -0.30);
    // Extend middle up-right (spread)
    extendFinger(lm, 9, 10, 11, 12, 0.08, -0.30);
    // Keep thumb curled
    lm[4] = p(0.45, 0.58);

    const result = classifyLibrasLetter(lm);
    expect(result.letter).toBe("V");
  });

  it("recognizes Y shape", () => {
    // Y = thumb + pinky extended, rest curled
    const lm = makeFist();
    // Extend thumb far to the left
    lm[2] = p(0.35, 0.62);
    lm[3] = p(0.25, 0.60);
    lm[4] = p(0.15, 0.58);
    // Extend pinky straight up
    extendFinger(lm, 17, 18, 19, 20, 0.04, -0.30);

    const result = classifyLibrasLetter(lm);
    expect(result.letter).toBe("Y");
  });
});
