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
  /** Width of the video stream */
  width?: number;
  /** Height of the video stream */
  height?: number;
  /** Whether to auto-start detection loop when ready */
  autoDetect?: boolean;
}

export interface UseCameraReturn {
  /** Current camera status */
  status: CameraStatus;
  /** Error message if status is "error" */
  errorMessage: string;
  /** Whether a hand is currently detected */
  handDetected: boolean;
  /** Current gesture analysis */
  analysis: GestureAnalysis | null;
  /** Start the camera and MediaPipe */
  startCamera: () => Promise<void>;
  /** Stop the camera and release resources */
  stopCamera: () => void;
  /** Ref to attach to the <video> element */
  videoRef: React.RefObject<HTMLVideoElement>;
  /** Ref to attach to the <canvas> element */
  canvasRef: React.RefObject<HTMLCanvasElement>;
  /** Whether the camera is currently active */
  isActive: boolean;
}

export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
  const { width = 640, height = 480 } = options;

  const [status, setStatus] = useState<CameraStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [handDetected, setHandDetected] = useState(false);
  const [analysis, setAnalysis] = useState<GestureAnalysis | null>(null);

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
      console.error("Failed to load MediaPipe:", err);
      throw new Error("Failed to load AI model. Please check your internet connection and try again.");
    }
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    // Reset state
    setErrorMessage("");
    setHandDetected(false);
    setAnalysis(null);
    setStatus("loading");

    try {
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setStatus("no-permission");
        setErrorMessage("Camera is not supported in this browser. Please use Chrome, Edge, or Firefox.");
        return;
      }

      // Request camera permission
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width, height },
        });
      } catch (err: any) {
        setStatus("no-permission");
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setErrorMessage("Camera access was denied. Please allow camera access in your browser settings and try again.");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setErrorMessage("No camera found. Please connect a webcam and try again.");
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          setErrorMessage("Camera is in use by another application. Please close other apps using the camera.");
        } else {
          setErrorMessage("Could not access camera. Please check your camera settings.");
        }
        return;
      }

      streamRef.current = stream;

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Load MediaPipe model
      try {
        await initMediaPipe();
      } catch (err: any) {
        // Camera works but AI model failed — still usable for basic features
        setStatus("ready");
        setErrorMessage("AI model failed to load. Camera is active but gesture detection may not work. Check your internet connection.");
        return;
      }

      setStatus("ready");
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred while starting the camera.");
    }
  }, [width, height, initMediaPipe]);

  // Stop camera
  const stopCamera = useCallback(() => {
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
    startCamera,
    stopCamera,
    videoRef,
    canvasRef,
    isActive,
  };
}

// ===== Reusable UI Components =====

/**
 * Loading spinner shown while MediaPipe model loads.
 */
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

/**
 * Error state shown when camera or model fails.
 */
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

/**
 * Camera status badge shown on the video feed.
 */
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

/**
 * Start camera button with icon.
 */
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

/**
 * Stop camera button.
 */
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
