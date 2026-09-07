/**
 * Indian Sign Language (ISL) Patterns
 *
 * ISL uses a combination of:
 * - Devanagari-based fingerspelling (for Hindi/Indian languages)
 * - Modified ASL alphabet (widely adopted in Indian deaf communities)
 * - Unique ISL signs for common words and phrases
 *
 * This module provides validation patterns for ISL alphabet letters,
 * common vocabulary, and cultural signs specific to India.
 */

import { FingerState } from "./gesture-detection";

// ===== Devanagari Alphabet Patterns =====

export interface ISLPattern {
  /** The letter or word */
  letter: string;
  /** Hindi/Devanagari equivalent */
  devanagari?: string;
  /** Required finger states: true = extended, false = curled */
  required: FingerState;
  /** Thumb direction if extended */
  thumbDirection?: "left" | "right" | "up";
  /** Min finger spread (0-1) */
  minSpread?: number;
  /** Max finger spread (0-1) */
  maxSpread?: number;
  /** Min fist ratio (0-1, 1 = tight fist) */
  minFistRatio?: number;
  /** Tolerance: how many fingers can be wrong */
  tolerance?: number;
  /** Human-readable description */
  description: string;
  /** Step-by-step instructions */
  steps: string[];
  /** Category for grouping */
  category: "vowel" | "consonant" | "number" | "common";
}

/**
 * ISL Devanagari Vowels (स्वर)
 * Based on the Indian Sign Language fingerspelling system
 */
export const ISL_VOWELS: Record<string, ISLPattern> = {
  अ: {
    letter: "अ",
    devanagari: "अ",
    required: { thumb: true, index: false, middle: false, ring: false, pinky: false },
    description: "Open fist with thumb extended sideways",
    steps: ["Make a loose fist", "Extend thumb sideways to the right", "Keep other fingers curled"],
    category: "vowel",
  },
  आ: {
    letter: "आ",
    devanagari: "आ",
    required: { thumb: true, index: true, middle: false, ring: false, pinky: false },
    description: "Thumb and index finger extended, forming an L shape",
    steps: ["Extend thumb sideways", "Extend index finger straight up", "Forms an L shape"],
    category: "vowel",
  },
  इ: {
    letter: "इ",
    devanagari: "इ",
    required: { thumb: false, index: true, middle: false, ring: false, pinky: false },
    minFistRatio: 0.75,
    description: "Index finger pointing up, fist otherwise",
    steps: ["Make a fist", "Point index finger straight up", "Keep thumb curled"],
    category: "vowel",
  },
  ई: {
    letter: "ई",
    devanagari: "ई",
    required: { thumb: false, index: true, middle: true, ring: false, pinky: false },
    minSpread: 0.3,
    description: "Index and middle fingers spread apart (V shape)",
    steps: ["Extend index and middle fingers", "Spread them apart in a V", "Keep other fingers curled"],
    category: "vowel",
  },
  उ: {
    letter: "उ",
    devanagari: "उ",
    required: { thumb: false, index: true, middle: true, ring: false, pinky: false },
    maxSpread: 0.2,
    description: "Index and middle fingers together, pointing up",
    steps: ["Extend index and middle fingers", "Keep them together (not spread)", "Like a closed peace sign"],
    category: "vowel",
  },
  ऊ: {
    letter: "ऊ",
    devanagari: "ऊ",
    required: { thumb: false, index: true, middle: false, ring: false, pinky: true },
    description: "Index finger and pinky extended (rock sign)",
    steps: ["Extend index finger up", "Extend pinky finger up", "Keep middle and ring curled"],
    category: "vowel",
  },
  ए: {
    letter: "ए",
    devanagari: "ए",
    required: { thumb: true, index: true, middle: true, ring: false, pinky: false },
    description: "Thumb, index, and middle extended (3 fingers)",
    steps: ["Extend thumb, index, and middle", "Keep ring and pinky curled", "Like a 3-finger scout salute"],
    category: "vowel",
  },
  ऐ: {
    letter: "ऐ",
    devanagari: "ऐ",
    required: { thumb: true, index: true, middle: true, ring: true, pinky: false },
    description: "Four fingers extended, pinky curled",
    steps: ["Extend thumb, index, middle, and ring", "Keep pinky curled into palm", "Like a partial open hand"],
    category: "vowel",
  },
  ओ: {
    letter: "ओ",
    devanagari: "ओ",
    required: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    maxSpread: 0.25,
    description: "All five fingers extended, held together",
    steps: ["Extend all five fingers", "Keep them close together", "Flat hand facing forward"],
    category: "vowel",
  },
  औ: {
    letter: "औ",
    devanagari: "औ",
    required: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    minSpread: 0.3,
    description: "All five fingers extended and spread apart",
    steps: ["Extend all five fingers wide", "Spread them apart", "Like a high-five hand"],
    category: "vowel",
  },
};

