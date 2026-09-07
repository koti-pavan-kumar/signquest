import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  loadProgress,
  saveProgress,
  markLetterLearned,
  markWordLearned,
  markSentencePracticed,
  saveQuizResult,
  addXP,
  addStreak,
  recordGesture,
  getAchievements,
  getUnlockedCount,
  getDashboardStats,
  resetProgress,
  isLetterLearned,
  isWordLearned,
  getLearnedLetters,
  getQuizHistory,
} from "@/lib/persistence";

describe("localStorage persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loadProgress returns defaults when empty", () => {
    const progress = loadProgress();
    expect(progress.learnedLetters).toEqual([]);
    expect(progress.learnedWords).toEqual([]);
    expect(progress.quizResults).toEqual([]);
    expect(progress.totalXP).toBe(0);
    expect(progress.level).toBe(1);
  });

  it("saveProgress persists data", () => {
    const progress = loadProgress();
    progress.totalXP = 100;
    progress.learnedLetters = ["A", "B"];
    saveProgress(progress);

    const loaded = loadProgress();
    expect(loaded.totalXP).toBe(100);
    expect(loaded.learnedLetters).toEqual(["A", "B"]);
  });

  it("loadProgress merges with defaults for new fields", () => {
    // Save old-format data (without new fields)
    localStorage.setItem("signquest_progress", JSON.stringify({ totalXP: 50 }));
    const loaded = loadProgress();
    expect(loaded.totalXP).toBe(50);
    expect(loaded.learnedLetters).toEqual([]); // default
  });
});

describe("Alphabet persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("markLetterLearned adds letter", () => {
    markLetterLearned("A");
    expect(isLetterLearned("A")).toBe(true);
    expect(isLetterLearned("B")).toBe(false);
  });

  it("markLetterLearned is idempotent", () => {
    markLetterLearned("A");
    markLetterLearned("A");
    const letters = getLearnedLetters();
    expect(letters.filter((l) => l === "A")).toHaveLength(1);
  });

  it("getLearnedLetters returns all learned letters", () => {
    markLetterLearned("A");
    markLetterLearned("B");
    markLetterLearned("C");
    const letters = getLearnedLetters();
    expect(letters).toContain("A");
    expect(letters).toContain("B");
    expect(letters).toContain("C");
  });
});

describe("Words & Sentences persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("markWordLearned adds word", () => {
    markWordLearned("Hello");
    expect(isWordLearned("Hello")).toBe(true);
    expect(isWordLearned("World")).toBe(false);
  });

  it("markSentencePracticed adds sentence", () => {
    markSentencePracticed("Nice to meet you");
    const progress = loadProgress();
    expect(progress.practicedSentences).toContain("Nice to meet you");
  });
});

describe("Quiz persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saveQuizResult adds result", () => {
    saveQuizResult({
      word: "Hello",
      correct: true,
      score: 10,
      difficulty: 1,
      timestamp: Date.now(),
    });
    const history = getQuizHistory();
    expect(history).toHaveLength(1);
    expect(history[0].word).toBe("Hello");
    expect(history[0].correct).toBe(true);
  });

  it("saveQuizResult updates stats", () => {
    saveQuizResult({
      word: "Hello",
      correct: true,
      score: 10,
      difficulty: 1,
      timestamp: Date.now(),
    });
    const progress = loadProgress();
    expect(progress.totalAttempts).toBe(1);
    expect(progress.totalCorrect).toBe(1);
    expect(progress.totalScore).toBe(10);
  });

  it("saveQuizResult tracks incorrect answers", () => {
    saveQuizResult({
      word: "Hello",
      correct: false,
      score: 0,
      difficulty: 1,
      timestamp: Date.now(),
    });
    const progress = loadProgress();
    expect(progress.totalAttempts).toBe(1);
    expect(progress.totalCorrect).toBe(0);
  });
});

