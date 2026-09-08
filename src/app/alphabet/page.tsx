"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Keyboard,
  Volume2,
  Copy,
  Check,
  Trash2,
  Camera,
  Loader2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { GestureAnalysis } from "@/lib/gesture-detection";
import { checkLetter, ASL_PATTERNS } from "@/lib/asl-patterns";
import { GestureIllustration } from "@/lib/gesture-illustrations";
import {
  useCamera,
  CameraLoadingSpinner,
  CameraError,
  CameraStatusBadge,
  StartCameraButton,
  StopCameraButton,
} from "@/hooks/useCamera";

const LETTER_COOLDOWN_MS = 1200; // Minimum time between recognizing the same letter
const CONFIDENCE_THRESHOLD = 60; // Minimum score to accept a letter

export default function SignKeyboardPage() {
  const [typedText, setTypedText] = useState("");
  const [lastTypedLetter, setLastTypedLetter] = useState<string | null>(null);
  const [lastTypedTime, setLastTypedTime] = useState(0);
  const [recognizedLetters, setRecognizedLetters] = useState<string[]>([]);
  const [showCopied, setShowCopied] = useState(false);
  const [currentGuess, setCurrentGuess] = useState<{ letter: string; score: number } | null>(null);
  const [totalTyped, setTotalTyped] = useState(0);
  const [showOnboard, setShowOnboard] = useState(true);
  const lastAnalysisRef = useRef<GestureAnalysis | null>(null);
  const cooldownRef = useRef(0);

  const {
    status: cameraStatus,
    errorMessage,
    handDetected,
    analysis: cameraAnalysis,
    startCamera: startCameraRaw,
    stopCamera: stopCameraRaw,
    videoRef,
    canvasRef,
    isActive: cameraActive,
  } = useCamera();

  // Continuous letter recognition loop
  useEffect(() => {
    if (!cameraActive || !cameraAnalysis || !handDetected) {
      setCurrentGuess(null);
      return;
    }

    lastAnalysisRef.current = cameraAnalysis;

    // Try to recognize a letter from current hand pose
    const now = Date.now();
    if (now < cooldownRef.current) return;

    let bestLetter = "";
    let bestScore = 0;

    // Check against all 26 ASL letter patterns
    for (const [letter, _pattern] of Object.entries(ASL_PATTERNS)) {
      const result = checkLetter(
        {
          fingers: cameraAnalysis.fingers,
          thumbDirection: "up",
          fingerSpread: cameraAnalysis.fingerSpread,
          fistRatio: cameraAnalysis.fistRatio,
        },
        letter
      );

      if (result.score > bestScore) {
        bestScore = result.score;
        bestLetter = letter;
      }
    }

    if (bestLetter && bestScore >= CONFIDENCE_THRESHOLD) {
      setCurrentGuess({ letter: bestLetter, score: bestScore });

      // Only type if confidence is high enough and cooldown passed
      if (bestScore >= 70 && now > cooldownRef.current) {
        const isSameLetter = bestLetter === lastTypedLetter;
        const cooldown = isSameLetter ? LETTER_COOLDOWN_MS * 1.5 : LETTER_COOLDOWN_MS;

        setTypedText((prev) => prev + bestLetter);
        setLastTypedLetter(bestLetter);
        setLastTypedTime(now);
        setRecognizedLetters((prev) => [...prev.slice(-20), bestLetter]);
        setTotalTyped((prev) => prev + 1);
        cooldownRef.current = now + cooldown;
      }
    } else {
      setCurrentGuess(null);
    }
  }, [cameraAnalysis, cameraActive, handDetected, lastTypedLetter]);

  const handleCopy = useCallback(() => {
    if (!typedText) return;
    navigator.clipboard.writeText(typedText);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  }, [typedText]);

  const handleSpeak = useCallback(() => {
    if (!typedText) return;
    const u = new SpeechSynthesisUtterance(typedText);
    u.lang = "en-US";
    u.rate = 0.7;
    window.speechSynthesis.speak(u);
  }, [typedText]);

  const handleClear = useCallback(() => {
    setTypedText("");
    setLastTypedLetter(null);
    setRecognizedLetters([]);
    setTotalTyped(0);
  }, []);

  const handleBackspace = useCallback(() => {
    setTypedText((prev) => prev.slice(0, -1));
  }, []);

  const handleSpace = useCallback(() => {
    setTypedText((prev) => prev + " ");
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Allow typing with physical keyboard too for accessibility
    if (e.key === "Backspace") {
      handleBackspace();
    } else if (e.key === " ") {
      e.preventDefault();
      handleSpace();
    } else if (/^[a-zA-Z]$/.test(e.key)) {
      setTypedText((prev) => prev + e.key.toUpperCase());
      setTotalTyped((prev) => prev + 1);
    }
  }, [handleBackspace, handleSpace]);

  return (
    <div
      className="min-h-screen pt-24 pb-16"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-violet-500/25">
            <Keyboard className="w-8 h-8 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-gray-900 dark:text-white">
            Sign Language{" "}
            <span className="bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
              Keyboard
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Sign ASL letters with your hands — the AI reads them and types your message in real-time.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="flex justify-center gap-6 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span><strong className="text-gray-900 dark:text-white">{totalTyped}</strong> letters typed</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span><strong className="text-gray-900 dark:text-white">{typedText.length}</strong> characters</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Camera + Recognition */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Sign Camera
            </h3>

            <div className="camera-feed bg-gray-900 relative mb-4 rounded-xl overflow-hidden">
              <video ref={videoRef} className="w-full" autoPlay playsInline muted />
              <canvas ref={canvasRef} className={`w-full absolute inset-0 ${cameraActive && handDetected ? "" : "hidden"}`} />

              {/* Current Guess Overlay */}
              {cameraActive && handDetected && currentGuess && (
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
                  <span className="text-2xl font-extrabold text-white">{currentGuess.letter}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    currentGuess.score >= 70
                      ? "bg-emerald-500 text-white"
                      : currentGuess.score >= 50
                      ? "bg-amber-500 text-white"
                      : "bg-red-500 text-white"
                  }`}>
                    {currentGuess.score}%
                  </span>
                </div>
              )}

              {/* Idle State */}
              {!cameraActive && cameraStatus === "idle" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm mb-3">Enable camera to start signing</p>
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
              ) : (
                <StartCameraButton onClick={startCameraRaw} />
              )}
            </div>

            {/* Recognition Instructions */}
            {showOnboard && (
              <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 mb-4">
                <p className="text-sm font-semibold text-violet-700 dark:text-violet-300 mb-2">How it works:</p>
                <ol className="space-y-1.5 text-xs text-violet-600 dark:text-violet-400">
                  <li className="flex items-center gap-2"><span className="font-bold">1.</span> Hold your hand up to the camera</li>
                  <li className="flex items-center gap-2"><span className="font-bold">2.</span> Form an ASL letter sign</li>
                  <li className="flex items-center gap-2"><span className="font-bold">3.</span> When confidence hits 70%+, the letter is typed</li>
                  <li className="flex items-center gap-2"><span className="font-bold">4.</span> Hold for 1.5s before the same letter types again</li>
                </ol>
                <button onClick={() => setShowOnboard(false)} className="text-xs text-violet-400 hover:text-violet-300 mt-2 underline">
                  Got it, dismiss
                </button>
              </div>
            )}

            {/* Recent Letters */}
            {recognizedLetters.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-xs text-gray-500 mr-1">Recent:</span>
                {recognizedLetters.slice(-8).map((letter, i) => (
                  <span
                    key={i}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-bold"
                  >
                    {letter}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right: Typed Output */}
          <div className="glass-card p-6 flex flex-col">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              Typed Output
            </h3>

            {/* Text Display */}
            <div className="flex-1 min-h-[200px] p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 mb-4 relative">
              {typedText ? (
                <p className="text-2xl font-mono text-gray-900 dark:text-white break-all leading-relaxed">
                  {typedText}
                  <span className="inline-block w-0.5 h-6 bg-violet-500 animate-pulse ml-0.5 align-middle" />
                </p>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-gray-400 text-center">
                    <ArrowRight className="w-5 h-5 mx-auto mb-2 opacity-50" />
                    Sign ASL letters to type here
                    <br />
                    <span className="text-xs">Or use your keyboard</span>
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                disabled={!typedText}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              >
                {showCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {showCopied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={handleSpeak}
                disabled={!typedText}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              >
                <Volume2 className="w-4 h-4" /> Speak
              </button>
              <button
                onClick={handleBackspace}
                disabled={!typedText}
                className="px-4 py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              >
                ⌫
              </button>
              <button
                onClick={handleSpace}
                disabled={!cameraActive}
                className="px-4 py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              >
                ␣
              </button>
              <button
                onClick={handleClear}
                disabled={!typedText}
                className="px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Phrases */}
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Quick phrases (tap to insert):</p>
              <div className="flex flex-wrap gap-2">
                {["HELLO", "THANK YOU", "PLEASE", "YES", "NO", "HELP", "SORRY"].map((phrase) => (
                  <button
                    key={phrase}
                    onClick={() => setTypedText((prev) => prev + (prev ? " " : "") + phrase)}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-700 dark:hover:text-violet-300 transition-all"
                  >
                    {phrase}
                  </button>
                ))}
              </div>
            </div>

            {/* ASL Reference Mini */}
            <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <p className="text-xs text-gray-500 mb-2">ASL Letter Reference:</p>
              <div className="flex flex-wrap gap-1">
                {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
                  <div
                    key={letter}
                    className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-all ${
                      currentGuess?.letter === letter
                        ? "bg-violet-500 text-white scale-125 shadow-lg"
                        : lastTypedLetter === letter
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {letter}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
