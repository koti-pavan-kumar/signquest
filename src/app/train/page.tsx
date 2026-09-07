"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Check,
  X,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Zap,
  Trophy,
  BookOpen,
  Sparkles,
  Volume2,
} from "lucide-react";
import { analyzeGesture, GestureAnalysis, Landmark } from "@/lib/gesture-detection";
import { checkLetter, ASL_PATTERNS } from "@/lib/asl-patterns";
import {
  WordEntry,
  SentenceEntry,
  Difficulty,
  WORDS_BY_DIFFICULTY,
  SENTENCES_BY_DIFFICULTY,
  ALL_WORDS,
  ALL_SENTENCES,
} from "@/lib/word-data";
import { GestureIllustration, WordGestureIllustration } from "@/lib/gesture-illustrations";
import {
  markWordLearned,
  markSentencePracticed,
  addXP,
  loadProgress,
} from "@/lib/persistence";
import { MotionTracker, validateWithMotion } from "@/lib/motion-tracking";
import {
  useCamera,
  CameraLoadingSpinner,
  CameraError,
  CameraStatusBadge,
  StartCameraButton,
  StopCameraButton,
} from "@/hooks/useCamera";

type TabType = "words" | "sentences";

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string; icon: string; xpMultiplier: number }> = {
  basic: { label: "Basic", color: "from-green-500 to-emerald-600", icon: "🌱", xpMultiplier: 1 },
  intermediate: { label: "Intermediate", color: "from-amber-500 to-orange-600", icon: "🔥", xpMultiplier: 2 },
  advanced: { label: "Advanced", color: "from-red-500 to-rose-600", icon: "💎", xpMultiplier: 3 },
};

