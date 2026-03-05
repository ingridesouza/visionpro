/**
 * Geometry-based Libras (Brazilian Sign Language) alphabet classifier.
 * Takes 21 MediaPipe hand landmarks and returns a letter A-Z.
 *
 * Landmark indices:
 * WRIST=0
 * THUMB:  CMC=1, MCP=2, IP=3, TIP=4
 * INDEX:  MCP=5, PIP=6, DIP=7, TIP=8
 * MIDDLE: MCP=9, PIP=10, DIP=11, TIP=12
 * RING:   MCP=13, PIP=14, DIP=15, TIP=16
 * PINKY:  MCP=17, PIP=18, DIP=19, TIP=20
 */

interface Point {
  x: number;
  y: number;
  z: number;
}

export interface LibrasResult {
  letter: string | null;
  confidence: number;
}

// --- Helpers ---

function dist2d(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function dist3d(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

/** Angle at point b formed by a-b-c, in radians */
function angle(a: Point, b: Point, c: Point): number {
  const ba = { x: a.x - b.x, y: a.y - b.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };
  const dot = ba.x * bc.x + ba.y * bc.y;
  const magBA = Math.sqrt(ba.x ** 2 + ba.y ** 2);
  const magBC = Math.sqrt(bc.x ** 2 + bc.y ** 2);
  if (magBA === 0 || magBC === 0) return 0;
  return Math.acos(Math.max(-1, Math.min(1, dot / (magBA * magBC))));
}

/**
 * Palm size for normalizing distances.
 * Uses wrist-to-middle_MCP as reference.
 */
function palmSize(lm: Point[]): number {
  return dist2d(lm[0], lm[9]) || 0.001;
}

/**
 * Continuous curl ratio for a finger (0 = fully extended, 1 = fully curled).
 * Measures how close the tip is to the MCP relative to the PIP-to-MCP distance.
 */
function curlRatio(lm: Point[], finger: "index" | "middle" | "ring" | "pinky"): number {
  const indices = {
    index: { mcp: 5, pip: 6, dip: 7, tip: 8 },
    middle: { mcp: 9, pip: 10, dip: 11, tip: 12 },
    ring: { mcp: 13, pip: 14, dip: 15, tip: 16 },
    pinky: { mcp: 17, pip: 18, dip: 19, tip: 20 },
  }[finger];

  // Curl angle at PIP joint (straighter = more extended)
  const pipAngle = angle(lm[indices.mcp], lm[indices.pip], lm[indices.tip]);
  // pipAngle close to PI = straight (extended), close to 0 = curled
  const ratio = 1 - pipAngle / Math.PI;
  return Math.max(0, Math.min(1, ratio));
}

/** Thumb curl: uses distance-based approach since thumb anatomy differs */
function thumbCurl(lm: Point[]): number {
  const palm = palmSize(lm);
  // How far is thumb tip from index MCP (palm side)
  const tipToIndex = dist2d(lm[4], lm[5]) / palm;
  // Extended thumb: tipToIndex > ~0.8; curled: < ~0.4
  return Math.max(0, Math.min(1, 1 - (tipToIndex - 0.3) / 0.6));
}

function isExtended(lm: Point[], finger: "thumb" | "index" | "middle" | "ring" | "pinky"): boolean {
  if (finger === "thumb") return thumbCurl(lm) < 0.45;
  return curlRatio(lm, finger) < 0.45;
}

function isCurled(lm: Point[], finger: "thumb" | "index" | "middle" | "ring" | "pinky"): boolean {
  if (finger === "thumb") return thumbCurl(lm) > 0.55;
  return curlRatio(lm, finger) > 0.55;
}

/** Normalized distance between two points (by palm size) */
function normDist(lm: Point[], a: number, b: number): number {
  return dist2d(lm[a], lm[b]) / palmSize(lm);
}

function areTouching(lm: Point[], a: number, b: number, threshold = 0.35): boolean {
  return normDist(lm, a, b) < threshold;
}

// Finger state summary
function fingerStates(lm: Point[]) {
  return {
    thumb: isExtended(lm, "thumb"),
    index: isExtended(lm, "index"),
    middle: isExtended(lm, "middle"),
    ring: isExtended(lm, "ring"),
    pinky: isExtended(lm, "pinky"),
    thumbCurl: thumbCurl(lm),
    indexCurl: curlRatio(lm, "index"),
    middleCurl: curlRatio(lm, "middle"),
    ringCurl: curlRatio(lm, "ring"),
    pinkyCurl: curlRatio(lm, "pinky"),
  };
}

type FS = ReturnType<typeof fingerStates>;

// --- Letter classifiers ---
// Each returns a confidence 0-1. Hard gates return 0 immediately when a required condition fails.

function checkA(lm: Point[], f: FS): number {
  // Fist with thumb alongside (pointing up), not tucked under
  if (f.index || f.middle || f.ring || f.pinky) return 0;
  if (!isCurled(lm, "index") || !isCurled(lm, "middle")) return 0;

  let score = 0;
  // Thumb tip should be above (y < ) the curled index tip
  if (lm[4].y < lm[8].y) score += 2;
  // Thumb tip beside index, not far out (not L) and not tucked under (not E)
  const thumbToIndex = normDist(lm, 4, 5);
  if (thumbToIndex < 0.7) score += 1;
  // Thumb not tucked under fingers (distinguishes from E/S)
  if (lm[4].y < lm[6].y) score += 2;
  // Curl scores for fingers
  score += f.indexCurl * 1;
  score += f.middleCurl * 1;
  score += f.ringCurl * 1;
  score += f.pinkyCurl * 1;

  return score / 9;
}

function checkB(lm: Point[], f: FS): number {
  // Four fingers extended up, thumb curled across palm
  if (!f.index || !f.middle || !f.ring || !f.pinky) return 0;
  if (f.thumb) return 0;

  let score = 0;
  // All four fingers should be up
  score += (1 - f.indexCurl) * 1;
  score += (1 - f.middleCurl) * 1;
  score += (1 - f.ringCurl) * 1;
  score += (1 - f.pinkyCurl) * 1;
  // Thumb curled
  score += f.thumbCurl * 1;
  // Fingers relatively close together (not spread like W)
  const indexMiddleDist = normDist(lm, 8, 12);
  const middleRingDist = normDist(lm, 12, 16);
  if (indexMiddleDist < 0.25) score += 1;
  if (middleRingDist < 0.25) score += 1;

  return score / 7;
}

function checkC(lm: Point[], f: FS): number {
  // Curved C shape: fingers together, partially bent, thumb opposed
  // All fingers partially curled (not fully extended, not fully closed)
  const avgCurl = (f.indexCurl + f.middleCurl + f.ringCurl + f.pinkyCurl) / 4;
  if (avgCurl < 0.15 || avgCurl > 0.8) return 0;

  let score = 0;
  // Moderate curl (sweet spot 0.25-0.6)
  if (avgCurl > 0.2 && avgCurl < 0.65) score += 2;
  // Thumb should be abducted (away from palm), forming the C opening
  if (f.thumb) score += 1;
  // Gap between thumb tip and index tip (the C opening)
  const gap = normDist(lm, 4, 8);
  if (gap > 0.3 && gap < 1.0) score += 2;
  // Fingers together (not spread)
  const tipSpread = normDist(lm, 8, 20);
  if (tipSpread < 0.6) score += 1;
  // Not all fingertips touching thumb (that's O)
  if (!areTouching(lm, 4, 12, 0.3)) score += 1;

  return score / 7;
}

function checkD(lm: Point[], f: FS): number {
  // Index up, middle/ring/pinky curled, thumb touches middle
  if (!f.index) return 0;
  if (f.ring || f.pinky) return 0;

  let score = 0;
  score += (1 - f.indexCurl) * 2; // Index must be very straight
  score += f.ringCurl * 1;
  score += f.pinkyCurl * 1;
  // Thumb touching middle fingertip (forming circle)
  if (areTouching(lm, 4, 12, 0.4)) score += 2;
  // Middle should be curled toward thumb
  if (f.middleCurl > 0.3) score += 1;

  return score / 7;
}

function checkE(lm: Point[], f: FS): number {
  // All fingers curled, thumb tucked in FRONT of fingers (below PIP line)
  if (f.index || f.middle || f.ring || f.pinky) return 0;

  let score = 0;
  score += f.indexCurl * 1;
  score += f.middleCurl * 1;
  score += f.ringCurl * 1;
  score += f.pinkyCurl * 1;
  // Thumb tucked: tip is BELOW (y >) index PIP and near palm
  if (lm[4].y > lm[6].y) score += 2;
  // Thumb tip close to fingers (tucked, not alongside)
  const thumbToMiddlePIP = normDist(lm, 4, 10);
  if (thumbToMiddlePIP < 0.5) score += 1;
  // Distinguish from A: in E, thumb tip is lower than in A
  if (lm[4].y > lm[8].y) score += 1;

  return score / 8;
}

function checkF(lm: Point[], f: FS): number {
  // Thumb + index form circle (tips touching), middle/ring/pinky extended up
  if (!f.middle || !f.ring || !f.pinky) return 0;

  let score = 0;
  // Thumb and index touching
  if (areTouching(lm, 4, 8, 0.4)) score += 3;
  // Three fingers up
  score += (1 - f.middleCurl) * 1;
  score += (1 - f.ringCurl) * 1;
  score += (1 - f.pinkyCurl) * 1;
  // Index should be curled toward thumb (not extended)
  if (f.indexCurl > 0.2) score += 1;

  return score / 7;
}

function checkG(lm: Point[], f: FS): number {
  // Index pointing sideways (horizontally), thumb out, others curled
  if (!f.index) return 0;
  if (f.middle || f.ring || f.pinky) return 0;

  let score = 0;
  // Index extended
  score += (1 - f.indexCurl) * 1;
  // Others curled
  score += f.middleCurl * 0.5;
  score += f.ringCurl * 0.5;
  score += f.pinkyCurl * 0.5;
  // Index pointing sideways: index tip x differs significantly from MCP x
  const indexHorizontal = Math.abs(lm[8].x - lm[5].x);
  const indexVertical = Math.abs(lm[8].y - lm[5].y);
  if (indexHorizontal > indexVertical) score += 2;
  // Thumb also somewhat out
  if (f.thumb) score += 1;

  return score / 5.5;
}

function checkI(lm: Point[], f: FS): number {
  // Pinky up only, all others curled
  if (!f.pinky) return 0;
  if (f.index || f.middle || f.ring) return 0;

  let score = 0;
  score += (1 - f.pinkyCurl) * 2;
  score += f.indexCurl * 1;
  score += f.middleCurl * 1;
  score += f.ringCurl * 1;
  score += f.thumbCurl * 1;

  return score / 6;
}

function checkL(lm: Point[], f: FS): number {
  // Index up + thumb out at ~90° (L shape), others curled
  if (!f.index || !f.thumb) return 0;
  if (f.middle || f.ring || f.pinky) return 0;

  let score = 0;
  score += (1 - f.indexCurl) * 1;
  score += f.middleCurl * 1;
  score += f.ringCurl * 1;
  score += f.pinkyCurl * 1;

  // L shape: angle between thumb direction and index direction
  const thumbDir = { x: lm[4].x - lm[2].x, y: lm[4].y - lm[2].y };
  const indexDir = { x: lm[8].x - lm[5].x, y: lm[8].y - lm[5].y };
  const dot = thumbDir.x * indexDir.x + thumbDir.y * indexDir.y;
  const mag =
    Math.sqrt(thumbDir.x ** 2 + thumbDir.y ** 2) *
    Math.sqrt(indexDir.x ** 2 + indexDir.y ** 2);
  const ang = mag > 0 ? Math.acos(Math.max(-1, Math.min(1, dot / mag))) : 0;
  // Near 90° (PI/2) is ideal, accept 50°-130°
  if (ang > 0.87 && ang < 2.27) score += 2;

  // Thumb should be far from index (not touching like D)
  const thumbIndexDist = normDist(lm, 4, 8);
  if (thumbIndexDist > 0.6) score += 1;

  return score / 7;
}

function checkM(lm: Point[], f: FS): number {
  // Three fingers (index, middle, ring) over thumb, pinky curled
  // Tips of index, middle, ring below their PIPs (curled over thumb)
  if (f.index || f.middle || f.ring || f.pinky) return 0;

  let score = 0;
  // All four fingers curled
  score += f.indexCurl * 1;
  score += f.middleCurl * 1;
  score += f.ringCurl * 1;
  score += f.pinkyCurl * 1;
  // Thumb tip should be between ring and pinky (tucked under three fingers)
  if (lm[4].x > Math.min(lm[16].x, lm[13].x) || lm[4].y > lm[14].y) score += 1;
  // Distinguish from E: thumb tip near pinky side
  const thumbToPinkyMCP = normDist(lm, 4, 17);
  if (thumbToPinkyMCP < 0.6) score += 1;

  return score / 6;
}

function checkN(lm: Point[], f: FS): number {
  // Two fingers (index, middle) over thumb, ring+pinky curled
  if (f.index || f.middle || f.ring || f.pinky) return 0;

  let score = 0;
  score += f.indexCurl * 1;
  score += f.middleCurl * 1;
  score += f.ringCurl * 1;
  score += f.pinkyCurl * 1;
  // Thumb tip visible between middle and ring
  const thumbToRingMCP = normDist(lm, 4, 13);
  if (thumbToRingMCP < 0.5) score += 1;
  // Distinguish from M: thumb between middle and ring (not ring and pinky)
  const thumbToMiddleTip = normDist(lm, 4, 12);
  if (thumbToMiddleTip < 0.4) score += 1;

  return score / 6;
}

function checkO(lm: Point[], f: FS): number {
  // Fingertips touching thumb forming O/circle
  let touchCount = 0;
  if (areTouching(lm, 4, 8, 0.35)) touchCount++;
  if (areTouching(lm, 4, 12, 0.35)) touchCount++;
  if (areTouching(lm, 4, 16, 0.4)) touchCount++;
  if (areTouching(lm, 4, 20, 0.45)) touchCount++;

  if (touchCount < 2) return 0;

  let score = touchCount * 1.5;
  // Fingers should be partially curled (not extended)
  const avgCurl = (f.indexCurl + f.middleCurl + f.ringCurl + f.pinkyCurl) / 4;
  if (avgCurl > 0.25) score += 1;

  return score / 7;
}

function checkP(lm: Point[], f: FS): number {
  // Index pointing down, middle extended, thumb out — hand rotated
  // Similar to D but hand points down
  if (!f.index || !f.middle) return 0;
  if (f.ring || f.pinky) return 0;

  let score = 0;
  score += (1 - f.indexCurl) * 1;
  score += (1 - f.middleCurl) * 1;
  score += f.ringCurl * 1;
  score += f.pinkyCurl * 1;
  // Hand pointing down: index tip below index MCP
  if (lm[8].y > lm[5].y) score += 2;

  return score / 6;
}

function checkQ(lm: Point[], f: FS): number {
  // Like G but hand pointing down — index + thumb pointing down
  if (!f.index) return 0;
  if (f.middle || f.ring || f.pinky) return 0;

  let score = 0;
  score += (1 - f.indexCurl) * 1;
  score += f.middleCurl * 0.5;
  score += f.ringCurl * 0.5;
  score += f.pinkyCurl * 0.5;
  // Index pointing down
  if (lm[8].y > lm[5].y) score += 2;
  // Thumb out
  if (f.thumb) score += 1;

  return score / 5.5;
}

function checkR(lm: Point[], f: FS): number {
  // Index + middle extended and crossed
  if (!f.index || !f.middle) return 0;
  if (f.ring || f.pinky) return 0;

  let score = 0;
  score += (1 - f.indexCurl) * 1;
  score += (1 - f.middleCurl) * 1;
  score += f.ringCurl * 1;
  score += f.pinkyCurl * 1;
  // Crossed: middle tip is on the other side of index tip (x-axis)
  // Index and middle tips very close together (crossed)
  const tipDist = normDist(lm, 8, 12);
  if (tipDist < 0.15) score += 2;
  // But their bases (MCPs) are apart
  const baseDist = normDist(lm, 5, 9);
  if (baseDist > 0.15 && tipDist < baseDist * 0.6) score += 1;

  return score / 7;
}

function checkS(lm: Point[], f: FS): number {
  // Fist with thumb over fingers (across front)
  if (f.index || f.middle || f.ring || f.pinky) return 0;

  let score = 0;
  score += f.indexCurl * 1;
  score += f.middleCurl * 1;
  score += f.ringCurl * 1;
  score += f.pinkyCurl * 1;
  // Thumb over fingers (not beside like A, not tucked like E)
  // Thumb tip near middle of curled fingers
  const thumbToIndexPIP = normDist(lm, 4, 6);
  if (thumbToIndexPIP < 0.45) score += 1;
  // Thumb tip roughly at same height as PIPs
  const avgPIPy = (lm[6].y + lm[10].y) / 2;
  if (Math.abs(lm[4].y - avgPIPy) < 0.05) score += 1;

  return score / 6;
}

function checkT(lm: Point[], f: FS): number {
  // Thumb between index and middle, fingers curled
  if (f.index || f.middle || f.ring || f.pinky) return 0;

  let score = 0;
  score += f.indexCurl * 1;
  score += f.middleCurl * 1;
  score += f.ringCurl * 1;
  score += f.pinkyCurl * 1;
  // Thumb tip between index and middle fingers
  const thumbToIndexTip = normDist(lm, 4, 8);
  const thumbToMiddleTip = normDist(lm, 4, 12);
  if (thumbToIndexTip < 0.4 && thumbToMiddleTip < 0.4) score += 1;
  // Thumb points upward from between fingers
  if (lm[4].y < lm[6].y) score += 1;

  return score / 6;
}

function checkU(lm: Point[], f: FS): number {
  // Index + middle up together (close), others curled
  if (!f.index || !f.middle) return 0;
  if (f.ring || f.pinky) return 0;

  let score = 0;
  score += (1 - f.indexCurl) * 1.5;
  score += (1 - f.middleCurl) * 1.5;
  score += f.ringCurl * 1;
  score += f.pinkyCurl * 1;
  score += f.thumbCurl * 0.5;
  // Fingers close together (NOT spread like V)
  const tipDist = normDist(lm, 8, 12);
  if (tipDist < 0.2) score += 2;
  else if (tipDist < 0.3) score += 1;
  // Penalty if spread (V territory)
  if (tipDist > 0.35) return 0;

  return score / 7.5;
}

function checkV(lm: Point[], f: FS): number {
  // Index + middle spread (V), others curled
  if (!f.index || !f.middle) return 0;
  if (f.ring || f.pinky) return 0;

  let score = 0;
  score += (1 - f.indexCurl) * 1.5;
  score += (1 - f.middleCurl) * 1.5;
  score += f.ringCurl * 1;
  score += f.pinkyCurl * 1;
  score += f.thumbCurl * 0.5;
  // Fingers spread apart
  const tipDist = normDist(lm, 8, 12);
  if (tipDist > 0.35) score += 2;
  else if (tipDist > 0.25) score += 1;
  // Penalty if too close (U territory)
  if (tipDist < 0.2) return 0;

  return score / 7.5;
}

function checkW(lm: Point[], f: FS): number {
  // Index + middle + ring extended and spread, thumb + pinky curled
  if (!f.index || !f.middle || !f.ring) return 0;
  if (f.pinky) return 0; // Distinguishes from B (where pinky is also up)

  let score = 0;
  score += (1 - f.indexCurl) * 1;
  score += (1 - f.middleCurl) * 1;
  score += (1 - f.ringCurl) * 1;
  score += f.pinkyCurl * 1.5; // Pinky must be curled (key distinction from B)
  score += f.thumbCurl * 0.5;
  // Fingers should be spread
  const imDist = normDist(lm, 8, 12);
  const mrDist = normDist(lm, 12, 16);
  if (imDist > 0.15) score += 0.5;
  if (mrDist > 0.15) score += 0.5;

  return score / 6;
}

function checkY(lm: Point[], f: FS): number {
  // Thumb + pinky extended, index/middle/ring curled ("hang loose")
  if (!f.thumb || !f.pinky) return 0;
  if (f.index || f.middle || f.ring) return 0;

  let score = 0;
  score += (1 - f.thumbCurl) * 1.5;
  score += (1 - f.pinkyCurl) * 1.5;
  score += f.indexCurl * 1;
  score += f.middleCurl * 1;
  score += f.ringCurl * 1;
  // Thumb and pinky spread far apart
  const spread = normDist(lm, 4, 20);
  if (spread > 0.8) score += 1;

  return score / 7;
}

// --- Main classifier ---

const CHECKERS: [string, (lm: Point[], f: FS) => number][] = [
  ["A", checkA],
  ["B", checkB],
  ["C", checkC],
  ["D", checkD],
  ["E", checkE],
  ["F", checkF],
  ["G", checkG],
  ["I", checkI],
  ["L", checkL],
  ["M", checkM],
  ["N", checkN],
  ["O", checkO],
  ["P", checkP],
  ["Q", checkQ],
  ["R", checkR],
  ["S", checkS],
  ["T", checkT],
  ["U", checkU],
  ["V", checkV],
  ["W", checkW],
  ["Y", checkY],
];

const MIN_CONFIDENCE = 0.65;
const MIN_MARGIN = 0.05; // Minimum gap between best and second-best to confirm

export function classifyLibrasLetter(landmarks: Point[]): LibrasResult {
  if (!landmarks || landmarks.length < 21) {
    return { letter: null, confidence: 0 };
  }

  const f = fingerStates(landmarks);

  let bestLetter: string | null = null;
  let bestConfidence = 0;
  let secondBest = 0;

  for (const [letter, checker] of CHECKERS) {
    const confidence = checker(landmarks, f);
    if (confidence > bestConfidence) {
      secondBest = bestConfidence;
      bestConfidence = confidence;
      bestLetter = letter;
    } else if (confidence > secondBest) {
      secondBest = confidence;
    }
  }

  // Require minimum confidence AND a clear margin over the next candidate
  if (bestConfidence < MIN_CONFIDENCE) {
    return { letter: null, confidence: bestConfidence };
  }
  if (bestConfidence - secondBest < MIN_MARGIN) {
    return { letter: null, confidence: bestConfidence };
  }

  return { letter: bestLetter, confidence: bestConfidence };
}
