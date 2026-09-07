/**
 * Motion Tracking System
 * Records hand landmark positions over a sliding time window
 * and computes velocity, trajectory shape, and motion patterns.
 *
 * This allows distinguishing dynamic signs (wave, snap, circle)
 * from static poses (fist, open palm, L-shape).
 */

import { Landmark } from "./gesture-detection";

// ===== Types =====

export interface MotionFrame {
  timestamp: number;
  palmCenter: { x: number; y: number };
  landmarks: Landmark[];
}

export interface MotionAnalysis {
  /** Detected motion type */
  motionType: MotionType;
  /** Confidence in the motion detection (0-1) */
  confidence: number;
  /** Horizontal velocity (pixels/sec, positive = right) */
  horizontalVelocity: number;
  /** Vertical velocity (pixels/sec, positive = down) */
  verticalVelocity: number;
  /** Speed magnitude (pixels/sec) */
  speed: number;
  /** Direction of movement */
  direction: "left" | "right" | "up" | "down" | "stationary" | "circular";
  /** Is the hand moving? */
  isMoving: boolean;
  /** Number of direction changes (oscillations) */
  oscillationCount: number;
  /** Trajectory points for visualization */
  trajectory: { x: number; y: number }[];
  /** Motion duration in ms */
  duration: number;
}

export type MotionType =
  | "stationary"     // No significant movement
  | "wave"           // Horizontal oscillation (Hello)
  | "snap"           // Quick downward motion (No)
  | "circle"         // Circular path (Sorry, Please)
  | "forward"        // Forward/backward (Thank You, Good)
  | "sideways"       // Single lateral sweep (Help, School)
  | "upward"         // Rising motion (Learn, Help)
  | "downward"       // Falling motion (Bad)
  | "tap"            // Quick repetitive motion (Water, Time)
  | "trace";         // Complex path (J, Z)

// ===== Constants =====

const RECORDING_WINDOW_MS = 2000;     // 2 seconds of data
const MIN_FRAMES_FOR_MOTION = 8;      // Need at least 8 frames
const VELOCITY_THRESHOLD = 0.15;       // Min velocity to count as "moving" (normalized coords/sec)
const OSCILLATION_THRESHOLD = 0.08;    // Min displacement to count as direction change
const CIRCULARITY_THRESHOLD = 0.6;     // How circular the path must be (0-1)
const SNAP_VELOCITY_THRESHOLD = 0.5;   // High velocity for snap detection
const TAP_INTERVAL_MS = 600;           // Max ms between taps

// ===== Motion Tracker Class =====

export class MotionTracker {
  private frames: MotionFrame[] = [];
  private lastAnalysis: MotionAnalysis | null = null;

  /**
   * Add a new frame of hand landmark data.
   * Call this every frame from MediaPipe results.
   */
  addFrame(landmarks: Landmark[]): void {
    if (!landmarks || landmarks.length < 21) return;

    const now = performance.now();
    const palmCenter = computePalmCenter(landmarks);

    this.frames.push({
      timestamp: now,
      palmCenter,
      landmarks: [...landmarks],
    });

    // Remove old frames outside the window
    const cutoff = now - RECORDING_WINDOW_MS;
    while (this.frames.length > 0 && this.frames[0].timestamp < cutoff) {
      this.frames.shift();
    }

    // Analyze motion
    this.lastAnalysis = this.analyzeMotion();
  }

  /**
   * Get the latest motion analysis.
   */
  getAnalysis(): MotionAnalysis {
    return this.lastAnalysis || getDefaultAnalysis();
  }

  /**
   * Check if a specific motion pattern is detected.
   */
  isMotionDetected(type: MotionType, minConfidence: number = 0.5): boolean {
    const analysis = this.getAnalysis();
    return analysis.motionType === type && analysis.confidence >= minConfidence;
  }

  /**
   * Reset the tracker (call when camera restarts or user switches letters).
   */
  reset(): void {
    this.frames = [];
    this.lastAnalysis = null;
  }

