"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Camera,
  VideoOff,
  Trophy,
  Timer,
  Zap,
  Check,
  X,
  RotateCcw,
  Star,
  Volume2,
  Eye,
  Loader2,
  Languages,
} from "lucide-react";
import { analyzeGesture, GestureAnalysis, Landmark } from "@/lib/gesture-detection";
import {
  useCamera,
  CameraLoadingSpinner,
  CameraError,
  CameraStatusBadge,
  StopCameraButton,
} from "@/hooks/useCamera";
import {
  getExpectedGesture,
  classifyGesture,
  validateWordGesture,
  ExpectedGesture,
} from "@/lib/word-gesture-map";
import { saveQuizResult, addXP, addStreak, loadProgress } from "@/lib/persistence";
import { MotionTracker, validateWithMotion, MotionType } from "@/lib/motion-tracking";
import { ISL_WORDS, ALL_ISL_WORDS, ISLWordEntry, checkISLLetter } from "@/lib/isl-patterns";

// ===== ASL Quiz Words =====
const ASL_QUIZ_WORDS = [
  { word: "Hello", difficulty: 1, hint: "Open palm facing forward, wave side to side" },
  { word: "Yes", difficulty: 1, hint: "Make a fist and nod it up and down" },
  { word: "No", difficulty: 1, hint: "Index and middle finger snap down against thumb" },
  { word: "Please", difficulty: 1, hint: "Flat palm on chest, rub in circles" },
  { word: "Sorry", difficulty: 1, hint: "Closed fist rubbing in circles on chest" },
  { word: "Good", difficulty: 1, hint: "Flat hand from chin, moving forward" },
  { word: "Help", difficulty: 2, hint: "Fist resting on flat palm, lift upward" },
  { word: "Water", difficulty: 2, hint: "W-handshape (3 fingers up) tapping chin" },
  { word: "Friend", difficulty: 2, hint: "Index fingers hooking together" },
  { word: "Love", difficulty: 2, hint: "Crossed fists over chest" },
  { word: "Bad", difficulty: 2, hint: "Flat hand from chin, flip palm down sharply" },
  { word: "Family", difficulty: 3, hint: "F-hands circling outward from center" },
  { word: "School", difficulty: 2, hint: "Clap then sweep hands apart" },
  { word: "Learn", difficulty: 2, hint: "Take info from palm to forehead" },
  { word: "Time", difficulty: 2, hint: "Tap your wrist where a watch would be" },
  { word: "Eat", difficulty: 1, hint: "Bunched fingertips tap mouth" },
  { word: "Drink", difficulty: 1, hint: "C-handshape brought to mouth" },
  { word: "Want", difficulty: 2, hint: "Claw hands pulling toward you" },
  { word: "Play", difficulty: 2, hint: "Y-hands (thumb + pinky) twisting back and forth" },
  { word: "Thank You", difficulty: 1, hint: "Flat hand, touch chin then move forward" },
];

