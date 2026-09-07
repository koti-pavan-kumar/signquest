/**
 * Word & Sentence Training Data
 * Organized by difficulty: Basic, Intermediate, Advanced
 * Each entry includes the sign description, finger-spelling breakdown, and tips.
 */

export type Difficulty = "basic" | "intermediate" | "advanced";

export interface WordEntry {
  word: string;
  difficulty: Difficulty;
  /** Description of how to sign this word */
  signDescription: string;
  /** Individual letter breakdown for finger-spelling */
  fingerSpell: string[];
  /** Tips for correct signing */
  tips: string[];
  /** Category for grouping */
  category: string;
  /** Emoji visual hint */
  emoji: string;
}

export interface SentenceEntry {
  sentence: string;
  difficulty: Difficulty;
  /** Description of how to sign the sentence */
  signDescription: string;
  /** Word-by-word breakdown */
  wordBreakdown: string[];
  /** Tips for sentence flow */
  tips: string[];
  /** Estimated sign count */
  signCount: number;
}

// ===== BASIC WORDS (Level 1) =====
export const BASIC_WORDS: WordEntry[] = [
  {
    word: "Hello",
    difficulty: "basic",
    signDescription: "Wave your open hand side to side near your face. Start with palm facing forward and sweep it outward.",
    fingerSpell: ["H", "E", "L", "L", "O"],
    tips: ["Open palm, fingers together", "Wave from left to right", "Keep hand near face level"],
    category: "greetings",
    emoji: "👋",
  },
  {
    word: "Yes",
    difficulty: "basic",
    signDescription: "Make a fist and nod it up and down like a head nodding. The fist represents your head.",
    fingerSpell: ["Y", "E", "S"],
    tips: ["Fist with thumb on side", "Nod up and down", "Like your hand is saying yes"],
    category: "responses",
    emoji: "👍",
  },
  {
    word: "No",
    difficulty: "basic",
    signDescription: "Flick your index and middle finger down against your thumb. The fingers snap closed.",
    fingerSpell: ["N", "O"],
    tips: ["Start with index and middle extended", "Snap them down onto thumb", "Quick, sharp motion"],
    category: "responses",
    emoji: "🚫",
  },
  {
    word: "Please",
    difficulty: "basic",
    signDescription: "Place your flat open palm on your chest and rub it in a circular motion.",
    fingerSpell: ["P", "L", "E", "A", "S", "E"],
    tips: ["Flat palm on chest", "Circular rubbing motion", "Move clockwise"],
    category: "polite",
    emoji: "🙏",
  },
  {
    word: "Thank",
    difficulty: "basic",
    signDescription: "Touch your fingertips to your chin, then move your hand forward and down toward the other person.",
    fingerSpell: ["T", "H", "A", "N", "K"],
    tips: ["Fingertips touch chin first", "Move hand outward", "Palm faces the person"],
    category: "polite",
    emoji: "🙏",
  },
  {
    word: "Sorry",
    difficulty: "basic",
    signDescription: "Make a fist and rub it in a circle on your chest. Like you are rubbing away a stain.",
    fingerSpell: ["S", "O", "R", "R", "Y"],
    tips: ["Closed fist on chest", "Circular rubbing motion", "Look remorseful"],
    category: "polite",
    emoji: "😔",
  },
  {
    word: "Good",
    difficulty: "basic",
    signDescription: "Start with flat hand touching your chin, then move it forward and down, ending with palm facing up.",
    fingerSpell: ["G", "O", "O", "D"],
    tips: ["Start at chin", "Move outward and down", "End with palm up"],
    category: "responses",
    emoji: "👍",
  },
  {
    word: "Bad",
    difficulty: "basic",
    signDescription: "Start with flat hand touching your chin, then flip it downward quickly with palm facing down.",
    fingerSpell: ["B", "A", "D"],
    tips: ["Start at chin like 'Good'", "Flip palm down sharply", "Quick, decisive motion"],
    category: "responses",
    emoji: "👎",
  },
  {
    word: "Help",
    difficulty: "basic",
    signDescription: "Make a fist with one hand, place it on top of your flat palm, and lift both hands together.",
    fingerSpell: ["H", "E", "L", "P"],
    tips: ["Fist on flat palm", "Lift both hands upward", "Shows lifting someone up"],
    category: "essential",
    emoji: "🆘",
  },
  {
    word: "Water",
    difficulty: "basic",
    signDescription: "Make a W shape with three fingers (index, middle, ring) and tap your chin twice.",
    fingerSpell: ["W", "A", "T", "E", "R"],
    tips: ["W handshape (3 fingers up)", "Tap chin with index finger", "Tap twice for emphasis"],
    category: "essential",
    emoji: "💧",
  },
  {
    word: "Eat",
    difficulty: "basic",
    signDescription: "Bring your bunched fingertips (all five touching) to your mouth repeatedly, like putting food in.",
    fingerSpell: ["E", "A", "T"],
    tips: ["Bunch all fingertips together", "Tap mouth 2-3 times", "Like feeding yourself"],
    category: "needs",
    emoji: "🍽️",
  },
  {
    word: "Drink",
    difficulty: "basic",
    signDescription: "Make a C shape with your hand (like holding a cup) and bring it to your mouth.",
    fingerSpell: ["D", "R", "I", "N", "K"],
    tips: ["C handshape", "Bring to mouth", "Like drinking from a cup"],
    category: "needs",
    emoji: "🥤",
  },
];

