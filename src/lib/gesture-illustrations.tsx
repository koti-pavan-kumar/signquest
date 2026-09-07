/**
 * SVG Gesture Illustrations
 * Simple, clear hand gesture diagrams for each ASL letter.
 * These are minimalist line drawings showing hand shape and finger positions.
 */

import React from "react";

interface GestureSVGProps {
  letter: string;
  size?: number;
  className?: string;
}

/**
 * Simple hand gesture SVGs for each ASL letter.
 * Each shows the approximate hand shape with clear finger positions.
 */
export function GestureIllustration({ letter, size = 120, className = "" }: GestureSVGProps) {
  const svgContent = GESTURE_SVGS[letter.toUpperCase()] || GESTURE_SVGS["DEFAULT"];

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {svgContent}
      </svg>
    </div>
  );
}

/**
 * Word gesture illustrations - showing the sign for common words
 */
interface WordGestureProps {
  word: string;
  size?: number;
  className?: string;
}

export function WordGestureIllustration({ word, size = 140, className = "" }: WordGestureProps) {
  const svgContent = WORD_GESTURE_SVGS[word.toUpperCase()] || WORD_GESTURE_SVGS["DEFAULT"];

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 140 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {svgContent}
      </svg>
    </div>
  );
}

// Helper: Draw a simple hand outline
function HandBase({ className = "" }: { className?: string }) {
  return (
    <g className={className}>
      {/* Palm */}
      <rect x="35" y="55" width="50" height="45" rx="8" fill="#F3E8FF" stroke="#8B5CF6" strokeWidth="2" />
    </g>
  );
}

// Helper: Draw a finger
function Finger({
  x1, y1, x2, y2, extended = true, thickness = 8
}: {
  x1: number; y1: number; x2: number; y2: number; extended?: boolean; thickness?: number;
}) {
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={extended ? "#8B5CF6" : "#C4B5FD"}
      strokeWidth={thickness}
      strokeLinecap="round"
      opacity={extended ? 1 : 0.5}
    />
  );
}