/**
 * ISL Devanagari Consonants (व्यंजन) — Key subset
 */
export const ISL_CONSONANTS: Record<string, ISLPattern> = {
  क: {
    letter: "क",
    devanagari: "क",
    required: { thumb: true, index: true, middle: true, ring: false, pinky: false },
    minSpread: 0.25,
    description: "Three fingers extended with spread",
    steps: ["Extend thumb, index, and middle", "Spread them apart", "Ring and pinky curled"],
    category: "consonant",
  },
  ख: {
    letter: "ख",
    devanagari: "ख",
    required: { thumb: true, index: true, middle: false, ring: false, pinky: false },
    description: "Thumb and index in a pinching shape",
    steps: ["Extend thumb and index finger", "Bring tips close together (not touching)", "Other fingers curled"],
    category: "consonant",
  },
  ग: {
    letter: "ग",
    devanagari: "ग",
    required: { thumb: false, index: true, middle: false, ring: false, pinky: false },
    minFistRatio: 0.75,
    description: "Index finger pointing up",
    steps: ["Make a fist", "Point index finger straight up", "Thumb tucked in"],
    category: "consonant",
  },
  घ: {
    letter: "घ",
    devanagari: "घ",
    required: { thumb: false, index: true, middle: true, ring: false, pinky: false },
    minSpread: 0.3,
    description: "V shape — index and middle spread",
    steps: ["Extend index and middle fingers", "Spread them into a V", "Other fingers curled"],
    category: "consonant",
  },
  च: {
    letter: "च",
    devanagari: "च",
    required: { thumb: false, index: false, middle: false, ring: false, pinky: true },
    minFistRatio: 0.75,
    description: "Only pinky finger extended",
    steps: ["Make a fist", "Extend only your pinky", "Thumb tucked in"],
    category: "consonant",
  },
  छ: {
    letter: "छ",
    devanagari: "छ",
    required: { thumb: false, index: false, middle: true, ring: false, pinky: false },
    minFistRatio: 0.75,
    description: "Only middle finger extended",
    steps: ["Make a fist", "Extend only your middle finger", "Keep it straight up"],
    category: "consonant",
  },
  ज: {
    letter: "ज",
    devanagari: "ज",
    required: { thumb: false, index: true, middle: true, ring: true, pinky: false },
    minSpread: 0.2,
    description: "Three fingers up (index, middle, ring)",
    steps: ["Extend index, middle, and ring", "Keep them together", "Thumb and pinky curled"],
    category: "consonant",
  },
  ट: {
    letter: "ट",
    devanagari: "ट",
    required: { thumb: true, index: false, middle: false, ring: false, pinky: false },
    minFistRatio: 0.75,
    description: "Thumb extended up from fist",
    steps: ["Make a fist", "Point thumb straight up", "Other fingers curled tight"],
    category: "consonant",
  },
  ड: {
    letter: "ड",
    devanagari: "ड",
    required: { thumb: true, index: true, middle: false, ring: false, pinky: false },
    maxSpread: 0.15,
    description: "Thumb and index extended close together",
    steps: ["Extend thumb and index", "Keep them close together", "Like a small pinch"],
    category: "consonant",
  },
  ढ: {
    letter: "ढ",
    devanagari: "ढ",
    required: { thumb: false, index: true, middle: true, ring: true, pinky: true },
    maxSpread: 0.2,
    description: "Four fingers up, thumb tucked",
    steps: ["Extend index, middle, ring, and pinky", "Tuck thumb across palm", "Keep fingers together"],
    category: "consonant",
  },
  त: {
    letter: "त",
    devanagari: "त",
    required: { thumb: false, index: true, middle: true, ring: false, pinky: false },
    maxSpread: 0.15,
    description: "Two fingers together pointing up",
    steps: ["Extend index and middle", "Keep them together", "Like the letter U in ASL"],
    category: "consonant",
  },
  द: {
    letter: "द",
    devanagari: "द",
    required: { thumb: true, index: false, middle: false, ring: false, pinky: true },
    description: "Thumb and pinky extended (phone gesture)",
    steps: ["Extend thumb and pinky", "Keep index, middle, ring curled", "Like a phone gesture"],
    category: "consonant",
  },
  न: {
    letter: "न",
    devanagari: "न",
    required: { thumb: false, index: false, middle: false, ring: false, pinky: false },
    minFistRatio: 0.85,
    description: "Closed fist (tight)",
    steps: ["Make a tight fist", "Thumb across the front", "All fingers curled tight"],
    category: "consonant",
  },
  प: {
    letter: "प",
    devanagari: "प",
    required: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    maxSpread: 0.15,
    description: "Flat hand, all fingers together",
    steps: ["Extend all five fingers", "Keep them close together", "Flat hand facing forward"],
    category: "consonant",
  },
  फ: {
    letter: "फ",
    devanagari: "फ",
    required: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    minSpread: 0.35,
    description: "Open hand, fingers spread wide",
    steps: ["Extend all five fingers", "Spread them wide apart", "Like a high-five"],
    category: "consonant",
  },
  ब: {
    letter: "ब",
    devanagari: "ब",
    required: { thumb: false, index: true, middle: true, ring: true, pinky: true },
    description: "Four fingers up, thumb folded",
    steps: ["Extend all four fingers", "Fold thumb across palm", "Keep fingers together"],
    category: "consonant",
  },
  म: {
    letter: "म",
    devanagari: "म",
    required: { thumb: true, index: false, middle: false, ring: false, pinky: false },
    description: "Thumb extended from fist (on side)",
    steps: ["Make a fist", "Extend thumb sideways", "Thumb rests on the side of index"],
    category: "consonant",
  },
  य: {
    letter: "य",
    devanagari: "य",
    required: { thumb: true, index: false, middle: false, ring: false, pinky: true },
    description: "Thumb and pinky extended (Y shape)",
    steps: ["Extend thumb and pinky", "Keep middle fingers curled", "Like hang-loose gesture"],
    category: "consonant",
  },
  र: {
    letter: "र",
    devanagari: "र",
    required: { thumb: false, index: true, middle: false, ring: false, pinky: false },
    description: "Index finger pointing sideways",
    steps: ["Extend index finger", "Point it sideways", "Other fingers curled"],
    category: "consonant",
  },
  ल: {
    letter: "ल",
    devanagari: "ल",
    required: { thumb: true, index: true, middle: true, ring: false, pinky: false },
    description: "Three fingers up (thumb, index, middle)",
    steps: ["Extend thumb, index, and middle", "Keep ring and pinky curled", "Spread fingers slightly"],
    category: "consonant",
  },
  व: {
    letter: "व",
    devanagari: "व",
    required: { thumb: true, index: false, middle: false, ring: false, pinky: false },
    minFistRatio: 0.7,
    description: "Thumb up from fist (like a thumbs up)",
    steps: ["Make a fist", "Point thumb straight up", "Like a thumbs-up gesture"],
    category: "consonant",
  },
  श: {
    letter: "श",
    devanagari: "श",
    required: { thumb: true, index: true, middle: false, ring: false, pinky: false },
    description: "Index and thumb forming a pinch",
    steps: ["Extend index and thumb", "Bring tips close together", "Other fingers curled"],
    category: "consonant",
  },
  स: {
    letter: "स",
    devanagari: "स",
    required: { thumb: false, index: false, middle: false, ring: false, pinky: false },
    minFistRatio: 0.9,
    description: "Very tight fist (letter S in ASL)",
    steps: ["Make a very tight fist", "Thumb across the front", "Tighter than normal fist"],
    category: "consonant",
  },
  ह: {
    letter: "ह",
    devanagari: "ह",
    required: { thumb: true, index: true, middle: true, ring: false, pinky: false },
    description: "Three fingers spread (H shape)",
    steps: ["Extend thumb, index, and middle", "Spread them apart", "Ring and pinky curled"],
    category: "consonant",
  },
};