// ===== INTERMEDIATE WORDS (Level 2) =====
export const INTERMEDIATE_WORDS: WordEntry[] = [
  {
    word: "Friend",
    difficulty: "intermediate",
    signDescription: "Hook your index fingers together, first one way then flip to hook the other way. Shows two people connected.",
    fingerSpell: ["F", "R", "I", "E", "N", "D"],
    tips: ["Hook index fingers", "Flip and re-hook", "Shows mutual connection"],
    category: "people",
    emoji: "🤝",
  },
  {
    word: "Love",
    difficulty: "intermediate",
    signDescription: "Cross your fists over your chest, one on top of the other, like hugging yourself.",
    fingerSpell: ["L", "O", "V", "E"],
    tips: ["Cross fists on chest", "Like a self-hug", "Hold for a moment"],
    category: "emotions",
    emoji: "❤️",
  },
  {
    word: "Family",
    difficulty: "intermediate",
    signDescription: "Start with F-hands (OK sign) touching at thumbs, then circle them outward and bring pinkies together.",
    fingerSpell: ["F", "A", "M", "I", "L", "Y"],
    tips: ["F handshape", "Circle outward", "End with pinkies touching"],
    category: "people",
    emoji: "👨‍👩‍👧‍👦",
  },
  {
    word: "School",
    difficulty: "intermediate",
    signDescription: "Clap your hands once, then sweep them apart horizontally with palms down.",
    fingerSpell: ["S", "C", "H", "O", "O", "L"],
    tips: ["Clap once", "Sweep hands apart", "Palms face down"],
    category: "places",
    emoji: "🏫",
  },
  {
    word: "Learn",
    difficulty: "intermediate",
    signDescription: "Place one palm up, then take information from it with the other hand and bring it to your forehead.",
    fingerSpell: ["L", "E", "A", "R", "N"],
    tips: ["Palm represents a book", "Grab from palm", "Bring to forehead (knowledge)"],
    category: "actions",
    emoji: "📚",
  },
  {
    word: "Time",
    difficulty: "intermediate",
    signDescription: "Tap your wrist where a watch would be with your index finger.",
    fingerSpell: ["T", "I", "M", "E"],
    tips: ["Tap wrist twice", "Where you wear a watch", "Simple and clear"],
    category: "concepts",
    emoji: "⏰",
  },
  {
    word: "Want",
    difficulty: "intermediate",
    signDescription: "Hold both hands out with palms up, fingers clawed, and pull them toward you.",
    fingerSpell: ["W", "A", "N", "T"],
    tips: ["Claw hands out", "Pull toward body", "Palms face up"],
    category: "actions",
    emoji: "🤗",
  },
  {
    word: "Play",
    difficulty: "intermediate",
    signDescription: "Make Y-hands (thumb and pinky out) and twist them back and forth.",
    fingerSpell: ["P", "L", "A", "Y"],
    tips: ["Y handshape on both hands", "Twist wrists back and forth", "Energetic motion"],
    category: "actions",
    emoji: "🎮",
  },
  {
    word: "Name",
    difficulty: "intermediate",
    signDescription: "Tap your middle and index fingers of both hands together in an X shape, twice.",
    fingerSpell: ["N", "A", "M", "E"],
    tips: ["H and U handshapes", "Tap fingers together", "Tap twice"],
    category: "concepts",
    emoji: "🏷️",
  },
  {
    word: "Where",
    difficulty: "intermediate",
    signDescription: "Shake your index finger back and forth horizontally, like wagging 'no' but to the side.",
    fingerSpell: ["W", "H", "E", "R", "E"],
    tips: ["Index finger extended", "Shake side to side", "Question expression"],
    category: "questions",
    emoji: "❓",
  },
];

