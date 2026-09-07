"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Camera,
  VideoOff,
  Check,
  X,
  Loader2,
  Eye,
  ChevronRight,
  ChevronLeft,
  Star,
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
  isWordLearned,
  addXP,
  loadProgress,
} from "@/lib/persistence";
import { MotionTracker, validateWithMotion, getMotionSignature } from "@/lib/motion-tracking";

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
  const [cameraActive, setCameraActive] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [handDetected, setHandDetected] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<GestureAnalysis | null>(null);
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

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number | null>(null);
  const mpHandsRef = useRef<any>(null);
  const motionTrackerRef = useRef(new MotionTracker());

  // Get current items based on tab and difficulty
  const words = WORDS_BY_DIFFICULTY[selectedDifficulty];
  const sentences = SENTENCES_BY_DIFFICULTY[selectedDifficulty];
  const currentItems = activeTab === "words" ? words : sentences;
  const currentItem = currentItems[selectedIndex];
  const practicedSet = activeTab === "words" ? practicedWords : practicedSentences;

  // Reset index when switching tabs or difficulty
  useEffect(() => {
    setSelectedIndex(0);
    setCheckResult(null);
    motionTrackerRef.current.reset();
  }, [activeTab, selectedDifficulty]);

  // Initialize MediaPipe Hands
  const initMediaPipe = useCallback(async () => {
    if (mpHandsRef.current) return;
    try {
      const { Hands } = await import("@mediapipe/hands");
      const hands = new Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5,
      });
      hands.onResults((results: any) => {
        if (canvasRef.current && videoRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.drawImage(videoRef.current, 0, 0);

            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
              const landmarks = results.multiHandLandmarks[0];
              setHandDetected(true);

              // Draw landmarks
              ctx.fillStyle = "#22c55e";
              for (const lm of landmarks) {
                ctx.beginPath();
                ctx.arc(
                  lm.x * canvasRef.current.width,
                  lm.y * canvasRef.current.height,
                  4, 0, 2 * Math.PI
                );
                ctx.fill();
              }

              // Draw connections
              const connections = [
                [0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],
                [0,9],[9,10],[10,11],[11,12],[0,13],[13,14],[14,15],[15,16],
                [0,17],[17,18],[18,19],[19,20],[5,9],[9,13],[13,17],
              ];
              ctx.strokeStyle = "#22c55e";
              ctx.lineWidth = 2;
              for (const [a, b] of connections) {
                ctx.beginPath();
                ctx.moveTo(
                  landmarks[a].x * canvasRef.current.width,
                  landmarks[a].y * canvasRef.current.height
                );
                ctx.lineTo(
                  landmarks[b].x * canvasRef.current.width,
                  landmarks[b].y * canvasRef.current.height
                );
                ctx.stroke();
              }

              const analysis = analyzeGesture(landmarks as Landmark[]);
              setCurrentAnalysis(analysis);
              motionTrackerRef.current.addFrame(landmarks as Landmark[]);
            } else {
              setHandDetected(false);
              setCurrentAnalysis(null);
            }
          }
        }
      });
      mpHandsRef.current = hands;
    } catch (err) {
      console.error("Failed to load MediaPipe:", err);
    }
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      await initMediaPipe();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch {
      alert("Camera access is needed for practice mode.");
    }
  }, [initMediaPipe]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setHandDetected(false);
    setCurrentAnalysis(null);
    setCheckResult(null);
  }, []);

  // Detection loop
  useEffect(() => {
    if (!cameraActive || !mpHandsRef.current || !videoRef.current) return;
    const detect = async () => {
      if (videoRef.current && videoRef.current.readyState >= 2 && mpHandsRef.current) {
        try {
          await mpHandsRef.current.send({ image: videoRef.current });
        } catch {}
      }
      animRef.current = requestAnimationFrame(detect);
    };
    animRef.current = requestAnimationFrame(detect);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [cameraActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  // Check the user's sign for a word/sentence
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

      if (activeTab === "words" && currentItem && "word" in currentItem) {
        // For words, check if the first letter matches (finger-spelling)
        const word = (currentItem as WordEntry).word;
        const firstLetter = word[0].toUpperCase();
        const pattern = ASL_PATTERNS[firstLetter];

        if (pattern) {
          const result = checkLetter(currentAnalysis!, firstLetter);
          const adjustedScore = Math.min(100, result.score + 20); // Bonus for word attempt

          // Combine with motion analysis
          const motionResult = validateWithMotion(
            adjustedScore,
            adjustedScore >= 70
              ? [`Great job! You signed the first letter of "${word}" correctly! 🎉`]
              : [...result.feedback, `Try focusing on the letter "${firstLetter}" first.`],
            motionAnalysis,
            word
          );

          setCheckResult({
            score: motionResult.score,
            isCorrect: motionResult.isCorrect || adjustedScore >= 70,
            feedback: motionResult.feedback,
          });

          if (motionResult.isCorrect || adjustedScore >= 70) {
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
          // Fallback: check generic gesture
          const f = currentAnalysis!.fingers;
          let gestureScore = 50;
          if (f.index && f.middle && f.ring && f.pinky && !f.thumb) gestureScore = 85;
          else if (!f.index && !f.middle && !f.ring && !f.pinky && !f.thumb) gestureScore = 75;
          else if (f.index && f.middle && !f.ring && !f.pinky) gestureScore = 80;

          const motionResult = validateWithMotion(
            gestureScore,
            gestureScore >= 70
              ? [`Good hand position! For "${word}", try finger-spelling: ${(currentItem as WordEntry).fingerSpell.join("-")}`]
              : [`Try the sign again. Hint: ${(currentItem as WordEntry).tips[0]}`],
            motionAnalysis,
            word
          );

          setCheckResult({
            score: motionResult.score,
            isCorrect: motionResult.isCorrect || gestureScore >= 70,
            feedback: motionResult.feedback,
          });
        }
      } else {
        // For sentences, do a general gesture check
        const f = currentAnalysis!.fingers;
        const extended = [f.thumb, f.index, f.middle, f.ring, f.pinky].filter(Boolean).length;
        const score = 60 + (extended * 5);

        setCheckResult({
          score: Math.min(100, score),
          isCorrect: score >= 70,
          feedback: score >= 70
            ? ["Good hand movement! Keep practicing the sentence flow. 🎉"]
            : ["Show your hand more clearly. Try one sign at a time."],
        });          if (score >= 70) {
            const key = `${selectedDifficulty}-${selectedIndex}`;
            setPracticedSentences((prev) => new Set(prev).add(key));
            if (currentItem && "sentence" in currentItem) {
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

  // Speak word/sentence
  const speak = useCallback(() => {
    if (!currentItem) return;
    const text = "word" in currentItem ? currentItem.word : currentItem.sentence;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.7;
    window.speechSynthesis.speak(u);
  }, [currentItem]);

  // Navigate
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

  // Calculate stats
  const totalWords = ALL_WORDS.length;
  const totalSentences = ALL_SENTENCES.length;
  const learnedWords = practicedWords.size;
  const learnedSentences = practicedSentences.size;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/25">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
            Word & Sentence{" "}
            <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
              Trainer
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Progress from simple words to full sentences. Our AI teacher checks your signs in real-time.
          </p>
        </motion.div>

        {/* Session XP Banner */}
        {sessionXP > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200 dark:border-amber-800 flex items-center justify-between"
          >
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

        {/* Tabs + Difficulty Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("words")}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "words"
                  ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-1.5" />
              Words ({ALL_WORDS.length})
            </button>
            <button
              onClick={() => setActiveTab("sentences")}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "sentences"
                  ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Sparkles className="w-4 h-4 inline mr-1.5" />
              Sentences ({ALL_SENTENCES.length})
            </button>
          </div>

          {/* Difficulty */}
          <div className="flex gap-2">
            {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedDifficulty === diff
                    ? `bg-gradient-to-r ${DIFFICULTY_CONFIG[diff].color} text-white shadow-lg`
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
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
              <Camera className="w-4 h-4" />
              Practice Camera
            </h3>

            <div className="camera-feed bg-gray-900 relative mb-4 rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                className={`w-full ${cameraActive ? "hidden" : ""}`}
                autoPlay
                playsInline
                muted
              />
              <canvas ref={canvasRef} className={`w-full ${cameraActive ? "" : "hidden"}`} />

              {!cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm mb-3">Enable camera to practice</p>
                    <button
                      onClick={startCamera}
                      className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all"
                    >
                      Start Camera
                    </button>
                  </div>
                </div>
              )}

              {cameraActive && (
                <>
                  <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                    handDetected
                      ? "bg-emerald-500/80 text-white"
                      : "bg-amber-500/80 text-white"
                  }`}>
                    <Eye className="w-3 h-3" />
                    {handDetected ? "Hand detected" : "Show your hand"}
                  </div>
                </>
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-2 mb-4">
              {cameraActive ? (
                <>
                  <button
                    onClick={stopCamera}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <VideoOff className="w-3.5 h-3.5" /> Stop
                  </button>
                </>
              ) : (
                <button
                  onClick={startCamera}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Camera className="w-3.5 h-3.5" /> Start Camera
                </button>
              )}
            </div>

            {/* Check My Sign Button */}
            {cameraActive && (
              <button
                onClick={checkMySign}
                disabled={!handDetected || isChecking}
                className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  checkResult?.isCorrect
                    ? "bg-gradient-to-r from-emerald-500 to-green-600 shadow-emerald-500/25"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700"
                }`}
              >
                {isChecking ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : checkResult?.isCorrect ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
                {isChecking
                  ? "Analyzing..."
                  : checkResult?.isCorrect
                  ? "Correct! Check Again?"
                  : "Check My Sign"}
              </button>
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
                    {checkResult.isCorrect ? (
                      <span className="text-2xl">🎉</span>
                    ) : (
                      <span className="text-2xl">🤔</span>
                    )}
                    <div>
                      <p className={`font-bold ${
                        checkResult.isCorrect
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-red-700 dark:text-red-300"
                      }`}>
                        {checkResult.isCorrect ? "Great job!" : "Not quite right"}
                      </p>
                      <p className="text-xs text-gray-500">Score: {checkResult.score}%</p>
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {checkResult.feedback.map((fb, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
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
            {currentItem && (
              <motion.div
                key={`${activeTab}-${selectedDifficulty}-${selectedIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
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
                      <p className="text-sm text-gray-500 mb-2">
                        {(currentItem as SentenceEntry).signCount} signs
                      </p>
                    </>
                  )}

                  <button
                    onClick={speak}
                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-blue-500 mx-auto transition-colors"
                  >
                    <Volume2 className="w-4 h-4" /> Listen
                  </button>
                </div>

                {/* Sign Description */}
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-4">
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">How to sign:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {"signDescription" in currentItem ? currentItem.signDescription : ""}
                  </p>
                </div>

                {/* Finger-spelling for words */}
                {"fingerSpell" in currentItem && (
                  <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 mb-4">
                    <p className="text-sm font-semibold text-violet-700 dark:text-violet-300 mb-2">
                      Finger-spell breakdown:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(currentItem as WordEntry).fingerSpell.map((letter, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <GestureIllustration letter={letter} size={50} />
                          <span className="text-xs font-bold text-violet-600 dark:text-violet-400 mt-1">
                            {letter}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Word breakdown for sentences */}
                {"wordBreakdown" in currentItem && (
                  <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 mb-4">
                    <p className="text-sm font-semibold text-violet-700 dark:text-violet-300 mb-2">
                      Sign each word:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(currentItem as SentenceEntry).wordBreakdown.map((word, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-violet-100 dark:bg-violet-800/30 text-violet-700 dark:text-violet-300 rounded-lg text-sm font-semibold"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips */}
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-xs text-gray-400 hover:text-gray-600 underline mb-2"
                >
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
                  <span className="ml-1 opacity-75">
                    (+{10 * DIFFICULTY_CONFIG[selectedDifficulty].xpMultiplier} XP)
                  </span>
                </div>

                {/* Progress indicator */}
                <div className="flex items-center gap-1 mb-4">
                  {currentItems.map((_, i) => {
                    const key = `${selectedDifficulty}-${i}`;
                    const learned = practicedSet.has(key);
                    return (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === selectedIndex
                            ? "bg-blue-500 w-6"
                            : learned
                            ? "bg-emerald-500"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={goPrev}
                    disabled={selectedIndex === 0}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-semibold border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  <span className="text-sm text-gray-400">
                    {selectedIndex + 1} / {currentItems.length}
                  </span>
                  <button
                    onClick={goNext}
                    disabled={selectedIndex === currentItems.length - 1}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-semibold border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Bottom Stats Grid */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card p-4 text-center">
            <BookOpen className="w-5 h-5 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {learnedWords}
            </div>
            <div className="text-xs text-gray-500">Words Learned</div>
          </div>
          <div className="glass-card p-4 text-center">
            <Sparkles className="w-5 h-5 text-violet-500 mx-auto mb-2" />
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {learnedSentences}
            </div>
            <div className="text-xs text-gray-500">Sentences Practiced</div>
          </div>
          <div className="glass-card p-4 text-center">
            <Zap className="w-5 h-5 text-amber-500 mx-auto mb-2" />
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {sessionXP}
            </div>
            <div className="text-xs text-gray-500">Session XP</div>
          </div>
          <div className="glass-card p-4 text-center">
            <Trophy className="w-5 h-5 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {Math.floor(sessionXP / 100) + 1}
            </div>
            <div className="text-xs text-gray-500">Level</div>
          </div>
        </div>
      </div>
    </div>
  );
}