  /**
   * Get frame count in current window.
   */
  getFrameCount(): number {
    return this.frames.length;
  }

  // ===== Private Analysis Methods =====

  private analyzeMotion(): MotionAnalysis {
    if (this.frames.length < MIN_FRAMES_FOR_MOTION) {
      return getDefaultAnalysis();
    }

    const trajectory = this.frames.map((f) => ({
      x: f.palmCenter.x,
      y: f.palmCenter.y,
    }));

    // Compute velocities between consecutive frames
    const velocities = computeVelocities(this.frames);

    // Average velocity
    const avgVelocity = {
      x: velocities.reduce((s, v) => s + v.vx, 0) / velocities.length,
      y: velocities.reduce((s, v) => s + v.vy, 0) / velocities.length,
    };

    const speed = Math.sqrt(avgVelocity.x ** 2 + avgVelocity.y ** 2);
    const isMoving = speed > VELOCITY_THRESHOLD;

    // Direction
    const direction = getPrimaryDirection(avgVelocity);

    // Oscillation count (direction changes)
    const oscillationCount = countOscillations(velocities);

    // Circularity
    const circularity = computeCircularity(trajectory);

    // Duration
    const duration =
      this.frames[this.frames.length - 1].timestamp - this.frames[0].timestamp;

    // Classify motion type
    const { motionType, confidence } = classifyMotion({
      speed,
      direction,
      oscillationCount,
      circularity,
      duration,
      velocities,
      trajectory,
    });

    return {
      motionType,
      confidence,
      horizontalVelocity: avgVelocity.x,
      verticalVelocity: avgVelocity.y,
      speed,
      direction: isMoving ? direction : "stationary",
      isMoving,
      oscillationCount,
      trajectory,
      duration,
    };
  }
}

// ===== Helper Functions =====

function computePalmCenter(landmarks: Landmark[]): { x: number; y: number } {
  // Average of wrist (0), middle MCP (9), and ring MCP (13)
  return {
    x: (landmarks[0].x + landmarks[9].x + landmarks[13].x) / 3,
    y: (landmarks[0].y + landmarks[9].y + landmarks[13].y) / 3,
  };
}

function computeVelocities(
  frames: MotionFrame[]
): { vx: number; vy: number; dt: number }[] {
  const velocities: { vx: number; vy: number; dt: number }[] = [];

  for (let i = 1; i < frames.length; i++) {
    const dt = (frames[i].timestamp - frames[i - 1].timestamp) / 1000; // seconds
    if (dt <= 0) continue;

    const vx = (frames[i].palmCenter.x - frames[i - 1].palmCenter.x) / dt;
    const vy = (frames[i].palmCenter.y - frames[i - 1].palmCenter.y) / dt;

    velocities.push({ vx, vy, dt });
  }

  return velocities;
}

function getPrimaryDirection(
  avg: { x: number; y: number }
): "left" | "right" | "up" | "down" | "stationary" | "circular" {
  const speed = Math.sqrt(avg.x ** 2 + avg.y ** 2);
  if (speed < VELOCITY_THRESHOLD) return "stationary";

  if (Math.abs(avg.x) > Math.abs(avg.y) * 1.5) {
    return avg.x > 0 ? "right" : "left";
  }
  if (Math.abs(avg.y) > Math.abs(avg.x) * 1.5) {
    return avg.y > 0 ? "down" : "up";
  }
  return "stationary";
}

function countOscillations(
  velocities: { vx: number; vy: number }[]
): number {
  if (velocities.length < 3) return 0;

  let count = 0;
  let lastSign = Math.sign(velocities[0].vx);

  for (let i = 1; i < velocities.length; i++) {
    const currentSign = Math.sign(velocities[i].vx);
    const magnitude = Math.abs(velocities[i].vx);

    if (currentSign !== lastSign && magnitude > OSCILLATION_THRESHOLD) {
      count++;
      lastSign = currentSign;
    }
  }

  return Math.floor(count / 2); // Each full oscillation is 2 direction changes
}

