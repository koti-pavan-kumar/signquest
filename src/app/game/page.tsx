"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Gamepad2, RotateCcw, Hand, Volume2 } from "lucide-react";
import { classifyGesture } from "@/lib/word-gesture-map";
import {
  recordGesture,
  getGestureHistory,
  clearGestureHistory,
  loadProgress,
  GestureHistoryEntry,
} from "@/lib/persistence";
import {
  useCamera,
  CameraLoadingSpinner,
  CameraError,
  CameraStatusBadge,
  StartCameraButton,
  StopCameraButton,
} from "@/hooks/useCamera";

const GESTURE_MAP: Record<string, { meaning: string; emoji: string }> = {
  open_palm: { meaning: "Hello / Open Palm", emoji: "🖐️" },
  fist: { meaning: "A / Stop", emoji: "✊" },
  peace: { meaning: "Victory / Peace", emoji: "✌️" },
  thumbs_up: { meaning: "Good / Yes / Like", emoji: "👍" },
  thumbs_down: { meaning: "No / Dislike", emoji: "👎" },
  pointing_up: { meaning: "Up / Attention", emoji: "☝️" },
  ok: { meaning: "OK / Perfect", emoji: "👌" },
  call_me: { meaning: "Phone / Call", emoji: "🤙" },
};

