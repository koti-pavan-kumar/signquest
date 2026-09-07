import { describe, it, expect } from "vitest";
import {
  ISL_VOWELS,
  ISL_CONSONANTS,
  ALL_ISL_PATTERNS,
  ISL_WORDS,
  ALL_ISL_WORDS,
  ISL_WORDS_BY_CATEGORY,
  checkISLLetter,
} from "@/lib/isl-patterns";

describe("ISL Alphabet", () => {
  it("has 10 Devanagari vowels", () => {
    expect(Object.keys(ISL_VOWELS)).toHaveLength(10);
  });

  it("has 24 Devanagari consonants", () => {
    expect(Object.keys(ISL_CONSONANTS)).toHaveLength(24);
  });

  it("combined has 34 patterns", () => {
    expect(Object.keys(ALL_ISL_PATTERNS)).toHaveLength(34);
  });

  it("each pattern has devanagari field", () => {
    for (const [, pattern] of Object.entries(ISL_VOWELS)) {
      expect(pattern.devanagari).toBeDefined();
      expect(pattern.devanagari!.length).toBeGreaterThan(0);
    }
  });

  it("each pattern has steps array", () => {
    for (const [, pattern] of Object.entries(ALL_ISL_PATTERNS)) {
      expect(Array.isArray(pattern.steps)).toBe(true);
      expect(pattern.steps.length).toBeGreaterThan(0);
    }
  });

  it("each pattern has category", () => {
    for (const [, pattern] of Object.entries(ALL_ISL_PATTERNS)) {
      expect(["vowel", "consonant", "number", "common"]).toContain(pattern.category);
    }
  });

  it("vowel अ requires fist with thumb extended", () => {
    const pattern = ISL_VOWELS["अ"];
    expect(pattern.required.thumb).toBe(true);
    expect(pattern.required.index).toBe(false);
    expect(pattern.required.middle).toBe(false);
  });

  it("vowel ई requires V shape (index + middle spread)", () => {
    const pattern = ISL_VOWELS["ई"];
    expect(pattern.required.index).toBe(true);
    expect(pattern.required.middle).toBe(true);
    expect(pattern.required.ring).toBe(false);
    expect(pattern.minSpread).toBe(0.3);
  });

  it("consonant न requires tight fist", () => {
    const pattern = ISL_CONSONANTS["न"];
    expect(pattern.required.thumb).toBe(false);
    expect(pattern.required.index).toBe(false);
    expect(pattern.minFistRatio).toBe(0.85);
  });
});

describe("checkISLLetter", () => {
  it("returns score 0 for unknown letter", () => {
    const result = checkISLLetter(
      {
        fingers: { thumb: false, index: false, middle: false, ring: false, pinky: false },
        thumbDirection: "neutral",
        fingerSpread: 0,
        fistRatio: 1,
      },
      "X"
    );
    expect(result.score).toBe(0);
    expect(result.isCorrect).toBe(false);
  });

  it("detects correct अ (fist with thumb)", () => {
    const result = checkISLLetter(
      {
        fingers: { thumb: true, index: false, middle: false, ring: false, pinky: false },
        thumbDirection: "right",
        fingerSpread: 0,
        fistRatio: 0.8,
      },
      "अ"
    );
    expect(result.isCorrect).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(70);
  });

  it("detects correct इ (index up)", () => {
    const result = checkISLLetter(
      {
        fingers: { thumb: false, index: true, middle: false, ring: false, pinky: false },
        thumbDirection: "neutral",
        fingerSpread: 0,
        fistRatio: 0.8,
      },
      "इ"
    );
    expect(result.isCorrect).toBe(true);
  });

  it("detects correct ई (V shape)", () => {
    const result = checkISLLetter(
      {
        fingers: { thumb: false, index: true, middle: true, ring: false, pinky: false },
        thumbDirection: "neutral",
        fingerSpread: 0.5,
        fistRatio: 0.5,
      },
      "ई"
    );
    expect(result.isCorrect).toBe(true);
  });

  it("detects correct न (tight fist)", () => {
    const result = checkISLLetter(
      {
        fingers: { thumb: false, index: false, middle: false, ring: false, pinky: false },
        thumbDirection: "neutral",
        fingerSpread: 0,
        fistRatio: 0.95,
      },
      "न"
    );
    expect(result.isCorrect).toBe(true);
  });

  it("detects incorrect sign with feedback", () => {
    const result = checkISLLetter(
      {
        fingers: { thumb: true, index: true, middle: true, ring: true, pinky: true },
        thumbDirection: "right",
        fingerSpread: 0.5,
        fistRatio: 0,
      },
      "न"
    );
    expect(result.isCorrect).toBe(false);
    expect(result.feedback.length).toBeGreaterThan(0);
  });
});

describe("ISL Words", () => {
  it("has 35+ ISL words", () => {
    expect(ALL_ISL_WORDS.length).toBeGreaterThanOrEqual(35);
  });

  it("each word has required fields", () => {
    for (const word of ALL_ISL_WORDS) {
      expect(word.word.length).toBeGreaterThan(0);
      expect(word.hindi.length).toBeGreaterThan(0);
      expect(word.devanagari.length).toBeGreaterThan(0);
      expect(word.description.length).toBeGreaterThan(0);
      expect(word.steps.length).toBeGreaterThan(0);
      expect(word.emoji.length).toBeGreaterThan(0);
    }
  });

  it("words are organized by category", () => {
    expect(ISL_WORDS_BY_CATEGORY.greeting.length).toBeGreaterThan(0);
    expect(ISL_WORDS_BY_CATEGORY.family.length).toBeGreaterThan(0);
    expect(ISL_WORDS_BY_CATEGORY.food.length).toBeGreaterThan(0);
    expect(ISL_WORDS_BY_CATEGORY.emotion.length).toBeGreaterThan(0);
    expect(ISL_WORDS_BY_CATEGORY.numbers.length).toBeGreaterThan(0);
  });

  it("Namaste has correct finger configuration", () => {
    const namaste = ISL_WORDS["Namaste"];
    expect(namaste).toBeDefined();
    expect(namaste.fingers.thumb).toBe(true);
    expect(namaste.fingers.index).toBe(true);
    expect(namaste.fingers.middle).toBe(true);
    expect(namaste.fingers.ring).toBe(true);
    expect(namaste.fingers.pinky).toBe(true);
    expect(namaste.maxSpread).toBe(0.15);
  });

  it("Mother touches chin (expectedMotion = tap)", () => {
    const mother = ISL_WORDS["Mother"];
    expect(mother).toBeDefined();
    expect(mother.expectedMotion).toBe("tap");
    expect(mother.category).toBe("family");
  });

  it("Father touches forehead (expectedMotion = tap)", () => {
    const father = ISL_WORDS["Father"];
    expect(father).toBeDefined();
    expect(father.expectedMotion).toBe("tap");
    expect(father.category).toBe("family");
  });

  it("Water uses W handshape", () => {
    const water = ISL_WORDS["Water"];
    expect(water).toBeDefined();
    expect(water.fingers.index).toBe(true);
    expect(water.fingers.middle).toBe(true);
    expect(water.fingers.ring).toBe(true);
    expect(water.fingers.pinky).toBe(false);
  });

  it("each word has valid category", () => {
    const validCategories = [
      "greeting", "polite", "essential", "family", "food",
      "numbers", "emotion", "action", "place",
    ];
    for (const word of ALL_ISL_WORDS) {
      expect(validCategories).toContain(word.category);
    }
  });
});
