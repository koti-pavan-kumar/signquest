"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Check,
  X,
  RotateCcw,
  Volume2,
  Sparkles,
  Zap,
  AlertTriangle,
  Eye,
  Hand,
} from "lucide-react";
import { GestureAnalysis } from "@/lib/gesture-detection";
import { MotionTracker, validateWithMotion, MotionAnalysis } from "@/lib/motion-tracking";
import { WordEntry, SentenceEntry } from "@/lib/word-data";
import { AlphabetEntry } from "@/lib/alphabet-data";
import { getExpectedGesture, validateWordGesture } from "@/lib/word-gesture-map";
import { checkLetter } from "@/lib/asl-patterns";
import { markWordLearned, markSentencePracticed, addXP } from "@/lib/persistence";

export type CoachMode = "recording" | "analyzing" | "result" | "idle";

export interface CoachResult {
  score: number;
  isCorrect: boolean;
  feedback: string[];
  motionType: string;
}

interface LiveCoachProps {
  /** The current word/sentence/letter being practiced */
  currentItem: WordEntry | SentenceEntry | AlphabetEntry;
  /** Current gesture analysis from the camera */
  analysis: GestureAnalysis | null;
  /** Whether hand is currently detected */
  handDetected: boolean;
  /** Number of hands detected */
  handCount: number;
  /** Motion tracker ref to feed frames into */
  motionTracker: React.MutableRefObject<MotionTracker>;
  /** Called when a correct sign is recognized */
  onCorrect: () => void;
  /** Difficulty multiplier for XP */
  xpMultiplier: number;
}

const RECORDING_DURATION_MS = 3000; // Record for 3 seconds
const FEEDBACK_INTERVAL_MS = 500; // Give live feedback every 500ms

