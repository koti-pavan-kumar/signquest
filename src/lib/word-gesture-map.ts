/**
 * Word-to-Gesture Mapping for Quiz Validation
 * Each word maps to the expected hand configuration that should be detected
 * when the user signs that word correctly.
 *
 * For finger-spelled words: we check the first letter's gesture
 * For whole-sign words: we check the overall hand shape
 */

import { FingerState } from "./gesture-detection";

export interface ExpectedGesture {
  /** The word this gesture represents */
  word: string;
  /** Expected finger configuration */
  fingers: FingerState;
  /** Expected thumb direction (if thumb is extended) */
  thumbDirection?: "left" | "right" | "up" | "neutral";
  /** Minimum finger spread (0-1) */
  minSpread?: number;
  /** Maximum finger spread (0-1) */
  maxSpread?: number;
  /** Minimum fist ratio (0-1, 1 = tight fist) */
  minFistRatio?: number;
  /** Human-readable description of the expected gesture */
  description: string;
  /** Specific feedback tips if the gesture is wrong */
  feedbackTips: string[];
  /** What the detected gesture name should be */
  gestureName: string;
}

/**
 * Maps each quiz word to the expected hand gesture.
 * These are based on actual ASL signs or finger-spelling of the first letter.
 */
export const WORD_GESTURE_MAP: Record<string, ExpectedGesture> = {
  // ===== BASIC WORDS =====
  Hello: {
    word: "Hello",
    fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    minSpread: 0.15,
    description: "Open palm facing forward, wave side to side",
    feedbackTips: [
      "Open all five fingers wide",
      "Palm should face the camera",
      "Wave your hand side to side",
    ],
    gestureName: "open_palm",
  },
  "Thank You": {
    word: "Thank You",
    fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    maxSpread: 0.3,
    description: "Flat hand, fingertips touch chin then move forward",
    feedbackTips: [
      "Keep fingers together (not spread)",
      "Touch your chin with fingertips",
      "Move hand forward toward the camera",
    ],
    gestureName: "flat_hand",
  },
  Yes: {
    word: "Yes",
    fingers: { thumb: false, index: false, middle: false, ring: false, pinky: false },
    minFistRatio: 0.8,
    description: "Closed fist that nods up and down",
    feedbackTips: [
      "Make a tight fist",
      "Nod your fist up and down like a head",
      "Keep thumb on the side (like ASL letter A)",
    ],
    gestureName: "fist",
  },
  No: {
    word: "No",
    fingers: { thumb: true, index: true, middle: true, ring: false, pinky: false },
    maxSpread: 0.15,
    description: "Index and middle snap down against thumb tip",
    feedbackTips: [
      "Start with index and middle fingers extended",
      "Quickly snap them down to touch your thumb",
      "Like pinching something closed",
    ],
    gestureName: "snap",
  },
  Please: {
    word: "Please",
    fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    maxSpread: 0.25,
    description: "Flat palm on chest, rubbing in circles",
    feedbackTips: [
      "Place your flat palm on your chest",
      "Rub in a circular motion",
      "Keep fingers together",
    ],
    gestureName: "flat_hand",
  },
  Sorry: {
    word: "Sorry",
    fingers: { thumb: false, index: false, middle: false, ring: false, pinky: false },
    minFistRatio: 0.85,
    description: "Closed fist rubbing in circles on chest",
    feedbackTips: [
      "Make a tight fist (like letter S)",
      "Rub it in circles on your chest",
      "Thumb should be across the front",
    ],
    gestureName: "fist",
  },
  Good: {
    word: "Good",
    fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    maxSpread: 0.2,
    description: "Flat hand from chin, moving forward and down",
    feedbackTips: [
      "Start with flat hand at your chin",
      "Move it forward and slightly down",
      "Palm faces up at the end",
    ],
    gestureName: "flat_hand",
  },
  Bad: {
    word: "Bad",
    fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    maxSpread: 0.2,
    description: "Flat hand from chin, flipping palm down sharply",
    feedbackTips: [
      "Start with flat hand at your chin",
      "Flip your palm down quickly",
      "Sharp, decisive downward motion",
    ],
    gestureName: "flat_hand",
  },

  // ===== INTERMEDIATE WORDS =====
  Help: {
    word: "Help",
    fingers: { thumb: false, index: false, middle: false, ring: false, pinky: false },
    minFistRatio: 0.85,
    description: "Fist resting on flat palm, lifting upward",
    feedbackTips: [
      "Make a fist with one hand",
      "Place it on your other flat palm",
      "Lift both hands upward together",
    ],
    gestureName: "fist",
  },
  Water: {
    word: "Water",
    fingers: { thumb: false, index: true, middle: true, ring: true, pinky: false },
    minSpread: 0.2,
    description: "W-handshape (3 fingers up) tapping chin",
    feedbackTips: [
      "Extend index, middle, and ring fingers",
      "Keep them spread to form a W",
      "Tap your chin with the index finger",
    ],
    gestureName: "W",
  },
  Friend: {
    word: "Friend",
    fingers: { thumb: false, index: true, middle: false, ring: false, pinky: false },
    description: "Index fingers hooking together",
    feedbackTips: [
      "Extend both index fingers",
      "Hook them together",
      "Then flip and re-hook the other way",
    ],
    gestureName: "index",
  },
  Love: {
    word: "Love",
    fingers: { thumb: false, index: false, middle: false, ring: false, pinky: false },
    minFistRatio: 0.8,
    description: "Crossed fists over chest",
    feedbackTips: [
      "Make two fists",
      "Cross them over your chest",
      "Like giving yourself a hug",
    ],
    gestureName: "fist",
  },
  Family: {
    word: "Family",
    fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    minSpread: 0.3,
    description: "F-hands circling outward from center",
    feedbackTips: [
      "Make OK signs with both hands (F-handshape)",
      "Start with thumbs touching",
      "Circle outward and bring pinkies together",
    ],
    gestureName: "open_palm",
  },
  School: {
    word: "School",
    fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    description: "Clap then sweep hands apart",
    feedbackTips: [
      "Clap your hands once",
      "Then sweep them apart horizontally",
      "Palms face down as you sweep",
    ],
    gestureName: "open_palm",
  },
  Learn: {
    word: "Learn",
    fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    description: "Take info from palm to forehead",
    feedbackTips: [
      "Hold one palm up (like a book)",
      "Grab from the palm with the other hand",
      "Bring it to your forehead",
    ],
    gestureName: "flat_hand",
  },
  Time: {
    word: "Time",
    fingers: { thumb: false, index: true, middle: false, ring: false, pinky: false },
    description: "Tap your wrist where a watch would be",
    feedbackTips: [
      "Extend your index finger",
      "Tap your wrist twice",
      "Where you would wear a watch",
    ],
    gestureName: "index",
  },

  // ===== ADVANCED WORDS =====
  Eat: {
    word: "Eat",
    fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    maxSpread: 0.15,
    description: "Bunched fingertips tap mouth repeatedly",
    feedbackTips: [
      "Bring all five fingertips together",
      "Tap your mouth 2-3 times",
      "Like you are putting food in your mouth",
    ],
    gestureName: "bunched",
  },
  Drink: {
    word: "Drink",
    fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    minSpread: 0.2,
    maxSpread: 0.5,
    description: "C-handshape brought to mouth",
    feedbackTips: [
      "Curve your hand into a C shape",
      "Like holding a cup",
      "Bring it to your mouth",
    ],
    gestureName: "C",
  },
  Want: {
    word: "Want",
    fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    minSpread: 0.2,
    description: "Claw hands pulling toward you",
    feedbackTips: [
      "Hold both hands out with palms up",
      "Curl your fingers into claws",
      "Pull both hands toward your body",
    ],
    gestureName: "claw",
  },
  Play: {
    word: "Play",
    fingers: { thumb: true, index: false, middle: false, ring: false, pinky: true },
    description: "Y-hands twisting back and forth",
    feedbackTips: [
      "Extend thumb and pinky on both hands",
      "Twist your wrists back and forth",
      "Like the 'hang loose' gesture shaking",
    ],
    gestureName: "Y",
  },
};

