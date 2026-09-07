/**
 * LocalStorage Persistence Layer
 * Centralizes all read/write for player progress, scores, and achievements.
 */

const STORAGE_KEY = "signquest_progress";

// ===== Data Types =====

export interface QuizResult {
  word: string;
  correct: boolean;
  score: number;
  difficulty: number;
  timestamp: number;
}

export interface GestureHistoryEntry {
  gesture: string;
  meaning: string;
  timestamp: number;
}

export interface PlayerProgress {
  // Alphabet
  learnedLetters: string[];

  // Words (from Train page)
  learnedWords: string[];

  // Sentences (from Train page)
  practicedSentences: string[];

  // Quiz history
  quizResults: QuizResult[];

  // Free Play
  gesturesRecorded: number;
  gestureHistory: GestureHistoryEntry[];

  // Aggregated stats
  totalScore: number;
  totalXP: number;
  level: number;
  bestStreak: number;
  totalCorrect: number;
  totalAttempts: number;
  totalGestures: number;
  daysActive: string[]; // unique dates like "2026-09-07"
  firstPlayedAt: number;
  lastPlayedAt: number;
}

// ===== Default State =====

const DEFAULT_PROGRESS: PlayerProgress = {
  learnedLetters: [],
  learnedWords: [],
  practicedSentences: [],
  quizResults: [],
  gesturesRecorded: 0,
  gestureHistory: [],
  totalScore: 0,
  totalXP: 0,
  level: 1,
  bestStreak: 0,
  totalCorrect: 0,
  totalAttempts: 0,
  totalGestures: 0,
  daysActive: [],
  firstPlayedAt: Date.now(),
  lastPlayedAt: Date.now(),
};

// ===== Read / Write =====

function isClient(): boolean {
  return typeof window !== "undefined";
}

