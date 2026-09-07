import { describe, it, expect } from "vitest";
import { ASL_PATTERNS, checkLetter } from "@/lib/asl-patterns";

describe("ASL_PATTERNS", () => {
  it("has 17 letters defined", () => {
    expect(Object.keys(ASL_PATTERNS)).toHaveLength(17);
  });

  it("each pattern has required finger states", () => {
    for (const [letter, pattern] of Object.entries(ASL_PATTERNS)) {
      expect(pattern.letter).toBe(letter);
      expect(typeof pattern.required.thumb).toBe("boolean");
      expect(typeof pattern.required.index).toBe("boolean");
      expect(typeof pattern.required.middle).toBe("boolean");
      expect(typeof pattern.required.ring).toBe("boolean");
      expect(typeof pattern.required.pinky).toBe("boolean");
    }
  });

  it("each pattern has checks array", () => {
    for (const [, pattern] of Object.entries(ASL_PATTERNS)) {
      expect(Array.isArray(pattern.checks)).toBe(true);
      expect(pattern.checks!.length).toBeGreaterThan(0);
    }
  });

  it("letter A requires all fingers curled (fist)", () => {
    const pattern = ASL_PATTERNS["A"];
    expect(pattern.required.thumb).toBe(false);
    expect(pattern.required.index).toBe(false);
    expect(pattern.required.middle).toBe(false);
    expect(pattern.required.ring).toBe(false);
    expect(pattern.required.pinky).toBe(false);
    expect(pattern.minFistRatio).toBe(0.75);
  });

  it("letter B requires 4 fingers extended, thumb folded", () => {
    const pattern = ASL_PATTERNS["B"];
    expect(pattern.required.thumb).toBe(false);
    expect(pattern.required.index).toBe(true);
    expect(pattern.required.middle).toBe(true);
    expect(pattern.required.ring).toBe(true);
    expect(pattern.required.pinky).toBe(true);
  });

  it("letter L requires thumb + index extended", () => {
    const pattern = ASL_PATTERNS["L"];
    expect(pattern.required.thumb).toBe(true);
    expect(pattern.required.index).toBe(true);
    expect(pattern.required.middle).toBe(false);
  });
});

describe("checkLetter", () => {
  it("returns score 0 for unknown letter", () => {
    const result = checkLetter(
      {
        fingers: { thumb: false, index: false, middle: false, ring: false, pinky: false },
        thumbDirection: "neutral",
        fingerSpread: 0,
        fistRatio: 1,
      },
      "Z"
    );
    expect(result.score).toBe(0);
    expect(result.isCorrect).toBe(false);
  });

  it("detects correct A (all fingers curled, tight fist)", () => {
    const result = checkLetter(
      {
        fingers: { thumb: false, index: false, middle: false, ring: false, pinky: false },
        thumbDirection: "left",
        fingerSpread: 0,
        fistRatio: 0.9,
      },
      "A"
    );
    expect(result.isCorrect).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(70);
  });

  it("detects incorrect A (fingers extended)", () => {
    const result = checkLetter(
      {
        fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
        thumbDirection: "right",
        fingerSpread: 0.5,
        fistRatio: 0,
      },
      "A"
    );
    expect(result.isCorrect).toBe(false);
    expect(result.feedback.length).toBeGreaterThan(0);
  });

  it("detects correct B (4 fingers up, thumb folded)", () => {
    const result = checkLetter(
      {
        fingers: { thumb: false, index: true, middle: true, ring: true, pinky: true },
        thumbDirection: "neutral",
        fingerSpread: 0.1,
        fistRatio: 0,
      },
      "B"
    );
    expect(result.isCorrect).toBe(true);
  });

  it("detects correct L (thumb + index)", () => {
    const result = checkLetter(
      {
        fingers: { thumb: true, index: true, middle: false, ring: false, pinky: false },
        thumbDirection: "right",
        fingerSpread: 0.5,
        fistRatio: 0.5,
      },
      "L"
    );
    expect(result.isCorrect).toBe(true);
  });

  it("detects correct V (index + middle spread)", () => {
    const result = checkLetter(
      {
        fingers: { thumb: false, index: true, middle: true, ring: false, pinky: false },
        thumbDirection: "neutral",
        fingerSpread: 0.5,
        fistRatio: 0.5,
      },
      "V"
    );
    expect(result.isCorrect).toBe(true);
  });

  it("detects correct Y (thumb + pinky)", () => {
    const result = checkLetter(
      {
        fingers: { thumb: true, index: false, middle: false, ring: false, pinky: true },
        thumbDirection: "right",
        fingerSpread: 0.3,
        fistRatio: 0.5,
      },
      "Y"
    );
    expect(result.isCorrect).toBe(true);
  });

  it("provides specific feedback for wrong fingers", () => {
    const result = checkLetter(
      {
        fingers: { thumb: true, index: false, middle: false, ring: false, pinky: false },
        thumbDirection: "right",
        fingerSpread: 0,
        fistRatio: 0.8,
      },
      "B"
    );
    expect(result.isCorrect).toBe(false);
    // Should mention specific fingers that are wrong
    const feedbackText = result.feedback.join(" ");
    expect(feedbackText).toMatch(/finger/i);
  });

  it("returns score between 0 and 100", () => {
    const result = checkLetter(
      {
        fingers: { thumb: false, index: true, middle: false, ring: false, pinky: false },
        thumbDirection: "up",
        fingerSpread: 0.3,
        fistRatio: 0.7,
      },
      "D"
    );
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