/**
 * Get the expected gesture for a word.
 * Falls back to first-letter finger-spelling if no whole-sign mapping exists.
 */
export function getExpectedGesture(word: string): ExpectedGesture | null {
  // Try exact match first
  if (WORD_GESTURE_MAP[word]) {
    return WORD_GESTURE_MAP[word];
  }

  // Try first letter finger-spelling as fallback
  const firstLetter = word[0]?.toUpperCase();
  if (firstLetter) {
    return {
      word,
      fingers: { thumb: false, index: false, middle: false, ring: false, pinky: false },
      description: `Finger-spell: show the letter "${firstLetter}"`,
      feedbackTips: [
        `Make the ASL sign for letter "${firstLetter}"`,
        "Hold it steady for the camera",
      ],
      gestureName: `letter_${firstLetter}`,
    };
  }

  return null;
}

/**
 * Classify a detected gesture from finger states into a named gesture.
 */
export function classifyGesture(
  fingers: FingerState,
  fingerSpread: number,
  fistRatio: number
): string {
  const { thumb, index, middle, ring, pinky } = fingers;
  const extended = [index, middle, ring, pinky].filter(Boolean).length;

  // Fist (no fingers extended)
  if (extended === 0 && fistRatio > 0.7) return "fist";

  // All fingers extended (open palm)
  if (extended === 4 && !thumb) return "open_palm";

  // Flat hand (all extended, fingers together)
  if (extended === 4 && thumb && fingerSpread < 0.25) return "flat_hand";

  // W shape (index + middle + ring)
  if (index && middle && ring && !pinky && !thumb) return "W";

  // Peace / V (index + middle spread)
  if (index && middle && !ring && !pinky && fingerSpread > 0.3) return "peace";

  // U (index + middle together)
  if (index && middle && !ring && !pinky && fingerSpread <= 0.3) return "U";

  // L (index + thumb)
  if (index && !middle && !ring && !pinky && thumb) return "L";

  // Y (thumb + pinky)
  if (thumb && pinky && !index && !middle && !ring) return "Y";

  // Only index
  if (index && !middle && !ring && !pinky && !thumb) return "index";

  // Only pinky
  if (!index && !middle && !ring && pinky && !thumb) return "pinky";

  // C shape (all extended but curved - high spread, some thumb)
  if (extended >= 3 && thumb && fingerSpread > 0.2 && fingerSpread < 0.5) return "C";

  // Claw (all extended, high spread)
  if (extended >= 3 && thumb && fingerSpread > 0.4) return "claw";

  // Bunched (all close together)
  if (extended >= 3 && thumb && fingerSpread < 0.15) return "bunched";

  return "unknown";
}