// ===== ISL Quiz Words =====
const ISL_QUIZ_WORDS = [
  // Greetings
  { word: "Namaste", difficulty: 1, hindi: "नमस्ते", hint: "Press both palms together in prayer position" },
  { word: "Good Morning", difficulty: 1, hindi: "सुप्रभात", hint: "Flat hand forward (good), then arc rising (morning)" },
  { word: "Good Night", difficulty: 1, hindi: "शुभ रात्रि", hint: "Flat hand forward (good), then hands sweep down" },
  { word: "How are you", difficulty: 2, hindi: "आप कैसे हैं", hint: "Two fingers moving from chest outward with question" },
  // Polite
  { word: "Thank You", difficulty: 1, hindi: "धन्यवाद", hint: "Fingertips touch chin, move forward" },
  { word: "Please", difficulty: 1, hindi: "कृपया", hint: "Flat palm on chest, rub in circles" },
  { word: "Sorry", difficulty: 1, hindi: "माफ़ कीजिए", hint: "Closed fist rubbing in circles on chest" },
  // Essential
  { word: "Yes", difficulty: 1, hindi: "हाँ", hint: "Closed fist nodding up and down" },
  { word: "No", difficulty: 1, hindi: "नहीं", hint: "Index and middle finger snap down against thumb" },
  { word: "Help", difficulty: 2, hindi: "मदद", hint: "Fist resting on flat palm, lift upward" },
  // Family
  { word: "Mother", difficulty: 2, hindi: "माँ", hint: "Thumb taps chin repeatedly" },
  { word: "Father", difficulty: 2, hindi: "पापा", hint: "Thumb taps forehead repeatedly" },
  { word: "Brother", difficulty: 2, hindi: "भाई", hint: "Index and thumb touch forehead, then extend" },
  { word: "Sister", difficulty: 2, hindi: "बहन", hint: "Index and thumb touch chin, then extend" },
  { word: "Family", difficulty: 3, hindi: "परिवार", hint: "F-hands circle outward from center" },
  { word: "Friend", difficulty: 2, hindi: "दोस्त", hint: "Index fingers hook together" },
  // Food
  { word: "Rice", difficulty: 1, hindi: "चावल", hint: "Bunched fingertips tap mouth" },
  { word: "Water", difficulty: 1, hindi: "पानी", hint: "W-handshape tapping chin" },
  { word: "Eat", difficulty: 1, hindi: "खाना", hint: "Bunched fingertips tap mouth repeatedly" },
  { word: "Drink", difficulty: 1, hindi: "पीना", hint: "C-handshape brought to mouth" },
  { word: "Milk", difficulty: 2, hindi: "दूध", hint: "Squeezing motion like milking a cow" },
  // Emotions
  { word: "Happy", difficulty: 2, hindi: "खुश", hint: "Flat hands brushing upward on chest" },
  { word: "Sad", difficulty: 2, hindi: "उदास", hint: "Flat hands brushing downward on chest" },
  { word: "Love", difficulty: 2, hindi: "प्यार", hint: "Crossed fists over chest" },
  { word: "Angry", difficulty: 3, hindi: "गुस्सा", hint: "Claw hands moving up from stomach" },
  // Actions
  { word: "Come", difficulty: 1, hindi: "आओ", hint: "Fingers curl inward toward yourself" },
  { word: "Go", difficulty: 1, hindi: "जाओ", hint: "Hand pushes away from body" },
  { word: "Stop", difficulty: 1, hindi: "रुको", hint: "Flat hand held up, palm facing forward" },
  { word: "Name", difficulty: 2, hindi: "नाम", hint: "Tap index and middle fingers of both hands together" },
  // Places
  { word: "School", difficulty: 2, hindi: "विद्यालय", hint: "Clap then sweep hands apart" },
  { word: "Home", difficulty: 2, hindi: "घर", hint: "Fingertips touch forming a roof shape" },
  { word: "Hospital", difficulty: 3, hindi: "अस्पताल", hint: "H handshape drawing cross on upper arm" },
];

type Language = "asl" | "isl";

interface QuizState {
  score: number;
  streak: number;
  bestStreak: number;
  totalQuestions: number;
  correct: number;
  currentIndex: number;
  timeLeft: number;
  isRunning: boolean;
  showResult: boolean;
  lastCorrect: boolean;
}