const GESTURE_SVGS: Record<string, React.ReactNode> = {
  A: (
    <g>
      <HandBase />
      {/* Fist - all fingers curled */}
      <rect x="38" y="50" width="44" height="35" rx="6" fill="#E9D5FF" stroke="#8B5CF6" strokeWidth="2" />
      {/* Thumb on side */}
      <line x1="35" y1="65" x2="28" y2="55" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <text x="60" y="110" textAnchor="middle" fill="#8B5CF6" fontSize="14" fontWeight="bold">Fist + Thumb on side</text>
    </g>
  ),
  B: (
    <g>
      <HandBase />
      {/* Four fingers up, together */}
      <line x1="45" y1="55" x2="45" y2="20" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <line x1="55" y1="55" x2="55" y2="18" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <line x1="65" y1="55" x2="65" y2="20" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <line x1="75" y1="55" x2="75" y2="22" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      {/* Thumb folded */}
      <line x1="35" y1="70" x2="42" y2="65" stroke="#C4B5FD" strokeWidth="6" strokeLinecap="round" />
      <text x="60" y="110" textAnchor="middle" fill="#8B5CF6" fontSize="14" fontWeight="bold">4 fingers up, thumb folded</text>
    </g>
  ),
  C: (
    <g>
      {/* Curved hand shape */}
      <path d="M 40 70 Q 40 30 80 30 Q 100 30 100 50 Q 100 70 80 75" stroke="#8B5CF6" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M 40 70 Q 35 80 45 90" stroke="#8B5CF6" strokeWidth="6" fill="none" strokeLinecap="round" />
      <text x="60" y="110" textAnchor="middle" fill="#8B5CF6" fontSize="14" fontWeight="bold">Curved C shape</text>
    </g>
  ),
  D: (
    <g>
      <HandBase />
      {/* Index finger up */}
      <line x1="60" y1="55" x2="60" y2="15" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      {/* Other fingers curled to touch thumb */}
      <circle cx="55" cy="70" r="8" fill="#E9D5FF" stroke="#8B5CF6" strokeWidth="2" />
      <text x="60" y="110" textAnchor="middle" fill="#8B5CF6" fontSize="14" fontWeight="bold">Index up, others circle</text>
    </g>
  ),
  E: (
    <g>
      <HandBase />
      {/* All fingers curled tight */}
      <rect x="38" y="48" width="44" height="30" rx="6" fill="#E9D5FF" stroke="#8B5CF6" strokeWidth="2" />
      <text x="60" y="110" textAnchor="middle" fill="#8B5CF6" fontSize="14" fontWeight="bold">Tight claw shape</text>
    </g>
  ),
  F: (
    <g>
      <HandBase />
      {/* OK circle with index + thumb */}
      <circle cx="55" cy="55" r="10" fill="none" stroke="#8B5CF6" strokeWidth="3" />
      {/* Three fingers up */}
      <line x1="65" y1="50" x2="65" y2="20" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <line x1="75" y1="50" x2="75" y2="18" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <line x1="85" y1="50" x2="85" y2="20" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <text x="60" y="110" textAnchor="middle" fill="#8B5CF6" fontSize="14" fontWeight="bold">OK sign + 3 fingers</text>
    </g>
  ),
  G: (
    <g>
      <HandBase />
      {/* Index and thumb pointing sideways */}
      <line x1="85" y1="60" x2="110" y2="60" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <line x1="85" y1="70" x2="110" y2="75" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <text x="60" y="110" textAnchor="middle" fill="#8B5CF6" fontSize="14" fontWeight="bold">Point sideways, pinch</text>
    </g>
  ),
  H: (
    <g>
      <HandBase />
      {/* Index and middle pointing sideways */}
      <line x1="85" y1="58" x2="110" y2="55" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <line x1="85" y1="68" x2="110" y2="68" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <text x="60" y="110" textAnchor="middle" fill="#8B5CF6" fontSize="14" fontWeight="bold">Two fingers sideways</text>
    </g>
  ),
  I: (
    <g>
      <HandBase />
      {/* Only pinky up */}
      <line x1="80" y1="55" x2="80" y2="20" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      {/* Fist for other fingers */}
      <rect x="38" y="50" width="40" height="25" rx="5" fill="#E9D5FF" stroke="#8B5CF6" strokeWidth="2" />
      <text x="60" y="110" textAnchor="middle" fill="#8B5CF6" fontSize="14" fontWeight="bold">Pinky up, fist</text>
    </g>
  ),
  J: (
    <g>
      <HandBase />
      {/* Pinky tracing J */}
      <line x1="80" y1="55" x2="80" y2="20" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <path d="M 80 20 L 80 40 Q 80 50 70 50" stroke="#EC4899" strokeWidth="3" fill="none" strokeDasharray="4 2" />
      <text x="60" y="110" textAnchor="middle" fill="#8B5CF6" fontSize="14" fontWeight="bold">Pinky traces J</text>
    </g>
  ),
  K: (
    <g>
      <HandBase />
      {/* Index up, middle diagonal */}
      <line x1="55" y1="55" x2="55" y2="18" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <line x1="65" y1="55" x2="78" y2="30" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      {/* Thumb between */}
      <circle cx="60" cy="45" r="4" fill="#8B5CF6" />
      <text x="60" y="110" textAnchor="middle" fill="#8B5CF6" fontSize="14" fontWeight="bold">V with thumb between</text>
    </g>
  ),
  L: (
    <g>
      <HandBase />
      {/* Index up, thumb out = L shape */}
      <line x1="60" y1="55" x2="60" y2="15" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <line x1="60" y1="70" x2="30" y2="70" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <text x="60" y="110" textAnchor="middle" fill="#8B5CF6" fontSize="14" fontWeight="bold">L shape (90 degrees)</text>
    </g>
  ),
  M: (
    <g>
      <HandBase />
      {/* Three fingers over thumb */}
      <rect x="38" y="48" width="44" height="28" rx="5" fill="#E9D5FF" stroke="#8B5CF6" strokeWidth="2" />
      <line x1="50" y1="76" x2="50" y2="85" stroke="#8B5CF6" strokeWidth="4" strokeLinecap="round" />
      <text x="60" y="110" textAnchor="middle" fill="#8B5CF6" fontSize="14" fontWeight="bold">3 fingers over thumb</text>
    </g>
  ),
  N: (
    <g>
      <HandBase />
      {/* Two fingers over thumb */}
      <rect x="38" y="48" width="44" height="28" rx="5" fill="#E9D5FF" stroke="#8B5CF6" strokeWidth="2" />
      <line x1="55" y1="76" x2="55" y2="85" stroke="#8B5CF6" strokeWidth="4" strokeLinecap="round" />
      <text x="60" y="110" textAnchor="middle" fill="#8B5CF6" fontSize="14" fontWeight="bold">2 fingers over thumb</text>
    </g>
  ),
  O: (
    <g>
      {/* All fingers touch thumb = O shape */}
      <ellipse cx="60" cy="55" rx="25" ry="22" fill="none" stroke="#8B5CF6" strokeWidth="6" />
      <circle cx="60" cy="55" r="3" fill="#8B5CF6" />
      <text x="60" y="110" textAnchor="middle" fill="#8B5CF6" fontSize="14" fontWeight="bold">Round O shape</text>
    </g>
  ),
  P: (
    <g>
      <HandBase />
      {/* K pointing down */}
      <line x1="55" y1="55" x2="55" y2="95" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <line x1="65" y1="55" x2="78" y2="85" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <text x="60" y="110" textAnchor="middle" fill="#8B5CF6" fontSize="14" fontWeight="bold">K handshape pointing down</text>
    </g>
  ),
  Q: (
    <g>
      <HandBase />
      {/* G pointing down */}
      <line x1="85" y1="60" x2="85" y2="95" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <line x1="85" y1="70" x2="100" y2="95" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <text x="60" y="110" textAnchor="middle" fill="#8B5CF6" fontSize="14" fontWeight="bold">Pinch pointing down</text>
    </g>
  ),
  R: (
    <g>
      <HandBase />
      {/* Crossed fingers */}
      <line x1="58" y1="55" x2="52" y2="18" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <line x1="62" y1="55" x2="68" y2="18" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      {/* Cross point */}
      <circle cx="60" cy="35" r="4" fill="#EC4899" />
      <text x="60" y="110" textAnchor="middle" fill="#8B5CF6" fontSize="14" fontWeight="bold">Fingers crossed</text>
    </g>
  ),
  S: (
    <g>
      <HandBase />
      {/* Tight fist with thumb across front */}
      <rect x="38" y="48" width="44" height="32" rx="6" fill="#E9D5FF" stroke="#8B5CF6" strokeWidth="2" />
      <line x1="40" y1="60" x2="80" y2="60" stroke="#8B5CF6" strokeWidth="4" strokeLinecap="round" />
      <text x="60" y="110" textAnchor="middle" fill="#8B5CF6" fontSize="14" fontWeight="bold">Fist, thumb across front</text>
    </g>
  ),
  T: (
    <g>
      <HandBase />
      {/* Thumb between index and middle */}
      <rect x="38" y="48" width="44" height="28" rx="5" fill="#E9D5FF" stroke="#8B5CF6" strokeWidth="2" />
      <line x1="55" y1="48" x2="55" y2="40" stroke="#8B5CF6" strokeWidth="6" strokeLinecap="round" />
      <text x="60" y="110" textAnchor="middle" fill="#8B5CF6" fontSize="14" fontWeight="bold">Thumb between fingers</text>
    </g>
  ),
  U: (
    <g>
      <HandBase />
      {/* Two fingers up, together */}
      <line x1="55" y1="55" x2="55" y2="18" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <line x1="65" y1="55" x2="65" y2="18" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <text x="60" y="110" textAnchor="middle" fill="#8B5CF6" fontSize="14" fontWeight="bold">Two fingers together</text>
    </g>
  ),
  V: (
    <g>
      <HandBase />
      {/* Peace sign - two fingers spread */}
      <line x1="50" y1="55" x2="42" y2="18" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <line x1="70" y1="55" x2="78" y2="18" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <text x="60" y="110" textAnchor="middle" fill="#8B5CF6" fontSize="14" fontWeight="bold">V / Peace sign</text>
    </g>
  ),
  W: (
    <g>
      <HandBase />
      {/* Three fingers up, spread */}
      <line x1="45" y1="55" x2="38" y2="18" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <line x1="60" y1="55" x2="60" y2="15" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <line x1="75" y1="55" x2="82" y2="18" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <text x="60" y="110" textAnchor="middle" fill="#8B5CF6" fontSize="14" fontWeight="bold">Three fingers spread</text>
    </g>
  ),
  X: (
    <g>
      <HandBase />
      {/* Hooked index finger */}
      <path d="M 60 55 L 60 30 Q 60 22 68 22" stroke="#8B5CF6" strokeWidth="8" fill="none" strokeLinecap="round" />
      <rect x="38" y="50" width="40" height="25" rx="5" fill="#E9D5FF" stroke="#8B5CF6" strokeWidth="2" />
      <text x="60" y="110" textAnchor="middle" fill="#8B5CF6" fontSize="14" fontWeight="bold">Hooked index finger</text>
    </g>
  ),
  Y: (
    <g>
      <HandBase />
      {/* Thumb and pinky out */}
      <line x1="60" y1="70" x2="30" y2="70" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <line x1="80" y1="55" x2="80" y2="20" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <rect x="42" y="50" width="32" height="20" rx="4" fill="#E9D5FF" stroke="#8B5CF6" strokeWidth="2" />
      <text x="60" y="110" textAnchor="middle" fill="#8B5CF6" fontSize="14" fontWeight="bold">Thumb + pinky (shaka)</text>
    </g>
  ),
  Z: (
    <g>
      <HandBase />
      {/* Index tracing Z */}
      <line x1="60" y1="55" x2="60" y2="20" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <path d="M 45 20 L 75 20 L 45 45 L 75 45" stroke="#EC4899" strokeWidth="3" fill="none" strokeDasharray="4 2" />
      <text x="60" y="110" textAnchor="middle" fill="#8B5CF6" fontSize="14" fontWeight="bold">Index traces Z</text>
    </g>
  ),
  DEFAULT: (
    <g>
      <HandBase />
      <line x1="60" y1="55" x2="60" y2="20" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <text x="60" y="110" textAnchor="middle" fill="#8B5CF6" fontSize="14" fontWeight="bold">Hand gesture</text>
    </g>
  ),
};

