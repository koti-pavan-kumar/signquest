/**
 * ASL Alphabet Training Data
 * All 26 letters organized by difficulty for progressive learning.
 * Each entry includes how to form the letter, tips, and common mistakes.
 */

export type AlphabetDifficulty = "basic" | "intermediate" | "advanced";

export interface AlphabetEntry {
  letter: string;
  difficulty: AlphabetDifficulty;
  /** Human-readable description of how to form this letter */
  description: string;
  /** Step-by-step tips for correct formation */
  tips: string[];
  /** Common mistakes to avoid */
  commonMistakes: string[];
  /** Visual mnemonic / memory aid */
  mnemonic: string;
}

// ===== BASIC — Letters with simple, distinct handshapes =====
export const BASIC_ALPHABET: AlphabetEntry[] = [
  {
    letter: "A",
    difficulty: "basic",
    description: "Make a fist with all fingers curled. Thumb rests alongside the index finger, NOT across the front.",
    tips: [
      "Curl all four fingers tightly into your palm",
      "Thumb sits alongside the index finger (not in front)",
      "Fingertips should touch the base of your palm",
    ],
    commonMistakes: ["Thumb crossing over the front (that's 'S')", "Loose fist — fingers not curled enough"],
    mnemonic: "Think of a solid block — a tight, closed shape",
  },
  {
    letter: "B",
    difficulty: "basic",
    description: "Extend all four fingers straight up and together. Fold your thumb across the palm.",
    tips: [
      "All four fingers point straight up, touching each other",
      "Thumb folds across the front of the palm",
      "Fingers are flat and straight, not spread",
    ],
    commonMistakes: ["Spreading fingers apart (that's '4')", "Thumb sticking out to the side"],
    mnemonic: "Flat hand = flat letter B, like a book page",
  },
  {
    letter: "C",
    difficulty: "basic",
    description: "Curve all your fingers and thumb to form a C shape, like holding a ball.",
    tips: [
      "All fingers curve together like a claw",
      "Thumb also curves to complete the C",
      "Look at your hand from the side — it should look like the letter C",
    ],
    commonMistakes: ["Fingers too flat — not enough curve", "Thumb not curving enough"],
    mnemonic: "Your hand IS the letter C — just curve it!",
  },
  {
    letter: "O",
    difficulty: "basic",
    description: "Bring all fingertips to touch the thumb tip, forming a round O shape.",
    tips: [
      "All five fingertips touch the thumb tip",
      "Forms a circle when viewed from the front",
      "Fingers are curved, not flat",
    ],
    commonMistakes: ["Fingers not touching thumb — gap at top", "Only some fingers touching"],
    mnemonic: "Make an O with your hand — simple!",
  },
  {
    letter: "V",
    difficulty: "basic",
    description: "Extend index and middle fingers upward in a V shape. Spread them apart.",
    tips: [
      "Index and middle fingers point straight up",
      "Spread them apart to form a V",
      "Ring and pinky curl into the palm",
    ],
    commonMistakes: ["Fingers together (that's 'U')", "Not spreading enough"],
    mnemonic: "Peace sign = V sign — same thing!",
  },
  {
    letter: "Y",
    difficulty: "basic",
    description: "Extend only your thumb and pinky finger. Other fingers curl into the palm.",
    tips: [
      "Thumb and pinky stick out",
      "Index, middle, and ring fingers curl down",
      "Looks like a 'hang loose' or phone gesture",
    ],
    commonMistakes: ["Other fingers sticking out", "Not extending pinky fully"],
    mnemonic: "Thumbs up + pinky out = Y",
  },
  {
    letter: "I",
    difficulty: "basic",
    description: "Extend only the pinky finger straight up. All other fingers form a tight fist.",
    tips: [
      "Only pinky points up",
      "Other four fingers curl tightly into palm",
      "Thumb crosses over the curled fingers",
    ],
    commonMistakes: ["Other fingers slightly extending", "Loose fist"],
    mnemonic: "One pinky = letter I — the smallest letter, the smallest finger",
  },
  {
    letter: "L",
    difficulty: "basic",
    description: "Extend your index finger up and thumb out to the side, forming an L shape at 90 degrees.",
    tips: [
      "Index finger points straight up",
      "Thumb points straight out to the side",
      "Makes a clear 90-degree angle",
    ],
    commonMistakes: ["Thumb not pointing far enough out", "Angle less than 90 degrees"],
    mnemonic: "Your hand literally makes the letter L!",
  },
];