// Combine all ISL patterns
export const ALL_ISL_PATTERNS: Record<string, ISLPattern> = {
  ...ISL_VOWELS,
  ...ISL_CONSONANTS,
};

/**
 * Check if a detected gesture matches a target ISL letter.
 */
export function checkISLLetter(
  detected: {
    fingers: FingerState;
    thumbDirection: string;
    fingerSpread: number;
    fistRatio: number;
  },
  targetLetter: string
): { score: number; isCorrect: boolean; feedback: string[] } {
  const pattern = ALL_ISL_PATTERNS[targetLetter];
  if (!pattern) {
    return { score: 0, isCorrect: false, feedback: ["Letter not in ISL database"] };
  }

  const feedback: string[] = [];
  let totalChecks = 0;
  let passedChecks = 0;

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
      const label = finger.charAt(0).toUpperCase() + finger.slice(1);
      if (expected) {
        feedback.push(`${label} finger should be EXTENDED — try straightening it`);
      } else {
        feedback.push(`${label} finger should be CURLED — close it into your palm`);
      }
    }
  }

  // Check spread
  if (pattern.minSpread !== undefined || pattern.maxSpread !== undefined) {
    totalChecks++;
    if (pattern.minSpread !== undefined && detected.fingerSpread < pattern.minSpread) {
      feedback.push("Spread your fingers MORE apart");
    } else if (pattern.maxSpread !== undefined && detected.fingerSpread > pattern.maxSpread) {
      feedback.push("Keep your fingers CLOSER together");
    } else {
      passedChecks++;
    }
  }

  // Check fist ratio
  if (pattern.minFistRatio !== undefined) {
    totalChecks++;
    if (detected.fistRatio < pattern.minFistRatio) {
      feedback.push("Make a TIGHTER fist — curl your fingers more");
    } else {
      passedChecks++;
    }
  } else {
    totalChecks++;
    passedChecks++;
  }

  const withinTolerance = wrongFingers <= (pattern.tolerance || 0);
  const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;
  const isCorrect = withinTolerance && score >= 70;

  if (isCorrect) {
    feedback.length = 0;
    feedback.push(`Excellent! Your ISL sign for "${pattern.devanagari || pattern.letter}" is correct! 🎉`);
  } else if (feedback.length === 0) {
    feedback.push("Close! Check the finger positions shown above.");
  }

  return { score, isCorrect, feedback };
}