export function loadProgress(): PlayerProgress {
  if (!isClient()) return { ...DEFAULT_PROGRESS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw) as PlayerProgress;
    // Merge with defaults in case of new fields
    return { ...DEFAULT_PROGRESS, ...parsed };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveProgress(progress: PlayerProgress): void {
  if (!isClient()) return;
  try {
    progress.lastPlayedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage full or blocked — silently fail
  }
}

function update(fn: (p: PlayerProgress) => PlayerProgress): PlayerProgress {
  const current = loadProgress();
  const updated = fn(current);
  saveProgress(updated);
  return updated;
}

// ===== Alphabet =====

export function markLetterLearned(letter: string): PlayerProgress {
  return update((p) => {
    if (!p.learnedLetters.includes(letter)) {
      p.learnedLetters = [...p.learnedLetters, letter];
    }
    trackDay(p);
    return p;
  });
}

export function isLetterLearned(letter: string): boolean {
  return loadProgress().learnedLetters.includes(letter);
}

export function getLearnedLetters(): string[] {
  return loadProgress().learnedLetters;
}

// ===== Words & Sentences =====

export function markWordLearned(word: string): PlayerProgress {
  return update((p) => {
    if (!p.learnedWords.includes(word)) {
      p.learnedWords = [...p.learnedWords, word];
    }
    trackDay(p);
    return p;
  });
}

export function markSentencePracticed(sentence: string): PlayerProgress {
  return update((p) => {
    if (!p.practicedSentences.includes(sentence)) {
      p.practicedSentences = [...p.practicedSentences, sentence];
    }
    trackDay(p);
    return p;
  });
}

export function isWordLearned(word: string): boolean {
  return loadProgress().learnedWords.includes(word);
}

// ===== Quiz =====

export function saveQuizResult(result: QuizResult): PlayerProgress {
  return update((p) => {
    p.quizResults.push(result);
    p.totalAttempts++;
    if (result.correct) {
      p.totalCorrect++;
    }
    p.totalScore += result.score;
    trackDay(p);
    return p;
  });
}

export function getQuizHistory(): QuizResult[] {
  return loadProgress().quizResults;
}

// ===== XP & Leveling =====

export function addXP(amount: number): PlayerProgress {
  return update((p) => {
    p.totalXP += amount;
    p.level = Math.floor(p.totalXP / 100) + 1;
    trackDay(p);
    return p;
  });
}

export function addStreak(streak: number): PlayerProgress {
  return update((p) => {
    if (streak > p.bestStreak) {
      p.bestStreak = streak;
    }
    return p;
  });
}

// ===== Free Play =====

export function recordGesture(gesture?: string, meaning?: string): PlayerProgress {
  return update((p) => {
    p.gesturesRecorded++;
    p.totalGestures++;
    if (gesture) {
      p.gestureHistory = [
        { gesture, meaning: meaning || gesture, timestamp: Date.now() },
        ...p.gestureHistory,
      ].slice(0, 100); // Keep last 100 gestures
    }
    trackDay(p);
    return p;
  });
}

export function getGestureHistory(): GestureHistoryEntry[] {
  return loadProgress().gestureHistory;
}

export function clearGestureHistory(): PlayerProgress {
  return update((p) => {
    p.gestureHistory = [];
    return p;
  });
}

// ===== Achievements =====

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export function getAchievements(): Achievement[] {
  const p = loadProgress();
  const today = new Date().toISOString().split("T")[0];

  return [
    {
      id: "first_quiz",
      title: "First Quiz",
      description: "Complete your first quiz",
      emoji: "🎯",
      unlocked: p.totalAttempts >= 1,
    },
    {
      id: "hot_streak",
      title: "Hot Streak",
      description: "Get 5 correct in a row",
      emoji: "🔥",
      unlocked: p.bestStreak >= 5,
    },
    {
      id: "halfway",
      title: "Halfway There",
      description: "Learn 13 letters",
      emoji: "📖",
      unlocked: p.learnedLetters.length >= 13,
    },
    {
      id: "quiz_master",
      title: "Quiz Master",
      description: "Score 100% on a quiz",
      emoji: "🏆",
      unlocked: p.quizResults.some((r) => r.score >= 90 && r.correct),
    },
    {
      id: "all_letters",
      title: "All Letters",
      description: "Learn all 26 letters",
      emoji: "🌟",
      unlocked: p.learnedLetters.length >= 26,
    },
    {
      id: "century",
      title: "Century",
      description: "Record 100 gestures",
      emoji: "💪",
      unlocked: p.totalGestures >= 100,
    },
    {
      id: "big_brain",
      title: "Big Brain",
      description: "Reach level 5",
      emoji: "🧠",
      unlocked: p.level >= 5,
    },
    {
      id: "word_master",
      title: "Word Master",
      description: "Learn 10 words",
      emoji: "📚",
      unlocked: p.learnedWords.length >= 10,
    },
    {
      id: "daily_3",
      title: "Dedicated",
      description: "Play on 3 different days",
      emoji: "📅",
      unlocked: p.daysActive.length >= 3,
    },
    {
      id: "five_quizzes",
      title: "Quiz Veteran",
      description: "Complete 5 quizzes",
      emoji: "🎖️",
      unlocked: p.totalAttempts >= 5,
    },
  ];
}

export function getUnlockedCount(): number {
  return getAchievements().filter((a) => a.unlocked).length;
}

// ===== Dashboard Stats =====

export function getDashboardStats() {
  const p = loadProgress();
  const accuracy = p.totalAttempts > 0
    ? Math.round((p.totalCorrect / p.totalAttempts) * 100)
    : 0;

  // Weekly data (last 7 days)
  const weeklyData = getWeeklyData(p);

  return {
    totalScore: p.totalScore,
    totalXP: p.totalXP,
    level: p.level,
    xpToNextLevel: (p.level * 100) - p.totalXP,
    bestStreak: p.bestStreak,
    lettersLearned: p.learnedLetters.length,
    wordsLearned: p.learnedWords.length,
    sentencesPracticed: p.practicedSentences.length,
    quizzesCompleted: p.totalAttempts,
    totalCorrect: p.totalCorrect,
    totalAttempts: p.totalAttempts,
    accuracy,
    totalGestures: p.totalGestures,
    daysActive: p.daysActive.length,
    firstPlayedAt: p.firstPlayedAt,
    lastPlayedAt: p.lastPlayedAt,
    weeklyData,
  };
}

function getWeeklyData(p: PlayerProgress) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const result: { day: string; score: number; gestures: number; quizzes: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayName = days[d.getDay()];

    // Count quiz scores for this day
    const dayQuizzes = p.quizResults.filter(
      (r) => new Date(r.timestamp).toISOString().split("T")[0] === dateStr
    );
    const dayScore = dayQuizzes.reduce((sum, r) => sum + r.score, 0);

    result.push({
      day: dayName,
      score: dayScore,
      gestures: p.gestureHistory.filter(
      (g) => new Date(g.timestamp).toISOString().split("T")[0] === dateStr
    ).length,
      quizzes: dayQuizzes.length,
    });
  }

  return result;
}

// ===== Helpers =====

function trackDay(p: PlayerProgress): void {
  const today = new Date().toISOString().split("T")[0];
  if (!p.daysActive.includes(today)) {
    p.daysActive = [...p.daysActive, today];
  }
}

// ===== Reset =====

export function resetProgress(): void {
  if (!isClient()) return;
  localStorage.removeItem(STORAGE_KEY);
}
