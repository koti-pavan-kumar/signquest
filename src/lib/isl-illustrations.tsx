/**
 * ISL Gesture Illustrations
 * SVG hand diagrams for Indian Sign Language letters and common signs.
 */

import React from "react";

interface ISLIllustrationProps {
  /** The Devanagari letter or ISL word to illustrate */
  letter: string;
  /** Size in pixels */
  size?: number;
  /** Additional CSS classes */
  className?: string;
}

// ===== Individual Hand Shape SVGs for ISL =====

const Handshapes: Record<string, React.FC<{ size: number }>> = {
  // Open palm - all fingers extended
  open_palm: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      {/* Palm */}
      <rect x="35" y="45" width="50" height="45" rx="8" fill="#E8D5C4" stroke="#8B7355" strokeWidth="2" />
      {/* Fingers */}
      <rect x="38" y="15" width="8" height="35" rx="4" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1.5" />
      <rect x="50" y="10" width="8" height="40" rx="4" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1.5" />
      <rect x="62" y="12" width="8" height="38" rx="4" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1.5" />
      <rect x="74" y="18" width="8" height="32" rx="4" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1.5" />
      {/* Thumb */}
      <rect x="22" y="48" width="18" height="8" rx="4" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1.5" transform="rotate(-10 22 48)" />
      {/* Fingernails */}
      <ellipse cx="42" cy="18" rx="3" ry="2" fill="#D4A990" />
      <ellipse cx="54" cy="13" rx="3" ry="2" fill="#D4A990" />
      <ellipse cx="66" cy="15" rx="3" ry="2" fill="#D4A990" />
      <ellipse cx="78" cy="21" rx="3" ry="2" fill="#D4A990" />
    </svg>
  ),

  // Fist - all fingers curled
  fist: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <rect x="30" y="40" width="55" height="50" rx="12" fill="#E8D5C4" stroke="#8B7355" strokeWidth="2" />
      {/* Curled finger lines */}
      <path d="M38 42 Q42 38 46 42" stroke="#8B7355" strokeWidth="1.5" fill="none" />
      <path d="M48 40 Q52 36 56 40" stroke="#8B7355" strokeWidth="1.5" fill="none" />
      <path d="M58 40 Q62 36 66 40" stroke="#8B7355" strokeWidth="1.5" fill="none" />
      <path d="M68 42 Q72 38 76 42" stroke="#8B7355" strokeWidth="1.5" fill="none" />
      {/* Thumb across front */}
      <rect x="32" y="55" width="20" height="9" rx="4" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1.5" />
      <ellipse cx="50" cy="59" rx="3" ry="3" fill="#D4A990" />
    </svg>
  ),

  // Index up (pointing)
  index_up: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <rect x="35" y="50" width="45" height="42" rx="8" fill="#E8D5C4" stroke="#8B7355" strokeWidth="2" />
      {/* Index finger */}
      <rect x="52" y="10" width="10" height="45" rx="5" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1.5" />
      <ellipse cx="57" cy="14" rx="4" ry="2.5" fill="#D4A990" />
      {/* Curled fingers */}
      <path d="M42 52 Q46 48 50 52" stroke="#8B7355" strokeWidth="1.5" fill="none" />
      <path d="M64 52 Q68 48 72 52" stroke="#8B7355" strokeWidth="1.5" fill="none" />
      {/* Thumb */}
      <rect x="30" y="58" width="12" height="7" rx="3" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1.5" />
    </svg>
  ),

  // V shape / Peace (index + middle spread)
  v_shape: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <rect x="35" y="55" width="45" height="40" rx="8" fill="#E8D5C4" stroke="#8B7355" strokeWidth="2" />
      {/* Index */}
      <rect x="42" y="12" width="9" height="48" rx="4" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1.5" transform="rotate(-8 42 12)" />
      {/* Middle */}
      <rect x="62" y="10" width="9" height="50" rx="4" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1.5" transform="rotate(5 62 10)" />
      <ellipse cx="46" cy="15" rx="3" ry="2" fill="#D4A990" />
      <ellipse cx="66" cy="13" rx="3" ry="2" fill="#D4A990" />
      {/* Thumb */}
      <rect x="30" y="62" width="14" height="7" rx="3" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1.5" />
    </svg>
  ),

  // L shape (index + thumb)
  l_shape: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <rect x="40" y="55" width="45" height="40" rx="8" fill="#E8D5C4" stroke="#8B7355" strokeWidth="2" />
      {/* Index up */}
      <rect x="55" y="10" width="10" height="48" rx="5" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1.5" />
      {/* Thumb sideways */}
      <rect x="22" y="58" width="38" height="9" rx="4" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1.5" />
      <ellipse cx="60" cy="14" rx="4" ry="2.5" fill="#D4A990" />
      <ellipse cx="25" cy="62" rx="2.5" ry="3" fill="#D4A990" />
    </svg>
  ),

  // W shape (index + middle + ring)
  w_shape: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <rect x="35" y="55" width="45" height="40" rx="8" fill="#E8D5C4" stroke="#8B7355" strokeWidth="2" />
      {/* Index */}
      <rect x="40" y="15" width="8" height="43" rx="4" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1.5" transform="rotate(-10 40 15)" />
      {/* Middle */}
      <rect x="52" y="10" width="8" height="48" rx="4" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1.5" />
      {/* Ring */}
      <rect x="64" y="14" width="8" height="44" rx="4" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1.5" transform="rotate(8 64 14)" />
      <ellipse cx="43" cy="18" rx="3" ry="2" fill="#D4A990" />
      <ellipse cx="56" cy="13" rx="3" ry="2" fill="#D4A990" />
      <ellipse cx="68" cy="17" rx="3" ry="2" fill="#D4A990" />
    </svg>
  ),

  // Y shape (thumb + pinky)
  y_shape: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <rect x="38" y="50" width="40" height="42" rx="8" fill="#E8D5C4" stroke="#8B7355" strokeWidth="2" />
      {/* Pinky */}
      <rect x="72" y="18" width="7" height="35" rx="3.5" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1.5" transform="rotate(12 72 18)" />
      {/* Thumb */}
      <rect x="20" y="52" width="25" height="8" rx="4" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1.5" transform="rotate(-15 20 52)" />
      <ellipse cx="75" cy="21" rx="3" ry="2" fill="#D4A990" />
      <ellipse cx="22" cy="55" rx="2.5" ry="3" fill="#D4A990" />
    </svg>
  ),

  // Flat hand (all fingers together)
  flat_hand: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <rect x="38" y="48" width="44" height="44" rx="8" fill="#E8D5C4" stroke="#8B7355" strokeWidth="2" />
      {/* Fingers together */}
      <rect x="40" y="14" width="40" height="38" rx="6" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1.5" />
      {/* Finger lines */}
      <line x1="50" y1="14" x2="50" y2="52" stroke="#8B7355" strokeWidth="0.8" />
      <line x1="60" y1="14" x2="60" y2="52" stroke="#8B7355" strokeWidth="0.8" />
      <line x1="70" y1="14" x2="70" y2="52" stroke="#8B7355" strokeWidth="0.8" />
      {/* Thumb */}
      <rect x="26" y="52" width="16" height="7" rx="3" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1.5" />
    </svg>
  ),

  // Prayer / Namaste (two hands)
  namaste: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      {/* Left hand */}
      <rect x="32" y="20" width="22" height="50" rx="6" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1.5" />
      <rect x="32" y="12" width="6" height="12" rx="3" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1" />
      <rect x="39" y="10" width="6" height="14" rx="3" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1" />
      <rect x="46" y="12" width="6" height="12" rx="3" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1" />
      {/* Right hand */}
      <rect x="66" y="20" width="22" height="50" rx="6" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1.5" />
      <rect x="66" y="12" width="6" height="12" rx="3" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1" />
      <rect x="73" y="10" width="6" height="14" rx="3" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1" />
      <rect x="80" y="12" width="6" height="12" rx="3" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1" />
      {/* Glow effect */}
      <circle cx="60" cy="55" r="8" fill="#F59E0B" opacity="0.2" />
      {/* Connection */}
      <line x1="54" y1="30" x2="66" y2="30" stroke="#D4A990" strokeWidth="1" />
      <line x1="54" y1="45" x2="66" y2="45" stroke="#D4A990" strokeWidth="1" />
      <line x1="54" y1="60" x2="66" y2="60" stroke="#D4A990" strokeWidth="1" />
    </svg>
  ),

  // Two fingers together (U shape)
  two_together: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <rect x="35" y="55" width="45" height="40" rx="8" fill="#E8D5C4" stroke="#8B7355" strokeWidth="2" />
      {/* Index + middle together */}
      <rect x="48" y="10" width="18" height="48" rx="6" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1.5" />
      <line x1="57" y1="10" x2="57" y2="58" stroke="#8B7355" strokeWidth="0.8" />
      <ellipse cx="52" cy="13" rx="3" ry="2" fill="#D4A990" />
      <ellipse cx="62" cy="13" rx="3" ry="2" fill="#D4A990" />
      {/* Thumb */}
      <rect x="30" y="62" width="12" height="7" rx="3" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1.5" />
    </svg>
  ),

  // Three fingers (thumb + index + middle)
  three_fingers: ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <rect x="40" y="55" width="40" height="40" rx="8" fill="#E8D5C4" stroke="#8B7355" strokeWidth="2" />
      {/* Thumb */}
      <rect x="22" y="50" width="22" height="8" rx="4" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1.5" transform="rotate(-20 22 50)" />
      {/* Index */}
      <rect x="44" y="12" width="9" height="46" rx="4" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1.5" transform="rotate(-5 44 12)" />
      {/* Middle */}
      <rect x="58" y="10" width="9" height="48" rx="4" fill="#E8D5C4" stroke="#8B7355" strokeWidth="1.5" />
      <ellipse cx="48" cy="15" rx="3" ry="2" fill="#D4A990" />
      <ellipse cx="62" cy="13" rx="3" ry="2" fill="#D4A990" />
      <ellipse cx="24" cy="53" rx="2.5" ry="3" fill="#D4A990" />
    </svg>
  ),
};

