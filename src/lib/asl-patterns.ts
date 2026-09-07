/**
 * ASL Letter Reference Patterns
 * Each pattern defines the expected finger configuration for a letter.
 * The checker compares detected finger states against these patterns.
 */

import { FingerState } from "./gesture-detection";

export interface ASLPattern {
  letter: string;
  /** Required finger states: true = must be extended, false = must be curled */
  required: FingerState;
  /** Thumb must point in this direction (if thumb is extended) */
  thumbDirection?: "left" | "right" | "up";
  /** Minimum finger spread required (0-1) */
  minSpread?: number;
  /** Maximum finger spread allowed (0-1) */
  maxSpread?: number;
  /** Minimum fist ratio (how curled the non-extended fingers are) */
  minFistRatio?: number;
  /** Tolerance: how many fingers can be wrong (0 = exact match) */
  tolerance?: number;
  /** Specific angle checks */
  checks?: string[];
}

export const ASL_PATTERNS: Record<string, ASLPattern> = {
  A: {
    letter: "A",
    required: { thumb: false, index: false, middle: false, ring: false, pinky: false },
    minFistRatio: 0.75,
    tolerance: 0,
    checks: ["All fingers must be curled into a fist", "Thumb rests alongside the index finger, NOT across the front"],
  },
  B: {
    letter: "B",
    required: { thumb: false, index: true, middle: true, ring: true, pinky: true },
    minFistRatio: 0,
    tolerance: 0,
    checks: ["All four fingers straight and together", "Thumb folded across the palm"],
  },
  C: {
    letter: "C",
    required: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    minSpread: 0,
    maxSpread: 0.3,
    tolerance: 1,
    checks: ["All fingers curved to form a C shape", "Hand looks like it's holding a ball"],
  },
  D: {
    letter: "D",
    required: { thumb: false, index: true, middle: false, ring: false, pinky: false },
    minFistRatio: 0.5,
    tolerance: 0,
    checks: ["Only the index finger points up", "Other fingers touch thumb to form a circle"],
  },
  E: {
    letter: "E",
    required: { thumb: false, index: false, middle: false, ring: false, pinky: false },
    minFistRatio: 0.85,
    tolerance: 0,
    checks: ["All fingers curled tightly", "Fingertips rest on the palm ridge", "Looks like a tight claw"],
  },
  F: {
    letter: "F",
    required: { thumb: true, index: false, middle: true, ring: true, pinky: true },
    minSpread: 0.3,
    tolerance: 0,
    checks: ["Index and thumb form a circle (OK sign)", "Other three fingers extended and spread"],
  },
  G: {
    letter: "G",
    required: { thumb: true, index: true, middle: false, ring: false, pinky: false },
    tolerance: 0,
    checks: ["Index and thumb point sideways", "Looks like you're about to pinch something"],
  },
  H: {
    letter: "H",
    required: { thumb: false, index: true, middle: true, ring: false, pinky: false },
    tolerance: 0,
    checks: ["Index and middle fingers extended sideways together", "Ring and pinky curl into palm"],
  },
  I: {
    letter: "I",
    required: { thumb: false, index: false, middle: false, ring: false, pinky: true },
    minFistRatio: 0.75,
    tolerance: 0,
    checks: ["Only the pinky finger is extended", "All other fingers form a fist"],
  },
  L: {
    letter: "L",
    required: { thumb: true, index: true, middle: false, ring: false, pinky: false },
    tolerance: 0,
    checks: ["Index points up, thumb points sideways", "Forms an L shape at 90 degrees"],
  },
  O: {
    letter: "O",
    required: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    maxSpread: 0.2,
    tolerance: 1,
    checks: ["All fingertips touch thumb tip", "Forms a round O shape"],
  },
  S: {
    letter: "S",
    required: { thumb: false, index: false, middle: false, ring: false, pinky: false },
    minFistRatio: 0.85,
    tolerance: 0,
    checks: ["Tight fist with thumb across the front", "Different from A — thumb is in FRONT not side"],
  },
  T: {
    letter: "T",
    required: { thumb: true, index: false, middle: false, ring: false, pinky: false },
    minFistRatio: 0.75,
    tolerance: 0,
    checks: ["Thumb peeks between index and middle fingers", "Other fingers form a fist"],
  },
  U: {
    letter: "U",
    required: { thumb: false, index: true, middle: true, ring: false, pinky: false },
    maxSpread: 0.2,
    tolerance: 0,
    checks: ["Index and middle fingers straight up, TOGETHER", "Like a closed peace sign"],
  },
  V: {
    letter: "V",
    required: { thumb: false, index: true, middle: true, ring: false, pinky: false },
    minSpread: 0.3,
    tolerance: 0,
    checks: ["Index and middle fingers spread apart", "Like a peace sign / V shape"],
  },
  W: {
    letter: "W",
    required: { thumb: false, index: true, middle: true, ring: true, pinky: false },
    minSpread: 0.2,
    tolerance: 0,
    checks: ["Three fingers extended and spread apart", "Thumb holds pinky down"],
  },
  Y: {
    letter: "Y",
    required: { thumb: true, index: false, middle: false, ring: false, pinky: true },
    tolerance: 0,
    checks: ["Only thumb and pinky extended", "Like a hang-loose or phone gesture"],
  },
};