// ===== ADVANCED WORDS (Level 3) =====
export const ADVANCED_WORDS: WordEntry[] = [
  {
    word: "Hospital",
    difficulty: "advanced",
    signDescription: "Make an H handshape (index and middle extended sideways) and draw a cross on your upper arm.",
    fingerSpell: ["H", "O", "S", "P", "I", "T", "A", "L"],
    tips: ["H handshape", "Draw cross on arm", "Top arm, not forearm"],
    category: "places",
    emoji: "🏥",
  },
  {
    word: "Emergency",
    difficulty: "advanced",
    signDescription: "Hold your non-dominant hand flat. With your dominant hand, quickly tap the center of the flat palm 3 times with your middle finger.",
    fingerSpell: ["E", "M", "E", "R", "G", "E", "N", "C", "Y"],
    tips: ["Flat palm as base", "Middle finger taps quickly", "3 sharp taps"],
    category: "urgent",
    emoji: "🚨",
  },
  {
    word: "Bathroom",
    difficulty: "advanced",
    signDescription: "Make a T handshape (thumb between index and middle) and shake it side to side.",
    fingerSpell: ["B", "A", "T", "H", "R", "O", "O", "M"],
    tips: ["T handshape", "Shake gently", "Side to side motion"],
    category: "places",
    emoji: "🚻",
  },
  {
    word: "Medicine",
    difficulty: "advanced",
    signDescription: "Press your middle finger into the center of your opposite palm and twist it back and forth.",
    fingerSpell: ["M", "E", "D", "I", "C", "I", "N", "E"],
    tips: ["Middle finger on palm", "Twist back and forth", "Like applying ointment"],
    category: "health",
    emoji: "💊",
  },
  {
    word: "Danger",
    difficulty: "advanced",
    signDescription: "Cross your forearms in front of your chest in an X shape, fists clenched, then pull them apart sharply.",
    fingerSpell: ["D", "A", "N", "G", "E", "R"],
    tips: ["Cross forearms", "Fists clenched", "Pull apart with force"],
    category: "urgent",
    emoji: "⚠️",
  },
  {
    word: "Paper",
    difficulty: "advanced",
    signDescription: "Brush the heel of your dominant palm across the back of your non-dominant hand twice.",
    fingerSpell: ["P", "A", "P", "E", "R"],
    tips: ["Non-dominant hand flat", "Brush with dominant palm", "Two brushing motions"],
    category: "objects",
    emoji: "📄",
  },
];

// ===== BASIC SENTENCES (Level 1) =====
export const BASIC_SENTENCES: SentenceEntry[] = [
  {
    sentence: "Hello, my name is...",
    difficulty: "basic",
    signDescription: "Wave hello, then point to yourself, then tap your H and U handshapes together for 'name'.",
    wordBreakdown: ["Hello", "My", "Name", "Is"],
    tips: ["Start with wave", "Point to self for 'my'", "H-U tap for 'name'"],
    signCount: 4,
  },
  {
    sentence: "Nice to meet you",
    difficulty: "basic",
    signDescription: "Slide your dominant palm across your non-dominant palm (nice), then point forward (you), with a handshake motion.",
    wordBreakdown: ["Nice", "To", "Meet", "You"],
    tips: ["Flat hand slide for 'nice'", "Point for 'you'", "Friendly expression"],
    signCount: 4,
  },
  {
    sentence: "I need help",
    difficulty: "basic",
    signDescription: "Point to yourself, then make a claw hand pulling toward you (need), then fist-on-palm lift (help).",
    wordBreakdown: ["I", "Need", "Help"],
    tips: ["Point to self", "Claw pull for 'need'", "Fist on palm for 'help'"],
    signCount: 3,
  },
  {
    sentence: "Thank you very much",
    difficulty: "basic",
    signDescription: "Touch chin with fingertips and move hand forward (thank), point forward (you), then both hands move forward with emphasis.",
    wordBreakdown: ["Thank", "You", "Very", "Much"],
    tips: ["Chin touch for 'thank'", "Point for 'you'", "Emphasize 'very much'"],
    signCount: 4,
  },
  {
    sentence: "I don't understand",
    difficulty: "basic",
    signDescription: "Point to yourself, then hold both hands up with palms facing you and shake your head, showing confusion.",
    wordBreakdown: ["I", "Don't", "Understand"],
    tips: ["Point to self", "Palms up shake", "Shake head 'no'"],
    signCount: 3,
  },
];

