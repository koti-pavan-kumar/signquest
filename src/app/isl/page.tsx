"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Languages,
  Check,
  Loader2,
  Volume2,
  BookOpen,
  Sparkles,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import {
  ALL_ISL_PATTERNS,
  ISL_VOWELS,
  ISL_CONSONANTS,
  ISL_WORDS,
  ALL_ISL_WORDS,
  ISL_WORDS_BY_CATEGORY,
  ISLPattern,
  ISLWordEntry,
  checkISLLetter,
} from "@/lib/isl-patterns";
import { ISLIllustration, ISLWordIllustration } from "@/lib/isl-illustrations";
import { analyzeGesture, GestureAnalysis } from "@/lib/gesture-detection";
import { markLetterLearned, addXP, loadProgress } from "@/lib/persistence";
import { MotionTracker, validateWithMotion } from "@/lib/motion-tracking";
import {
  useCamera,
  CameraLoadingSpinner,
  CameraError,
  CameraStatusBadge,
  StartCameraButton,
  StopCameraButton,
} from "@/hooks/useCamera";

type TabType = "alphabet" | "words";
type AlphabetSection = "vowels" | "consonants";

const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  greeting: { label: "Greetings", color: "from-green-500 to-emerald-600", icon: "🙏" },
  polite: { label: "Polite", color: "from-blue-500 to-indigo-600", icon: "💙" },
  essential: { label: "Essential", color: "from-red-500 to-rose-600", icon: "⭐" },
  family: { label: "Family", color: "from-pink-500 to-rose-600", icon: "👨‍👩‍👧‍👦" },
  food: { label: "Food & Drink", color: "from-orange-500 to-amber-600", icon: "🍚" },
  numbers: { label: "Numbers", color: "from-violet-500 to-purple-600", icon: "🔢" },
  emotion: { label: "Emotions", color: "from-yellow-500 to-orange-600", icon: "😊" },
  action: { label: "Actions", color: "from-cyan-500 to-blue-600", icon: "🏃" },
  place: { label: "Places", color: "from-teal-500 to-green-600", icon: "🏫" },
};