describe("XP & Leveling", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("addXP increases totalXP", () => {
    addXP(50);
    const progress = loadProgress();
    expect(progress.totalXP).toBe(50);
  });

  it("addXP computes level correctly", () => {
    addXP(250); // 250 XP = level 3 (floor(250/100) + 1)
    const progress = loadProgress();
    expect(progress.level).toBe(3);
  });

  it("addXP accumulates across calls", () => {
    addXP(50);
    addXP(30);
    const progress = loadProgress();
    expect(progress.totalXP).toBe(80);
  });

  it("addStreak updates best streak", () => {
    addStreak(5);
    const progress = loadProgress();
    expect(progress.bestStreak).toBe(5);
  });

  it("addStreak does not decrease best streak", () => {
    addStreak(5);
    addStreak(3);
    const progress = loadProgress();
    expect(progress.bestStreak).toBe(5);
  });
});

describe("Free Play persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("recordGesture increments counter", () => {
    recordGesture();
    recordGesture();
    const progress = loadProgress();
    expect(progress.gesturesRecorded).toBe(2);
    expect(progress.totalGestures).toBe(2);
  });
});

describe("Achievements", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns 10 achievements", () => {
    const achievements = getAchievements();
    expect(achievements).toHaveLength(10);
  });

  it("each achievement has required fields", () => {
    const achievements = getAchievements();
    for (const a of achievements) {
      expect(a.id.length).toBeGreaterThan(0);
      expect(a.title.length).toBeGreaterThan(0);
      expect(a.description.length).toBeGreaterThan(0);
      expect(a.emoji.length).toBeGreaterThan(0);
      expect(typeof a.unlocked).toBe("boolean");
    }
  });

  it("no achievements unlocked initially", () => {
    const achievements = getAchievements();
    const unlocked = achievements.filter((a) => a.unlocked);
    expect(unlocked).toHaveLength(0);
  });

  it("first_quiz unlocks after 1 quiz", () => {
    saveQuizResult({
      word: "Hello",
      correct: true,
      score: 10,
      difficulty: 1,
      timestamp: Date.now(),
    });
    const achievements = getAchievements();
    const firstQuiz = achievements.find((a) => a.id === "first_quiz");
    expect(firstQuiz!.unlocked).toBe(true);
  });

  it("halfway unlocks after 13 letters", () => {
    for (let i = 0; i < 13; i++) {
      markLetterLearned(String.fromCharCode(65 + i)); // A-M
    }
    const achievements = getAchievements();
    const halfway = achievements.find((a) => a.id === "halfway");
    expect(halfway!.unlocked).toBe(true);
  });

  it("big_brain unlocks at level 5", () => {
    addXP(400); // Level 5
    const achievements = getAchievements();
    const bigBrain = achievements.find((a) => a.id === "big_brain");
    expect(bigBrain!.unlocked).toBe(true);
  });

  it("getUnlockedCount returns count of unlocked", () => {
    const count = getUnlockedCount();
    expect(count).toBe(0);

    saveQuizResult({
      word: "Hello",
      correct: true,
      score: 10,
      difficulty: 1,
      timestamp: Date.now(),
    });
    expect(getUnlockedCount()).toBe(1);
  });
});

describe("Dashboard Stats", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns default stats when empty", () => {
    const stats = getDashboardStats();
    expect(stats.totalXP).toBe(0);
    expect(stats.level).toBe(1);
    expect(stats.accuracy).toBe(0);
    expect(stats.weeklyData).toHaveLength(7);
  });

  it("computes accuracy from quiz results", () => {
    saveQuizResult({ word: "A", correct: true, score: 10, difficulty: 1, timestamp: Date.now() });
    saveQuizResult({ word: "B", correct: true, score: 10, difficulty: 1, timestamp: Date.now() });
    saveQuizResult({ word: "C", correct: false, score: 0, difficulty: 1, timestamp: Date.now() });
    const stats = getDashboardStats();
    expect(stats.accuracy).toBe(67); // 2/3 = 66.67, rounded to 67
    expect(stats.totalAttempts).toBe(3);
    expect(stats.totalCorrect).toBe(2);
  });

  it("tracks letters and words learned", () => {
    markLetterLearned("A");
    markLetterLearned("B");
    markWordLearned("Hello");
    const stats = getDashboardStats();
    expect(stats.lettersLearned).toBe(2);
    expect(stats.wordsLearned).toBe(1);
  });
});

describe("Reset", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("resetProgress clears all data", () => {
    markLetterLearned("A");
    addXP(100);
    resetProgress();
    const progress = loadProgress();
    expect(progress.learnedLetters).toEqual([]);
    expect(progress.totalXP).toBe(0);
  });
});
