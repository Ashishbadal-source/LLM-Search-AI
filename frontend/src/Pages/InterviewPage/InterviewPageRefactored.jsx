import React, { useEffect, useState, useRef } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import Sidebar from "../../Components/Sidebar/Sidebar";
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../../config';
import { useTheme } from '../../context/ThemeContext';
import { getMovement, showLookStraightMessage, hideLookStraightMessage, calculateDistance, detectSmile, distance, calculateEAR, detectBlink, detectCameraLook } from './MediapipeFunctions';
import { glowAiCoach, glowUser } from './GlowFunctions.jsx';
import { NetworkStatus, NetworkQualityIndicator } from './Network.jsx';
import SmileStatistics from '../../Components/SmileStatistics/SmileStatistics';
import { useSmileTracking } from '../../hooks/useSmileTracking';
import avatarVideo from './Avatarvideo.mp4';
import aiCoach from './avatar7pic.jpg';

// Add CSS for glow effect for the AI coach avatar
const glowStyle = document.createElement('style');
glowStyle.textContent = `
  @keyframes glowPulse {
    0% {
      box-shadow: 0 0 6px 6px rgba(19, 84, 122, 0.3),
                  0 0 12px 8px rgba(19, 84, 122, 0.2),
                  0 0 18px 12px rgba(19, 84, 122, 0.1);
    }
    25% {
      box-shadow: 0 0 8px 8px rgba(19, 84, 122, 0.5),
                  0 0 16px 12px rgba(19, 84, 122, 0.3),
                  0 0 24px 16px rgba(19, 84, 122, 0.2);
    }
    50% {
      box-shadow: 0 0 12px 12px rgba(19, 84, 122, 0.6),
                  0 0 20px 16px rgba(19, 84, 122, 0.4),
                  0 0 30px 20px rgba(19, 84, 122, 0.2);
    }
    75% {
      box-shadow: 0 0 8px 8px rgba(19, 84, 122, 0.5),
                  0 0 16px 12px rgba(19, 84, 122, 0.3),
                  0 0 24px 16px rgba(19, 84, 122, 0.2);
    }
    100% {
      box-shadow: 0 0 6px 6px rgba(19, 84, 122, 0.3),
                  0 0 12px 8px rgba(19, 84, 122, 0.2),
                  0 0 18px 12px rgba(19, 84, 122, 0.1);
    }
  }

  #aiCoach {
    transition: all 0.7s ease-in-out;
    box-shadow: 0 0 0 0 rgba(19, 84, 122, 0);
  }

  .glow {
    animation: glowPulse 1.5s infinite ease-in-out !important;
  }

  /* Add smooth transition when glow is removed */
  .glow-exit {
    animation: none !important;
    transition: all 0.5s ease-out !important;
    box-shadow: 0 0 0 0 rgba(19, 84, 122, 0) !important;
  }
`;
document.head.appendChild(glowStyle);

// --- Face and eye tracking variables (used by Mediapipe functions) ---
let prevNoseY = null;     // For head movement detection
const LEFT_IRIS = 468;
const RIGHT_IRIS = 473;
const LEFT_EYE_INNER = 133;
const LEFT_EYE_OUTER = 33;
const RIGHT_EYE_INNER = 362;
const RIGHT_EYE_OUTER = 263;
const NOSE_TIP = 1;
let lookFrames = 0;       // Frames where user is looking at camera
let lookTotalFrames = 0;  // Total frames for look detection
const LEFT_EYE_EAR = [33, 160, 158, 133, 153, 144];
const RIGHT_EYE_EAR = [362, 385, 387, 263, 373, 380];
const EAR_THRESHOLD = 0.22;  // Eye aspect ratio threshold for blink
let blinkCounter = 0;     // Number of blinks detected
let blinkActive = false;

// --- Media stream and recording variables ---
let cameraStream = null;      // User webcam stream
let screenRecorder;           // MediaRecorder for screen+mic
let screenChunks = [];        // Chunks of recorded video
let screenStream;             // Screen stream
let micStream = null;         // Microphone stream
let uploadInProgress = false; // Flag for video upload

// --- Screen Recording Functions ---
// (Include all your existing screen recording functions here - startScreenRecording, stopScreenRecording, goFullscreen)

// --- Dialog styles for the interview complete dialog ---
const dialogWrapperClasses = "fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4";
const dialogBoxClasses = "bg-white bg-opacity-50 backdrop-blur-lg p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-2xl min-h-[300px]";

// --- Global transcript for speech recognition ---
let finalTranscriptGlobal = ""; // shared across the component

// Utility: delay for async/await
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- Interview Complete Dialog ---
// (Include your existing InterviewCompleteDialog component here)