/**
 * Compare detected gesture against expected gesture.
 * Returns a score 0-100 and detailed feedback.
 */
export function validateWordGesture(
  detectedFingers: FingerState,
  detectedSpread: number,
  detectedFistRatio: number,
  expectedGesture: ExpectedGesture
): { score: number; isCorrect: boolean; feedback: string[] } {
  const feedback: string[] = [];
  let totalChecks = 0;
  let passedChecks = 0;

  const expected = expectedGesture;

  // Check each finger
  const fingerNames: (keyof FingerState)[] = ["thumb", "index", "middle", "ring", "pinky"];
  let wrongFingers = 0;

  for (const finger of fingerNames) {
    totalChecks++;
    const expectedVal = expected.fingers[finger];
    const actualVal = detectedFingers[finger];

    if (expectedVal === actualVal) {
      passedChecks++;
    } else {
      wrongFingers++;
      const label = finger.charAt(0).toUpperCase() + finger.slice(1);
      if (expectedVal) {
        feedback.push(`${label} finger should be EXTENDED — try straightening it`);
      } else {
        feedback.push(`${label} finger should be CURLED — close it into your palm`);
      }
    }
  }

  // Check spread if specified
  if (expected.minSpread !== undefined || expected.maxSpread !== undefined) {
    totalChecks++;
    if (expected.minSpread !== undefined && detectedSpread < expected.minSpread) {
      feedback.push("Spread your fingers MORE apart");
    } else if (expected.maxSpread !== undefined && detectedSpread > expected.maxSpread) {
      feedback.push("Keep your fingers CLOSER together");
    } else {
      passedChecks++;
    }
  }

  // Check fist ratio if specified
  if (expected.minFistRatio !== undefined) {
    totalChecks++;
    if (detectedFistRatio < expected.minFistRatio) {
      feedback.push("Make a TIGHTER fist — curl your fingers more");
    } else {
      passedChecks++;
    }
  }

  const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 50;
  // Lenient: need 65%+ score AND no more than 2 wrong fingers (forgiving for beginners)
  const isCorrect = score >= 65 && wrongFingers <= 2;

  // Add positive feedback if correct
  if (isCorrect) {
    feedback.length = 0;
    feedback.push(`Great job! You signed "${expectedGesture.word}" correctly! 🎉`);
  } else if (feedback.length === 0) {
    feedback.push("Close! Check the finger positions shown above.");
    // Add specific tips
    expectedGesture.feedbackTips.forEach((tip) => feedback.push(tip));
  }

  return { score, isCorrect, feedback };
}
