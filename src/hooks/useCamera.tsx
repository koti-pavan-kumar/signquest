/**
 * useCamera Hook
 * Shared hook for camera + MediaPipe initialization with loading states,
 * error handling, and graceful degradation.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { Loader2, Camera, AlertCircle, VideoOff, Eye } from "lucide-react";
import { analyzeGesture, GestureAnalysis, Landmark } from "@/lib/gesture-detection";

export type CameraStatus =
  | "idle"        // Camera not started
  | "loading"     // Requesting camera + loading MediaPipe
  | "ready"       // Camera active, MediaPipe ready
  | "error"       // Something failed
  | "no-permission"; // User denied camera

export interface UseCameraOptions {
  width?: number;
  height?: number;
}

export interface UseCameraReturn {
  status: CameraStatus;
  errorMessage: string;
  handDetected: boolean;
  analysis: GestureAnalysis | null;
  videoReady: boolean;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isActive: boolean;
}

/**
 * Wait for a ref to become non-null (polls every 50ms, max 2s).
 */
function waitForRef<T>(ref: React.RefObject<T>, timeoutMs = 2000): Promise<T> {
  return new Promise((resolve, reject) => {
    if (ref.current) {
      resolve(ref.current);
      return;
    }
    const start = Date.now();
    const check = () => {
      if (ref.current) {
        resolve(ref.current);
      } else if (Date.now() - start > timeoutMs) {
        reject(new Error("Video element not found in DOM"));
      } else {
        setTimeout(check, 50);
      }
    };
    check();
  });
}