/**
 * Check if a detected gesture matches a target letter.
 * Returns a score 0-100 and detailed feedback.
 */
export function checkLetter(
  detected: { fingers: FingerState; thumbDirection: string; fingerSpread: number; fistRatio: number },
  targetLetter: string
): { score: number; isCorrect: boolean; feedback: string[] } {
  const pattern = ASL_PATTERNS[targetLetter];
  if (!pattern) {
    return { score: 0, isCorrect: false, feedback: ["Letter not in database"] };
  }

  const feedback: string[] = [];
  let totalChecks = 0;
  let passedChecks = 0;

  // Check each finger
  const fingerNames: (keyof FingerState)[] = ["thumb", "index", "middle", "ring", "pinky"];
  let wrongFingers = 0;

  for (const finger of fingerNames) {
    totalChecks++;
    const expected = pattern.required[finger];
    const actual = detected.fingers[finger];

    if (expected === actual) {
      passedChecks++;
    } else {
      wrongFingers++;
      const fingerLabel = finger.charAt(0).toUpperCase() + finger.slice(1);
      if (expected) {
        feedback.push(`${fingerLabel} finger should be EXTENDED — try straightening it`);
      } else {
        feedback.push(`${fingerLabel} finger should be CURLED — try closing it into your palm`);
      }
    }
  }

  // Check spread
  if (pattern.minSpread !== undefined && detected.fingerSpread < pattern.minSpread) {
    feedback.push("Fingers need to be more SPREAD apart");
  } else if (pattern.maxSpread !== undefined && detected.fingerSpread > pattern.maxSpread) {
    feedback.push("Fingers should be CLOSER together — not spread apart");
  } else if (pattern.minSpread !== undefined || pattern.maxSpread !== undefined) {
    passedChecks++;
  }
  totalChecks++;

  // Check fist ratio
  if (pattern.minFistRatio !== undefined && detected.fistRatio < pattern.minFistRatio) {
    feedback.push("Make a tighter FIST — curl your fingers more");
  } else if (pattern.minFistRatio !== undefined) {
    passedChecks++;
  }
  totalChecks++;

  // Apply tolerance
  const withinTolerance = wrongFingers <= (pattern.tolerance || 0);
  const score = Math.round((passedChecks / totalChecks) * 100);
  const isCorrect = withinTolerance && score >= 70;

  // Add specific checks from pattern
  if (isCorrect && pattern.checks) {
    feedback.push(`Great job! ✓`);
  }

  if (feedback.length === 0) {
    if (isCorrect) {
      feedback.push("Excellent! Your sign looks correct! 🎉");
    } else {
      feedback.push("Close! Check the finger positions above.");
    }
  }

  return { score, isCorrect, feedback };
}
