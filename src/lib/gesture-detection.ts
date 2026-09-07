/**
 * Gesture Detection Engine
 * Uses MediaPipe Hands landmarks (21 points) to determine finger states.
 * All processing runs in the browser — zero server cost.
 */

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface FingerState {
  thumb: boolean;   // true = extended
  index: boolean;
  middle: boolean;
  ring: boolean;
  pinky: boolean;
}

export interface GestureAnalysis {
  fingers: FingerState;
  thumbDirection: "left" | "right" | "up" | "neutral";
  fingerSpread: number;    // 0-1, how spread the fingers are
  fistRatio: number;       // 0-1, 1 = tight fist
  confidence: number;      // 0-1, how clearly the hand is visible
  rawLandmarks: Landmark[];
}

/**
 * Compute the angle (in degrees) between three points.
 * The middle point is the vertex.
 */
function angle(a: Landmark, b: Landmark, c: Landmark): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) -
    Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

/**
 * Distance between two landmarks.
 */
function dist(a: Landmark, b: Landmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Analyze hand landmarks to determine finger states.
 *
 * MediaPipe Hand Landmark indices:
 *  0: Wrist
 *  1-4: Thumb (CMC, MCP, IP, TIP)
 *  5-8: Index (MCP, PIP, DIP, TIP)
 *  9-12: Middle (MCP, PIP, DIP, TIP)
 * 13-16: Ring (MCP, PIP, DIP, TIP)
 * 17-20: Pinky (MCP, PIP, DIP, TIP)
 */
export function analyzeGesture(landmarks: Landmark[]): GestureAnalysis {
  if (!landmarks || landmarks.length < 21) {
    return {
      fingers: { thumb: false, index: false, middle: false, ring: false, pinky: false },
      thumbDirection: "neutral",
      fingerSpread: 0,
      fistRatio: 1,
      confidence: 0,
      rawLandmarks: landmarks || [],
    };
  }

  // --- Finger extension detection ---
  // For index, middle, ring, pinky: compare PIP-to-TIP distance vs PIP-to-MCP distance
  // If TIP is farther from MCP than PIP is, the finger is extended.

  const isFingerExtended = (pipIdx: number, tipIdx: number, mcpIdx: number): boolean => {
    const pipToTip = dist(landmarks[pipIdx], landmarks[tipIdx]);
    const mcpToPip = dist(landmarks[mcpIdx], landmarks[pipIdx]);
    // Also check the angle — extended fingers point upward/outward
    const a = angle(landmarks[mcpIdx], landmarks[pipIdx], landmarks[tipIdx]);
    // Extended finger: angle is relatively straight (>140°) AND tip is far from palm
    return a > 140 && pipToTip > mcpToPip * 0.5;
  };

  // Thumb: use x-coordinate comparison (thumb extends sideways)
  const thumbExtended =
    dist(landmarks[4], landmarks[0]) > dist(landmarks[3], landmarks[0]) * 1.1 &&
    angle(landmarks[2], landmarks[1], landmarks[4]) > 100;

  const indexExtended = isFingerExtended(6, 8, 5);
  const middleExtended = isFingerExtended(10, 12, 9);
  const ringExtended = isFingerExtended(14, 16, 13);
  const pinkyExtended = isFingerExtended(18, 20, 17);

  const fingers: FingerState = {
    thumb: thumbExtended,
    index: indexExtended,
    middle: middleExtended,
    ring: ringExtended,
    pinky: pinkyExtended,
  };

  // --- Thumb direction ---
  let thumbDirection: "left" | "right" | "up" | "neutral" = "neutral";
  if (thumbExtended) {
    const thumbTip = landmarks[4];
    const thumbMcp = landmarks[2];
    const dx = thumbTip.x - thumbMcp.x;
    const dy = thumbTip.y - thumbMcp.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      thumbDirection = dx > 0 ? "right" : "left";
    } else {
      thumbDirection = dy < 0 ? "up" : "neutral";
    }
  }

  // --- Finger spread ---
  const extendedTips = [landmarks[8], landmarks[12], landmarks[16], landmarks[20]].filter(
    (_, i) => [indexExtended, middleExtended, ringExtended, pinkyExtended][i]
  );
  const fingerSpread =
    extendedTips.length > 1
      ? extendedTips.reduce((sum, tip, i) => {
          if (i === 0) return 0;
          return sum + dist(tip, extendedTips[i - 1]);
        }, 0) / (extendedTips.length - 1)
      : 0;

  // Normalize spread to 0-1
  const normalizedSpread = Math.min(1, fingerSpread * 5);

  // --- Fist ratio ---
  const allFingers = [indexExtended, middleExtended, ringExtended, pinkyExtended];
  const extendedCount = allFingers.filter(Boolean).length;
  const fistRatio = 1 - extendedCount / 4;

  // --- Confidence ---
  const handSize = dist(landmarks[0], landmarks[9]); // wrist to middle MCP
  const confidence = Math.min(1, handSize * 3);

  return {
    fingers,
    thumbDirection,
    fingerSpread: normalizedSpread,
    fistRatio,
    confidence,
    rawLandmarks: landmarks,
  };
}