export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
  const { width = 640, height = 480 } = options;

  const [status, setStatus] = useState<CameraStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [handDetected, setHandDetected] = useState(false);
  const [analysis, setAnalysis] = useState<GestureAnalysis | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number | null>(null);
  const mpHandsRef = useRef<any>(null);

  const isActive = status === "ready";

  // Initialize MediaPipe Hands
  const initMediaPipe = useCallback(async () => {
    if (mpHandsRef.current) return mpHandsRef.current;

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
          const vw = videoRef.current.videoWidth;
          const vh = videoRef.current.videoHeight;
          if (ctx && vw > 0 && vh > 0) {
            canvasRef.current.width = vw;
            canvasRef.current.height = vh;
            ctx.clearRect(0, 0, vw, vh);
            try {
              ctx.drawImage(videoRef.current, 0, 0, vw, vh);
            } catch {
              // Video frame not ready yet
            }

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

              // Analyze gesture
              const gestureAnalysis = analyzeGesture(landmarks as Landmark[]);
              setAnalysis(gestureAnalysis);
            } else {
              setHandDetected(false);
              setAnalysis(null);
            }
          }
        }
      });

      mpHandsRef.current = hands;
      return hands;
    } catch (err) {
      console.error("[useCamera] Failed to load MediaPipe:", err);
      throw new Error("Failed to load AI model. Please check your internet connection and try again.");
    }
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    console.log("[useCamera] startCamera called");
    setErrorMessage("");
    setHandDetected(false);
    setAnalysis(null);
    setStatus("loading");

    try {
      // Check if camera API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("[useCamera] getUserMedia not supported");
        setStatus("no-permission");
        setErrorMessage("Camera is not supported in this browser. Please use Chrome, Edge, or Firefox.");
        return;
      }

      console.log("[useCamera] Requesting camera access...");
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width, height },
        });
        console.log("[useCamera] Camera stream obtained:", stream.getTracks().map(t => t.kind));
      } catch (err: any) {
        console.error("[useCamera] getUserMedia failed:", err.name, err.message);
        setStatus("no-permission");
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setErrorMessage("Camera access was denied. Please allow camera access in your browser settings and try again.");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setErrorMessage("No camera found. Please connect a webcam and try again.");
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          setErrorMessage("Camera is in use by another application. Please close other apps using the camera.");
        } else {
          setErrorMessage(`Could not access camera: ${err.message}. Please check your camera settings.`);
        }
        return;
      }

      streamRef.current = stream;

      // Wait for videoRef to be available in DOM (handles race condition)
      console.log("[useCamera] Waiting for video element...");
      let video: HTMLVideoElement;
      try {
        video = await waitForRef(videoRef, 3000);
      } catch {
        console.error("[useCamera] Video element not found after 3s");
        setStatus("error");
        setErrorMessage("Video element not found. Please refresh the page.");
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      // Attach stream to video element
      console.log("[useCamera] Attaching stream to video element");
      video.srcObject = stream;

      // Wait for video to have data
      await new Promise<void>((resolve) => {
        if (video.readyState >= 2) { resolve(); return; }
        video.onloadeddata = () => resolve();
        setTimeout(resolve, 3000); // fallback after 3s
      });
      setVideoReady(true);

      try {
        await video.play();
        console.log("[useCamera] Video playing successfully");
      } catch (playErr: any) {
        console.error("[useCamera] Video play failed:", playErr);
        // Autoplay might be blocked — try muted
        video.muted = true;
        try {
          await video.play();
          console.log("[useCamera] Video playing (muted)");
        } catch {
          setStatus("error");
          setErrorMessage("Could not play video. Your browser may be blocking autoplay. Try clicking the video or enabling autoplay.");
          return;
        }
      }

      // Load MediaPipe model
      console.log("[useCamera] Loading MediaPipe model...");
      try {
        await initMediaPipe();
        console.log("[useCamera] MediaPipe loaded successfully");
      } catch (err: any) {
        console.warn("[useCamera] MediaPipe failed, camera still active:", err.message);
        setStatus("ready");
        setErrorMessage("AI model failed to load. Camera is active but gesture detection may not work. Check your internet connection.");
        return;
      }

      setStatus("ready");
      console.log("[useCamera] Camera ready!");
    } catch (err: any) {
      console.error("[useCamera] Unexpected error:", err);
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred while starting the camera.");
    }
  }, [width, height, initMediaPipe]);

  // Stop camera
  const stopCamera = useCallback(() => {
    console.log("[useCamera] stopCamera called");
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus("idle");
    setHandDetected(false);
    setAnalysis(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return {
    status,
    errorMessage,
    handDetected,
    analysis,
    videoReady,
    startCamera,
    stopCamera,
    videoRef,
    canvasRef,
    isActive,
  };
}

// ===== Reusable UI Components =====

export function CameraLoadingSpinner({ message }: { message?: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/95 z-10">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-violet-500 animate-spin mx-auto mb-3" />
        <p className="text-white font-semibold text-sm">{message || "Loading AI model..."}</p>
        <p className="text-gray-400 text-xs mt-1">This may take a few seconds</p>
      </div>
    </div>
  );
}

export function CameraError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/95 z-10">
      <div className="text-center px-6">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <p className="text-white font-semibold text-sm mb-1">Something went wrong</p>
        <p className="text-gray-400 text-xs mb-4 max-w-xs mx-auto">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-all"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

export function CameraStatusBadge({ status, handDetected }: { status: CameraStatus; handDetected: boolean }) {
  if (status === "idle" || status === "loading" || status === "error" || status === "no-permission") {
    return null;
  }

  return (
    <div
      className={`absolute top-3 left-3 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
        handDetected
          ? "bg-emerald-500/80 text-white"
          : "bg-amber-500/80 text-white"
      }`}
    >
      {handDetected ? (
        <>
          <Eye className="w-3 h-3" />
          Hand detected
        </>
      ) : (
        <>
          <AlertCircle className="w-3 h-3" />
          Show your hand
        </>
      )}
    </div>
  );
}

export function StartCameraButton({
  onClick,
  label = "Start Camera",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:from-violet-700 hover:to-purple-700 transition-all active:scale-95"
    >
      <Camera className="w-5 h-5" />
      {label}
    </button>
  );
}

export function StopCameraButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
    >
      <VideoOff className="w-4 h-4" />
      Stop Camera
    </button>
  );
}
