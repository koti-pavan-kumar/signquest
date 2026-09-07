"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Gamepad2, RotateCcw, Hand, Volume2 } from "lucide-react";
import { classifyGesture } from "@/lib/word-gesture-map";
import { recordGesture } from "@/lib/persistence";
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
  const [history, setHistory] = useState<{ gesture: string; time: number }[]>([]);
  const [totalDetected, setTotalDetected] = useState(0);

  // Classify gesture from analysis
  useEffect(() => {
    if (analysis) {
      const gesture = classifyGesture(
        analysis.fingers,
        analysis.fingerSpread,
        analysis.fistRatio
      );
      setDetectedGesture(gesture);
    } else {
      setDetectedGesture("");
    }
  }, [analysis]);

  const recordGestureAction = useCallback(() => {
    if (!detectedGesture) return;
    setHistory((prev) => [{ gesture: detectedGesture, time: Date.now() }, ...prev.slice(0, 49)]);
    setTotalDetected((p) => p + 1);
    recordGesture();
  }, [detectedGesture]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setTotalDetected(0);
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-violet-500/25">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
            Free <span className="bg-gradient-to-r from-violet-400 to-purple-600 bg-clip-text text-transparent">Play</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Open practice mode — sign anything and see real-time detection feedback.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera */}
          <div className="lg:col-span-2 glass-card p-6">
            <div className="camera-feed bg-gray-900 relative mb-4">
              <video ref={videoRef} className={`w-full ${isActive ? "hidden" : ""}`} autoPlay playsInline muted />
              <canvas ref={canvasRef} className={`w-full ${isActive ? "" : "hidden"}`} />

              {/* Idle state */}
              {!isActive && status === "idle" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Hand className="w-16 h-16 text-gray-600 mx-auto mb-4" />
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
                    <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{GESTURE_MAP[detectedGesture]?.emoji || "❓"}</span>
                          <div>
                            <p className="text-white font-bold">{GESTURE_MAP[detectedGesture]?.meaning || "Unknown"}</p>
                            <p className="text-gray-300 text-sm">Confidence: {((analysis?.confidence || 0) * 100).toFixed(0)}%</p>
                          </div>
                        </div>
                        <button onClick={recordGestureAction} className="px-4 py-2 bg-violet-600 text-white text-sm font-bold rounded-lg hover:bg-violet-700">
                          Record
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              {isActive ? (
                <StopCameraButton onClick={stopCamera} />
              ) : status === "idle" ? (
                <StartCameraButton onClick={startCamera} />
              ) : null}
              <button onClick={clearHistory} className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                <RotateCcw className="w-4 h-4" /> Clear History
              </button>
            </div>

            {/* Error warning */}
            {isActive && errorMessage && (
              <div className="mt-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-300">{errorMessage}</p>
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Session Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 text-center">
                  <div className="text-2xl font-extrabold text-violet-600">{totalDetected}</div>
                  <div className="text-xs text-gray-500">Gestures Recorded</div>
                </div>
                <div className="p-3 rounded-xl bg-pink-50 dark:bg-pink-900/20 text-center">
                  <div className="text-2xl font-extrabold text-pink-600">{history.length}</div>
                  <div className="text-xs text-gray-500">In History</div>
                </div>
              </div>
            </div>

            {/* Gesture Guide */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Gesture Guide
              </h3>
              <div className="space-y-2">
                {Object.entries(GESTURE_MAP).map(([key, val]) => (
                  <div
                    key={key}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${
                      detectedGesture === key
                        ? "bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800"
                        : "bg-gray-50 dark:bg-gray-800/50"
                    }`}
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <span>{val.emoji}</span>
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
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No gestures recorded yet</p>
                ) : (
                  history.map((h, i) => (
                    <div key={i} className="flex items-center justify-between px-2 py-1 text-xs">
                      <span>{GESTURE_MAP[h.gesture]?.emoji} {GESTURE_MAP[h.gesture]?.meaning?.split(" / ")[0]}</span>
                      <span className="text-gray-400">{new Date(h.time).toLocaleTimeString()}</span>
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