// --- Main Interview Page Component ---
const InterviewPage = () => {
  // --- State and refs ---
  const { darkMode } = useTheme();
  
  // Use the custom smile tracking hook
  const {
    smileStats,
    smileFramesRef,
    unsmileRef,
    totalFramesRef,
    updateSmileStats,
    resetSmileStats,
    getCurrentStats
  } = useSmileTracking();

  // --- All your existing state variables ---
  const hasStarted = useRef(false);
  const hasStartedRecording = useRef(false);
  const hasStartedInterview = useRef(false);
  const recognitionRef = useRef(null);
  const isSubmitting = useRef(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [mainCount, setMainCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [showBlur, setShowBlur] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);
  const interviewStartTimeRef = useRef(null);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  // --- Avatar video state ---
  const [showAvatarVideo, setShowAvatarVideo] = useState(false);
  const avatarVideoRef = useRef(null);

  // --- Timer durations (seconds) ---
  const MAIN_QUESTION_TIME = 10;
  const FOLLOW_UP_TIME = 10;

  // --- Include all your existing functions here ---
  // (startTimer, handleTimeUp, fetchNextQuestion, fetchFollowUpQuestion, etc.)

  // --- Modified sendFaceStatsToServer to use the hook ---
  const sendFaceStatsToServer = async () => {
    try {
      if (!hasStarted.current) return;

      const stats = getCurrentStats();
      const res = await fetch(`${API_BASE_URL}/save_face_stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          smileFrames: stats.smileFrames,
          unsmileFrames: stats.unsmileFrames,
          smileTotal: stats.totalFrames,
          lookFrames: lookFrames,
          lookTotal: lookTotalFrames,
          blinkCount: blinkCounter
        })
      });
      const result = await res.json();
      if (result.success) {
        console.log("📊 Face stats saved successfully");
      } else {
        console.error("❌ Failed to save face stats:", result.message);
      }
    } catch (err) {
      console.error("❌ Failed to send face stats:", err);
    }
  };

  // --- useEffect: On mount, start screen recording, countdown, and interview ---
  useEffect(() => {
    if (!hasStartedRecording.current) {
      hasStartedRecording.current = true;

      // Reset smile stats when interview starts
      resetSmileStats();

      // Include your existing startScreenRecording and interview initialization logic
    }

    // --- Webcam and face mesh setup ---
    const video = document.getElementById("userVideo");
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          cameraStream = stream;
          if (video) {
            video.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Webcam access error:", err);
        });
    }

    const videoElement = document.getElementById("userVideo");
    const faceMesh = new FaceMesh({
      locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    // Set up periodic face stats saving (every 30 seconds)
    const faceStatsInterval = setInterval(() => {
      if (hasStarted.current) {
        sendFaceStatsToServer();
      }
    }, 30000);

    // On each frame, run face/eye/smile detection
    faceMesh.onResults(results => {
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        getMovement(landmarks);
        // Use the refs from the hook
        detectSmile(landmarks, smileFramesRef, unsmileRef, totalFramesRef);
        detectCameraLook(landmarks);
        detectBlink(landmarks);
      }
    });

    // Start Mediapipe camera loop
    if (videoElement) {
      const camera = new Camera(videoElement, {
        onFrame: async () => {
          await faceMesh.send({ image: videoElement });
        },
        width: 640,
        height: 480
      });
      camera.start();
    }

    // Cleanup function on unmount
    return () => {
      clearInterval(faceStatsInterval);
      hideLookStraightMessage();
    };
  }, [resetSmileStats, smileFramesRef, unsmileRef, totalFramesRef]);

  // --- Include all your other useEffects and functions ---

  // --- Main render: Interview UI layout ---
  return (
    <>
      <Navbar heading="Interview Page" type={1} flag={1} />
      <Sidebar selectedIndex={3} />
      
      {/* Persistent Network Quality Indicator */}
      <NetworkQualityIndicator />
      
      {/* Add NetworkStatus component */}
      <NetworkStatus
        isOnline={isOnline}
        onRetry={() => {/* your retry logic */}}
      />

      {/* Smile Statistics Component - now using the extracted component */}
      <SmileStatistics 
        smileStats={smileStats}
        isVisible={true}
        position="top-right"
      />

      <div className={`flex flex-col min-h-screen max-h-screen h-screen transition-colors duration-300 ${darkMode
        ? 'bg-gradient-to-b from-gray-900 to-gray-800 text-white'
        : 'bg-gradient-to-b from-[#6bc1c4] to-[#105775] text-white'
        } font-montserrat text-xs sm:text-sm md:text-base overflow-y-auto`}
        style={{ height: '100vh' }}
      >
        {/* Overlay instead of blur */}
        {(countdown !== null || showBlur) && (
          <div className="fixed inset-0 bg-gradient-to-b from-[#13547a] to-[#105775] flex items-center justify-center z-[9999]">
            <div className="flex flex-col items-center space-y-6">
              {countdown !== null ? (
                <div className="flex flex-col items-center">
                  <div className="text-6xl sm:text-8xl font-bold text-white mb-4">
                    {countdown > 0 ? countdown : "Go!"}
                  </div>
                  <div className="text-lg sm:text-xl text-white/80">
                    Get ready for your interview
                  </div>
                </div>
              ) : showBlur ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  <div className="text-xl sm:text-2xl text-white/90 font-medium">
                    Preparing your interview
                  </div>
                  <div className="text-sm sm:text-base text-white/70">
                    This will only take a moment
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Main Content with proper margins for Navbar and Sidebar */}
        <div className="flex flex-1 w-full ">
          {/* Include all your existing UI content here */}
          <div className="flex flex-col flex-1 items-center justify-center w-full px-1 sm:px-3 md:px-6 lg:px-12 xl:px-20 pt-16 pb-0 md:pt-24 md:pb-0" style={{ minHeight: 0 }}>
            {/* Your existing interview UI content */}
            {/* ... */}
          </div>
        </div>
      </div>
    </>
  );
};

export default InterviewPage;