// ===== INTERMEDIATE SENTENCES (Level 2) =====
export const INTERMEDIATE_SENTENCES: SentenceEntry[] = [
  {
    sentence: "Good morning, how are you?",
    difficulty: "intermediate",
    signDescription: "Flat hand from chin forward (good), arc hand rising from non-dominant arm (morning), then two fingers moving from chest outward (how-you).",
    wordBreakdown: ["Good", "Morning", "How", "Are", "You"],
    tips: ["Start with 'good'", "Rising arc for 'morning'", "End with question expression"],
    signCount: 5,
  },
  {
    sentence: "Where is the bathroom?",
    difficulty: "intermediate",
    signDescription: "Shake index side to side (where), then T-handshake for 'bathroom'.",
    wordBreakdown: ["Where", "Is", "The", "Bathroom"],
    tips: ["Shake finger for 'where'", "T-shake for 'bathroom'", "Question face"],
    signCount: 4,
  },
  {
    sentence: "I want water please",
    difficulty: "intermediate",
    signDescription: "Point to self, claw hands pull toward you (want), W-tap chin (water), palm on chest circle (please).",
    wordBreakdown: ["I", "Want", "Water", "Please"],
    tips: ["Point self", "Claw pull", "W on chin", "Palm circle"],
    signCount: 4,
  },
  {
    sentence: "My family is small",
    difficulty: "intermediate",
    signDescription: "Point to self, F-hand circle for 'family', then bring both hands close together for 'small'.",
    wordBreakdown: ["My", "Family", "Is", "Small"],
    tips: ["Point for 'my'", "F-circle for 'family'", "Hands close for 'small'"],
    signCount: 4,
  },
  {
    sentence: "I love my friend",
    difficulty: "intermediate",
    signDescription: "Point to self, cross fists on chest (love), point to self (my), hook index fingers (friend).",
    wordBreakdown: ["I", "Love", "My", "Friend"],
    tips: ["Cross fists for 'love'", "Self-hug motion", "Hook fingers for 'friend'"],
    signCount: 4,
  },
];

// ===== ADVANCED SENTENCES (Level 3) =====
export const ADVANCED_SENTENCES: SentenceEntry[] = [
  {
    sentence: "Where is the hospital?",
    difficulty: "advanced",
    signDescription: "Shake index for 'where', H-hand cross-draw for 'hospital'.",
    wordBreakdown: ["Where", "Is", "The", "Hospital"],
    tips: ["Question expression", "H-draw on arm", "Clear finger spelling if needed"],
    signCount: 4,
  },
  {
    sentence: "I need emergency help now",
    difficulty: "advanced",
    signDescription: "Point self, claw pull (need), middle-finger tap 3x on palm (emergency), fist-on-palm (help), then time-tap wrist (now).",
    wordBreakdown: ["I", "Need", "Emergency", "Help", "Now"],
    tips: ["Urgent expression", "3 quick taps for emergency", "Fist-lift for help"],
    signCount: 5,
  },
  {
    sentence: "Please call my family",
    difficulty: "advanced",
    signDescription: "Palm circle on chest (please), Y-hand to ear (call), point self (my), F-hand circle (family).",
    wordBreakdown: ["Please", "Call", "My", "Family"],
    tips: ["Circle for 'please'", "Phone gesture for 'call'", "F-circle for family"],
    signCount: 4,
  },
  {
    sentence: "The medicine is on the table",
    difficulty: "advanced",
    signDescription: "Middle finger twist on palm (medicine), point to flat surface (table).",
    wordBreakdown: ["The", "Medicine", "Is", "On", "The", "Table"],
    tips: ["Twist for 'medicine'", "Flat hand = table", "Point to location"],
    signCount: 6,
  },
  {
    sentence: "I don't know where they are",
    difficulty: "advanced",
    signDescription: "Point self, palm up shake with head shake (don't-know), shake index (where), point to side (they).",
    wordBreakdown: ["I", "Don't", "Know", "Where", "They", "Are"],
    tips: ["Shake head for negation", "Palm-up shrug for 'don't know'", "Point for 'they'"],
    signCount: 6,
  },
];

// ===== COMBINED EXPORTS =====
export const ALL_WORDS: WordEntry[] = [
  ...BASIC_WORDS,
  ...INTERMEDIATE_WORDS,
  ...ADVANCED_WORDS,
];

export const ALL_SENTENCES: SentenceEntry[] = [
  ...BASIC_SENTENCES,
  ...INTERMEDIATE_SENTENCES,
  ...ADVANCED_SENTENCES,
];

export const WORDS_BY_DIFFICULTY = {
  basic: BASIC_WORDS,
  intermediate: INTERMEDIATE_WORDS,
  advanced: ADVANCED_WORDS,
};

export const SENTENCES_BY_DIFFICULTY = {
  basic: BASIC_SENTENCES,
  intermediate: INTERMEDIATE_SENTENCES,
  advanced: ADVANCED_SENTENCES,
};
