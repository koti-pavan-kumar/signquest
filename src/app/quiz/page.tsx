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
  ExpectedGesture,
} from "@/lib/word-gesture-map";
import { saveQuizResult, addXP, addStreak, loadProgress } from "@/lib/persistence";
import { MotionTracker, validateWithMotion, MotionType } from "@/lib/motion-tracking";

const QUIZ_WORDS = [
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

  const getRandomWord = useCallback(() => {
    const available = QUIZ_WORDS.filter((w) => w.difficulty <= difficulty);
    return available[Math.floor(Math.random() * available.length)];
  }, [difficulty]);

  const nextQuestion = useCallback(() => {
    const word = getRandomWord();
    setCurrentWord(word.word);
    setCurrentExpected(getExpectedGesture(word.word));
    setShowHint(false);
    setFeedbackResult(null);
    setDetectedGestureName("");
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
  }, [getRandomWord]);

  const startGame = useCallback(async () => {
    if (!cameraActive) await startCameraRaw();
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
    setCurrentExpected(getExpectedGesture(word.word));

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
  }, [cameraActive, startCameraRaw, getRandomWord]);



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

  // Submit answer with PROPER gesture validation
  const submitAnswer = useCallback(() => {
    if (!currentAnalysis || !handDetected || quiz.showResult || !currentExpected) return;

    // Use the REAL gesture analysis from MediaPipe
    const result = {
      score: 0,
      isCorrect: false,
      feedback: [] as string[],
    };

    // Compare detected finger states against expected gesture
    const expected = currentExpected;
    const detected = currentAnalysis;

    let totalChecks = 0;
    let passedChecks = 0;
    const feedback: string[] = [];

    // Check each finger
    const fingerNames = ["thumb", "index", "middle", "ring", "pinky"] as const;
    let wrongFingers = 0;

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

    // Check spread
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

    // Check fist ratio
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
      feedback.length = 0;
      feedback.push(`Great job! You signed "${expected.word}" correctly! 🎉`);
    } else if (feedback.length === 0) {
      feedback.push("Close! Check the finger positions shown above.");
      expected.feedbackTips.forEach((tip) => feedback.push(`💡 ${tip}`));
    }

    // Get motion analysis
    const motionAnalysis = motionTrackerRef.current.getAnalysis();

    // Combine static + motion validation
    const motionResult = validateWithMotion(
      score,
      feedback,
      motionAnalysis,
      currentWord
    );

    setFeedbackResult({
      score: motionResult.score,
      isCorrect: motionResult.isCorrect,
      feedback: motionResult.feedback,
    });

    setQuiz((prev) => {
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      const newScore = isCorrect
        ? prev.score + (newStreak) * 10 + Math.max(0, 15 - prev.timeLeft)
        : prev.score;

      // Persist to localStorage
      saveQuizResult({
        word: currentWord,
        correct: isCorrect,
        score: isCorrect ? 10 + Math.max(0, 15 - prev.timeLeft) : 0,
        difficulty: difficulty,
        timestamp: Date.now(),
      });
      if (isCorrect) {
        const xp = 10 + Math.max(0, 15 - prev.timeLeft);
        addXP(xp);
      }
      if (newStreak > 0) {
        addStreak(newStreak);
      }

      return {
        ...prev,
        showResult: true,
        lastCorrect: isCorrect,
        currentIndex: prev.currentIndex + 1,
        correct: isCorrect ? prev.correct + 1 : prev.correct,
        score: newScore,
        streak: newStreak,
        bestStreak: isCorrect
          ? Math.max(prev.bestStreak, newStreak)
          : prev.bestStreak,
      };
    });
    if (timerRef.current) clearInterval(timerRef.current);
  }, [currentAnalysis, handDetected, quiz.showResult, currentExpected]);

  const speakWord = useCallback(() => {
    const u = new SpeechSynthesisUtterance(currentWord);
    u.lang = "en-US";
    u.rate = 0.8;
    window.speechSynthesis.speak(u);
  }, [currentWord]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopCameraRaw();
    };
  }, [stopCameraRaw]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-pink-500/25">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
            Quiz <span className="bg-gradient-to-r from-pink-500 to-rose-600 bg-clip-text text-transparent">Challenge</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400">See the word. Sign it. Get scored by AI in real-time.</p>
        </motion.div>

        {/* Difficulty Selector */}
        {!quiz.isRunning && !gameOver && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-8 text-center">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Select Difficulty</h3>
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
            <button onClick={startGame} className="btn-primary flex items-center gap-2 mx-auto">
              <Zap className="w-5 h-5" />
              Start Quiz (10 Questions)
            </button>
          </motion.div>
        )}

        {/* Game Over */}
        {gameOver && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 text-center">
            <div className="text-6xl mb-4">{quiz.correct >= 8 ? "🏆" : quiz.correct >= 5 ? "⭐" : "💪"}</div>
            <h2 className="text-3xl font-extrabold mb-2">Quiz Complete!</h2>
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
              <button onClick={startGame} className="btn-primary flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Play Again
              </button>
            </div>
          </motion.div>
        )}

        {/* Active Game */}
        {quiz.isRunning && !gameOver && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Camera */}
            <div className="glass-card p-6">
              <div className="camera-feed bg-gray-900 relative mb-4">
                <video ref={videoRef} className={`w-full ${cameraActive ? "hidden" : ""}`} autoPlay playsInline muted />
                <canvas ref={canvasRef} className={`w-full ${cameraActive ? "" : "hidden"}`} />
              {!cameraActive && cameraStatus === "idle" && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90">
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm mb-3">Enable your camera for the quiz</p>
                    <button onClick={startCameraRaw} className="btn-primary flex items-center gap-2 mx-auto">
                      <Camera className="w-5 h-5" /> Enable Camera
                    </button>
                  </div>
                </div>
              )}
              {cameraStatus === "loading" && <CameraLoadingSpinner message="Loading AI model for quiz..." />}
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
              {currentExpected && handDetected && !quiz.showResult && (
                <div className="mb-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-gray-500">Expected: </span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{currentExpected.gestureName.replace("_", " ")}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Detected: </span>
                      <span className={`font-semibold ${
                        detectedGestureName === currentExpected.gestureName
                          ? "text-emerald-600"
                          : "text-amber-600"
                      }`}>
                        {detectedGestureName || "..."}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{currentExpected.description}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={submitAnswer}
                disabled={!handDetected || quiz.showResult}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold rounded-xl shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                {quiz.showResult ? "Next Question..." : "Submit Answer"}
              </button>

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
                        <p className={`font-bold ${
                          feedbackResult.isCorrect
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-red-700 dark:text-red-300"
                        }`}>
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
                    className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded-full transition-all duration-1000"
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
                      {currentExpected && (
                        <p className="text-sm text-gray-400 mt-1">
                          Expected gesture: <span className="font-semibold">{currentExpected.gestureName.replace("_", " ")}</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-400 mb-2 uppercase tracking-wider">Sign this word:</p>
                      <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3">{currentWord}</h3>
                      <button onClick={speakWord} className="flex items-center gap-1 text-sm text-violet-500 hover:text-violet-600 mx-auto mb-4">
                        <Volume2 className="w-4 h-4" /> Hear pronunciation
                      </button>

                      {/* Expected gesture hint */}
                      {currentExpected && (
                        <div className="mb-4 p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 text-left">
                          <p className="text-xs font-semibold text-violet-700 dark:text-violet-300 mb-1">How to sign:</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{currentExpected.description}</p>
                          <p className="text-xs text-violet-500 mt-1">
                            Target gesture: <span className="font-bold">{currentExpected.gestureName.replace("_", " ")}</span>
                          </p>
                        </div>
                      )}

                      <button onClick={() => setShowHint(!showHint)} className="text-xs text-gray-400 hover:text-gray-600 underline">
                        {showHint ? "Hide hint" : "Show hint"}
                      </button>
                      {showHint && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-violet-500 mt-2 italic">
                          {QUIZ_WORDS.find((w) => w.word === currentWord)?.hint}
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