// ===== ISL Common Words & Phrases =====

export interface ISLWordEntry {
  /** English word */
  word: string;
  /** Hindi translation */
  hindi: string;
  /** Devanagari script */
  devanagari: string;
  /** Expected finger configuration */
  fingers: FingerState;
  /** Min/max spread */
  minSpread?: number;
  maxSpread?: number;
  /** Min fist ratio */
  minFistRatio?: number;
  /** Description of the sign */
  description: string;
  /** Step-by-step instructions */
  steps: string[];
  /** Category */
  category: "greeting" | "polite" | "family" | "food" | "numbers" | "essential" | "emotion" | "action" | "place";
  /** Motion type expected */
  expectedMotion?: string;
  /** Emoji */
  emoji: string;
}

export const ISL_WORDS: Record<string, ISLWordEntry> = {
  // ===== Greetings =====
  Namaste: {
    word: "Namaste",
    hindi: "नमस्ते",
    devanagari: "नमस्ते",
    fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    maxSpread: 0.15,
    description: "Press both palms together in front of chest (prayer position)",
    steps: ["Bring both palms together", "Fingers pointing up", "Press gently at chest level", "Slight bow of the head"],
    category: "greeting",
    expectedMotion: "stationary",
    emoji: "🙏",
  },
  "Good Morning": {
    word: "Good Morning",
    hindi: "सुप्रभात",
    devanagari: "सुप्रभात",
    fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    maxSpread: 0.2,
    description: "Flat hand from chin moves forward (good), then arc hand rising (morning)",
    steps: ["Start with flat hand at chin", "Move hand forward (good)", "Arc other hand rising like sun", "Morning = rising motion"],
    category: "greeting",
    expectedMotion: "forward",
    emoji: "🌅",
  },
  "Good Night": {
    word: "Good Night",
    hindi: "शुभ रात्रि",
    devanagari: "शुभ रात्रि",
    fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    maxSpread: 0.2,
    description: "Flat hand from chin moves forward (good), then hands come down (night = dark)",
    steps: ["Flat hand at chin → forward (good)", "Both hands sweep down", "Like curtains closing", "End with hands low"],
    category: "greeting",
    expectedMotion: "downward",
    emoji: "🌙",
  },
  "How are you": {
    word: "How are you",
    hindi: "आप कैसे हैं",
    devanagari: "आप कैसे हैं",
    fingers: { thumb: false, index: true, middle: true, ring: false, pinky: false },
    description: "Two fingers moving from chest outward with questioning expression",
    steps: ["Extend index and middle fingers", "Start at your chest", "Move outward toward person", "Raise eyebrows (question)"],
    category: "greeting",
    expectedMotion: "forward",
    emoji: "😊",
  },

  // ===== Polite / Essential =====
  "Thank You": {
    word: "Thank You",
    hindi: "धन्यवाद",
    devanagari: "धन्यवाद",
    fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    maxSpread: 0.25,
    description: "Flat hand, fingertips touch chin then move forward",
    steps: ["Fingertips touch your chin", "Move hand forward toward person", "Palm faces the person", "Slight nod"],
    category: "polite",
    expectedMotion: "forward",
    emoji: "🙏",
  },
  Please: {
    word: "Please",
    hindi: "कृपया",
    devanagari: "कृपया",
    fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    maxSpread: 0.25,
    description: "Flat palm on chest, rubbing in circles",
    steps: ["Place flat palm on chest", "Rub in circular motion", "Keep fingers together", "Polite expression"],
    category: "polite",
    expectedMotion: "circle",
    emoji: "🙏",
  },
  Sorry: {
    word: "Sorry",
    hindi: "माफ़ कीजिए",
    devanagari: "माफ़ कीजिए",
    fingers: { thumb: false, index: false, middle: false, ring: false, pinky: false },
    minFistRatio: 0.85,
    description: "Closed fist rubbing in circles on chest",
    steps: ["Make a tight fist", "Place it on your chest", "Rub in circular motion", "Apologetic expression"],
    category: "polite",
    expectedMotion: "circle",
    emoji: "😔",
  },
  Yes: {
    word: "Yes",
    hindi: "हाँ",
    devanagari: "हाँ",
    fingers: { thumb: false, index: false, middle: false, ring: false, pinky: false },
    minFistRatio: 0.8,
    description: "Closed fist that nods up and down",
    steps: ["Make a fist with thumb on side", "Nod it up and down", "Like a head nodding yes", "Repeat 2-3 times"],
    category: "essential",
    expectedMotion: "tap",
    emoji: "👍",
  },
  No: {
    word: "No",
    hindi: "नहीं",
    devanagari: "नहीं",
    fingers: { thumb: true, index: false, middle: false, ring: false, pinky: false },
    minFistRatio: 0.6,
    description: "Index and middle finger snap down against thumb",
    steps: ["Start with index and middle extended", "Snap them down onto thumb", "Quick closing motion", "Shake head no"],
    category: "essential",
    expectedMotion: "snap",
    emoji: "🚫",
  },
  Help: {
    word: "Help",
    hindi: "मदद",
    devanagari: "मदद",
    fingers: { thumb: false, index: false, middle: false, ring: false, pinky: false },
    minFistRatio: 0.85,
    description: "Fist resting on flat palm, lifting upward",
    steps: ["Make a fist with dominant hand", "Place it on flat non-dominant palm", "Lift both hands up together", "Shows lifting someone up"],
    category: "essential",
    expectedMotion: "upward",
    emoji: "🆘",
  },

  // ===== Family =====
  Mother: {
    word: "Mother",
    hindi: "माँ",
    devanagari: "माँ",
    fingers: { thumb: true, index: false, middle: false, ring: false, pinky: false },
    description: "Thumb taps chin repeatedly (ISL: mother = chin touch)",
    steps: ["Extend thumb", "Tap your chin with thumb tip", "Repeat 2-3 times", "In ISL, chin area = female"],
    category: "family",
    expectedMotion: "tap",
    emoji: "👩",
  },
  Father: {
    word: "Father",
    hindi: "पापा",
    devanagari: "पापा",
    fingers: { thumb: true, index: false, middle: false, ring: false, pinky: false },
    description: "Thumb taps forehead repeatedly (ISL: father = forehead touch)",
    steps: ["Extend thumb", "Tap your forehead with thumb tip", "Repeat 2-3 times", "In ISL, forehead area = male"],
    category: "family",
    expectedMotion: "tap",
    emoji: "👨",
  },
  Brother: {
    word: "Brother",
    hindi: "भाई",
    devanagari: "भाई",
    fingers: { thumb: true, index: true, middle: false, ring: false, pinky: false },
    description: "Index and thumb touch forehead, then extend down (male + same generation)",
    steps: ["Touch forehead with index and thumb", "Then extend hand forward", "Shows male + peer", "Can also clasped hands"],
    category: "family",
    emoji: "👦",
  },
  Sister: {
    word: "Sister",
    hindi: "बहन",
    devanagari: "बहन",
    fingers: { thumb: true, index: true, middle: false, ring: false, pinky: false },
    description: "Index and thumb touch chin, then extend down (female + same generation)",
    steps: ["Touch chin with index and thumb", "Then extend hand forward", "Shows female + peer", "Chin area = female in ISL"],
    category: "family",
    emoji: "👧",
  },
  Family: {
    word: "Family",
    hindi: "परिवार",
    devanagari: "परिवार",
    fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    minSpread: 0.3,
    description: "F-hands circle outward from center, representing a group",
    steps: ["Make F-handshapes (OK sign) with both hands", "Start with thumbs touching", "Circle outward", "End with pinkies touching"],
    category: "family",
    expectedMotion: "circle",
    emoji: "👨‍👩‍👧‍👦",
  },
  Friend: {
    word: "Friend",
    hindi: "दोस्त",
    devanagari: "दोस्त",
    fingers: { thumb: false, index: true, middle: false, ring: false, pinky: false },
    description: "Index fingers hook together",
    steps: ["Extend both index fingers", "Hook them together", "Flip and re-hook the other way", "Shows mutual connection"],
    category: "family",
    emoji: "🤝",
  },

  // ===== Food =====
  Rice: {
    word: "Rice",
    hindi: "चावल",
    devanagari: "चावल",
    fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    maxSpread: 0.15,
    description: "Bunched fingertips tap mouth (eating rice with fingers)",
    steps: ["Bring all fingertips together", "Tap toward your mouth", "Mimics eating rice by hand", "Repeat 2-3 times"],
    category: "food",
    expectedMotion: "tap",
    emoji: "🍚",
  },
  Water: {
    word: "Water",
    hindi: "पानी",
    devanagari: "पानी",
    fingers: { thumb: false, index: true, middle: true, ring: true, pinky: false },
    minSpread: 0.2,
    description: "W handshape (3 fingers up) tapping chin",
    steps: ["Extend index, middle, ring fingers", "Spread to form W shape", "Tap chin with index finger", "Tap twice"],
    category: "food",
    expectedMotion: "tap",
    emoji: "💧",
  },
  Eat: {
    word: "Eat",
    hindi: "खाना",
    devanagari: "खाना",
    fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    maxSpread: 0.15,
    description: "Bunched fingertips tap mouth repeatedly",
    steps: ["Bunch all fingertips together", "Tap your mouth 2-3 times", "Like putting food in mouth", "Universal gesture"],
    category: "food",
    expectedMotion: "tap",
    emoji: "🍽️",
  },
  Drink: {
    word: "Drink",
    hindi: "पीना",
    devanagari: "पीना",
    fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    minSpread: 0.2,
    maxSpread: 0.5,
    description: "C handshape brought to mouth (holding a cup)",
    steps: ["Curve hand into C shape", "Like holding a glass", "Bring it to your mouth", "Tilt slightly"],
    category: "food",
    expectedMotion: "forward",
    emoji: "🥤",
  },
  Milk: {
    word: "Milk",
    hindi: "दूध",
    devanagari: "दूध",
    fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    description: "Squeezing motion with hand (milking a cow)",
    steps: ["Make a fist around an imaginary handle", "Squeeze and release repeatedly", "Like milking a cow", "Traditional Indian gesture"],
    category: "food",
    expectedMotion: "tap",
    emoji: "🥛",
  },

  // ===== Numbers (Hindi) =====
  "1 - Ek": {
    word: "1 - Ek",
    hindi: "एक",
    devanagari: "१",
    fingers: { thumb: false, index: true, middle: false, ring: false, pinky: false },
    minFistRatio: 0.75,
    description: "Index finger pointing up",
    steps: ["Make a fist", "Point index finger straight up", "Other fingers curled"],
    category: "numbers",
    emoji: "1️⃣",
  },
  "2 - Do": {
    word: "2 - Do",
    hindi: "दो",
    devanagari: "२",
    fingers: { thumb: false, index: true, middle: true, ring: false, pinky: false },
    minSpread: 0.3,
    description: "Index and middle fingers in V shape",
    steps: ["Extend index and middle fingers", "Spread them into V", "Other fingers curled"],
    category: "numbers",
    emoji: "2️⃣",
  },
  "3 - Teen": {
    word: "3 - Teen",
    hindi: "तीन",
    devanagari: "३",
    fingers: { thumb: false, index: true, middle: true, ring: true, pinky: false },
    minSpread: 0.2,
    description: "Three fingers up (index, middle, ring)",
    steps: ["Extend index, middle, and ring", "Keep them slightly spread", "Thumb holds pinky down"],
    category: "numbers",
    emoji: "3️⃣",
  },
  "5 - Paanch": {
    word: "5 - Paanch",
    hindi: "पाँच",
    devanagari: "५",
    fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    minSpread: 0.3,
    description: "All five fingers extended and spread",
    steps: ["Extend all five fingers wide", "Spread them apart", "High-five hand"],
    category: "numbers",
    emoji: "🖐️",
  },

  // ===== Emotions =====
  Happy: {
    word: "Happy",
    hindi: "खुश",
    devanagari: "खुश",
    fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    description: "Flat hands brushing upward on chest with smile",
    steps: ["Place both palms on chest", "Brush upward several times", "Smile broadly", "Upward = positive in ISL"],
    category: "emotion",
    expectedMotion: "upward",
    emoji: "😊",
  },
  Sad: {
    word: "Sad",
    hindi: "उदास",
    devanagari: "उदास",
    fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    description: "Flat hands brushing downward on chest",
    steps: ["Place both palms on chest", "Brush downward slowly", "Frown expression", "Downward = negative in ISL"],
    category: "emotion",
    expectedMotion: "downward",
    emoji: "😢",
  },
  Love: {
    word: "Love",
    hindi: "प्यार",
    devanagari: "प्यार",
    fingers: { thumb: false, index: false, middle: false, ring: false, pinky: false },
    minFistRatio: 0.8,
    description: "Crossed fists over chest (self-hug)",
    steps: ["Make two fists", "Cross them over your chest", "Like giving yourself a hug", "Hold for a moment"],
    category: "emotion",
    emoji: "❤️",
  },
  Angry: {
    word: "Angry",
    hindi: "गुस्सा",
    devanagari: "गुस्सा",
    fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    minSpread: 0.4,
    description: "Claw hands moving up from stomach to chest",
    steps: ["Start with claw hands at stomach", "Move them upward aggressively", "Fingers spread and tense", "Angry facial expression"],
    category: "emotion",
    expectedMotion: "upward",
    emoji: "😠",
  },

  // ===== Actions =====
  Come: {
    word: "Come",
    hindi: "आओ",
    devanagari: "आओ",
    fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    description: "Fingers curl inward toward yourself repeatedly",
    steps: ["Extend hand toward person", "Curl fingers inward", "Pull hand toward yourself", "Repeat 2-3 times"],
    category: "action",
    expectedMotion: "forward",
    emoji: "👉",
  },
  Go: {
    word: "Go",
    hindi: "जाओ",
    devanagari: "जाओ",
    fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    description: "Hand pushes away from body",
    steps: ["Start with hand near body", "Push hand outward/forward", "Palm faces away", "Point in direction"],
    category: "action",
    expectedMotion: "forward",
    emoji: "🏃",
  },
  Stop: {
    word: "Stop",
    hindi: "रुको",
    devanagari: "रुको",
    fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    maxSpread: 0.15,
    description: "Flat hand held up, palm facing forward (stop signal)",
    steps: ["Extend all fingers", "Palm faces the person", "Hold hand up firmly", "Universal stop gesture"],
    category: "action",
    expectedMotion: "stationary",
    emoji: "✋",
  },
  "Know": {
    word: "Know",
    hindi: "पता",
    devanagari: "पता",
    fingers: { thumb: false, index: true, middle: false, ring: false, pinky: false },
    description: "Index finger taps forehead",
    steps: ["Extend index finger", "Tap your forehead", "Knowledge is in the head", "Repeat 1-2 times"],
    category: "action",
    expectedMotion: "tap",
    emoji: "🧠",
  },
  "Don't Know": {
    word: "Don't Know",
    hindi: "नहीं पता",
    devanagari: "नहीं पता",
    fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    description: "Both palms up, shrug with head shake",
    steps: ["Extend both hands, palms up", "Shrug shoulders", "Shake head side to side", "Confused expression"],
    category: "action",
    expectedMotion: "sideways",
    emoji: "🤷",
  },
  Name: {
    word: "Name",
    hindi: "नाम",
    devanagari: "नाम",
    fingers: { thumb: false, index: true, middle: true, ring: false, pinky: false },
    description: "Tap middle and index fingers of both hands together",
    steps: ["Extend index and middle on both hands", "Tap the finger pairs together", "Tap twice", "Like two people meeting"],
    category: "action",
    expectedMotion: "tap",
    emoji: "🏷️",
  },

  // ===== Places =====
  School: {
    word: "School",
    hindi: "विद्यालय",
    devanagari: "विद्यालय",
    fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
    description: "Clap then sweep hands apart",
    steps: ["Clap your hands once", "Sweep them apart horizontally", "Palms face down", "Shows a building/space"],
    category: "place",
    expectedMotion: "sideways",
    emoji: "🏫",
  },
  Home: {
    word: "Home",
    hindi: "घर",
    devanagari: "घर",
    fingers: { thumb: true, index: true, middle: false, ring: false, pinky: false },
    description: "Fingertips touch together forming a roof shape",
    steps: ["Bring fingertips of both hands together", "Form a triangle/roof shape", "Like the top of a house", "Hold at face level"],
    category: "place",
    expectedMotion: "stationary",
    emoji: "🏠",
  },
  Hospital: {
    word: "Hospital",
    hindi: "अस्पताल",
    devanagari: "अस्पताल",
    fingers: { thumb: false, index: true, middle: true, ring: false, pinky: false },
    description: "H handshape drawing a cross on upper arm",
    steps: ["Make H handshape (two fingers sideways)", "Draw a cross on your upper arm", "Top vertical, then horizontal", "Medical cross symbol"],
    category: "place",
    emoji: "🏥",
  },
};

// All ISL words as an array
export const ALL_ISL_WORDS: ISLWordEntry[] = Object.values(ISL_WORDS);

// Words by category
export const ISL_WORDS_BY_CATEGORY = {
  greeting: ALL_ISL_WORDS.filter((w) => w.category === "greeting"),
  polite: ALL_ISL_WORDS.filter((w) => w.category === "polite"),
  essential: ALL_ISL_WORDS.filter((w) => w.category === "essential"),
  family: ALL_ISL_WORDS.filter((w) => w.category === "family"),
  food: ALL_ISL_WORDS.filter((w) => w.category === "food"),
  numbers: ALL_ISL_WORDS.filter((w) => w.category === "numbers"),
  emotion: ALL_ISL_WORDS.filter((w) => w.category === "emotion"),
  action: ALL_ISL_WORDS.filter((w) => w.category === "action"),
  place: ALL_ISL_WORDS.filter((w) => w.category === "place"),
};
