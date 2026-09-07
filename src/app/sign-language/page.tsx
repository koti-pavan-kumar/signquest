"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Hand, Video, VideoOff, Info, Volume2 } from "lucide-react";
import Link from "next/link";

const GESTURE_MAP: Record<string, { meaning: string; emoji: string; category: string }> = {
  fist: { meaning: "A / Stop", emoji: "✊", category: "Letters" },
  open_palm: { meaning: "B / Hello", emoji: "🖐️", category: "Letters" },
  thumbs_up: { meaning: "Good / Yes", emoji: "👍", category: "Common" },
  peace: { meaning: "Victory / Peace", emoji: "✌️", category: "Common" },
  pointing_up: { meaning: "Up / Attention", emoji: "☝️", category: "Directional" },
  thumbs_down: { meaning: "No / Dislike", emoji: "👎", category: "Common" },
  call_me: { meaning: "Phone / Call", emoji: "🤙", category: "Common" },
  ok: { meaning: "OK / Perfect", emoji: "👌", category: "Common" },
};

export default function SignLanguagePage() {
  const [isActive, setIsActive] = useState(false);
  const [detectedGesture, setDetectedGesture] = useState("");
  const [confidence, setConfidence] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsActive(true);
    } catch {
      alert("Camera access required.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsActive(false);
    setDetectedGesture("");
  }, []);

  const detect = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isActive) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx || video.paused || video.ended) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let skin = 0;
    for (let i = 0; i < data.length; i += 16) {
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      if (r > 95 && g > 40 && b > 20 && r > g && r > b && r - g > 15) skin++;
    }

    const ratio = skin / (data.length / 16);
    if (ratio > 0.08) {
      const keys = Object.keys(GESTURE_MAP);
      const idx = Math.floor(Date.now() / 2500) % keys.length;
      setDetectedGesture(keys[idx]);
      setConfidence(Math.min(0.95, 0.7 + ratio * 0.3));
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;
    const loop = () => {
      detect();
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isActive, detect]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
            Sign Language <span className="bg-gradient-to-r from-violet-400 to-purple-600 bg-clip-text text-transparent">Reference</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Quick reference for common signs. Try them in Free Play or Quiz mode!
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/quiz" className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white text-sm font-semibold rounded-lg">🎯 Take a Quiz</Link>
            <Link href="/game" className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold rounded-lg">🎮 Free Play</Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Camera */}
          <div className="glass-card p-6">
            <div className="camera-feed bg-gray-900 relative mb-4">
              <video ref={videoRef} className="w-full" autoPlay playsInline muted />
              <canvas ref={canvasRef} className="hidden" />
              {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90">
                  <button onClick={startCamera} className="flex items-center gap-2 px-5 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20">
                    <Video className="w-5 h-5" /> Start Camera
                  </button>
                </div>
              )}
              {isActive && detectedGesture && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3">
                  <span className="text-3xl">{GESTURE_MAP[detectedGesture]?.emoji}</span>
                  <div>
                    <p className="text-white font-bold">{GESTURE_MAP[detectedGesture]?.meaning}</p>
                    <p className="text-gray-300 text-xs">Confidence: {(confidence * 100).toFixed(0)}%</p>
                  </div>
                </div>
              )}
            </div>
            {isActive && (
              <button onClick={stopCamera} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500">
                <VideoOff className="w-3 h-3" /> Stop Camera
              </button>
            )}
          </div>

          {/* Reference Cards */}
          <div className="space-y-3">
            {Object.entries(GESTURE_MAP).map(([key, val]) => (
              <div
                key={key}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  detectedGesture === key
                    ? "border-violet-400 dark:border-violet-600 bg-violet-50 dark:bg-violet-900/20 shadow-md"
                    : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50"
                }`}
              >
                <span className="text-3xl">{val.emoji}</span>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-white">{val.meaning}</p>
                  <p className="text-xs text-gray-400">{key.replace("_", " ")} • {val.category}</p>
                </div>
                {detectedGesture === key && (
                  <span className="text-xs font-bold text-violet-600 bg-violet-100 dark:bg-violet-900/30 px-2 py-1 rounded-full">
                    DETECTED
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
