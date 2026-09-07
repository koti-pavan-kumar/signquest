import { describe, it, expect } from "vitest";
import {
  WORD_GESTURE_MAP,
  getExpectedGesture,
  classifyGesture,
  validateWordGesture,
} from "@/lib/word-gesture-map";

describe("WORD_GESTURE_MAP", () => {
  it("has 20 words mapped", () => {
    expect(Object.keys(WORD_GESTURE_MAP)).toHaveLength(20);
  });

  it("each word has required fields", () => {
    for (const [, gesture] of Object.entries(WORD_GESTURE_MAP)) {
      expect(gesture.word.length).toBeGreaterThan(0);
      expect(typeof gesture.fingers.thumb).toBe("boolean");
      expect(typeof gesture.fingers.index).toBe("boolean");
      expect(gesture.description.length).toBeGreaterThan(0);
      expect(gesture.feedbackTips.length).toBeGreaterThan(0);
      expect(gesture.gestureName.length).toBeGreaterThan(0);
    }
  });

  it("Hello maps to open_palm gesture", () => {
    expect(WORD_GESTURE_MAP["Hello"].gestureName).toBe("open_palm");
    expect(WORD_GESTURE_MAP["Hello"].fingers.index).toBe(true);
  });

  it("Yes maps to fist gesture", () => {
    expect(WORD_GESTURE_MAP["Yes"].gestureName).toBe("fist");
    expect(WORD_GESTURE_MAP["Yes"].minFistRatio).toBe(0.8);
  });

  it("No maps to snap gesture", () => {
    expect(WORD_GESTURE_MAP["No"].gestureName).toBe("snap");
  });
});

describe("getExpectedGesture", () => {
  it("returns gesture for known word", () => {
    const gesture = getExpectedGesture("Hello");
    expect(gesture).not.toBeNull();
    expect(gesture!.word).toBe("Hello");
    expect(gesture!.gestureName).toBe("open_palm");
  });

  it("returns null for empty string", () => {
    const gesture = getExpectedGesture("");
    expect(gesture).toBeNull();
  });

  it("falls back to first-letter finger-spelling for unknown word", () => {
    const gesture = getExpectedGesture("Xylophone");
    expect(gesture).not.toBeNull();
    expect(gesture!.word).toBe("Xylophone");
    expect(gesture!.description).toContain("X");
  });

  it("returns gesture for Thank You", () => {
    const gesture = getExpectedGesture("Thank You");
    expect(gesture).not.toBeNull();
    expect(gesture!.gestureName).toBe("flat_hand");
  });
});

describe("classifyGesture", () => {
  it("classifies fist (no fingers extended)", () => {
    const result = classifyGesture(
      { thumb: false, index: false, middle: false, ring: false, pinky: false },
      0,
      0.9
    );
    expect(result).toBe("fist");
  });

  it("classifies open palm (4 fingers extended, no thumb)", () => {
    const result = classifyGesture(
      { thumb: false, index: true, middle: true, ring: true, pinky: true },
      0.5,
      0
    );
    expect(result).toBe("open_palm");
  });

  it("classifies flat hand (all extended, low spread)", () => {
    const result = classifyGesture(
      { thumb: true, index: true, middle: true, ring: true, pinky: true },
      0.15,
      0
    );
    expect(result).toBe("flat_hand");
  });

  it("classifies W shape (index + middle + ring)", () => {
    const result = classifyGesture(
      { thumb: false, index: true, middle: true, ring: true, pinky: false },
      0.3,
      0.25
    );
    expect(result).toBe("W");
  });

  it("classifies peace/V (index + middle spread)", () => {
    const result = classifyGesture(
      { thumb: false, index: true, middle: true, ring: false, pinky: false },
      0.5,
      0.5
    );
    expect(result).toBe("peace");
  });

  it("classifies L shape (index + thumb)", () => {
    const result = classifyGesture(
      { thumb: true, index: true, middle: false, ring: false, pinky: false },
      0.3,
      0.5
    );
    expect(result).toBe("L");
  });

  it("classifies Y shape (thumb + pinky)", () => {
    const result = classifyGesture(
      { thumb: true, index: false, middle: false, ring: false, pinky: true },
      0.4,
      0.5
    );
    expect(result).toBe("Y");
  });

  it("classifies index only", () => {
    const result = classifyGesture(
      { thumb: false, index: true, middle: false, ring: false, pinky: false },
      0,
      0.75
    );
    expect(result).toBe("index");
  });
});

describe("validateWordGesture", () => {
  it("returns high score for matching gesture", () => {
    const gesture = getExpectedGesture("Hello")!;
    const result = validateWordGesture(
      { thumb: true, index: true, middle: true, ring: true, pinky: true },
      0.4, // above minSpread of 0.3
      0,
      gesture
    );
    expect(result.score).toBeGreaterThanOrEqual(65);
    expect(result.isCorrect).toBe(true);
  });

  it("returns low score for wrong gesture", () => {
    const gesture = getExpectedGesture("Hello")!;
    const result = validateWordGesture(
      { thumb: false, index: false, middle: false, ring: false, pinky: false },
      0,
      0.9,
      gesture
    );
    expect(result.isCorrect).toBe(false);
    expect(result.feedback.length).toBeGreaterThan(0);
  });

  it("returns score between 0 and 100", () => {
    const gesture = getExpectedGesture("Yes")!;
    const result = validateWordGesture(
      { thumb: false, index: false, middle: false, ring: false, pinky: false },
      0,
      0.9,
      gesture
    );
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