export default function ISLPage() {
  // State
  const [activeTab, setActiveTab] = useState<TabType>("alphabet");
  const [alphabetSection, setAlphabetSection] = useState<AlphabetSection>("vowels");
  const [selectedCategory, setSelectedCategory] = useState<string>("greeting");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [handDetected, setHandDetected] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    score: number;
    isCorrect: boolean;
    feedback: string[];
  } | null>(null);
  const [learnedLetters, setLearnedLetters] = useState<Set<string>>(() => {
    return new Set(loadProgress().learnedLetters);
  });
  const [sessionXP, setSessionXP] = useState(0);
  const [currentAnalysis, setCurrentAnalysis] = useState<GestureAnalysis | null>(null);

  const motionTrackerRef = useRef(new MotionTracker());

  // Camera hook
  const {
    status: cameraStatus,
    errorMessage,
    handDetected: cameraHandDetected,
    analysis: cameraAnalysis,
    startCamera: startCameraRaw,
    stopCamera: stopCameraRaw,
    videoRef,
    canvasRef,
    isActive: cameraActive,
  } = useCamera();

  // Sync hand detection
  useEffect(() => {
    setHandDetected(cameraHandDetected);
  }, [cameraHandDetected]);

  // Sync analysis and motion tracking
  useEffect(() => {
    setCurrentAnalysis(cameraAnalysis);
    if (cameraAnalysis) {
      motionTrackerRef.current.addFrame(cameraAnalysis.rawLandmarks);
    }
  }, [cameraAnalysis]);

  // Get current items
  const alphabetItems =
    alphabetSection === "vowels"
      ? Object.entries(ISL_VOWELS)
      : Object.entries(ISL_CONSONANTS);

  const wordItems = ALL_ISL_WORDS.filter((w) => w.category === selectedCategory);
  const currentAlphabet = alphabetItems[selectedIndex] || null;
  const currentWord = wordItems[selectedIndex] || null;

  const autoSubmitCooldownRef = useRef(false);

  // Reset on tab/section change
  useEffect(() => {
    setSelectedIndex(0);
    setCheckResult(null);
    motionTrackerRef.current.reset();
  }, [activeTab, alphabetSection, selectedCategory]);

  // ===== CONTINUOUS AUTO-DETECTION for ISL =====
  useEffect(() => {
    if (!cameraActive || !currentAnalysis || !handDetected || autoSubmitCooldownRef.current) return;
    if (checkResult && checkResult.isCorrect) return;

    const currentItem = activeTab === "alphabet" ? currentAlphabet : currentWord;
    if (!currentItem) return;

    let gestureScore = 0;

    if (activeTab === "alphabet" && currentAlphabet) {
      const pattern = currentAlphabet[1] as ISLPattern;
      const result = checkISLLetter(currentAnalysis, currentAlphabet[0]);
      gestureScore = result.score;
    } else if (activeTab === "words" && currentWord) {
      const f = currentAnalysis.fingers;
      const expected = currentWord.fingers;
      let correct = 0;
      const fingerNames: (keyof typeof f)[] = ["thumb", "index", "middle", "ring", "pinky"];
      for (const fn of fingerNames) {
        if (f[fn] === expected[fn]) correct++;
      }
      gestureScore = Math.round((correct / 5) * 100);
    }

    // Auto-check when gesture is confident enough
    if (gestureScore >= 70 && !autoSubmitCooldownRef.current) {
      autoSubmitCooldownRef.current = true;
      setTimeout(() => {
        checkMySign();
        setTimeout(() => { autoSubmitCooldownRef.current = false; }, 3000);
      }, 300);
    }
  }, [currentAnalysis, handDetected, cameraActive, activeTab, currentAlphabet, currentWord, checkResult]);

  // Check sign
  const checkMySign = useCallback(() => {
    if (!currentAnalysis || !handDetected) {
      setCheckResult({
        score: 0,
        isCorrect: false,
        feedback: ["No hand detected! Show your hand to the camera."],
      });
      return;
    }

    setIsChecking(true);

    setTimeout(() => {
      const motionAnalysis = motionTrackerRef.current.getAnalysis();

      if (activeTab === "alphabet" && currentAlphabet) {
        const [letter, pattern] = currentAlphabet;
        const result = checkISLLetter(currentAnalysis!, letter);
        const adjustedScore = Math.min(100, result.score + 15);

        const motionResult = validateWithMotion(
          adjustedScore,
          adjustedScore >= 70
            ? [`Great job! Your ISL sign for "${pattern.devanagari || letter}" is correct! 🎉`]
            : [...result.feedback, `Try focusing on the letter "${letter}" (${pattern.devanagari})`],
          motionAnalysis,
          // Map common motion expectations
          "Please" // fallback for circular motion
        );

        setCheckResult({
          score: motionResult.score,
          isCorrect: motionResult.isCorrect || adjustedScore >= 70,
          feedback: motionResult.feedback,
        });

        if (motionResult.isCorrect || adjustedScore >= 70) {
          setLearnedLetters((prev) => new Set(prev).add(letter));
          markLetterLearned(letter);
          addXP(10);
          setSessionXP((prev) => prev + 10);
        }
      } else if (activeTab === "words" && currentWord) {
        const word = currentWord;
        // Simple finger-state check against expected
        const f = currentAnalysis!.fingers;
        const expected = word.fingers;
        let correct = 0;
        let total = 5;
        const fingerNames: (keyof typeof f)[] = ["thumb", "index", "middle", "ring", "pinky"];
        const feedback: string[] = [];

        for (const fn of fingerNames) {
          if (f[fn] === expected[fn]) {
            correct++;
          } else {
            const label = fn.charAt(0).toUpperCase() + fn.slice(1);
            if (expected[fn]) {
              feedback.push(`${label} finger should be EXTENDED`);
            } else {
              feedback.push(`${label} finger should be CURLED`);
            }
          }
        }

        const score = Math.round((correct / total) * 100);
        const isCorrect = score >= 70;

        if (isCorrect) {
          feedback.length = 0;
          feedback.push(`Great job! You signed "${word.word}" (${word.hindi}) correctly! 🎉`);
          markLetterLearned(word.word);
          addXP(15);
          setSessionXP((prev) => prev + 15);
        }

        setCheckResult({ score, isCorrect, feedback });
      }
      setIsChecking(false);
    }, 600);
  }, [currentAnalysis, handDetected, activeTab, currentAlphabet, currentWord]);

  // Speak
  const speak = useCallback((text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "hi-IN"; // Hindi for ISL
    u.rate = 0.7;
    window.speechSynthesis.speak(u);
  }, []);

  const goNext = () => {
    const maxIndex = activeTab === "alphabet" ? alphabetItems.length - 1 : wordItems.length - 1;
    if (selectedIndex < maxIndex) {
      setSelectedIndex((prev) => prev + 1);
      setCheckResult(null);
    }
  };

  const goPrev = () => {
    if (selectedIndex > 0) {
      setSelectedIndex((prev) => prev - 1);
      setCheckResult(null);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-500/25">
            <Languages className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
            Indian Sign Language{" "}
            <span className="bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
              Explorer
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Learn ISL (Indian Sign Language) — India&apos;s native sign language used by 18 million
            deaf and hard-of-hearing Indians.
          </p>
        </motion.div>

        {/* Session XP Banner */}
        {sessionXP > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-200 dark:border-orange-800 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🇮🇳</span>
              <div>
                <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                  ISL Session XP
                </p>
                <p className="text-2xl font-extrabold text-orange-600">{sessionXP} XP</p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>
                {learnedLetters.size} items learned
              </p>
            </div>
          </motion.div>
        )}

        {/* Tabs + Section Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("alphabet")}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "alphabet"
                  ? "bg-white dark:bg-gray-700 text-orange-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-1.5" /> Alphabet ({Object.keys(ALL_ISL_PATTERNS).length})
            </button>
            <button
              onClick={() => setActiveTab("words")}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "words"
                  ? "bg-white dark:bg-gray-700 text-orange-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Sparkles className="w-4 h-4 inline mr-1.5" /> Words ({ALL_ISL_WORDS.length})
            </button>
          </div>

          {/* Alphabet section toggle */}
          {activeTab === "alphabet" && (
            <div className="flex gap-2">
              <button
                onClick={() => setAlphabetSection("vowels")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  alphabetSection === "vowels"
                    ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200"
                }`}
              >
                🇮🇳 Vowels ({Object.keys(ISL_VOWELS).length})
              </button>
              <button
                onClick={() => setAlphabetSection("consonants")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  alphabetSection === "consonants"
                    ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200"
                }`}
              >
                🔤 Consonants ({Object.keys(ISL_CONSONANTS).length})
              </button>
            </div>
          )}

          {/* Word category selector */}
          {activeTab === "words" && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedCategory(key);
                    setSelectedIndex(0);
                    setCheckResult(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedCategory === key
                      ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {config.icon} {config.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Camera + Practice */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              ISL Practice Camera
            </h3>

            <div className="camera-feed bg-gray-900 relative mb-4 rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                className="w-full"
                autoPlay
                playsInline
                muted
              />
              <canvas ref={canvasRef} className={`w-full absolute inset-0 ${cameraActive && handDetected ? "" : "hidden"}`} />

              {/* Idle */}
              {!cameraActive && cameraStatus === "idle" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-4xl mb-3 block">🇮🇳</span>
                    <p className="text-gray-400 text-sm mb-3">Enable camera to practice ISL</p>
                    <StartCameraButton onClick={startCameraRaw} />
                  </div>
                </div>
              )}

              {/* Loading */}
              {cameraStatus === "loading" && (
                <CameraLoadingSpinner message="Loading ISL AI model..." />
              )}

              {/* Error */}
              {(cameraStatus === "error" || cameraStatus === "no-permission") && (
                <CameraError message={errorMessage} onRetry={startCameraRaw} />
              )}

              {/* Active */}
              {cameraActive && (
                <CameraStatusBadge status={cameraStatus} handDetected={handDetected} />
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-2 mb-4">
              {cameraActive ? (
                <StopCameraButton onClick={stopCameraRaw} />
              ) : cameraStatus === "idle" ? (
                <StartCameraButton onClick={startCameraRaw} />
              ) : null}
            </div>

            {/* Live Auto-Detection Status */}
            {cameraActive && !checkResult?.isCorrect && (
              <div className="space-y-2">
                {handDetected ? (
                  <div className="px-4 py-3 rounded-xl text-sm font-medium bg-amber-900/50 text-amber-300 border border-amber-700/50 flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                    Watching for your ISL sign...
                  </div>
                ) : (
                  <div className="px-4 py-3 rounded-xl text-sm font-medium bg-gray-800 text-gray-400 flex items-center gap-2">
                    Show your hand to the camera
                  </div>
                )}
              </div>
            )}

            {/* AI Feedback */}
            <AnimatePresence>
              {checkResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className={`mt-4 p-4 rounded-xl border ${
                    checkResult.isCorrect
                      ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                      : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{checkResult.isCorrect ? "🎉" : "🤔"}</span>
                    <div>
                      <p
                        className={`font-bold ${
                          checkResult.isCorrect
                            ? "text-emerald-700 dark:text-emerald-300"
                            : "text-red-700 dark:text-red-300"
                        }`}
                      >
                        {checkResult.isCorrect ? "Great job!" : "Not quite right"}
                      </p>
                      <p className="text-xs text-gray-500">Score: {checkResult.score}%</p>
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {checkResult.feedback.map((fb, i) => (
                      <li
                        key={i}
                        className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"
                      >
                        <span className={checkResult.isCorrect ? "text-emerald-500" : "text-red-500"}>
                          {checkResult.isCorrect ? "✓" : "→"}
                        </span>
                        {fb}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Content Card */}
          <div className="glass-card p-6">
            {activeTab === "alphabet" && currentAlphabet && (
              <motion.div
                key={`alpha-${alphabetSection}-${selectedIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {/* Letter Display */}
                <div className="text-center mb-6">
                  <ISLIllustration letter={currentAlphabet[0]} size={140} className="my-4" />
                  {currentAlphabet[1].devanagari && (
                    <p className="text-sm text-gray-500 mb-2">
                      Hindi: {currentAlphabet[1].devanagari}
                    </p>
                  )}
                  <h2 className="text-2xl font-extrabold bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent mb-2">
                    {currentAlphabet[1].description}
                  </h2>
                  <button
                    onClick={() => speak(currentAlphabet[1].devanagari || currentAlphabet[0])}
                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-orange-500 mx-auto transition-colors"
                  >
                    <Volume2 className="w-4 h-4" /> Listen (Hindi)
                  </button>
                </div>

                {/* Steps */}
                <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 mb-4">
                  <p className="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-2">
                    How to sign:
                  </p>
                  <ol className="space-y-1.5">
                    {currentAlphabet[1].steps.map((step, i) => (
                      <li
                        key={i}
                        className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
                      >
                        <span className="font-bold text-orange-500">{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={goPrev}
                    disabled={selectedIndex === 0}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  <span className="text-sm text-gray-400">
                    {selectedIndex + 1} / {alphabetItems.length}
                  </span>
                  <button
                    onClick={goNext}
                    disabled={selectedIndex >= alphabetItems.length - 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 hover:bg-orange-200 disabled:opacity-30 transition-all"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "words" && currentWord && (
              <motion.div
                key={`word-${selectedCategory}-${selectedIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {/* Word Display */}
                <div className="text-center mb-6">
                  <span className="text-5xl mb-2 block">{currentWord.emoji}</span>
                  <ISLWordIllustration word={currentWord.word} size={140} className="my-4" />
                  <h2 className="text-3xl font-extrabold bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent mb-1">
                    {currentWord.word}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-1">
                    {currentWord.hindi}
                  </p>
                  {currentWord.devanagari && (
                    <p className="text-sm text-gray-400 mb-2">{currentWord.devanagari}</p>
                  )}
                  <button
                    onClick={() => speak(currentWord.hindi)}
                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-orange-500 mx-auto transition-colors"
                  >
                    <Volume2 className="w-4 h-4" /> Listen (Hindi)
                  </button>
                </div>

                {/* Description */}
                <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 mb-4">
                  <p className="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-2">
                    How to sign:
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {currentWord.description}
                  </p>
                </div>

                {/* Steps */}
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 mb-4">
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-2">
                    Step by step:
                  </p>
                  <ol className="space-y-1.5">
                    {currentWord.steps.map((step, i) => (
                      <li
                        key={i}
                        className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
                      >
                        <span className="font-bold text-amber-500">{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Category badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${
                      CATEGORY_CONFIG[currentWord.category]?.color || "from-gray-500 to-gray-600"
                    } text-white`}
                  >
                    {CATEGORY_CONFIG[currentWord.category]?.icon}{" "}
                    {CATEGORY_CONFIG[currentWord.category]?.label}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={goPrev}
                      disabled={selectedIndex === 0}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 disabled:opacity-30 transition-all text-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-400">
                      {selectedIndex + 1} / {wordItems.length}
                    </span>
                    <button
                      onClick={goNext}
                      disabled={selectedIndex >= wordItems.length - 1}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 hover:bg-orange-200 disabled:opacity-30 transition-all text-sm"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Quick Reference Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-extrabold text-center mb-6">
            Quick <span className="bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">Reference</span>
          </h2>
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-4">
              🇮🇳 Devanagari Vowels (स्वर)
            </h3>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
              {Object.entries(ISL_VOWELS).map(([letter, pattern]) => (
                <button
                  key={letter}
                  onClick={() => {
                    setActiveTab("alphabet");
                    setAlphabetSection("vowels");
                    const idx = Object.keys(ISL_VOWELS).indexOf(letter);
                    setSelectedIndex(idx);
                    setCheckResult(null);
                  }}
                  className={`p-2 rounded-xl border-2 text-center transition-all hover:scale-105 ${
                    learnedLetters.has(letter)
                      ? "bg-orange-50 dark:bg-orange-900/20 border-orange-300"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-orange-300"
                  }`}
                >
                  <span className="text-lg font-bold">{letter}</span>
                  <span className="text-xs text-gray-400 block">{pattern.devanagari}</span>
                </button>
              ))}
            </div>

            <h3 className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-4 mt-6">
              🔤 Key Consonants (व्यंजन)
            </h3>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-3">
              {Object.entries(ISL_CONSONANTS)
                .slice(0, 12)
                .map(([letter, pattern]) => (
                  <button
                    key={letter}
                    onClick={() => {
                      setActiveTab("alphabet");
                      setAlphabetSection("consonants");
                      const idx = Object.keys(ISL_CONSONANTS).indexOf(letter);
                      setSelectedIndex(idx);
                      setCheckResult(null);
                    }}
                    className={`p-2 rounded-xl border-2 text-center transition-all hover:scale-105 ${
                      learnedLetters.has(letter)
                        ? "bg-orange-50 dark:bg-orange-900/20 border-orange-300"
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-orange-300"
                    }`}
                  >
                    <span className="text-lg font-bold">{letter}</span>
                  </button>
                ))}
            </div>

            <h3 className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-4 mt-6">
              🙏 Common ISL Words
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ALL_ISL_WORDS.slice(0, 8).map((word) => (
                <button
                  key={word.word}
                  onClick={() => {
                    setActiveTab("words");
                    setSelectedCategory(word.category);
                    const idx = ALL_ISL_WORDS.filter((w) => w.category === word.category).findIndex(
                      (w) => w.word === word.word
                    );
                    if (idx >= 0) setSelectedIndex(idx);
                    setCheckResult(null);
                  }}
                  className={`p-3 rounded-xl border-2 text-left transition-all hover:scale-105 ${
                    learnedLetters.has(word.word)
                      ? "bg-orange-50 dark:bg-orange-900/20 border-orange-300"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-orange-300"
                  }`}
                >
                  <span className="text-lg">{word.emoji}</span>
                  <span className="text-sm font-bold block">{word.word}</span>
                  <span className="text-xs text-gray-400">{word.hindi}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
