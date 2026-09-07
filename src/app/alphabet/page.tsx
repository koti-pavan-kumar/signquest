"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Camera,
  VideoOff,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Check,
  X,
  Loader2,
  Eye,
  AlertCircle,
} from "lucide-react";
import { analyzeGesture, GestureAnalysis, Landmark } from "@/lib/gesture-detection";
import { checkLetter, ASL_PATTERNS } from "@/lib/asl-patterns";
import { markLetterLearned, getLearnedLetters, addXP } from "@/lib/persistence";
import { GestureIllustration } from "@/lib/gesture-illustrations";
import {
  useCamera,
  CameraLoadingSpinner,
  CameraError,
  CameraStatusBadge,
  StopCameraButton,
} from "@/hooks/useCamera";

const ALPHABET_DATA = [
  {
    letter: "A",
    description: "Make a fist with your thumb resting alongside your index finger, pointing straight up. All four fingers curl tightly into the palm, and the thumb stays flush against the side of the fist — not wrapped across the front.",
    stepByStep: ["Curl all four fingers tightly into your palm", "Keep the thumb straight, pressed against the side of your index finger", "The thumb should NOT wrap across the front of the fist", "Hold your hand upright with the palm facing forward"],
    tips: ["Thumb must stay on the SIDE, not the front", "Fingers should be tightly curled", "Palm faces the person you're signing to"],
    category: "basic",
  },
  {
    letter: "B",
    description: "Hold all four fingers straight up and pressed together. Fold your thumb across the palm, tucking it in front of the curled fingers. The palm faces outward.",
    stepByStep: ["Extend all four fingers straight up, pressed together", "Fold the thumb across and rest it on the palm", "The thumb should NOT stick out to the side", "Keep the palm facing forward"],
    tips: ["All four fingers must be straight and together", "Thumb folds IN, not out", "Looks like a flat paddle"],
    category: "basic",
  },
  {
    letter: "C",
    description: "Curve all four fingers and your thumb to form a C-shape, as if you're gripping a large ball. Your hand should look like the letter C from the side.",
    stepByStep: ["Curve all four fingers into a C shape", "The thumb also curves to form the bottom of the C", "Your hand should look like it's holding a ball", "View it from the side — it should literally look like a C"],
    tips: ["Think of holding an orange", "The curve should be smooth and even", "View from the side to check the C shape"],
    category: "basic",
  },
  {
    letter: "D",
    description: "Point your index finger straight up. Touch the tips of your middle, ring, and pinky fingers to the tip of your thumb, forming a circle. Only the index finger is extended.",
    stepByStep: ["Point the index finger straight up", "Touch middle, ring, and pinky fingertips to the thumb tip", "The three fingers and thumb form a circle/oval", "The index finger stands tall alone"],
    tips: ["Only the index finger points up", "Other three fingers touch the thumb", "Looks like a lowercase d"],
    category: "basic",
  },
  {
    letter: "E",
    description: "Curl all four fingers down so the tips rest on the top edge of your palm. The thumb tucks underneath, resting against the curled fingers. It looks like a claw.",
    stepByStep: ["Curl all four fingers downward", "The fingertips should rest on the top ridge of the palm", "Tuck the thumb underneath, against the curled fingers", "The hand looks like a tight claw or a small bun"],
    tips: ["Fingertips touch the palm ridge, not flat down", "Thumb hides underneath", "Looks compact — like a small curled fist"],
    category: "basic",
  },
  {
    letter: "F",
    description: "Touch the tip of your index finger to the tip of your thumb, forming a circle. Extend the other three fingers (middle, ring, pinky) straight up and spread apart.",
    stepByStep: ["Touch index finger tip to thumb tip — make a circle", "Extend middle, ring, and pinky straight up", "Spread the three extended fingers apart", "Palm faces forward"],
    tips: ["This is the OK sign with 3 fingers up", "The circle is made by index + thumb", "Three fingers spread apart, not together"],
    category: "basic",
  },
  {
    letter: "G",
    description: "Point your index finger and thumb sideways (to the left if right-handed). The other three fingers curl into the palm. It looks like you're pointing or pinching something small.",
    stepByStep: ["Point the index finger sideways", "The thumb also points the same direction, slightly apart", "Curl middle, ring, and pinky into the palm", "Turn your hand so the side faces the viewer"],
    tips: ["Index and thumb point sideways, not up", "Looks like you're about to pinch something", "Other fingers are hidden in the palm"],
    category: "intermediate",
  },
  {
    letter: "H",
    description: "Extend your index and middle fingers sideways (pointing to the left if right-handed). The thumb, ring, and pinky fingers curl into the palm.",
    stepByStep: ["Extend index and middle fingers sideways together", "Point them in the same direction as G", "Curl ring, pinky, and thumb into the palm", "Palm faces sideways/downward"],
    tips: ["Two fingers point sideways", "Like G but with two fingers instead of one", "Keep the two fingers together"],
    category: "intermediate",
  },
  {
    letter: "I",
    description: "Make a fist and extend only your pinky finger straight up. The thumb wraps across the front of the curled fingers.",
    stepByStep: ["Make a fist with all four fingers curled", "Extend only the pinky finger straight up", "Wrap the thumb across the front of the curled fingers", "Palm faces forward"],
    tips: ["Only the pinky is up", "Thumb crosses over the front", "Looks like a little antenna"],
    category: "basic",
  },
  {
    letter: "J",
    description: "Start with the I handshape (pinky up). Then trace a J shape in the air by swooping the pinky down and curving it — like drawing the letter J.",
    stepByStep: ["Start with the I handshape — pinky up", "Move the pinky downward", "Curve it in a J-shaped swoop", "Draw the letter J in the air with the pinky"],
    tips: ["This is the only letter that moves!", "The motion traces a J shape", "Keep other fingers curled throughout"],
    category: "intermediate",
  },
  {
    letter: "K",
    description: "Point your index finger straight up. Extend the middle finger forward at an angle. The thumb rests between the index and middle fingers. Ring and pinky curl down.",
    stepByStep: ["Point index finger straight up", "Extend middle finger forward/diagonally", "Place the thumb between index and middle", "Curl ring and pinky into the palm"],
    tips: ["Thumb touches the middle finger's knuckle", "Index up, middle diagonal — creates a V shape", "Ring and pinky are hidden"],
    category: "intermediate",
  },
  {
    letter: "L",
    description: "Extend your index finger straight up and your thumb straight out to the side, forming an L shape. The other three fingers curl into the palm.",
    stepByStep: ["Point the index finger straight up", "Extend the thumb straight out to the side", "The two form a right angle — an L shape", "Curl middle, ring, and pinky into the palm"],
    tips: ["Should literally look like the letter L", "90-degree angle between index and thumb", "Very easy to recognize"],
    category: "basic",
  },
  {
    letter: "M",
    description: "Make a fist with the thumb tucked under the first three fingers (index, middle, ring). The three fingers fold over the thumb, which peeks out below the pinky.",
    stepByStep: ["Place the thumb under the index, middle, and ring fingers", "Fold those three fingers down over the thumb", "The thumb tip peeks out between the ring and pinky fingers", "Pinky also curls down normally"],
    tips: ["Three fingers fold over the thumb", "Thumb peeks between 3rd and 4th fingers", "Think: M has 3 humps -> 3 fingers over thumb"],
    category: "intermediate",
  },
  {
    letter: "N",
    description: "Similar to M but only two fingers (index and middle) fold over the thumb. The thumb peeks out between the middle and ring fingers.",
    stepByStep: ["Place the thumb under the index and middle fingers", "Fold those two fingers down over the thumb", "The thumb peeks out between middle and ring fingers", "Ring and pinky curl into the palm"],
    tips: ["Two fingers over the thumb (N = 2 strokes)", "Thumb peeks between 2nd and 3rd fingers", "Similar to M but one less finger"],
    category: "intermediate",
  },
  {
    letter: "O",
    description: "Curve all four fingers down to touch the tip of the thumb, forming a circle. The hand should look like the letter O from the front.",
    stepByStep: ["Curve all four fingers downward", "Touch each fingertip to the thumb tip", "The fingers and thumb form a round O shape", "Palm faces forward so the O is visible"],
    tips: ["All fingertips touch the thumb", "The shape should be round, not squished", "Looks like you're holding a tennis ball"],
    category: "basic",
  },
  {
    letter: "P",
    description: "Same as K but pointing downward. Index finger points forward, middle finger points down, thumb rests between them. Ring and pinky curl in.",
    stepByStep: ["Form the K handshape (index up, middle diagonal, thumb between)", "Rotate your hand so it points downward", "Index points forward, middle points down", "Ring and pinky stay curled"],
    tips: ["It's K pointing down", "Index finger is horizontal, middle points down", "Thumb rests on the middle finger"],
    category: "intermediate",
  },
  {
    letter: "Q",
    description: "Same as G but pointing downward. Index finger and thumb point down and slightly apart. The other three fingers curl into the palm.",
    stepByStep: ["Form the G handshape (index + thumb pointing sideways)", "Rotate so the fingers point downward", "Index and thumb point down, slightly apart", "Curl the other three fingers into the palm"],
    tips: ["It's G pointing down", "Index and thumb look like they're about to grab something", "Other fingers are hidden"],
    category: "intermediate",
  },
  {
    letter: "R",
    description: "Cross your middle finger over your index finger. Both point straight up. The thumb holds down the ring and pinky fingers.",
    stepByStep: ["Extend the index finger straight up", "Cross the middle finger over the index finger", "Both fingers point upward", "Thumb holds ring and pinky down into the palm"],
    tips: ["Like crossing your fingers for good luck!", "Middle finger goes OVER the index", "Ring and pinky curl down"],
    category: "intermediate",
  },
  {
    letter: "S",
    description: "Make a tight fist with the thumb wrapped across the front of all four fingers. Similar to A, but the thumb crosses IN FRONT instead of along the side.",
    stepByStep: ["Curl all four fingers tightly into your palm", "Wrap the thumb across the FRONT of the fist", "The thumb rests on top of the curled fingers", "Palm faces forward"],
    tips: ["Key difference from A: thumb is in FRONT, not side", "Tight fist — thumb crosses over fingers", "Looks like you're holding on tight"],
    category: "basic",
  },
  {
    letter: "T",
    description: "Make a fist and tuck your thumb between the index and middle fingers. Only the thumb tip peeks out.",
    stepByStep: ["Curl all four fingers into a fist", "Tuck the thumb between the index and middle fingers", "Only the thumb tip peeks out from between the two fingers", "Don't let it peek from the side like I"],
    tips: ["Thumb goes BETWEEN index and middle", "Looks like a fist with a thumb sticking out the top", "Different from I (pinky up) and M/N (thumb under)"],
    category: "intermediate",
  },
  {
    letter: "U",
    description: "Extend your index and middle fingers straight up, pressed together. The thumb holds down the ring and pinky fingers.",
    stepByStep: ["Extend index and middle fingers straight up", "Keep them pressed tightly together", "Use the thumb to hold ring and pinky down", "Palm faces forward"],
    tips: ["Two fingers up, TOGETHER (not spread)", "Looks like a closed peace sign", "Thumb holds the other two fingers down"],
    category: "basic",
  },
  {
    letter: "V",
    description: "Extend your index and middle fingers straight up and spread them apart to form a V shape. The thumb holds down the ring and pinky fingers.",
    stepByStep: ["Extend index and middle fingers straight up", "Spread them apart to form a V", "The thumb holds ring and pinky into the palm", "Palm faces forward"],
    tips: ["Same as U but fingers are APART", "Looks exactly like the letter V", "Also known as the peace sign"],
    category: "basic",
  },
  {
    letter: "W",
    description: "Extend your index, middle, and ring fingers straight up and spread them apart. The thumb holds down the pinky finger.",
    stepByStep: ["Extend index, middle, and ring fingers straight up", "Spread all three apart", "The thumb holds the pinky finger down", "Palm faces forward"],
    tips: ["Three fingers up, spread apart", "Looks like the letter W", "Thumb holds only the pinky"],
    category: "basic",
  },
  {
    letter: "X",
    description: "Make a fist and then extend the index finger, but bend it into a hook shape — like a crooked finger. The other fingers stay curled.",
    stepByStep: ["Start with a closed fist", "Extend the index finger up", "Bend the index finger into a hook/curve", "Keep all other fingers curled tightly"],
    tips: ["Index finger is HOOKED, not straight", "Looks like a pirate's hook", "The bend is at the middle joint"],
    category: "advanced",
  },
  {
    letter: "Y",
    description: "Extend your thumb and pinky finger outward while curling the index, middle, and ring fingers into the palm. Looks like a hang-loose or phone gesture.",
    stepByStep: ["Extend the pinky finger straight out", "Extend the thumb straight out in the opposite direction", "Curl index, middle, and ring into the palm", "The hand looks like a phone or hang-loose sign"],
    tips: ["Only thumb and pinky are extended", "Other three fingers curl down", "Looks like the 'call me' or 'shaka' gesture"],
    category: "basic",
  },
  {
    letter: "Z",
    description: "Point your index finger straight out and trace the letter Z in the air — a zigzag line going right, then diagonal down-left, then right again.",
    stepByStep: ["Point the index finger straight out", "Draw a horizontal line to the right", "Draw a diagonal line down and to the left", "Draw another horizontal line to the right — it spells Z!"],
    tips: ["Another letter that MOVES (like J)", "Trace the Z shape clearly in the air", "Keep other fingers curled during the motion"],
    category: "advanced",
  },
];