export function LiveCoach({
  currentItem,
  analysis,
  handDetected,
  handCount,
  motionTracker,
  onCorrect,
  xpMultiplier,
}: LiveCoachProps) {
  const [mode, setMode] = useState<CoachMode>("idle");
  const [result, setResult] = useState<CoachResult | null>(null);
  const [liveFeedback, setLiveFeedback] = useState<string[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [handShapeScore, setHandShapeScore] = useState(0);

  const modeRef = useRef<CoachMode>("idle");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const analysisHistoryRef = useRef<GestureAnalysis[]>([]);

  // Keep ref in sync
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (feedbackTimerRef.current) clearInterval(feedbackTimerRef.current);
    };
  }, []);

  // Live feedback loop — gives real-time corrections while recording
  useEffect(() => {
    if (mode !== "recording" || !analysis) return;

    analysisHistoryRef.current.push(analysis);

    const newFeedback: string[] = [];

    // Check if this is an ALPHABET letter entry
    if ("letter" in currentItem && "description" in currentItem && "commonMistakes" in currentItem) {
      // ALPHABET MODE — use checkLetter from asl-patterns
      const alphabetEntry = currentItem as AlphabetEntry;
      const letterResult = checkLetter(
        {
          fingers: analysis.fingers,
          thumbDirection: "up",
          fingerSpread: analysis.fingerSpread,
          fistRatio: analysis.fistRatio,
        },
        alphabetEntry.letter
      );
      setHandShapeScore(letterResult.score);

      if (letterResult.isCorrect) {
        newFeedback.push("✅ Hand shape looks correct!");
      } else {
        const corrections = letterResult.feedback.slice(0, 2);
        if (corrections.length > 0) {
          newFeedback.push("Fix: " + corrections.join(", "));
        } else {
          newFeedback.push(`Try: ${alphabetEntry.description}`);
        }
      }
    } else {
      // WORD / SENTENCE MODE — use word-gesture-map
      const word = "word" in currentItem ? currentItem.word : "";
      const expectedGesture = getExpectedGesture(word);

      if (expectedGesture) {
        const gestureResult = validateWordGesture(
          analysis.fingers,
          analysis.fingerSpread,
          analysis.fistRatio,
          expectedGesture
        );
        setHandShapeScore(gestureResult.score);

        if (gestureResult.score >= 70) {
          newFeedback.push("✅ Hand shape looks good!");
        } else {
          const fingerFeedback = gestureResult.feedback
            .filter((f) => f.includes("EXTENDED") || f.includes("CURLED") || f.includes("SPREAD") || f.includes("finger"))
            .slice(0, 2);
          if (fingerFeedback.length > 0) {
            newFeedback.push("Fix: " + fingerFeedback.join(", "));
          } else {
            newFeedback.push(`Expected: ${expectedGesture.description}`);
          }
        }
      } else {
        const f = analysis.fingers;
        const extended = [f.thumb, f.index, f.middle, f.ring, f.pinky].filter(Boolean).length;
        if (extended >= 3) {
          newFeedback.push("✅ Good hand visibility");
        } else {
          newFeedback.push("Show more fingers to the camera");
        }
      }
    }

    // Motion feedback for words/sentences (letters are mostly static)
    if (!("letter" in currentItem && "description" in currentItem)) {
      if (!handDetected) {
        newFeedback.push("👀 Show your hand to the camera");
      } else if (handCount > 1) {
        newFeedback.push(`🙌 ${handCount} hands detected — great!`);
      }
    } else {
      // For letters, just check hand visibility
      if (!handDetected) {
        newFeedback.push("👀 Show your hand to the camera");
      }
    }

    setLiveFeedback(newFeedback);
  }, [analysis, mode, handDetected, handCount, currentItem]);

  // Start recording mode
  const startRecording = useCallback(() => {
    setMode("recording");
    modeRef.current = "recording";
    setResult(null);
    setLiveFeedback(["🎤 Recording... Show the sign now!"]);
    setRecordingTime(0);
    analysisHistoryRef.current = [];

    // Reset motion tracker for fresh recording
    motionTracker.current.reset?.();

    // Countdown timer
    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed += 100;
      setRecordingTime(elapsed);

      if (elapsed >= RECORDING_DURATION_MS) {
        // Auto-analyze after recording duration
        if (timerRef.current) clearInterval(timerRef.current);
        analyzeRecording();
      }
    }, 100);
  }, [motionTracker, currentItem]);

  // Analyze the recorded gesture
  const analyzeRecording = useCallback(() => {
    setMode("analyzing");
    modeRef.current = "analyzing";

    // Small delay for dramatic effect
    setTimeout(() => {
      const motionAnalysis = motionTracker.current.getAnalysis();
      const lastAnalysis = analysisHistoryRef.current[analysisHistoryRef.current.length - 1];

      let staticScore = 0;
      let staticFeedback: string[] = [];

      // ALPHABET MODE
      if ("letter" in currentItem && "description" in currentItem && "commonMistakes" in currentItem) {
        const alphabetEntry = currentItem as AlphabetEntry;
        if (lastAnalysis) {
          const letterResult = checkLetter(
            {
              fingers: lastAnalysis.fingers,
              thumbDirection: "up",
              fingerSpread: lastAnalysis.fingerSpread,
              fistRatio: lastAnalysis.fistRatio,
            },
            alphabetEntry.letter
          );
          staticScore = letterResult.score;
          staticFeedback = letterResult.feedback;
        }

        // Letters are mostly static — less weight on motion
        const coachResult: CoachResult = {
          score: staticScore,
          isCorrect: staticScore >= 65,
          feedback: staticFeedback,
          motionType: "static",
        };

        setResult(coachResult);
        setMode("result");
        modeRef.current = "result";

        if (coachResult.isCorrect) {
          try {
            const u = new SpeechSynthesisUtterance(`Letter ${alphabetEntry.letter}! Correct!`);
            u.lang = "en-US";
            u.rate = 0.9;
            window.speechSynthesis.speak(u);
          } catch {}
          onCorrect();
        } else {
          try {
            const feedbackText = coachResult.feedback[0] || `Try the letter ${alphabetEntry.letter} again.`;
            const u = new SpeechSynthesisUtterance(feedbackText);
            u.lang = "en-US";
            u.rate = 0.9;
            window.speechSynthesis.speak(u);
          } catch {}
        }
        return;
      }

      // WORD / SENTENCE MODE
      const word = "word" in currentItem ? currentItem.word : "";
      const expectedGesture = getExpectedGesture(word);

      if (expectedGesture && lastAnalysis) {
        const gestureResult = validateWordGesture(
          lastAnalysis.fingers,
          lastAnalysis.fingerSpread,
          lastAnalysis.fistRatio,
          expectedGesture
        );
        staticScore = gestureResult.score;
        staticFeedback = gestureResult.feedback;
      } else if (lastAnalysis) {
        const f = lastAnalysis.fingers;
        const extended = [f.thumb, f.index, f.middle, f.ring, f.pinky].filter(Boolean).length;
        staticScore = 30 + extended * 8;
        staticFeedback = staticScore >= 60
          ? [`Good hand position for "${word}"!`]
          : [`Try the sign again. Hint: ${(currentItem as WordEntry)?.tips?.[0] || "Show your hand clearly"}`];
      }

      // Combine with motion validation
      const motionResult = validateWithMotion(
        staticScore,
        staticFeedback,
        motionAnalysis,
        word
      );

      const coachResult: CoachResult = {
        score: motionResult.score,
        isCorrect: motionResult.isCorrect,
        feedback: motionResult.feedback,
        motionType: motionResult.motionType,
      };

      setResult(coachResult);
      setMode("result");
      modeRef.current = "result";

      // Speak result
      if (coachResult.isCorrect) {
        try {
          const u = new SpeechSynthesisUtterance("Correct! Great job!");
          u.lang = "en-US";
          u.rate = 0.9;
          window.speechSynthesis.speak(u);
        } catch {}
        onCorrect();
      } else {
        // Speak the first feedback item
        try {
          const feedbackText = coachResult.feedback[0] || "Not quite right. Try again.";
          const u = new SpeechSynthesisUtterance(feedbackText);
          u.lang = "en-US";
          u.rate = 0.9;
          window.speechSynthesis.speak(u);
        } catch {}
      }
    }, 500);
  }, [motionTracker, currentItem, onCorrect]);

  // Reset to try again
  const resetCoach = useCallback(() => {
    setMode("idle");
    setResult(null);
    setLiveFeedback([]);
    setRecordingTime(0);
    setHandShapeScore(0);
    analysisHistoryRef.current = [];
  }, []);

  const recordingProgress = Math.min(100, (recordingTime / RECORDING_DURATION_MS) * 100);

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {/* IDLE STATE — Show start button */}
        {mode === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <button
              onClick={startRecording}
              disabled={!handDetected}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                handDetected
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/25 active:scale-95"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Mic className="w-5 h-5" />
              {handDetected ? "Start Signing — I'll Watch You" : "Show Your Hand First"}
            </button>
          </motion.div>
        )}

        {/* RECORDING STATE — Live feedback while recording */}
        {mode === "recording" && (
          <motion.div
            key="recording"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-3"
          >
            {/* Recording progress bar */}
            <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
                animate={{ width: `${recordingProgress}%` }}
                transition={{ duration: 0.1 }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            </div>

            {/* Recording indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 font-semibold text-sm">
                  RECORDING — {(RECORDING_DURATION_MS - recordingTime) / 1000}s left
                </span>
              </div>
              <button
                onClick={() => {
                  if (timerRef.current) clearInterval(timerRef.current);
                  analyzeRecording();
                }}
                className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-lg hover:bg-gray-600 transition-all"
              >
                Stop & Check
              </button>
            </div>

            {/* Live feedback cards */}
            <div className="space-y-2">
              {liveFeedback.map((fb, i) => (
                <motion.div
                  key={fb}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium ${
                    fb.startsWith("✅")
                      ? "bg-emerald-900/50 text-emerald-300 border border-emerald-700/50"
                      : fb.startsWith("👀") || fb.startsWith("🙌")
                      ? "bg-amber-900/50 text-amber-300 border border-amber-700/50"
                      : "bg-blue-900/50 text-blue-300 border border-blue-700/50"
                  }`}
                >
                  {fb}
                </motion.div>
              ))}
            </div>

            {/* Live hand shape score */}
            {handShapeScore > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      handShapeScore >= 70 ? "bg-emerald-500" : handShapeScore >= 50 ? "bg-amber-500" : "bg-red-500"
                    }`}
                    animate={{ width: `${handShapeScore}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <span className="text-xs text-gray-400 font-mono">{handShapeScore}%</span>
              </div>
            )}
          </motion.div>
        )}

        {/* ANALYZING STATE — Processing animation */}
        {mode === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-6 text-center"
          >
            <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-violet-400 font-semibold">Analyzing your sign...</p>
          </motion.div>
        )}

        {/* RESULT STATE — Show result with option to retry */}
        {mode === "result" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-3"
          >
            {/* Score card */}
            <div
              className={`p-4 rounded-xl border ${
                result.isCorrect
                  ? "bg-emerald-900/30 border-emerald-600/50"
                  : "bg-red-900/30 border-red-600/50"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                {result.isCorrect ? (
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <X className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <p className={`font-bold text-lg ${result.isCorrect ? "text-emerald-300" : "text-red-300"}`}>
                    {result.isCorrect ? "Perfect! 🎉" : "Not quite right"}
                  </p>
                  <p className="text-gray-400 text-sm">Score: {result.score}%</p>
                </div>
              </div>

              {/* Feedback list */}
              <div className="mt-3 space-y-1.5">
                {result.feedback.map((fb, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-sm"
                  >
                    <span className="text-gray-500 mt-0.5">•</span>
                    <span className="text-gray-300">{fb}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={resetCoach}
                className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </button>
              {!result.isCorrect && (
                <button
                  onClick={() => {
                    try {
                      let word = "";
                      if ("letter" in currentItem && "commonMistakes" in currentItem) {
                        word = `Letter ${(currentItem as AlphabetEntry).letter}`;
                      } else if ("word" in currentItem) {
                        word = currentItem.word;
                      } else {
                        word = currentItem.sentence;
                      }
                      const u = new SpeechSynthesisUtterance(word);
                      u.lang = "en-US";
                      u.rate = 0.6;
                      window.speechSynthesis.speak(u);
                    } catch {}
                  }}
                  className="px-4 py-3 bg-gray-700 text-gray-300 font-semibold rounded-xl hover:bg-gray-600 transition-all flex items-center gap-2"
                >
                  <Volume2 className="w-4 h-4" />
                  Hear it
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