export default function TrainPage() {
  // State
  const [activeTab, setActiveTab] = useState<TabType>("words");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("basic");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [handDetected, setHandDetected] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    score: number;
    isCorrect: boolean;
    feedback: string[];
  } | null>(null);
  const [practicedWords, setPracticedWords] = useState<Set<string>>(() => {
    const saved = loadProgress().learnedWords;
    return new Set(saved);
  });
  const [practicedSentences, setPracticedSentences] = useState<Set<string>>(() => {
    const saved = loadProgress().practicedSentences;
    return new Set(saved);
  });
  const [showDetails, setShowDetails] = useState(true);
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
  const words = WORDS_BY_DIFFICULTY[selectedDifficulty];
  const sentences = SENTENCES_BY_DIFFICULTY[selectedDifficulty];
  const currentItems = activeTab === "words" ? words : sentences;
  const currentItem = currentItems[selectedIndex];
  const practicedSet = activeTab === "words" ? practicedWords : practicedSentences;

  // Reset on tab/difficulty change
  useEffect(() => {
    setSelectedIndex(0);
    setCheckResult(null);
    motionTrackerRef.current.reset();
  }, [activeTab, selectedDifficulty]);

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

      if ("word" in currentItem) {
        const word = (currentItem as WordEntry).word;
        const firstLetter = word[0].toUpperCase();
        const pattern = ASL_PATTERNS[firstLetter];

        if (pattern) {
          const result = checkLetter(currentAnalysis!, firstLetter);

          const motionResult = validateWithMotion(
            result.score,
            result.score >= 70
              ? [`Good handshape for "${word}"!`]
              : [...result.feedback, `Try focusing on the letter "${firstLetter}" first.`],
            motionAnalysis,
            word
          );

          setCheckResult({
            score: motionResult.score,
            isCorrect: motionResult.isCorrect && motionResult.score >= 70,
            feedback: motionResult.feedback,
          });

          if (motionResult.isCorrect && motionResult.score >= 70) {
            const key = `${selectedDifficulty}-${selectedIndex}`;
            if ("word" in currentItem) {
              setPracticedWords((prev) => new Set(prev).add(key));
              markWordLearned((currentItem as WordEntry).word);
            } else {
              setPracticedSentences((prev) => new Set(prev).add(key));
              markSentencePracticed((currentItem as SentenceEntry).sentence);
            }
            const xp = 10 * DIFFICULTY_CONFIG[selectedDifficulty].xpMultiplier;
            addXP(xp);
            setSessionXP((prev) => prev + xp);
          }
        } else {
          const f = currentAnalysis!.fingers;
          // More accurate gesture scoring based on common hand shapes
          let gestureScore = 40;
          const extended = [f.thumb, f.index, f.middle, f.ring, f.pinky].filter(Boolean).length;
          gestureScore = 30 + extended * 8;

          const motionResult = validateWithMotion(
            gestureScore,
            gestureScore >= 60
              ? [`Good hand position! For "${word}", try finger-spelling: ${(currentItem as WordEntry).fingerSpell.join("-")}`]
              : [`Try the sign again. Hint: ${(currentItem as WordEntry).tips[0]}`],
            motionAnalysis,
            word
          );

          setCheckResult({
            score: motionResult.score,
            isCorrect: motionResult.isCorrect && motionResult.score >= 70,
            feedback: motionResult.feedback,
          });
        }
      } else {
        // Sentence — requires BOTH hand position AND motion
        const f = currentAnalysis!.fingers;
        const extended = [f.thumb, f.index, f.middle, f.ring, f.pinky].filter(Boolean).length;
        // Base score: hand must be clearly in frame with good shape
        const handScore = Math.min(70, 20 + extended * 10);
        // Motion score: sentences require movement
        const motionScore = motionAnalysis.isMoving
          ? Math.round(motionAnalysis.confidence * 100)
          : 0;
        // Combined: need both hand + motion
        const combinedScore = Math.round(handScore * 0.4 + motionScore * 0.6);
        const isCorrect = combinedScore >= 70 && motionAnalysis.isMoving;

        const feedback: string[] = [];
        if (motionAnalysis.isMoving) {
          feedback.push(`${motionAnalysis.motionType} motion detected ✓`);
        } else {
          feedback.push("No movement detected — sentences need dynamic gestures. Move your hands!");
        }
        if (extended < 3) {
          feedback.push("Show your hand more clearly — fingers should be visible.");
        }

        setCheckResult({
          score: combinedScore,
          isCorrect,
          feedback,
        });

        if (isCorrect) {
          const key = `${selectedDifficulty}-${selectedIndex}`;
          setPracticedSentences((prev) => new Set(prev).add(key));
          if ("sentence" in currentItem) {
            markSentencePracticed((currentItem as SentenceEntry).sentence);
          }
          const xp = 15 * DIFFICULTY_CONFIG[selectedDifficulty].xpMultiplier;
          addXP(xp);
          setSessionXP((prev) => prev + xp);
        }
      }
      setIsChecking(false);
    }, 600);
  }, [currentAnalysis, handDetected, activeTab, currentItem, selectedDifficulty, selectedIndex]);

  // Speak
  const speak = useCallback(() => {
    if (!currentItem) return;
    const text = "word" in currentItem ? currentItem.word : currentItem.sentence;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.7;
    window.speechSynthesis.speak(u);
  }, [currentItem]);

  const goNext = () => {
    if (selectedIndex < currentItems.length - 1) {
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

  const totalWords = ALL_WORDS.length;
  const totalSentences = ALL_SENTENCES.length;
  const learnedWords = practicedWords.size;
  const learnedSentences = practicedSentences.size;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/25">
            <GraduationCap className="w-8 h-8 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-gray-900 dark:text-white">
            Word & Sentence{" "}
            <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">Trainer</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Progress from simple words to full sentences. Our AI teacher checks your signs in real-time.
          </p>
        </div>

        {/* Session XP Banner */}
        {sessionXP > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-amber-500" />
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Session XP Earned</p>
                <p className="text-2xl font-extrabold text-amber-600">{sessionXP} XP</p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>{learnedWords}/{totalWords} words learned</p>
              <p>{learnedSentences}/{totalSentences} sentences practiced</p>
            </div>
          </motion.div>
        )}

        {/* Tabs + Difficulty */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button onClick={() => setActiveTab("words")} className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "words" ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              <BookOpen className="w-4 h-4 inline mr-1.5" /> Words ({ALL_WORDS.length})
            </button>
            <button onClick={() => setActiveTab("sentences")} className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "sentences" ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              <Sparkles className="w-4 h-4 inline mr-1.5" /> Sentences ({ALL_SENTENCES.length})
            </button>
          </div>
          <div className="flex gap-2">
            {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((diff) => (
              <button key={diff} onClick={() => setSelectedDifficulty(diff)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${selectedDifficulty === diff ? `bg-gradient-to-r ${DIFFICULTY_CONFIG[diff].color} text-white shadow-lg` : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200"}`}>
                {DIFFICULTY_CONFIG[diff].icon} {DIFFICULTY_CONFIG[diff].label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Camera + Practice */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              Practice Camera
            </h3>

            <div className="camera-feed bg-gray-900 relative mb-4 rounded-xl overflow-hidden">
              <video ref={videoRef} className="w-full" autoPlay playsInline muted />
              <canvas ref={canvasRef} className={`w-full absolute inset-0 ${cameraActive && handDetected ? "" : "hidden"}`} />

              {/* Idle */}
              {!cameraActive && cameraStatus === "idle" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    <p className="text-gray-400 text-sm mb-3">Enable camera to practice</p>
                    <StartCameraButton onClick={startCameraRaw} />
                  </div>
                </div>
              )}

              {/* Loading */}
              {cameraStatus === "loading" && <CameraLoadingSpinner message="Loading AI model..." />}

              {/* Error */}
              {(cameraStatus === "error" || cameraStatus === "no-permission") && (
                <CameraError message={errorMessage} onRetry={startCameraRaw} />
              )}

              {/* Active */}
              {cameraActive && <CameraStatusBadge status={cameraStatus} handDetected={handDetected} />}
            </div>

            {/* Controls */}
            <div className="flex gap-2 mb-4">
              {cameraActive ? (
                <StopCameraButton onClick={stopCameraRaw} />
              ) : cameraStatus === "idle" ? (
                <StartCameraButton onClick={startCameraRaw} />
              ) : null}
            </div>

            {/* Error warning */}
            {cameraActive && errorMessage && (
              <div className="mb-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-300">{errorMessage}</p>
              </div>
            )}

            {/* Check My Sign */}
            {cameraActive && (
              <button
                onClick={checkMySign}
                disabled={isChecking}
                className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  checkResult?.isCorrect
                    ? "bg-gradient-to-r from-emerald-500 to-green-600 shadow-emerald-500/25"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700"
                }`}
              >
                {isChecking ? <Loader2 className="w-5 h-5 animate-spin" /> : checkResult?.isCorrect ? <Check className="w-5 h-5" /> : <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                {isChecking ? "Analyzing..." : checkResult?.isCorrect ? "Correct! Check Again?" : "Check My Sign"}
              </button>
            )}

            {/* AI Feedback */}
            <AnimatePresence>
              {checkResult && (
                <motion.div initial={{ opacity: 0, y: 10, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -10, height: 0 }} className={`mt-4 p-4 rounded-xl border ${checkResult.isCorrect ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{checkResult.isCorrect ? "🎉" : "🤔"}</span>
                    <div>
                      <p className={`font-bold ${checkResult.isCorrect ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}`}>
                        {checkResult.isCorrect ? "Great job!" : "Not quite right"}
                      </p>
                      <p className="text-xs text-gray-500">Score: {checkResult.score}%</p>
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {checkResult.feedback.map((fb, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className={checkResult.isCorrect ? "text-emerald-500" : "text-red-500"}>{checkResult.isCorrect ? "✓" : "→"}</span>
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
            {currentItem && (
              <motion.div key={`${activeTab}-${selectedDifficulty}-${selectedIndex}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                {/* Word/Sentence Display */}
                <div className="text-center mb-6">
                  {"word" in currentItem ? (
                    <>
                      <span className="text-5xl mb-2 block">{(currentItem as WordEntry).emoji}</span>
                      <h2 className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent mb-2">
                        {(currentItem as WordEntry).word}
                      </h2>
                      <WordGestureIllustration word={(currentItem as WordEntry).word} size={140} className="my-4" />
                    </>
                  ) : (
                    <>
                      <h2 className="text-2xl font-extrabold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent mb-2">
                        &ldquo;{(currentItem as SentenceEntry).sentence}&rdquo;
                      </h2>
                      <p className="text-sm text-gray-500 mb-2">{(currentItem as SentenceEntry).signCount} signs</p>
                    </>
                  )}
                  <button onClick={speak} className="flex items-center gap-1 text-sm text-gray-400 hover:text-blue-500 mx-auto transition-colors">
                    <Volume2 className="w-4 h-4" /> Listen
                  </button>
                </div>

                {/* Sign Description */}
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-4">
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">How to sign:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{"signDescription" in currentItem ? currentItem.signDescription : ""}</p>
                </div>

                {/* Finger-spelling */}
                {"fingerSpell" in currentItem && (
                  <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 mb-4">
                    <p className="text-sm font-semibold text-violet-700 dark:text-violet-300 mb-2">Finger-spell breakdown:</p>
                    <div className="flex flex-wrap gap-2">
                      {(currentItem as WordEntry).fingerSpell.map((letter, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <GestureIllustration letter={letter} size={50} />
                          <span className="text-xs font-bold text-violet-600 dark:text-violet-400 mt-1">{letter}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Word breakdown */}
                {"wordBreakdown" in currentItem && (
                  <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 mb-4">
                    <p className="text-sm font-semibold text-violet-700 dark:text-violet-300 mb-2">Sign each word:</p>
                    <div className="flex flex-wrap gap-2">
                      {(currentItem as SentenceEntry).wordBreakdown.map((word, i) => (
                        <span key={i} className="px-3 py-1.5 bg-violet-100 dark:bg-violet-800/30 text-violet-700 dark:text-violet-300 rounded-lg text-sm font-semibold">{word}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips */}
                <button onClick={() => setShowDetails(!showDetails)} className="text-xs text-gray-400 hover:text-gray-600 underline mb-2">
                  {showDetails ? "Hide tips" : "Show tips"}
                </button>
                {showDetails && "tips" in currentItem && (
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-1 mb-4">
                    {(currentItem as WordEntry | SentenceEntry).tips.map((tip, i) => (
                      <p key={i} className="text-xs text-gray-500 flex items-center gap-2">
                        <span className="text-blue-500">•</span> {tip}
                      </p>
                    ))}
                  </div>
                )}

                {/* Difficulty Badge */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r ${DIFFICULTY_CONFIG[selectedDifficulty].color} text-white mb-4`}>
                  {DIFFICULTY_CONFIG[selectedDifficulty].icon} {DIFFICULTY_CONFIG[selectedDifficulty].label}
                  <span className="ml-1 opacity-75">(+{10 * DIFFICULTY_CONFIG[selectedDifficulty].xpMultiplier} XP)</span>
                </div>

                {/* Progress dots */}
                <div className="flex items-center gap-1 mb-4">
                  {currentItems.map((_, i) => {
                    const key = `${selectedDifficulty}-${i}`;
                    const learned = practicedSet.has(key);
                    return (
                      <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === selectedIndex ? "bg-blue-500 w-6" : learned ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"}`} />
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <button onClick={goPrev} disabled={selectedIndex === 0} className="flex items-center gap-1 px-4 py-2 text-sm font-semibold border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30">
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  <span className="text-sm text-gray-400">{selectedIndex + 1} / {currentItems.length}</span>
                  <button onClick={goNext} disabled={selectedIndex === currentItems.length - 1} className="flex items-center gap-1 px-4 py-2 text-sm font-semibold border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30">
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card p-4 text-center">
            <BookOpen className="w-5 h-5 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{learnedWords}</div>
            <div className="text-xs text-gray-500">Words Learned</div>
          </div>
          <div className="glass-card p-4 text-center">
            <Sparkles className="w-5 h-5 text-violet-500 mx-auto mb-2" />
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{learnedSentences}</div>
            <div className="text-xs text-gray-500">Sentences Practiced</div>
          </div>
          <div className="glass-card p-4 text-center">
            <Zap className="w-5 h-5 text-amber-500 mx-auto mb-2" />
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{sessionXP}</div>
            <div className="text-xs text-gray-500">Session XP</div>
          </div>
          <div className="glass-card p-4 text-center">
            <Trophy className="w-5 h-5 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{Math.floor(sessionXP / 100) + 1}</div>
            <div className="text-xs text-gray-500">Level</div>
          </div>
        </div>
      </div>
    </div>
  );
}
