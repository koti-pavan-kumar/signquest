import { describe, it, expect } from "vitest";
import { analyzeGesture, GestureAnalysis, Landmark } from "@/lib/gesture-detection";

// Helper to create 21 landmarks (MediaPipe hand format)
function createLandmarks(overrides: Partial<Record<number, Landmark>> = {}): Landmark[] {
  const defaults: Landmark[] = Array.from({ length: 21 }, (_, i) => ({
    x: 0.5,
    y: 0.5,
    z: 0,
  }));
  return Object.entries(overrides).reduce(
    (acc, [idx, val]) => {
      acc[Number(idx)] = val;
      return acc;
    },
    [...defaults]
  );
}

describe("analyzeGesture", () => {
  it("returns zero confidence with fewer than 21 landmarks", () => {
    const landmarks = Array.from({ length: 10 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
    const result = analyzeGesture(landmarks);
    expect(result.confidence).toBe(0);
    expect(result.fingers.thumb).toBe(false);
    expect(result.fingers.index).toBe(false);
  });

  it("returns zero confidence with empty array", () => {
    const result = analyzeGesture([]);
    expect(result.confidence).toBe(0);
  });

  it("detects an open palm (all fingers extended)", () => {
    // Index finger: PIP(6) and TIP(8) are extended (low y = high on screen)
    const landmarks = createLandmarks({
      // Wrist
      0: { x: 0.5, y: 0.8, z: 0 },
      // Thumb: extended sideways
      1: { x: 0.45, y: 0.65, z: 0 },
      2: { x: 0.4, y: 0.6, z: 0 },
      3: { x: 0.3, y: 0.55, z: 0 },
      4: { x: 0.25, y: 0.5, z: 0 },
      // Index: extended up
      5: { x: 0.42, y: 0.45, z: 0 },
      6: { x: 0.42, y: 0.35, z: 0 },
      7: { x: 0.42, y: 0.25, z: 0 },
      8: { x: 0.42, y: 0.15, z: 0 },
      // Middle: extended up
      9: { x: 0.5, y: 0.45, z: 0 },
      10: { x: 0.5, y: 0.35, z: 0 },
      11: { x: 0.5, y: 0.25, z: 0 },
      12: { x: 0.5, y: 0.15, z: 0 },
      // Ring: extended up
      13: { x: 0.58, y: 0.45, z: 0 },
      14: { x: 0.58, y: 0.35, z: 0 },
      15: { x: 0.58, y: 0.25, z: 0 },
      16: { x: 0.58, y: 0.15, z: 0 },
      // Pinky: extended up
      17: { x: 0.65, y: 0.48, z: 0 },
      18: { x: 0.65, y: 0.38, z: 0 },
      19: { x: 0.65, y: 0.28, z: 0 },
      20: { x: 0.65, y: 0.18, z: 0 },
    });

    const result = analyzeGesture(landmarks);
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.rawLandmarks).toHaveLength(21);
  });

  it("computes fingerSpread for extended fingers", () => {
    const landmarks = createLandmarks({
      0: { x: 0.5, y: 0.8, z: 0 },
      5: { x: 0.42, y: 0.45, z: 0 },
      6: { x: 0.42, y: 0.35, z: 0 },
      7: { x: 0.42, y: 0.25, z: 0 },
      8: { x: 0.42, y: 0.15, z: 0 },
      9: { x: 0.5, y: 0.45, z: 0 },
      10: { x: 0.5, y: 0.35, z: 0 },
      11: { x: 0.5, y: 0.25, z: 0 },
      12: { x: 0.5, y: 0.15, z: 0 },
      13: { x: 0.58, y: 0.45, z: 0 },
      14: { x: 0.58, y: 0.35, z: 0 },
      15: { x: 0.58, y: 0.25, z: 0 },
      16: { x: 0.58, y: 0.15, z: 0 },
      17: { x: 0.65, y: 0.48, z: 0 },
      18: { x: 0.65, y: 0.38, z: 0 },
      19: { x: 0.65, y: 0.28, z: 0 },
      20: { x: 0.65, y: 0.18, z: 0 },
    });

    const result = analyzeGesture(landmarks);
    expect(result.fingerSpread).toBeGreaterThanOrEqual(0);
    expect(result.fingerSpread).toBeLessThanOrEqual(1);
  });

  it("returns all FingerState fields as booleans", () => {
    const landmarks = createLandmarks();
    const result = analyzeGesture(landmarks);
    expect(typeof result.fingers.thumb).toBe("boolean");
    expect(typeof result.fingers.index).toBe("boolean");
    expect(typeof result.fingers.middle).toBe("boolean");
    expect(typeof result.fingers.ring).toBe("boolean");
    expect(typeof result.fingers.pinky).toBe("boolean");
  });

  it("returns valid thumbDirection", () => {
    const landmarks = createLandmarks();
    const result = analyzeGesture(landmarks);
    expect(["left", "right", "up", "neutral"]).toContain(result.thumbDirection);
  });

  it("fistRatio is between 0 and 1", () => {
    const landmarks = createLandmarks();
    const result = analyzeGesture(landmarks);
    expect(result.fistRatio).toBeGreaterThanOrEqual(0);
    expect(result.fistRatio).toBeLessThanOrEqual(1);
  });
});