/**
 * Get the appropriate handshape for an ISL letter
 */
function getHandshapeForLetter(letter: string): string {
  // Map Devanagari letters to handshapes
  const vowelMap: Record<string, string> = {
    "अ": "fist", // thumb extended
    "आ": "l_shape",
    "इ": "index_up",
    "ई": "v_shape",
    "उ": "two_together",
    "ऊ": "y_shape",
    "ए": "three_fingers",
    "ऐ": "open_palm", // 4 fingers
    "ओ": "flat_hand",
    "औ": "open_palm",
  };

  // Common consonant mappings
  const consonantMap: Record<string, string> = {
    "क": "three_fingers",
    "ख": "v_shape", // pinch
    "ग": "index_up",
    "घ": "v_shape",
    "च": "index_up", // pinky variant
    "छ": "index_up", // middle variant
    "ज": "w_shape",
    "ट": "index_up", // thumb up
    "ड": "l_shape",
    "ढ": "flat_hand",
    "त": "two_together",
    "द": "y_shape",
    "न": "fist",
    "प": "flat_hand",
    "फ": "open_palm",
    "ब": "flat_hand",
    "म": "fist", // thumb side
    "य": "y_shape",
    "र": "index_up",
    "ल": "three_fingers",
    "व": "index_up", // thumb up
    "श": "v_shape",
    "स": "fist",
    "ह": "three_fingers",
  };

  return vowelMap[letter] || consonantMap[letter] || "open_palm";
}