// ===== INTERMEDIATE — Letters requiring more precision =====
export const INTERMEDIATE_ALPHABET: AlphabetEntry[] = [
  {
    letter: "D",
    difficulty: "intermediate",
    description: "Point only your index finger straight up. Touch the tips of your other three fingers to your thumb, forming a circle.",
    tips: [
      "Index finger points straight up",
      "Middle, ring, and pinky touch thumb tip",
      "Forms a circle with three fingers + thumb",
    ],
    commonMistakes: ["Other fingers extending up too", "Circle not formed properly"],
    mnemonic: "D = one finger Up, three fingers making a circle at the base",
  },
  {
    letter: "E",
    difficulty: "intermediate",
    description: "Curl all four fingers tightly so the fingertips rest on the palm ridge. Thumb tucks under the fingers.",
    tips: [
      "Fingertips press down onto the palm ridge (where fingers meet palm)",
      "All four fingers curl tightly — tighter than 'A'",
      "Thumb hides under the fingers, not visible from front",
    ],
    commonMistakes: ["Fingers not curled enough — too loose", "Thumb showing from the front"],
    mnemonic: "E = tight claw — fingertips pressed into your palm",
  },
  {
    letter: "F",
    difficulty: "intermediate",
    description: "Touch your index finger tip to your thumb tip (forming a circle). Extend the other three fingers up and spread.",
    tips: [
      "Index + thumb make an OK sign circle",
      "Middle, ring, and pinky extend straight up",
      "The three extended fingers are spread apart",
    ],
    commonMistakes: ["All fingers extended (that's 'B')", "Circle not closed properly"],
    mnemonic: "F = 'OK' sign with three extra fingers up",
  },
  {
    letter: "W",
    difficulty: "intermediate",
    description: "Extend index, middle, and ring fingers up and spread apart. Thumb holds the pinky down.",
    tips: [
      "Three fingers up: index, middle, ring",
      "Spread them apart — they represent the three peaks of W",
      "Thumb presses pinky down into the palm",
    ],
    commonMistakes: ["Pinky also extending", "Fingers not spread enough"],
    mnemonic: "Three fingers up = W for three letters: W-A-V-E",
  },
  {
    letter: "S",
    difficulty: "intermediate",
    description: "Make a tight fist with thumb across the FRONT of the curled fingers.",
    tips: [
      "All fingers curl into a tight fist",
      "Thumb crosses over the front of the fingers",
      "Different from 'A' — thumb is IN FRONT, not on the side",
    ],
    commonMistakes: ["Thumb on the side (that's 'A')", "Fist too loose"],
    mnemonic: "S = thumb crosses the front like a belt buckle",
  },
  {
    letter: "T",
    difficulty: "intermediate",
    description: "Make a fist, then let your thumb peek out between the index and middle fingers.",
    tips: [
      "Fist with thumb poking between index and middle",
      "Thumb tip should be visible",
      "Other fingers curl tightly over the thumb",
    ],
    commonMistakes: ["Thumb next to index (that's 'A' or 'M')", "Thumb not between the right fingers"],
    mnemonic: "T = thumb peeks between the first two fingers like a tent pole",
  },
  {
    letter: "M",
    difficulty: "intermediate",
    description: "Fold three fingers over the thumb. Thumb peeks out between the ring and pinky fingers.",
    tips: [
      "Index, middle, and ring fold over the thumb",
      "Thumb tip peeks out between ring and pinky",
      "Three fingers visible on the outside",
    ],
    commonMistakes: ["Only two fingers over thumb (that's 'N')", "Thumb not peeking through"],
    mnemonic: "M = three bumps (three fingers folded over) = 3 humps like the letter M",
  },
  {
    letter: "N",
    difficulty: "intermediate",
    description: "Fold two fingers over the thumb. Thumb peeks out between the middle and ring fingers.",
    tips: [
      "Only index and middle fold over the thumb",
      "Thumb tip peeks out between middle and ring",
      "Two fingers visible on the outside",
    ],
    commonMistakes: ["Three fingers over thumb (that's 'M')", "Thumb not peeking through"],
    mnemonic: "N = two bumps (two fingers folded) — one less than M",
  },
];

