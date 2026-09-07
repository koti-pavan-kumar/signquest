"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Camera, VideoOff, RotateCcw, Hand, Volume2, Eye } from "lucide-react";
import { analyzeGesture, Landmark } from "@/lib/gesture-detection";

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
  const [isActive, setIsActive] = useState(false);
  const [detectedGesture, setDetectedGesture] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [history, setHistory] = useState<{ gesture: string; time: number }[]>([]);
  const [totalDetected, setTotalDetected] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number | null>(null);

  // MediaPipe
  const mpHandsRef = useRef<any>(null);
  const [handDetected, setHandDetected] = useState(false);

  const initMediaPipe = useCallback(async () => {
    if (mpHandsRef.current) return;
    try {
      const { Hands } = await import("@mediapipe/hands");
      const hands = new Hands({
        locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
      });
      hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.7, minTrackingConfidence: 0.5 });
      hands.onResults((results: any) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const lm = results.multiHandLandmarks[0];
          setHandDetected(true);
          const a = analyzeGesture(lm as Landmark[]);
          const f = a.fingers;
          let g = "unknown";
          if (!f.thumb && !f.index && !f.middle && !f.ring && !f.pinky && a.fistRatio > 0.8) g = "fist";
          else if (f.index && f.middle && f.ring && f.pinky && !f.thumb) g = "open_palm";
          else if (f.index && f.middle && !f.ring && !f.pinky) g = a.fingerSpread > 0.3 ? "peace" : "ok";
          else if (f.thumb && f.pinky && !f.index) g = "call_me";
          else if (f.index && !f.middle && f.thumb) g = "thumbs_up";
          setDetectedGesture(g);
          setConfidence(a.confidence);
        } else {
          setHandDetected(false);
          setDetectedGesture("");
        }
        if (canvasRef.current && videoRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            ctx.drawImage(videoRef.current, 0, 0);
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
              const handLm = results.multiHandLandmarks[0];
              const conns = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[0,9],[9,10],[10,11],[11,12],[0,13],[13,14],[14,15],[15,16],[0,17],[17,18],[18,19],[19,20],[5,9],[9,13],[13,17]];
              ctx.strokeStyle = "#22c55e"; ctx.lineWidth = 2;
              for (const [a,b] of conns) {
                ctx.beginPath();
                ctx.moveTo(handLm[a].x * canvasRef.current.width, handLm[a].y * canvasRef.current.height);
                ctx.lineTo(handLm[b].x * canvasRef.current.width, handLm[b].y * canvasRef.current.height);
                ctx.stroke();
              }
              ctx.fillStyle = "#22c55e";
              for (const p of handLm) {
                ctx.beginPath(); ctx.arc(p.x * canvasRef.current.width, p.y * canvasRef.current.height, 3, 0, 2 * Math.PI); ctx.fill();
              }
            }
          }
        }
      });
      mpHandsRef.current = hands;
    } catch (e) { console.error("MediaPipe failed:", e); }
  }, []);

  useEffect(() => {
    if (!isActive || !mpHandsRef.current || !videoRef.current) return;
    let id: number;
    const loop = async () => {
      if (videoRef.current && videoRef.current.readyState >= 2 && mpHandsRef.current) {
        try { await mpHandsRef.current.send({ image: videoRef.current }); } catch {}
      }
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [isActive]);

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
      setIsActive(true);
    } catch {
      alert("Camera access is required for free play mode.");
    }
  }, [initMediaPipe]);

  const stopCamera = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsActive(false);
    setHandDetected(false);
    setDetectedGesture("");
  }, []);

  const recordGesture = useCallback(() => {
    if (!detectedGesture) return;
    setHistory((prev) => [{ gesture: detectedGesture, time: Date.now() }, ...prev.slice(0, 49)]);
    setTotalDetected((p) => p + 1);
  }, [detectedGesture]);

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
              {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90">
                  <div className="text-center">
                    <Hand className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">Enable your camera to start practicing</p>
                    <button onClick={startCamera} className="btn-primary flex items-center gap-2 mx-auto">
                      <Camera className="w-5 h-5" /> Start Camera
                    </button>
                  </div>
                </div>
              )}

              {isActive && (
                <>
                  <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                    handDetected ? "bg-emerald-500/80 text-white" : "bg-amber-500/80 text-white"
                  }`}>
                    <Eye className="w-3 h-3" />
                    {handDetected ? "Hand detected" : "Show your hand"}
                  </div>
                  {detectedGesture && (
                    <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{GESTURE_MAP[detectedGesture]?.emoji || "❓"}</span>
                      <div>
                        <p className="text-white font-bold">{GESTURE_MAP[detectedGesture]?.meaning || "Unknown"}</p>
                        <p className="text-gray-300 text-sm">Confidence: {(confidence * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                    <button onClick={recordGesture} className="px-4 py-2 bg-violet-600 text-white text-sm font-bold rounded-lg hover:bg-violet-700">
                      Record
                    </button>
                  </div>
                </div>
              )}
                </>
              )}
            </div>

            <div className="flex gap-2">
              {isActive ? (
                <button onClick={stopCamera} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600">
                  <VideoOff className="w-4 h-4" /> Stop Camera
                </button>
              ) : (
                <button onClick={startCamera} className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700">
                  <Camera className="w-4 h-4" /> Start Camera
                </button>
              )}
              <button onClick={() => { setHistory([]); setTotalDetected(0); }} className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                <RotateCcw className="w-4 h-4" /> Clear History
              </button>
            </div>
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