function computeCircularity(
  trajectory: { x: number; y: number }[]
): number {
  if (trajectory.length < 5) return 0;

  // Compute centroid
  const cx = trajectory.reduce((s, p) => s + p.x, 0) / trajectory.length;
  const cy = trajectory.reduce((s, p) => s + p.y, 0) / trajectory.length;

  // Compute distances from centroid
  const distances = trajectory.map((p) =>
    Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2)
  );

  // Compute angular progression
  const angles = trajectory.map((p) => Math.atan2(p.y - cy, p.x - cx));

  // Check if angles progress consistently (circular)
  let angleProgress = 0;
  let totalAngleChange = 0;

  for (let i = 1; i < angles.length; i++) {
    let diff = angles[i] - angles[i - 1];
    // Normalize to [-PI, PI]
    if (diff > Math.PI) diff -= 2 * Math.PI;
    if (diff < -Math.PI) diff += 2 * Math.PI;
    totalAngleChange += Math.abs(diff);
  }

  // Check if start and end are close (closed loop)
  const startEndDist = Math.sqrt(
    (trajectory[0].x - trajectory[trajectory.length - 1].x) ** 2 +
    (trajectory[0].y - trajectory[trajectory.length - 1].y) ** 2
  );

  // Compute radius consistency
  const avgDist = distances.reduce((s, d) => s + d, 0) / distances.length;
  const distVariance =
    distances.reduce((s, d) => s + (d - avgDist) ** 2, 0) / distances.length;
  const radiusConsistency = avgDist > 0 ? 1 - Math.min(1, distVariance / (avgDist ** 2)) : 0;

  // Circularity = consistent radius + angular progression + closed loop
  const loopCloseness = avgDist > 0 ? 1 - Math.min(1, startEndDist / (avgDist * 2)) : 0;
  const angleScore = Math.min(1, totalAngleChange / (2 * Math.PI));

  return (radiusConsistency * 0.4 + loopCloseness * 0.3 + angleScore * 0.3);
}

interface MotionParams {
  speed: number;
  direction: string;
  oscillationCount: number;
  circularity: number;
  duration: number;
  velocities: { vx: number; vy: number; dt: number }[];
  trajectory: { x: number; y: number }[];
}

function classifyMotion(params: MotionParams): {
  motionType: MotionType;
  confidence: number;
} {
  const {
    speed,
    oscillationCount,
    circularity,
    duration,
    velocities,
    trajectory,
  } = params;

  // Stationary — no significant movement
  if (speed < VELOCITY_THRESHOLD * 0.5) {
    return { motionType: "stationary", confidence: 0.9 };
  }

  // Snap — very fast downward motion
  if (speed > SNAP_VELOCITY_THRESHOLD) {
    const avgVy =
      velocities.reduce((s, v) => s + v.vy, 0) / velocities.length;
    if (avgVy > 0) {
      return { motionType: "snap", confidence: Math.min(1, speed / SNAP_VELOCITY_THRESHOLD) };
    }
  }

  // Wave — horizontal oscillation (2+ direction changes)
  if (oscillationCount >= 2 && speed > VELOCITY_THRESHOLD) {
    return {
      motionType: "wave",
      confidence: Math.min(1, 0.5 + oscillationCount * 0.15),
    };
  }

  // Circle — high circularity score
  if (circularity > CIRCULARITY_THRESHOLD && speed > VELOCITY_THRESHOLD * 0.8) {
    return {
      motionType: "circle",
      confidence: Math.min(1, circularity),
    };
  }

  // Tap — short repeated small motions
  if (detectTapPattern(velocities)) {
    return { motionType: "tap", confidence: 0.7 };
  }

  // Trace — complex path with multiple direction changes
  if (trajectory.length > 10 && oscillationCount >= 3) {
    return {
      motionType: "trace",
      confidence: Math.min(1, 0.4 + oscillationCount * 0.1),
    };
  }

  // Forward — dominant vertical motion toward camera (y decreasing = forward in normalized coords)
  if (speed > VELOCITY_THRESHOLD) {
    const avgVy =
      velocities.reduce((s, v) => s + v.vy, 0) / velocities.length;
    if (Math.abs(avgVy) > speed * 0.7) {
      return {
        motionType: avgVy < 0 ? "forward" : "downward",
        confidence: Math.min(1, speed / (VELOCITY_THRESHOLD * 3)),
      };
    }
    // Sideways — dominant horizontal motion
    const avgVx =
      velocities.reduce((s, v) => s + v.vx, 0) / velocities.length;
    if (Math.abs(avgVx) > speed * 0.7) {
      return {
        motionType: "sideways",
        confidence: Math.min(1, speed / (VELOCITY_THRESHOLD * 3)),
      };
    }
  }

  return { motionType: "stationary", confidence: 0.3 };
}