// ===== ADVANCED — Letters requiring motion or tricky handshapes =====
export const ADVANCED_ALPHABET: AlphabetEntry[] = [
  {
    letter: "G",
    difficulty: "advanced",
    description: "Point your index finger and thumb to the side (sideways). Other fingers curl into the palm.",
    tips: [
      "Index finger points sideways (not up)",
      "Thumb also points sideways, parallel to index",
      "Looks like you're about to pinch something",
      "Hand is turned so fingers point to the side",
    ],
    commonMistakes: ["Index pointing up (that's 'L' or 'D')", "Both fingers pointing forward"],
    mnemonic: "G = grip — your fingers look like they're grabbing sideways",
  },
  {
    letter: "H",
    difficulty: "advanced",
    description: "Extend index and middle fingers sideways, held together. Ring and pinky curl into palm.",
    tips: [
      "Index and middle point sideways (not up)",
      "They are held together, not spread",
      "Ring and pinky curl into the palm",
    ],
    commonMistakes: ["Fingers pointing up (that's 'U')", "Fingers spread apart (that's 'K' direction)"],
    mnemonic: "H = two fingers pointing horizontally, like two horses running",
  },
  {
    letter: "P",
    difficulty: "advanced",
    description: "Make a K handshape but point it downward. Index and middle extend down with thumb between them.",
    tips: [
      "Index and middle fingers point DOWN",
      "Thumb sits between the two fingers",
      "Looks like an upside-down K",
    ],
    commonMistakes: ["Pointing up (that's 'K')", "Thumb not between fingers"],
    mnemonic: "P = K turned upside down",
  },
  {
    letter: "K",
    difficulty: "advanced",
    description: "Extend index and middle fingers up with thumb between them. Middle finger is slightly forward.",
    tips: [
      "Index and middle point up, spread apart",
      "Thumb touches the base of the middle finger",
      "Like a peace sign but with thumb touching middle finger",
    ],
    commonMistakes: ["Thumb not touching middle finger", "Fingers too close together"],
    mnemonic: "K = like V but your thumb pushes the middle finger forward",
  },
  {
    letter: "Q",
    difficulty: "advanced",
    description: "Point your index finger and thumb downward, like a downward G. Pinch position pointing down.",
    tips: [
      "Index and thumb point DOWN",
      "Looks like you're picking something up off the ground",
      "Other fingers curl into the palm",
    ],
    commonMistakes: ["Pointing sideways (that's 'G')", "Pointing up"],
    mnemonic: "Q = G flipped downward — like reaching for something on the floor",
  },
  {
    letter: "R",
    difficulty: "advanced",
    description: "Cross your middle finger over your index finger. Both fingers point up.",
    tips: [
      "Cross middle finger OVER index finger",
      "Both fingers point up",
      "Ring and pinky curl into the palm",
    ],
    commonMistakes: ["Fingers side by side (that's 'U')", "Not actually crossing"],
    mnemonic: "R = crossed fingers for 'luck' — cross them tighter!",
  },
  {
    letter: "X",
    difficulty: "advanced",
    description: "Extend your index finger and hook it into a bent shape, like a crooked finger or a pirate's hook.",
    tips: [
      "Index finger extends then hooks/bends at the middle joint",
      "Other fingers curl into the fist",
      "Should look like a hook shape",
    ],
    commonMistakes: ["Finger straight (that's 'D' or '1')", "Bending too much — looks like a fist"],
    mnemonic: "X = X marks the spot — a pirate's hooked finger",
  },
  {
    letter: "J",
    difficulty: "advanced",
    description: "Start with the 'I' handshape (pinky up), then draw a J curve in the air with your pinky.",
    tips: [
      "Start with only pinky extended (like letter I)",
      "Draw a J motion — down, then curve up",
      "The motion makes it different from I",
    ],
    commonMistakes: ["Not moving — just holding I", "Using index finger instead of pinky"],
    mnemonic: "J = I that takes a journey — pinky draws the letter J",
  },
  {
    letter: "Z",
    difficulty: "advanced",
    description: "Start with the 'I' handshape (index finger extended), then draw a Z shape in the air with your index finger.",
    tips: [
      "Index finger extended (like letter D/1)",
      "Draw a Z: left to right, diagonal down-left, then left to right again",
      "The motion makes it different from D",
    ],
    commonMistakes: ["Not drawing the Z motion", "Using wrong finger"],
    mnemonic: "Z = the last letter draws its own shape in the air!",
  },
];

// ===== ALL ALPHABET DATA =====
export const ALL_ALPHABET: AlphabetEntry[] = [
  ...BASIC_ALPHABET,
  ...INTERMEDIATE_ALPHABET,
  ...ADVANCED_ALPHABET,
];

export const ALPHABET_BY_DIFFICULTY = {
  basic: BASIC_ALPHABET,
  intermediate: INTERMEDIATE_ALPHABET,
  advanced: ADVANCED_ALPHABET,
};