// ===== WORD GESTURE SVGs =====
const WORD_GESTURE_SVGS: Record<string, React.ReactNode> = {
  HELLO: (
    <g>
      {/* Open palm waving */}
      <line x1="60" y1="70" x2="60" y2="25" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <line x1="45" y1="70" x2="40" y2="30" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <line x1="75" y1="70" x2="80" y2="30" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <line x1="85" y1="70" x2="95" y2="35" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <line x1="35" y1="70" x2="25" y2="40" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <rect x="30" y="70" width="60" height="35" rx="8" fill="#E9D5FF" stroke="#8B5CF6" strokeWidth="2" />
      {/* Wave arrows */}
      <path d="M 100 25 Q 110 30 105 40 Q 100 50 110 55" stroke="#EC4899" strokeWidth="2" fill="none" strokeDasharray="3 2" />
      <text x="70" y="125" textAnchor="middle" fill="#8B5CF6" fontSize="12" fontWeight="bold">Wave hand</text>
    </g>
  ),
  YES: (
    <g>
      {/* Fist nodding */}
      <rect x="40" y="35" width="40" height="35" rx="8" fill="#E9D5FF" stroke="#8B5CF6" strokeWidth="2" />
      <line x1="35" y1="50" x2="28" y2="45" stroke="#8B5CF6" strokeWidth="6" strokeLinecap="round" />
      {/* Nod arrows */}
      <path d="M 90 30 L 90 20 L 85 25 M 90 20 L 95 25" stroke="#22C55E" strokeWidth="2" fill="none" />
      <path d="M 90 55 L 90 65 L 85 60 M 90 65 L 95 60" stroke="#22C55E" strokeWidth="2" fill="none" />
      <text x="70" y="125" textAnchor="middle" fill="#8B5CF6" fontSize="12" fontWeight="bold">Fist nods up/down</text>
    </g>
  ),
  NO: (
    <g>
      {/* Index + middle snapping down */}
      <line x1="55" y1="50" x2="55" y2="25" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <line x1="65" y1="50" x2="65" y2="25" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <circle cx="60" cy="60" r="12" fill="#E9D5FF" stroke="#8B5CF6" strokeWidth="2" />
      <path d="M 55 25 L 55 55 M 65 25 L 65 55" stroke="#EF4444" strokeWidth="2" strokeDasharray="3 2" />
      <text x="70" y="125" textAnchor="middle" fill="#8B5CF6" fontSize="12" fontWeight="bold">Snap fingers down</text>
    </g>
  ),
  PLEASE: (
    <g>
      {/* Flat palm on chest */}
      <ellipse cx="70" cy="55" rx="25" ry="20" fill="#E9D5FF" stroke="#8B5CF6" strokeWidth="2" />
      <path d="M 70 45 Q 55 55 70 65 Q 85 55 70 45" stroke="#EC4899" strokeWidth="2" fill="none" />
      <text x="70" y="125" textAnchor="middle" fill="#8B5CF6" fontSize="12" fontWeight="bold">Palm circles on chest</text>
    </g>
  ),
  THANK: (
    <g>
      {/* Fingertips from chin forward */}
      <ellipse cx="60" cy="40" rx="15" ry="12" fill="#E9D5FF" stroke="#8B5CF6" strokeWidth="2" />
      <path d="M 60 40 L 60 75" stroke="#22C55E" strokeWidth="3" fill="none" strokeDasharray="4 2" />
      <path d="M 55 75 L 60 82 L 65 75" stroke="#22C55E" strokeWidth="2" fill="none" />
      <text x="70" y="125" textAnchor="middle" fill="#8B5CF6" fontSize="12" fontWeight="bold">Chin to forward</text>
    </g>
  ),
  HELP: (
    <g>
      {/* Fist on flat palm, lifting */}
      <rect x="45" y="55" width="50" height="20" rx="5" fill="#E9D5FF" stroke="#8B5CF6" strokeWidth="2" />
      <rect x="55" y="40" width="30" height="20" rx="6" fill="#DDD6FE" stroke="#8B5CF6" strokeWidth="2" />
      <path d="M 70 40 L 70 25" stroke="#22C55E" strokeWidth="3" fill="none" strokeDasharray="3 2" />
      <path d="M 65 25 L 70 18 L 75 25" stroke="#22C55E" strokeWidth="2" fill="none" />
      <text x="70" y="125" textAnchor="middle" fill="#8B5CF6" fontSize="12" fontWeight="bold">Fist lifts on palm</text>
    </g>
  ),
  WATER: (
    <g>
      {/* W handshape tapping chin */}
      <line x1="50" y1="55" x2="45" y2="25" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <line x1="60" y1="55" x2="60" y2="22" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <line x1="70" y1="55" x2="75" y2="25" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <circle cx="60" cy="70" r="15" fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3 2" />
      <text x="70" y="125" textAnchor="middle" fill="#8B5CF6" fontSize="12" fontWeight="bold">W taps chin</text>
    </g>
  ),
  EAT: (
    <g>
      {/* Bunched fingers to mouth */}
      <circle cx="60" cy="35" r="10" fill="#FDE68A" stroke="#F59E0B" strokeWidth="2" />
      <path d="M 60 55 Q 50 45 60 35 Q 70 45 60 55" stroke="#8B5CF6" strokeWidth="3" fill="none" />
      <path d="M 60 55 L 60 70" stroke="#22C55E" strokeWidth="2" strokeDasharray="3 2" />
      <text x="70" y="125" textAnchor="middle" fill="#8B5CF6" fontSize="12" fontWeight="bold">Bunch fingers to mouth</text>
    </g>
  ),
  DRINK: (
    <g>
      {/* C handshape to mouth */}
      <path d="M 45 40 Q 45 25 60 25 Q 75 25 75 40 Q 75 55 60 55" stroke="#8B5CF6" strokeWidth="6" fill="none" strokeLinecap="round" />
      <circle cx="60" cy="40" r="8" fill="#3B82F6" fillOpacity="0.3" stroke="#3B82F6" strokeWidth="2" />
      <text x="70" y="125" textAnchor="middle" fill="#8B5CF6" fontSize="12" fontWeight="bold">C-hand to mouth</text>
    </g>
  ),
  DEFAULT: (
    <g>
      <circle cx="70" cy="55" r="25" fill="#E9D5FF" stroke="#8B5CF6" strokeWidth="2" />
      <text x="70" y="60" textAnchor="middle" fill="#8B5CF6" fontSize="24" fontWeight="bold">🤟</text>
      <text x="70" y="125" textAnchor="middle" fill="#8B5CF6" fontSize="12" fontWeight="bold">Sign this word</text>
    </g>
  ),
};