export default function GamePage() {
  const {
    status,
    errorMessage,
    handDetected,
    analysis,
    startCamera,
    stopCamera,
    videoRef,
    canvasRef,
    isActive,
  } = useCamera();

  const [detectedGesture, setDetectedGesture] = useState("");
  const [history, setHistory] = useState<GestureHistoryEntry[]>([]);
  const [totalDetected, setTotalDetected] = useState(0);

  // Load persisted history on mount
  useEffect(() => {
    const saved = getGestureHistory();
    if (saved.length > 0) {
      setHistory(saved);
      setTotalDetected(loadProgress().gesturesRecorded);
    }
  }, []);

  const lastAutoRecordRef = useRef("");

  // Classify gesture from analysis AND auto-record
  useEffect(() => {
    if (analysis) {
      const gesture = classifyGesture(
        analysis.fingers,
        analysis.fingerSpread,
        analysis.fistRatio
      );
      setDetectedGesture(gesture);

      // Auto-record when gesture is detected with high confidence and is stable
      if (gesture && analysis.confidence > 0.7 && gesture !== lastAutoRecordRef.current) {
        lastAutoRecordRef.current = gesture;
        const meaning = GESTURE_MAP[gesture]?.meaning || gesture;
        recordGesture(gesture, meaning);
        const entry: GestureHistoryEntry = { gesture, meaning, timestamp: Date.now() };
        setHistory((prev) => [entry, ...prev].slice(0, 100));
        setTotalDetected((p) => p + 1);
        // Cooldown: don't re-record same gesture for 2 seconds
        setTimeout(() => { lastAutoRecordRef.current = ""; }, 2000);
      }
    } else {
      setDetectedGesture("");
    }
  }, [analysis]);

  const recordGestureAction = useCallback(() => {
    if (!detectedGesture) return;
    const meaning = GESTURE_MAP[detectedGesture]?.meaning || detectedGesture;
    recordGesture(detectedGesture, meaning);
    const entry: GestureHistoryEntry = {
      gesture: detectedGesture,
      meaning,
      timestamp: Date.now(),
    };
    setHistory((prev) => [entry, ...prev].slice(0, 100));
    setTotalDetected((p) => p + 1);
  }, [detectedGesture]);

  const clearHistory = useCallback(() => {
    clearGestureHistory();
    setHistory([]);
    setTotalDetected(0);
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-violet-500/25"
            role="img"
            aria-label="Free Play mode icon"
          >
            <Gamepad2 className="w-8 h-8 text-white" aria-hidden="true" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-gray-900 dark:text-white">
            Free <span className="bg-gradient-to-r from-violet-400 to-purple-600 bg-clip-text text-transparent">Play</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Open practice mode — sign anything and see real-time detection feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera */}
          <div className="lg:col-span-2 glass-card p-6">
            <div
              className="camera-feed bg-gray-900 relative mb-4"
              role="region"
              aria-label="Camera feed for gesture detection"
            >
              <video
                ref={videoRef}
                className="w-full"
                autoPlay
                playsInline
                muted
                aria-label="Webcam video feed"
              />
              <canvas
                ref={canvasRef}
                className={`w-full absolute inset-0 ${isActive && handDetected ? "" : "hidden"}`}
                aria-hidden="true"
              />

              {/* Idle state */}
              {!isActive && status === "idle" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Hand className="w-16 h-16 text-gray-600 mx-auto mb-4" aria-hidden="true" />
                    <p className="text-gray-400 mb-4">Enable your camera to start practicing</p>
                    <StartCameraButton onClick={startCamera} />
                  </div>
                </div>
              )}

              {/* Loading state */}
              {status === "loading" && <CameraLoadingSpinner message="Loading hand detection..." />}

              {/* Error state */}
              {(status === "error" || status === "no-permission") && (
                <CameraError message={errorMessage} onRetry={startCamera} />
              )}

              {/* Active camera overlay */}
              {isActive && (
                <>
                  <CameraStatusBadge status={status} handDetected={handDetected} />
                  {detectedGesture && (
                    <div
                      className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-xl p-4"
                      role="status"
                      aria-live="polite"
                      aria-label={`Detected gesture: ${GESTURE_MAP[detectedGesture]?.meaning || "Unknown"}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl" aria-hidden="true">{GESTURE_MAP[detectedGesture]?.emoji || "❓"}</span>
                        <div>
                          <p className="text-white font-bold">{GESTURE_MAP[detectedGesture]?.meaning || "Unknown"}</p>
                          <p className="text-gray-300 text-sm">Auto-recorded • Confidence: {((analysis?.confidence || 0) * 100).toFixed(0)}%</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-2" role="toolbar" aria-label="Camera controls">
              {isActive ? (
                <StopCameraButton onClick={stopCamera} />
              ) : status === "idle" ? (
                <StartCameraButton onClick={startCamera} />
              ) : null}
              <button
                onClick={clearHistory}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
                aria-label="Clear gesture history"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" /> Clear History
              </button>
            </div>

            {/* Error warning */}
            {isActive && errorMessage && (
              <div className="mt-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800" role="alert">
                <p className="text-xs text-amber-700 dark:text-amber-300">{errorMessage}</p>
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="glass-card p-6" aria-label="Session statistics">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Session Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 text-center">
                  <div className="text-2xl font-extrabold text-violet-600" aria-label={`${totalDetected} gestures recorded`}>{totalDetected}</div>
                  <div className="text-xs text-gray-500">Gestures Recorded</div>
                </div>
                <div className="p-3 rounded-xl bg-pink-50 dark:bg-pink-900/20 text-center">
                  <div className="text-2xl font-extrabold text-pink-600" aria-label={`${history.length} in history`}>{history.length}</div>
                  <div className="text-xs text-gray-500">In History</div>
                </div>
              </div>
            </div>

            {/* Gesture Guide */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Volume2 className="w-4 h-4" aria-hidden="true" />
                Gesture Guide
              </h3>
              <div className="space-y-2" role="list" aria-label="Available gestures">
                {Object.entries(GESTURE_MAP).map(([key, val]) => (
                  <div
                    key={key}
                    role="listitem"
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${
                      detectedGesture === key
                        ? "bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800"
                        : "bg-gray-50 dark:bg-gray-800/50"
                    }`}
                    aria-label={`${val.emoji} ${key.replace("_", " ")}: ${val.meaning}`}
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <span aria-hidden="true">{val.emoji}</span>
                      <span className="capitalize">{key.replace("_", " ")}</span>
                    </span>
                    <span className="text-gray-500">{val.meaning.split(" / ")[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent History */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Recent Signs</h3>
              <div
                className="space-y-1 max-h-48 overflow-y-auto"
                role="log"
                aria-label="Gesture history"
                aria-live="off"
              >
                {history.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No gestures recorded yet</p>
                ) : (
                  history.map((h, i) => (
                    <div key={i} className="flex items-center justify-between px-2 py-1 text-xs">
                      <span>{GESTURE_MAP[h.gesture]?.emoji} {h.meaning?.split(" / ")[0]}</span>
                      <span className="text-gray-400">{new Date(h.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