export default function QuizPage() {
  const [language, setLanguage] = useState<Language>("asl");
  const [quiz, setQuiz] = useState<QuizState>({
    score: 0,
    streak: 0,
    bestStreak: 0,
    totalQuestions: 10,
    correct: 0,
    currentIndex: 0,
    timeLeft: 15,
    isRunning: false,
    showResult: false,
    lastCorrect: false,
  });

  const [currentWord, setCurrentWord] = useState("");
  const [currentExpected, setCurrentExpected] = useState<ExpectedGesture | null>(null);
  const [currentISLWord, setCurrentISLWord] = useState<ISLWordEntry | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [difficulty, setDifficulty] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  const [detectedGestureName, setDetectedGestureName] = useState("");
  const [feedbackResult, setFeedbackResult] = useState<{
    score: number;
    isCorrect: boolean;
    feedback: string[];
  } | null>(null);

  const {
    status: cameraStatus,
    errorMessage: cameraError,
    handDetected,
    analysis: cameraAnalysis,
    startCamera: startCameraRaw,
    stopCamera: stopCameraRaw,
    videoRef,
    canvasRef,
    isActive: cameraActive,
  } = useCamera();
  const [currentAnalysis, setCurrentAnalysis] = useState<GestureAnalysis | null>(null);
  const [liveStatus, setLiveStatus] = useState<string[]>([]);
  const [autoScore, setAutoScore] = useState(0);
  const autoSubmitCooldownRef = useRef(false);
  const submitAnswerRef = useRef<() => void>(() => {});
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const motionTrackerRef = useRef(new MotionTracker());

  // Sync camera analysis to local state
  useEffect(() => {
    setCurrentAnalysis(cameraAnalysis);
    if (cameraAnalysis) {
      const gestureName = classifyGesture(
        cameraAnalysis.fingers,
        cameraAnalysis.fingerSpread,
        cameraAnalysis.fistRatio
      );
      setDetectedGestureName(gestureName);
      motionTrackerRef.current.addFrame(cameraAnalysis.rawLandmarks);
    } else {
      setDetectedGestureName("");
    }
  }, [cameraAnalysis]);

  // Stability tracking for auto-submit
  const stableScoreRef = useRef(0);
  const stableFramesRef = useRef(0);

  // ===== CONTINUOUS AUTO-DETECTION =====
  // Runs on every camera analysis frame — checks gesture and auto-submits
  useEffect(() => {
    if (!quiz.isRunning || quiz.showResult || gameOver || !cameraActive) return;
    if (!cameraAnalysis || !handDetected) {
      setLiveStatus(["👀 Show your hand to the camera"]);
      setAutoScore(0);
      stableScoreRef.current = 0;
      stableFramesRef.current = 0;
      return;
    }
    if (autoSubmitCooldownRef.current) return;

    // Evaluate gesture from current camera analysis
    const newStatus: string[] = [];
    let gestureScore = 0;

    if (language === "isl" && currentISLWord) {
      const f = cameraAnalysis.fingers;
      const expected = currentISLWord.fingers;
      let correct = 0;
      let wrongFingers = 0;
      const fingerNames: (keyof typeof f)[] = ["thumb", "index", "middle", "ring", "pinky"];

      for (const fn of fingerNames) {
        if (f[fn] === expected[fn]) correct++;
        else wrongFingers++;
      }
      gestureScore = Math.round((correct / 5) * 100);

      if (gestureScore >= 70) newStatus.push("✅ ISL gesture looks good!");
      else if (wrongFingers > 0) newStatus.push(`Fix ${wrongFingers} finger${wrongFingers > 1 ? "s" : ""}`);
    } else if (currentExpected) {
      const gestureResult = validateWordGesture(
        cameraAnalysis.fingers,
        cameraAnalysis.fingerSpread,
        cameraAnalysis.fistRatio,
        currentExpected
      );
      gestureScore = gestureResult.score;

      if (gestureScore >= 65) newStatus.push("✅ Gesture looks good!");
      else {
        const tips = gestureResult.feedback.filter((fb) => fb.includes("EXTENDED") || fb.includes("CURLED") || fb.includes("SPREAD")).slice(0, 1);
        if (tips.length) newStatus.push("Fix: " + tips[0]);
        else newStatus.push(`Score: ${gestureScore}% — adjust your hand`);
      }
    }

    setLiveStatus(newStatus);
    setAutoScore(gestureScore);

    // Stability check — require gesture above threshold for 2+ frames before auto-submit
    if (gestureScore >= 65) {
      if (gestureScore === stableScoreRef.current || Math.abs(gestureScore - stableScoreRef.current) < 10) {
        stableFramesRef.current++;
      } else {
        stableFramesRef.current = 1;
        stableScoreRef.current = gestureScore;
      }

      // Auto-submit after 2 stable frames above threshold
      if (stableFramesRef.current >= 2 && gestureScore >= 65 && !autoSubmitCooldownRef.current) {
        autoSubmitCooldownRef.current = true;
        stableFramesRef.current = 0;
        stableScoreRef.current = 0;
        setTimeout(() => {
          submitAnswerRef.current();
          setTimeout(() => { autoSubmitCooldownRef.current = false; }, 3000);
        }, 400);
      }
    } else {
      stableFramesRef.current = 0;
      stableScoreRef.current = 0;
    }
  }, [cameraAnalysis, handDetected, quiz.isRunning, quiz.showResult, gameOver, cameraActive, language, currentExpected, currentISLWord]);

  // Get current quiz word list based on language
  const getQuizWordList = useCallback(() => {
    return language === "isl" ? ISL_QUIZ_WORDS : ASL_QUIZ_WORDS;
  }, [language]);

  const getRandomWord = useCallback(() => {
    const wordList = getQuizWordList();
    const available = wordList.filter((w) => w.difficulty <= difficulty);
    return available[Math.floor(Math.random() * available.length)];
  }, [difficulty, getQuizWordList]);

  const nextQuestion = useCallback(() => {
    const word = getRandomWord();
    setCurrentWord(word.word);

    if (language === "isl") {
      const islEntry = ALL_ISL_WORDS.find((w) => w.word === word.word);
      setCurrentISLWord(islEntry || null);
      setCurrentExpected(null);
    } else {
      setCurrentExpected(getExpectedGesture(word.word));
      setCurrentISLWord(null);
    }

    setShowHint(false);
    setFeedbackResult(null);
    setDetectedGestureName("");
    setLiveStatus([]);
    setAutoScore(0);
    motionTrackerRef.current.reset();
    setQuiz((prev) => ({ ...prev, timeLeft: 15, showResult: false }));

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setQuiz((prev) => {
        if (prev.timeLeft <= 1) {
          clearInterval(timerRef.current!);
          return {
            ...prev,
            timeLeft: 0,
            showResult: true,
            lastCorrect: false,
            currentIndex: prev.currentIndex + 1,
            streak: 0,
          };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  }, [getRandomWord, language]);

  // Auto-start camera when game starts (after DOM commit)
  useEffect(() => {
    if (quiz.isRunning && !gameOver && !cameraActive && cameraStatus === "idle") {
      const timer = setTimeout(() => {
        startCameraRaw();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [quiz.isRunning, gameOver, cameraActive, cameraStatus, startCameraRaw]);

  const startGame = useCallback(async () => {
    setGameOver(false);
    setFeedbackResult(null);
    motionTrackerRef.current.reset();
    setQuiz({
      score: 0,
      streak: 0,
      bestStreak: 0,
      totalQuestions: 10,
      correct: 0,
      currentIndex: 0,
      timeLeft: 15,
      isRunning: true,
      showResult: false,
      lastCorrect: false,
    });
    const word = getRandomWord();
    setCurrentWord(word.word);

    if (language === "isl") {
      const islEntry = ALL_ISL_WORDS.find((w) => w.word === word.word);
      setCurrentISLWord(islEntry || null);
      setCurrentExpected(null);
    } else {
      setCurrentExpected(getExpectedGesture(word.word));
      setCurrentISLWord(null);
    }

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setQuiz((prev) => {
        if (prev.timeLeft <= 1) {
          clearInterval(timerRef.current!);
          return {
            ...prev,
            timeLeft: 0,
            showResult: true,
            lastCorrect: false,
            currentIndex: prev.currentIndex + 1,
            streak: 0,
          };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  }, [cameraActive, startCameraRaw, getRandomWord, language]);

  // Auto-advance after showing result
  useEffect(() => {
    if (quiz.showResult) {
      if (quiz.currentIndex >= quiz.totalQuestions) {
        setTimeout(() => {
          setGameOver(true);
          if (timerRef.current) clearInterval(timerRef.current);
        }, 2000);
      } else {
        const timeout = setTimeout(() => nextQuestion(), 2000);
        return () => clearTimeout(timeout);
      }
    }
  }, [quiz.showResult, quiz.currentIndex, quiz.totalQuestions, nextQuestion]);

  // Submit answer with gesture validation (ASL or ISL)
  const submitAnswer = useCallback(() => {
    if (!currentAnalysis || !handDetected || quiz.showResult) return;

    let result = { score: 0, isCorrect: false, feedback: [] as string[] };

    if (language === "isl") {
      // ===== ISL Validation =====
      if (currentISLWord) {
        const f = currentAnalysis.fingers;
        const expected = currentISLWord.fingers;
        let correct = 0;
        const total = 5;
        const feedback: string[] = [];
        const fingerNames: (keyof typeof f)[] = ["thumb", "index", "middle", "ring", "pinky"];
        let wrongFingers = 0;

        for (const fn of fingerNames) {
          if (f[fn] === expected[fn]) {
            correct++;
          } else {
            wrongFingers++;
            const label = fn.charAt(0).toUpperCase() + fn.slice(1);
            if (expected[fn]) {
              feedback.push(`${label} finger should be EXTENDED`);
            } else {
              feedback.push(`${label} finger should be CURLED`);
            }
          }
        }

        // Check spread
        if (currentISLWord.minSpread !== undefined || currentISLWord.maxSpread !== undefined) {
          if (currentISLWord.minSpread !== undefined && currentAnalysis.fingerSpread < currentISLWord.minSpread) {
            feedback.push("Spread your fingers MORE apart");
          } else if (currentISLWord.maxSpread !== undefined && currentAnalysis.fingerSpread > currentISLWord.maxSpread) {
            feedback.push("Keep your fingers CLOSER together");
          } else {
            correct++;
          }
        }

        // Check fist ratio
        if (currentISLWord.minFistRatio !== undefined) {
          if (currentAnalysis.fistRatio < currentISLWord.minFistRatio) {
            feedback.push("Make a TIGHTER fist");
          } else {
            correct++;
          }
        }

        const totalChecks = total + ((currentISLWord.minSpread !== undefined || currentISLWord.maxSpread !== undefined) ? 1 : 0) + (currentISLWord.minFistRatio !== undefined ? 1 : 0);
        const score = Math.round((correct / totalChecks) * 100);
        const isCorrect = score >= 65 && wrongFingers <= 2;

        if (isCorrect) {
          result = {
            score,
            isCorrect: true,
            feedback: [`Great job! You signed "${currentISLWord.word}" (${currentISLWord.hindi}) correctly! 🎉`],
          };
        } else {
          result = { score, isCorrect: false, feedback };
        }

        // Add ISL-specific tips
        if (!isCorrect) {
          result.feedback.push(`ISL tip: ${currentISLWord.description}`);
          currentISLWord.steps.forEach((step, i) => {
            result.feedback.push(`${i + 1}. ${step}`);
          });
        }
      }
    } else {
      // ===== ASL Validation =====
      if (!currentExpected) return;

      const expected = currentExpected;
      const detected = currentAnalysis;
      let totalChecks = 0;
      let passedChecks = 0;
      const feedback: string[] = [];
      let wrongFingers = 0;
      const fingerNames = ["thumb", "index", "middle", "ring", "pinky"] as const;

      for (const finger of fingerNames) {
        totalChecks++;
        const expectedVal = expected.fingers[finger];
        const actualVal = detected.fingers[finger];
        if (expectedVal === actualVal) {
          passedChecks++;
        } else {
          wrongFingers++;
          const label = finger.charAt(0).toUpperCase() + finger.slice(1);
          if (expectedVal) {
            feedback.push(`${label} finger should be EXTENDED — try straightening it`);
          } else {
            feedback.push(`${label} finger should be CURLED — close it into your palm`);
          }
        }
      }

      if (expected.minSpread !== undefined || expected.maxSpread !== undefined) {
        totalChecks++;
        if (expected.minSpread !== undefined && detected.fingerSpread < expected.minSpread) {
          feedback.push("Spread your fingers MORE apart");
        } else if (expected.maxSpread !== undefined && detected.fingerSpread > expected.maxSpread) {
          feedback.push("Keep your fingers CLOSER together");
        } else {
          passedChecks++;
        }
      }

      if (expected.minFistRatio !== undefined) {
        totalChecks++;
        if (detected.fistRatio < expected.minFistRatio) {
          feedback.push("Make a TIGHTER fist — curl your fingers more");
        } else {
          passedChecks++;
        }
      }

      const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 50;
      const isCorrect = score >= 65 && wrongFingers <= 2;

      if (isCorrect) {
        result = {
          score,
          isCorrect: true,
          feedback: [`Great job! You signed "${expected.word}" correctly! 🎉`],
        };
      } else {
        result = { score, isCorrect: false, feedback };
        if (feedback.length === 0) {
          result.feedback.push("Close! Check the finger positions shown above.");
          expected.feedbackTips.forEach((tip) => result.feedback.push(`💡 ${tip}`));
        }
      }
    }

    // Get motion analysis
    const motionAnalysis = motionTrackerRef.current.getAnalysis();

    // Combine static + motion validation
    const motionResult = validateWithMotion(
      result.score,
      result.feedback,
      motionAnalysis,
      currentWord
    );

    setFeedbackResult({
      score: motionResult.score,
      isCorrect: motionResult.isCorrect,
      feedback: motionResult.feedback,
    });

    const isCorrectFinal = motionResult.isCorrect;

    setQuiz((prev) => {
      const newStreak = isCorrectFinal ? prev.streak + 1 : 0;
      const newScore = isCorrectFinal
        ? prev.score + newStreak * 10 + Math.max(0, 15 - prev.timeLeft)
        : prev.score;

      saveQuizResult({
        word: currentWord,
        correct: isCorrectFinal,
        score: isCorrectFinal ? 10 + Math.max(0, 15 - prev.timeLeft) : 0,
        difficulty: difficulty,
        timestamp: Date.now(),
      });
      if (isCorrectFinal) {
        addXP(10 + Math.max(0, 15 - prev.timeLeft));
      }
      if (newStreak > 0) {
        addStreak(newStreak);
      }

      return {
        ...prev,
        showResult: true,
        lastCorrect: isCorrectFinal,
        currentIndex: prev.currentIndex + 1,
        correct: isCorrectFinal ? prev.correct + 1 : prev.correct,
        score: newScore,
        streak: newStreak,
        bestStreak: isCorrectFinal ? Math.max(prev.bestStreak, newStreak) : prev.bestStreak,
      };
    });
    if (timerRef.current) clearInterval(timerRef.current);
  }, [currentAnalysis, handDetected, quiz.showResult, currentExpected, currentISLWord, language, currentWord, difficulty]);

  // Keep ref in sync for auto-detection effect
  useEffect(() => {
    submitAnswerRef.current = submitAnswer;
  }, [submitAnswer]);

  const speakWord = useCallback(() => {
    const u = new SpeechSynthesisUtterance(currentWord);
    u.lang = language === "isl" ? "hi-IN" : "en-US";
    u.rate = 0.8;
    window.speechSynthesis.speak(u);
  }, [currentWord, language]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopCameraRaw();
    };
  }, [stopCameraRaw]);

  // Current hint
  const currentHint = language === "isl"
    ? ISL_QUIZ_WORDS.find((w) => w.word === currentWord)?.hint
    : ASL_QUIZ_WORDS.find((w) => w.word === currentWord)?.hint;

  const wordList = language === "isl" ? ISL_QUIZ_WORDS : ASL_QUIZ_WORDS;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${language === "isl" ? "from-orange-500 to-amber-600" : "from-pink-500 to-rose-600"} flex items-center justify-center mx-auto mb-4 shadow-xl ${language === "isl" ? "shadow-orange-500/25" : "shadow-pink-500/25"}`}>
            {language === "isl" ? <Languages className="w-8 h-8 text-white" /> : <Target className="w-8 h-8 text-white" />}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-gray-900 dark:text-white">
            Quiz <span className={`bg-gradient-to-r ${language === "isl" ? "from-orange-500 to-amber-600" : "from-pink-500 to-rose-600"} bg-clip-text text-transparent`}>
              {language === "isl" ? "ISL Challenge" : "Challenge"}
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {language === "isl"
              ? "Test your Indian Sign Language skills — sign the Hindi word, get scored by AI."
              : "See the word. Sign it. Get scored by AI in real-time."}
          </p>
        </div>

        {/* Language Selector — always visible */}
        {!quiz.isRunning && !gameOver && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-8">
            <div className="text-center mb-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Choose Sign Language</h3>
              <p className="text-sm text-gray-500">Select ASL (American) or ISL (Indian) for the quiz</p>
            </div>
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => setLanguage("asl")}
                className={`flex-1 max-w-xs p-4 rounded-xl border-2 transition-all ${
                  language === "asl"
                    ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20 shadow-lg shadow-pink-500/10"
                    : "border-gray-200 dark:border-gray-700 hover:border-pink-300"
                }`}
              >
                <span className="text-3xl block mb-2">🤟</span>
                <span className="font-bold text-gray-900 dark:text-white block">ASL</span>
                <span className="text-xs text-gray-500">American Sign Language</span>
              </button>
              <button
                onClick={() => setLanguage("isl")}
                className={`flex-1 max-w-xs p-4 rounded-xl border-2 transition-all ${
                  language === "isl"
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-lg shadow-orange-500/10"
                    : "border-gray-200 dark:border-gray-700 hover:border-orange-300"
                }`}
              >
                <span className="text-3xl block mb-2">🇮🇳</span>
                <span className="font-bold text-gray-900 dark:text-white block">ISL</span>
                <span className="text-xs text-gray-500">Indian Sign Language</span>
              </button>
            </div>

            {/* Difficulty Selector */}
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-center">Select Difficulty</h3>
            <div className="flex justify-center gap-3 mb-6">
              {[
                { level: 1, label: "Easy", desc: "Basic words", icon: "🌱" },
                { level: 2, label: "Medium", desc: "Common phrases", icon: "🔥" },
                { level: 3, label: "Hard", desc: "All words", icon: "💎" },
              ].map((d) => (
                <button
                  key={d.level}
                  onClick={() => setDifficulty(d.level)}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                    difficulty === d.level ? "tab-active" : "tab-inactive"
                  }`}
                >
                  <div>{d.icon} {d.label}</div>
                  <div className="text-xs opacity-70">{d.desc}</div>
                </button>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={startGame}
                className={`px-8 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 flex items-center gap-2 mx-auto ${
                  language === "isl"
                    ? "bg-gradient-to-r from-orange-500 to-amber-600 shadow-orange-500/25"
                    : "bg-gradient-to-r from-pink-500 to-rose-600 shadow-pink-500/25"
                }`}
              >
                <Zap className="w-5 h-5" />
                Start {language === "isl" ? "ISL" : "ASL"} Quiz (10 Questions)
              </button>
            </div>
          </motion.div>
        )}

        {/* Game Over */}
        {gameOver && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 text-center">
            <div className="text-6xl mb-4">{quiz.correct >= 8 ? "🏆" : quiz.correct >= 5 ? "⭐" : "💪"}</div>
            <h2 className="text-3xl font-extrabold mb-2">
              {language === "isl" ? "ISL" : "ASL"} Quiz Complete!
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
              {[
                { label: "Score", value: quiz.score, icon: Trophy },
                { label: "Correct", value: `${quiz.correct}/${quiz.totalQuestions}`, icon: Check },
                { label: "Best Streak", value: quiz.bestStreak, icon: Zap },
                { label: "Accuracy", value: `${Math.round((quiz.correct / quiz.totalQuestions) * 100)}%`, icon: Star },
              ].map((s) => (
                <div key={s.label} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <s.icon className="w-5 h-5 text-violet-500 mx-auto mb-1" />
                  <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={startGame}
                className={`px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
                  language === "isl"
                    ? "bg-gradient-to-r from-orange-500 to-amber-600 shadow-orange-500/25"
                    : "bg-gradient-to-r from-pink-500 to-rose-600 shadow-pink-500/25"
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </button>
            </div>
          </motion.div>
        )}

        {/* Active Game — camera always in DOM when game is running */}
        {quiz.isRunning && !gameOver && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Camera — always renders so videoRef is never null */}
            <div className="glass-card p-6">
              <div className="camera-feed bg-gray-900 relative mb-4">
                <video ref={videoRef} className="w-full" autoPlay playsInline muted style={{ minHeight: 240 }} />
                <canvas ref={canvasRef} className={`w-full absolute inset-0 ${cameraActive && handDetected ? "" : "hidden"}`} />
                {!cameraActive && cameraStatus === "idle" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90">
                    <div className="text-center">
                      <Camera className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm mb-3">Enable your camera for the {language === "isl" ? "ISL" : "ASL"} quiz</p>
                      <button onClick={startCameraRaw} className="btn-primary flex items-center gap-2 mx-auto">
                        <Camera className="w-5 h-5" /> Enable Camera
                      </button>
                    </div>
                  </div>
                )}
                {cameraStatus === "loading" && <CameraLoadingSpinner message={`Loading AI model for ${language === "isl" ? "ISL" : "ASL"} quiz...`} />}
                {cameraStatus === "error" || cameraStatus === "no-permission" ? (
                  <CameraError message={cameraError} onRetry={startCameraRaw} />
                ) : null}
                {cameraActive && (
                  <>
                    <CameraStatusBadge status={cameraStatus} handDetected={handDetected} />
                    {detectedGestureName && (
                      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 text-white text-sm">
                        Detected: <span className="font-semibold text-emerald-400">{detectedGestureName.replace("_", " ")}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {cameraActive && (
                <div className="mb-3">
                  <StopCameraButton onClick={stopCameraRaw} />
                </div>
              )}
              {cameraActive && cameraError && (
                <div className="mb-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-amber-700 dark:text-amber-300">{cameraError}</p>
                </div>
              )}

              {/* Expected vs Detected */}
              {(currentExpected || currentISLWord) && handDetected && !quiz.showResult && (
                <div className="mb-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-gray-500">Expected: </span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {language === "isl" && currentISLWord
                          ? `${currentISLWord.word} (${currentISLWord.hindi})`
                          : currentExpected?.gestureName.replace("_", " ")}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Detected: </span>
                      <span className={`font-semibold ${
                        detectedGestureName === (currentExpected?.gestureName || "")
                          ? "text-emerald-600"
                          : "text-amber-600"
                      }`}>
                        {detectedGestureName || "..."}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {language === "isl" && currentISLWord
                      ? currentISLWord.description
                      : currentExpected?.description}
                  </p>
                </div>
              )}

              {/* Live Auto-Detection Status */}
              {quiz.isRunning && !quiz.showResult && (
                <div className="space-y-2">
                  {/* Live status messages */}
                  {liveStatus.length > 0 ? (
                    <div className="space-y-1.5">
                      {liveStatus.map((status, i) => (
                        <div key={i} className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                          status.startsWith("✅")
                            ? "bg-emerald-900/50 text-emerald-300 border border-emerald-700/50"
                            : "bg-blue-900/50 text-blue-300 border border-blue-700/50"
                        }`}>
                          {status}
                        </div>
                      ))}
                    </div>
                  ) : handDetected ? (
                    <div className="px-3 py-2 rounded-lg text-sm font-medium bg-amber-900/50 text-amber-300 border border-amber-700/50 flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                      Watching for your sign...
                    </div>
                  ) : (
                    <div className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-400 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Show your hand to the camera
                    </div>
                  )}

                  {/* Auto-score progress bar */}
                  {autoScore > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            autoScore >= 70 ? "bg-emerald-500" : autoScore >= 50 ? "bg-amber-500" : "bg-red-500"
                          }`}
                          style={{ width: `${autoScore}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 font-mono">{autoScore}%</span>
                    </div>
                  )}
                </div>
              )}

              {/* Feedback */}
              <AnimatePresence>
                {feedbackResult && quiz.showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`mt-4 p-4 rounded-xl border ${
                      feedbackResult.isCorrect
                        ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                        : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{feedbackResult.isCorrect ? "🎉" : "🤔"}</span>
                      <div>
                        <p className={`font-bold ${feedbackResult.isCorrect ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}`}>
                          {feedbackResult.isCorrect ? "Correct!" : "Not quite"}
                        </p>
                        <p className="text-xs text-gray-500">Score: {feedbackResult.score}%</p>
                      </div>
                    </div>
                    <ul className="space-y-1">
                      {feedbackResult.feedback.map((fb, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <span className={feedbackResult.isCorrect ? "text-emerald-500" : "text-red-500"}>
                            {feedbackResult.isCorrect ? "✓" : "→"}
                          </span>
                          {fb}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Score + Challenge */}
            <div className="space-y-6">
              {/* Score Bar */}
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{quiz.score}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${language === "isl" ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30" : "bg-pink-100 text-pink-600 dark:bg-pink-900/30"}`}>
                      {language === "isl" ? "🇮🇳 ISL" : "🤟 ASL"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className={`w-5 h-5 ${quiz.timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-gray-400"}`} />
                    <span className={`text-xl font-bold ${quiz.timeLeft <= 5 ? "text-red-500" : "text-gray-600 dark:text-gray-300"}`}>
                      {quiz.timeLeft}s
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-violet-500" />
                    <span className="font-bold text-violet-600">x{quiz.streak}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`bg-gradient-to-r h-2 rounded-full transition-all duration-1000 ${language === "isl" ? "from-orange-500 to-amber-500" : "from-pink-500 to-rose-500"}`}
                    style={{ width: `${(quiz.currentIndex / quiz.totalQuestions) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-400">
                  <span>Q{quiz.currentIndex + 1} / {quiz.totalQuestions}</span>
                  <span>{quiz.correct} correct</span>
                </div>
              </div>

              {/* Current Challenge */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentWord + quiz.currentIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="glass-card p-8 text-center"
                >
                  {quiz.showResult ? (
                    <div>
                      <div className="text-5xl mb-3">{quiz.lastCorrect ? "✅" : "❌"}</div>
                      <h3 className={`text-2xl font-extrabold ${quiz.lastCorrect ? "text-green-600" : "text-red-600"}`}>
                        {quiz.lastCorrect ? "Correct!" : "Not Quite!"}
                      </h3>
                      <p className="text-gray-500 mt-2">
                        The word was: <span className="font-bold">{currentWord}</span>
                      </p>
                      {language === "isl" && currentISLWord && (
                        <p className="text-sm text-gray-400 mt-1">
                          Hindi: <span className="font-semibold">{currentISLWord.hindi}</span>
                        </p>
                      )}
                      {currentExpected && (
                        <p className="text-sm text-gray-400 mt-1">
                          Expected gesture: <span className="font-semibold">{currentExpected.gestureName.replace("_", " ")}</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-400 mb-2 uppercase tracking-wider">
                        {language === "isl" ? "🇮🇳 Sign this ISL word:" : "Sign this word:"}
                      </p>
                      <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-1">{currentWord}</h3>
                      {language === "isl" && currentISLWord && (
                        <p className="text-lg text-orange-500 mb-2">{currentISLWord.hindi}</p>
                      )}
                      <button onClick={speakWord} className="flex items-center gap-1 text-sm text-violet-500 hover:text-violet-600 mx-auto mb-4">
                        <Volume2 className="w-4 h-4" /> Hear pronunciation
                      </button>

                      {/* Expected gesture hint */}
                      {(currentExpected || currentISLWord) && (
                        <div className="mb-4 p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 text-left">
                          <p className="text-xs font-semibold text-violet-700 dark:text-violet-300 mb-1">How to sign:</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {language === "isl" && currentISLWord
                              ? currentISLWord.description
                              : currentExpected?.description}
                          </p>
                          {currentExpected && (
                            <p className="text-xs text-violet-500 mt-1">
                              Target gesture: <span className="font-bold">{currentExpected.gestureName.replace("_", " ")}</span>
                            </p>
                          )}
                          {language === "isl" && currentISLWord && (
                            <p className="text-xs text-orange-500 mt-1">
                              {currentISLWord.steps[0]}
                            </p>
                          )}
                        </div>
                      )}

                      <button onClick={() => setShowHint(!showHint)} className="text-xs text-gray-400 hover:text-gray-600 underline">
                        {showHint ? "Hide hint" : "Show hint"}
                      </button>
                      {showHint && currentHint && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-violet-500 mt-2 italic">
                          {currentHint}
                        </motion.p>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