function detectTapPattern(
  velocities: { vx: number; vy: number; dt: number }[]
): boolean {
  if (velocities.length < 4) return false;

  // Look for repeated small bursts of motion
  let burstCount = 0;
  let lastBurstTime = 0;

  for (let i = 0; i < velocities.length; i++) {
    const speed = Math.sqrt(velocities[i].vx ** 2 + velocities[i].vy ** 2);
    if (speed > VELOCITY_THRESHOLD * 1.5) {
      // This is a burst
      const timeSinceLastBurst = i > 0 ? velocities[i].dt * 1000 : TAP_INTERVAL_MS + 1;
      if (timeSinceLastBurst > 100 && timeSinceLastBurst < TAP_INTERVAL_MS) {
        burstCount++;
      }
      lastBurstTime = i;
    }
  }

  return burstCount >= 2;
}

function getDefaultAnalysis(): MotionAnalysis {
  return {
    motionType: "stationary",
    confidence: 0,
    horizontalVelocity: 0,
    verticalVelocity: 0,
    speed: 0,
    direction: "stationary",
    isMoving: false,
    oscillationCount: 0,
    trajectory: [],
    duration: 0,
  };
}

// ===== Motion Signatures for Known Signs =====

export interface MotionSignature {
  /** Name of the sign */
  sign: string;
  /** Expected motion type */
  expectedMotion: MotionType;
  /** Minimum confidence for this motion */
  minConfidence: number;
  /** Human-readable description */
  description: string;
}

/**
 * Maps sign words to their expected motion patterns.
 * Used alongside static handshape detection for full validation.
 */