export default function AlphabetPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [practicedLetters, setPracticedLetters] = useState<Set<number>>(() => {
    // Load learned letters from localStorage on mount
    const saved = getLearnedLetters();
    const set = new Set<number>();
    saved.forEach((letter) => {
      const idx = ALPHABET_DATA.findIndex((a) => a.letter === letter);
      if (idx >= 0) set.add(idx);
    });
    return set;
  });
  const [showTip, setShowTip] = useState(true);

  // Sign checking state
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    score: number;
    isCorrect: boolean;
    feedback: string[];
  } | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<GestureAnalysis | null>(null);

  const {
    status: cameraStatus,
    errorMessage,
    handDetected,
    analysis: cameraAnalysis,
    startCamera,
    stopCamera: stopCameraRaw,
    videoRef,
    canvasRef,
    isActive: cameraActive,
  } = useCamera();
  const streamRef = useRef<MediaStream | null>(null);

  const current = ALPHABET_DATA[selectedIndex];

  // Sync camera analysis to local state
  useEffect(() => {
    setCurrentAnalysis(cameraAnalysis);
  }, [cameraAnalysis]);

  const stopCamera = useCallback(() => {
    stopCameraRaw();
    setCheckResult(null);
    setIsChecking(false);
  }, [stopCameraRaw]);



  // Check the user's sign
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

    // Brief delay for visual feedback
    setTimeout(() => {
      const result = checkLetter(currentAnalysis, current.letter);
      setCheckResult(result);
      setIsChecking(false);

      if (result.isCorrect) {
        setPracticedLetters((prev) => new Set(prev).add(selectedIndex));
        markLetterLearned(current.letter);
        addXP(10);
      }
    }, 500);
  }, [currentAnalysis, handDetected, current.letter, selectedIndex]);

  const markPracticed = useCallback(() => {
    setPracticedLetters((prev) => new Set(prev).add(selectedIndex));
    markLetterLearned(current.letter);
    addXP(5);
  }, [selectedIndex, current.letter]);

  const speakLetter = useCallback(() => {
    const u = new SpeechSynthesisUtterance(`The letter ${current.letter}`);
    u.lang = "en-US";
    u.rate = 0.7;
    window.speechSynthesis.speak(u);
  }, [current.letter]);

  // Reset check result when switching letters
  useEffect(() => {
    setCheckResult(null);
  }, [selectedIndex]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/25">
            <BookOpen className="w-8 h-8 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-gray-900 dark:text-white">
            Alphabet <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">Explorer</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Learn each letter — our AI teacher checks your sign in real-time.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
            <span>Progress</span>
            <span>{practicedLetters.size} / 26 letters learned</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full transition-all"
              style={{ width: `${(practicedLetters.size / 26) * 100}%` }}
            />
          </div>
        </div>

        {/* Letter Grid */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {ALPHABET_DATA.map((item, i) => (
            <button
              key={item.letter}
              onClick={() => setSelectedIndex(i)}
              className={`relative w-11 h-11 rounded-xl text-sm font-bold transition-all ${
                selectedIndex === i
                  ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 scale-110"
                  : practicedLetters.has(i)
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {item.letter}
              {practicedLetters.has(i) && (
                <Check className="w-3 h-3 text-emerald-500 absolute -top-1 -right-1" />
              )}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <motion.div
          key={selectedIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Camera + AI Teacher */}
          <div className="glass-card p-6">
            <div className="camera-feed bg-gray-900 relative mb-4">
              {/* Video feed (hidden behind canvas when active) */}
              <video
                ref={videoRef}
                className={`w-full ${cameraActive ? "hidden" : ""}`}
                autoPlay
                playsInline
                muted
              />
              {/* Canvas with landmark overlay */}
              <canvas
                ref={canvasRef}
                className={`w-full ${cameraActive ? "" : "hidden"}`}
              />
              {!cameraActive && cameraStatus === "idle" && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90">
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm mb-3">Enable your camera to practice signs</p>
                    <button
                      onClick={startCamera}
                      className="px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-all"
                    >
                      Start Camera
                    </button>
                  </div>
                </div>
              )}
              {cameraStatus === "loading" && <CameraLoadingSpinner />}
              {cameraStatus === "error" || cameraStatus === "no-permission" ? (
                <CameraError message={errorMessage} onRetry={startCamera} />
              ) : null}
            </div>

            {/* Hand Detection Status */}
            {cameraActive && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-3 ${
                handDetected
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                  : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
              }`}>
                {handDetected ? (
                  <>
                    <Eye className="w-4 h-4" />
                    <span className="font-semibold">Hand detected</span>
                    <span className="text-xs ml-auto">21 landmarks tracked</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>Show your hand to the camera</span>
                  </>
                )}
              </div>
            )}
            {/* Warning if model loaded with errors */}
            {cameraActive && errorMessage && (
              <div className="mb-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-300">{errorMessage}</p>
              </div>
            )}

            {/* Controls */}
            <div className="flex gap-2">
              {cameraActive ? (
                <>
                  <StopCameraButton onClick={stopCamera} />
                  <button
                    onClick={markPracticed}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                  >
                    <Check className="w-3 h-3" /> Mark as Practiced
                  </button>
                </>
              ) : cameraStatus === "idle" ? (
                <button
                  onClick={startCamera}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs font-semibold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                >
                  <Camera className="w-3 h-3" /> Start Camera
                </button>
              ) : null}
            </div>

            {/* CHECK MY SIGN Button */}
            {cameraActive && (
              <button
                onClick={checkMySign}
                disabled={!handDetected || isChecking}
                className={`w-full mt-4 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  checkResult?.isCorrect
                    ? "bg-gradient-to-r from-emerald-500 to-green-600 shadow-emerald-500/25"
                    : "bg-gradient-to-r from-violet-600 to-purple-600 shadow-violet-500/25 hover:from-violet-700 hover:to-purple-700"
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
                  ? "Analyzing your sign..."
                  : checkResult?.isCorrect
                  ? "Correct! ✓ — Check Again?"
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
                      <p className={`font-bold ${checkResult.isCorrect ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}`}>
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

          {/* Letter Info */}
          <div className="glass-card p-6">
            <div className="text-center mb-6">
              <div className="text-8xl font-extrabold bg-gradient-to-br from-emerald-500 to-teal-600 bg-clip-text text-transparent mb-2">
                {current.letter}
              </div>
              <div className="flex justify-center my-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800">
                  <GestureIllustration letter={current.letter} size={140} />
                </div>
              </div>
              <button onClick={speakLetter} className="flex items-center gap-1 text-sm text-gray-400 hover:text-emerald-500 mx-auto">
                <Volume2 className="w-4 h-4" /> Listen
              </button>
            </div>

            <div className="space-y-3">
              {/* Description */}
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2">How to sign:</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{current.description}</p>
              </div>

              {/* Step by Step */}
              <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
                <p className="text-sm font-semibold text-violet-700 dark:text-violet-300 mb-2">Step by step:</p>
                <ol className="space-y-2">
                  {current.stepByStep.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-200 dark:bg-violet-800 text-violet-700 dark:text-violet-300 text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Tips */}
              <button onClick={() => setShowTip(!showTip)} className="text-xs text-gray-400 hover:text-gray-600 underline">
                {showTip ? "Hide tips" : "Show tips"}
              </button>
              {showTip && (
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-1">
                  {current.tips.map((tip, i) => (
                    <p key={i} className="text-xs text-gray-500 flex items-center gap-2">
                      <span className="text-emerald-500">•</span> {tip}
                    </p>
                  ))}
                </div>
              )}

              {/* Difficulty */}
              <div className={`px-3 py-2 rounded-lg text-xs font-medium ${
                current.category === "basic"
                  ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                  : current.category === "intermediate"
                  ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300"
                  : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300"
              }`}>
                Difficulty: {current.category.charAt(0).toUpperCase() + current.category.slice(1)}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setSelectedIndex(Math.max(0, selectedIndex - 1))}
                disabled={selectedIndex === 0}
                className="flex items-center gap-1 px-4 py-2 text-sm font-semibold border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <span className="text-sm text-gray-400">{selectedIndex + 1} / 26</span>
              <button
                onClick={() => setSelectedIndex(Math.min(25, selectedIndex + 1))}
                disabled={selectedIndex === 25}
                className="flex items-center gap-1 px-4 py-2 text-sm font-semibold border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
