import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  MotionTracker,
  MOTION_SIGNATURES,
  getMotionSignature,
  validateWithMotion,
  MotionType,
} from "@/lib/motion-tracking";
import { Landmark } from "@/lib/gesture-detection";

// Helper to create 21 landmarks at a specific position
function landmarksAt(x: number, y: number): Landmark[] {
  return Array.from({ length: 21 }, (_, i) => ({
    x: x + (i % 5) * 0.01,
    y: y + Math.floor(i / 5) * 0.01,
    z: 0,
  }));
}

describe("MotionTracker", () => {
  let tracker: MotionTracker;

  beforeEach(() => {
    tracker = new MotionTracker();
    vi.stubGlobal("performance", {
      now: vi.fn(() => 0),
    });
  });

  it("starts with no analysis", () => {
    const analysis = tracker.getAnalysis();
    expect(analysis.motionType).toBe("stationary");
    expect(analysis.confidence).toBe(0);
    expect(analysis.isMoving).toBe(false);
  });

  it("starts with zero frames", () => {
    expect(tracker.getFrameCount()).toBe(0);
  });

  it("accepts frames and increments count", () => {
    (performance.now as any).mockReturnValue(100);
    tracker.addFrame(landmarksAt(0.5, 0.5));
    expect(tracker.getFrameCount()).toBe(1);

    (performance.now as any).mockReturnValue(200);
    tracker.addFrame(landmarksAt(0.5, 0.5));
    expect(tracker.getFrameCount()).toBe(2);
  });

  it("ignores frames with fewer than 21 landmarks", () => {
    tracker.addFrame(Array.from({ length: 10 }, () => ({ x: 0.5, y: 0.5, z: 0 })));
    expect(tracker.getFrameCount()).toBe(0);
  });

  it("ignores empty frames", () => {
    tracker.addFrame([]);
    expect(tracker.getFrameCount()).toBe(0);
  });

  it("resets frame count to zero", () => {
    (performance.now as any).mockReturnValue(100);
    tracker.addFrame(landmarksAt(0.5, 0.5));
    (performance.now as any).mockReturnValue(200);
    tracker.addFrame(landmarksAt(0.5, 0.5));
    expect(tracker.getFrameCount()).toBe(2);

    tracker.reset();
    expect(tracker.getFrameCount()).toBe(0);
  });

  it("removes old frames outside the 2s window", () => {
    // Add frames within window
    (performance.now as any).mockReturnValue(0);
    tracker.addFrame(landmarksAt(0.5, 0.5));
    (performance.now as any).mockReturnValue(500);
    tracker.addFrame(landmarksAt(0.5, 0.5));
    expect(tracker.getFrameCount()).toBe(2);

    // Jump past window
    (performance.now as any).mockReturnValue(3000);
    tracker.addFrame(landmarksAt(0.5, 0.5));
    // Old frames should be removed
    expect(tracker.getFrameCount()).toBe(1);
  });

  it("isMotionDetected returns false when no motion", () => {
    expect(tracker.isMotionDetected("wave")).toBe(false);
  });

  it("classifies stationary motion with no movement", () => {
    for (let i = 0; i < 10; i++) {
      (performance.now as any).mockReturnValue(i * 100);
      tracker.addFrame(landmarksAt(0.5, 0.5));
    }
    const analysis = tracker.getAnalysis();
    expect(analysis.motionType).toBe("stationary");
  });
});