export const MOTION_SIGNATURES: Record<string, MotionSignature> = {
  Hello: {
    sign: "Hello",
    expectedMotion: "wave",
    minConfidence: 0.5,
    description: "Wave hand side to side",
  },
  No: {
    sign: "No",
    expectedMotion: "snap",
    minConfidence: 0.5,
    description: "Quick snap downward",
  },
  Sorry: {
    sign: "Sorry",
    expectedMotion: "circle",
    minConfidence: 0.5,
    description: "Circular motion on chest",
  },
  Please: {
    sign: "Please",
    expectedMotion: "circle",
    minConfidence: 0.4,
    description: "Circular rubbing motion",
  },
  "Thank You": {
    sign: "Thank You",
    expectedMotion: "forward",
    minConfidence: 0.4,
    description: "Hand moves forward from chin",
  },
  Good: {
    sign: "Good",
    expectedMotion: "forward",
    minConfidence: 0.4,
    description: "Hand moves forward from chin",
  },
  Bad: {
    sign: "Bad",
    expectedMotion: "downward",
    minConfidence: 0.4,
    description: "Palm flips downward",
  },
  Water: {
    sign: "Water",
    expectedMotion: "tap",
    minConfidence: 0.4,
    description: "Tap chin repeatedly",
  },
  Time: {
    sign: "Time",
    expectedMotion: "tap",
    minConfidence: 0.4,
    description: "Tap wrist repeatedly",
  },
  Eat: {
    sign: "Eat",
    expectedMotion: "tap",
    minConfidence: 0.4,
    description: "Tap mouth repeatedly",
  },
  School: {
    sign: "School",
    expectedMotion: "sideways",
    minConfidence: 0.4,
    description: "Clap then sweep apart",
  },
  Play: {
    sign: "Play",
    expectedMotion: "wave",
    minConfidence: 0.4,
    description: "Y-hands twist back and forth",
  },
  Love: {
    sign: "Love",
    expectedMotion: "stationary",
    minConfidence: 0.3,
    description: "Cross fists over chest (hold)",
  },
  Help: {
    sign: "Help",
    expectedMotion: "upward",
    minConfidence: 0.4,
    description: "Fist lifts upward on palm",
  },
  Learn: {
    sign: "Learn",
    expectedMotion: "upward",
    minConfidence: 0.4,
    description: "Hand moves from palm to forehead",
  },
  Family: {
    sign: "Family",
    expectedMotion: "circle",
    minConfidence: 0.4,
    description: "F-hands circle outward",
  },
  Yes: {
    sign: "Yes",
    expectedMotion: "tap",
    minConfidence: 0.5,
    description: "Fist nods up and down",
  },
  Friend: {
    sign: "Friend",
    expectedMotion: "stationary",
    minConfidence: 0.3,
    description: "Index fingers hook together",
  },
  Drink: {
    sign: "Drink",
    expectedMotion: "forward",
    minConfidence: 0.4,
    description: "C-hand brings to mouth",
  },
  Want: {
    sign: "Want",
    expectedMotion: "forward",
    minConfidence: 0.4,
    description: "Claw hands pull toward you",
  },
};

/**
 * Get the motion signature for a word.
 */
export function getMotionSignature(word: string): MotionSignature | null {
  return MOTION_SIGNATURES[word] || null;
}

/**
 * Combined validation: checks BOTH static handshape AND motion pattern.
 * Returns a combined score and feedback.
 */
export function validateWithMotion(
  staticScore: number,
  staticFeedback: string[],
  motionAnalysis: MotionAnalysis,
  word: string
): {
  score: number;
  isCorrect: boolean;
  feedback: string[];
  motionScore: number;
  motionType: MotionType;
} {
  const signature = getMotionSignature(word);

  // If no motion signature, rely purely on static
  if (!signature) {
    return {
      score: staticScore,
      isCorrect: staticScore >= 65,
      feedback: staticFeedback,
      motionScore: 0,
      motionType: motionAnalysis.motionType,
    };
  }

  // Check if detected motion matches expected
  const motionMatch =
    motionAnalysis.motionType === signature.expectedMotion ||
    (signature.expectedMotion === "stationary" && !motionAnalysis.isMoving);

  const motionScore = motionMatch
    ? Math.round(motionAnalysis.confidence * 100)
    : Math.round(motionAnalysis.confidence * 40); // Partial credit

  // Combine scores (60% static, 40% motion)
  const combinedScore = Math.round(staticScore * 0.6 + motionScore * 0.4);

  const feedback = [...staticFeedback];

  // Add motion feedback
  if (motionMatch) {
    feedback.push(`Motion detected: ${signature.description} ✓`);
  } else if (motionAnalysis.isMoving) {
    feedback.push(
      `Expected "${signature.description}" but detected ${motionAnalysis.motionType} motion`
    );
  } else {
    feedback.push(
      `No movement detected. Try: ${signature.description}`
    );
  }

  const isCorrect = combinedScore >= 60;

  return {
    score: combinedScore,
    isCorrect,
    feedback,
    motionScore,
    motionType: motionAnalysis.motionType,
  };
}