/**
 * ISL Hand Illustration Component
 * Shows an SVG hand diagram for an ISL letter.
 */
export function ISLIllustration({ letter, size = 100, className = "" }: ISLIllustrationProps) {
  const handshape = getHandshapeForLetter(letter);
  const HandComponent = Handshapes[handshape] || Handshapes.open_palm;

  return (
    <div className={`inline-flex flex-col items-center gap-1 ${className}`}>
      <div className="rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200 dark:border-orange-800 p-2">
        <HandComponent size={size} />
      </div>
      <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{letter}</span>
    </div>
  );
}

/**
 * ISL Word Illustration Component
 * Shows the appropriate hand gesture for an ISL word.
 */
export function ISLWordIllustration({
  word,
  size = 120,
  className = "",
}: {
  word: string;
  size?: number;
  className?: string;
}) {
  // Map words to handshapes
  const wordHandshapes: Record<string, string> = {
    Namaste: "namaste",
    "Thank You": "flat_hand",
    Please: "flat_hand",
    Sorry: "fist",
    Yes: "fist",
    No: "fist",
    Help: "fist",
    Mother: "index_up",
    Father: "index_up",
    Brother: "l_shape",
    Sister: "l_shape",
    Family: "open_palm",
    Friend: "v_shape",
    Rice: "flat_hand",
    Water: "w_shape",
    Eat: "flat_hand",
    Drink: "open_palm",
    Milk: "fist",
    Happy: "open_palm",
    Sad: "open_palm",
    Love: "fist",
    Angry: "open_palm",
    Come: "open_palm",
    Go: "open_palm",
    Stop: "flat_hand",
    School: "open_palm",
    Home: "l_shape",
    Hospital: "v_shape",
  };

  const handshape = wordHandshapes[word] || "open_palm";
  const HandComponent = Handshapes[handshape] || Handshapes.open_palm;

  return (
    <div className={`inline-flex flex-col items-center gap-1 ${className}`}>
      <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-2 border-orange-200 dark:border-orange-800 p-3 shadow-lg">
        <HandComponent size={size} />
      </div>
    </div>
  );
}

/**
 * Letter Grid Item - shows a single ISL letter in a grid
 */
export function ISLGridItem({
  letter,
  devanagari,
  isLearned,
  onClick,
}: {
  letter: string;
  devanagari?: string;
  isLearned: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative p-3 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 ${
        isLearned
          ? "bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700 shadow-md"
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700"
      }`}
    >
      {isLearned && (
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs">
          ✓
        </span>
      )}
      <ISLIllustration letter={letter} size={40} />
      {devanagari && (
        <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">{devanagari}</span>
      )}
    </button>
  );
}