describe("MOTION_SIGNATURES", () => {
  it("has signatures for 20+ ASL words", () => {
    const aslSigns = Object.keys(MOTION_SIGNATURES).filter(
      (k) => !["Namaste", "Good Morning", "Good Night", "How are you", "Mother", "Father",
        "Brother", "Sister", "Rice", "Milk", "Happy", "Sad", "Angry", "Come", "Go",
        "Stop", "Name", "Hospital", "Home", "Don't Know", "धन्यवाद"].includes(k)
    );
    expect(aslSigns.length).toBeGreaterThanOrEqual(15);
  });

  it("has signatures for ISL words", () => {
    expect(MOTION_SIGNATURES["Namaste"]).toBeDefined();
    expect(MOTION_SIGNATURES["Mother"]).toBeDefined();
    expect(MOTION_SIGNATURES["Father"]).toBeDefined();
    expect(MOTION_SIGNATURES["Happy"]).toBeDefined();
    expect(MOTION_SIGNATURES["Sad"]).toBeDefined();
    expect(MOTION_SIGNATURES["Hospital"]).toBeDefined();
  });

  it("each signature has required fields", () => {
    for (const [, sig] of Object.entries(MOTION_SIGNATURES)) {
      expect(sig.sign.length).toBeGreaterThan(0);
      expect(typeof sig.minConfidence).toBe("number");
      expect(sig.description.length).toBeGreaterThan(0);
    }
  });

  it("Hello expects wave motion", () => {
    expect(MOTION_SIGNATURES["Hello"].expectedMotion).toBe("wave");
  });

  it("Sorry expects circle motion", () => {
    expect(MOTION_SIGNATURES["Sorry"].expectedMotion).toBe("circle");
  });

  it("No expects snap motion", () => {
    expect(MOTION_SIGNATURES["No"].expectedMotion).toBe("snap");
  });

  it("Love expects stationary", () => {
    expect(MOTION_SIGNATURES["Love"].expectedMotion).toBe("stationary");
  });

  it("Mother expects tap motion", () => {
    expect(MOTION_SIGNATURES["Mother"].expectedMotion).toBe("tap");
  });

  it("Happy expects upward motion", () => {
    expect(MOTION_SIGNATURES["Happy"].expectedMotion).toBe("upward");
  });

  it("Sad expects downward motion", () => {
    expect(MOTION_SIGNATURES["Sad"].expectedMotion).toBe("downward");
  });
});

describe("getMotionSignature", () => {
  it("returns signature for known word", () => {
    const sig = getMotionSignature("Hello");
    expect(sig).not.toBeNull();
    expect(sig!.expectedMotion).toBe("wave");
  });

  it("returns null for unknown word", () => {
    const sig = getMotionSignature("Nonexistent");
    expect(sig).toBeNull();
  });
});

describe("validateWithMotion", () => {
  it("returns static score when no motion signature exists", () => {
    const result = validateWithMotion(
      80,
      ["Good handshape"],
      {
        motionType: "stationary",
        confidence: 0.9,
        horizontalVelocity: 0,
        verticalVelocity: 0,
        speed: 0,
        direction: "stationary",
        isMoving: false,
        oscillationCount: 0,
        trajectory: [],
        duration: 0,
      },
      "NonexistentWord"
    );
    expect(result.score).toBe(80);
    expect(result.feedback).toContain("Good handshape");
  });

  it("combines static + motion when motion matches", () => {
    const result = validateWithMotion(
      80,
      ["Good handshape"],
      {
        motionType: "wave",
        confidence: 0.8,
        horizontalVelocity: 0.3,
        verticalVelocity: 0,
        speed: 0.3,
        direction: "left",
        isMoving: true,
        oscillationCount: 3,
        trajectory: [],
        duration: 2000,
      },
      "Hello"
    );
    expect(result.score).toBeGreaterThan(60);
    expect(result.motionType).toBe("wave");
    // Should have motion feedback
    expect(result.feedback.some((f) => f.includes("Motion detected"))).toBe(true);
  });

  it("gives partial credit when motion doesn't match", () => {
    const result = validateWithMotion(
      70,
      ["Some feedback"],
      {
        motionType: "stationary",
        confidence: 0.5,
        horizontalVelocity: 0,
        verticalVelocity: 0,
        speed: 0,
        direction: "stationary",
        isMoving: false,
        oscillationCount: 0,
        trajectory: [],
        duration: 0,
      },
      "Hello"
    );
    expect(result.score).toBeLessThan(80);
    // Should suggest the correct motion
    expect(result.feedback.some((f) => f.includes("Try"))).toBe(true);
  });

  it("reports no movement when stationary and wave expected", () => {
    const result = validateWithMotion(
      60,
      [],
      {
        motionType: "stationary",
        confidence: 0.9,
        horizontalVelocity: 0,
        verticalVelocity: 0,
        speed: 0,
        direction: "stationary",
        isMoving: false,
        oscillationCount: 0,
        trajectory: [],
        duration: 0,
      },
      "Hello"
    );
    expect(result.feedback.some((f) => f.includes("No movement"))).toBe(true);
  });

  it("returns score between 0 and 100", () => {
    const result = validateWithMotion(
      50,
      [],
      {
        motionType: "circle",
        confidence: 0.6,
        horizontalVelocity: 0.1,
        verticalVelocity: 0.1,
        speed: 0.14,
        direction: "stationary",
        isMoving: true,
        oscillationCount: 0,
        trajectory: [],
        duration: 1500,
      },
      "Sorry"
    );
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
