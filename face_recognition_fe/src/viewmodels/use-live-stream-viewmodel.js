import { useEffect, useRef, useState } from "react";
import { FaceRecognitionDataSource, FaceRecognitionRepository } from "@/data";

export function useLiveStreamViewModel({ activeTab, streamInterval }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const animationFrameRef = useRef(null);
  const sendTimerRef = useRef(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [latency, setLatency] = useState(0);
  const [fps, setFps] = useState(0);
  const [detectionData, setDetectionData] = useState(null);
  const [stats, setStats] = useState({
    totalFrames: 0,
    facesDetected: 0,
    masksDetected: 0,
    noMasksDetected: 0,
  });
  const [errorMsg, setErrorMsg] = useState("");

  const frameCountRef = useRef(0);
  const fpsIntervalRef = useRef(null);
  const sendTimeTrackerRef = useRef({});

  const repository = new FaceRecognitionRepository(new FaceRecognitionDataSource());

  // Initialize FPS counter
  useEffect(() => {
    fpsIntervalRef.current = setInterval(() => {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
    }, 1000);

    return () => {
      if (fpsIntervalRef.current) clearInterval(fpsIntervalRef.current);
      stopStream();
      closeWebSocket();
    };
  }, []);

  const connectWebSocket = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;
    setIsConnecting(true);
    setErrorMsg("");

    try {
      const ws = repository.createWebSocketConnection();
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        setDetectionData(null);
      };

      ws.onerror = (err) => {
        setErrorMsg("Failed to connect to WebSocket server. Make sure Go BE is running on :8080.");
        setIsConnecting(false);
      };

      ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          if (response.status === "success") {
            const data = response.data?.stage1 || {};
            setDetectionData(data);

            const sentTime = sendTimeTrackerRef.current["latest"];
            if (sentTime) {
              setLatency(Date.now() - sentTime);
            }

            setStats((prev) => {
              const hasFace = data.face_detected;
              const hasMask = data.mask_detected;
              return {
                totalFrames: prev.totalFrames + 1,
                facesDetected: prev.facesDetected + (hasFace ? 1 : 0),
                masksDetected: prev.masksDetected + (hasFace && hasMask ? 1 : 0),
                noMasksDetected: prev.noMasksDetected + (hasFace && !hasMask ? 1 : 0),
              };
            });
          }
        } catch (err) {
          console.error("Failed to parse WebSocket payload", err);
        }
      };
    } catch (e) {
      setErrorMsg("Failed to establish WebSocket connection.");
      setIsConnecting(false);
    }
  };

  const closeWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  };

  const startStream = async () => {
    try {
      setErrorMsg("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => console.warn(err));
        setStreamActive(true);
        connectWebSocket();
      }
    } catch (err) {
      setErrorMsg("Failed to access camera. Please allow webcam permissions.");
    }
  };

  const stopStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
    if (sendTimerRef.current) {
      clearInterval(sendTimerRef.current);
      sendTimerRef.current = null;
    }
  };

  // Live Canvas Drawing Loop
  useEffect(() => {
    let active = true;

    const drawLoop = () => {
      if (!active) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && streamActive && activeTab === "live") {
        const ctx = canvas.getContext("2d");

        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
        }

        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        if (detectionData && detectionData.face_detected) {
          const { bbox, landmarks, mask_detected, mask_probability } = detectionData;
          const mirrorX = (x) => canvas.width - x;

          const [x1, y1, x2, y2] = bbox;
          const boxWidth = x2 - x1;
          const boxHeight = y2 - y1;
          const left = mirrorX(x2);

          const color = mask_detected ? "#10B981" : "#EF4444";
          const glowColor = mask_detected ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)";

          // Bounding Box Corners
          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.shadowBlur = 10;
          ctx.shadowColor = color;
          const len = Math.min(boxWidth, boxHeight) * 0.2;

          ctx.beginPath(); ctx.moveTo(left + len, y1); ctx.lineTo(left, y1); ctx.lineTo(left, y1 + len); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(left + boxWidth - len, y1); ctx.lineTo(left + boxWidth, y1); ctx.lineTo(left + boxWidth, y1 + len); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(left, y2 - len); ctx.lineTo(left, y2); ctx.lineTo(left + len, y2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(left + boxWidth, y2 - len); ctx.lineTo(left + boxWidth, y2); ctx.lineTo(left + boxWidth - len, y2); ctx.stroke();

          ctx.shadowBlur = 0;
          ctx.fillStyle = glowColor;
          ctx.fillRect(left, y1, boxWidth, boxHeight);

          // Landmarks
          if (landmarks) {
            landmarks.forEach((pt) => {
              const lx = mirrorX(pt[0]);
              const ly = pt[1];
              ctx.beginPath();
              ctx.arc(lx, ly, 4, 0, 2 * Math.PI);
              ctx.fillStyle = "#3B82F6";
              ctx.fill();
              ctx.strokeStyle = "#FFFFFF";
              ctx.lineWidth = 1;
              ctx.stroke();
            });
          }

          // Badge
          ctx.fillStyle = color;
          const labelText = `${mask_detected ? "MASK" : "NO MASK"} (${(mask_probability * 100).toFixed(0)}%)`;
          ctx.font = "bold 13px Inter, sans-serif";
          const textW = ctx.measureText(labelText).width;
          ctx.fillRect(left, y1 - 28, textW + 16, 24);
          ctx.fillStyle = "#FFFFFF";
          ctx.fillText(labelText, left + 8, y1 - 12);
        }
        frameCountRef.current += 1;
      }
      animationFrameRef.current = requestAnimationFrame(drawLoop);
    };

    drawLoop();

    return () => {
      active = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [streamActive, detectionData, activeTab]);

  // Live Frame Sending Loop
  useEffect(() => {
    if (streamActive && isConnected && activeTab === "live") {
      sendTimerRef.current = setInterval(() => {
        const canvas = canvasRef.current;
        const ws = wsRef.current;
        if (canvas && ws && ws.readyState === WebSocket.OPEN) {
          canvas.toBlob((blob) => {
            if (blob) {
              sendTimeTrackerRef.current["latest"] = Date.now();
              blob.arrayBuffer().then((buf) => {
                if (ws && ws.readyState === WebSocket.OPEN) ws.send(buf);
              });
            }
          }, "image/jpeg", 0.7);
        }
      }, streamInterval);
    } else {
      if (sendTimerRef.current) {
        clearInterval(sendTimerRef.current);
        sendTimerRef.current = null;
      }
    }
    return () => {
      if (sendTimerRef.current) clearInterval(sendTimerRef.current);
    };
  }, [streamActive, isConnected, streamInterval, activeTab]);

  return {
    videoRef,
    canvasRef,
    isConnected,
    isConnecting,
    streamActive,
    latency,
    fps,
    detectionData,
    stats,
    errorMsg,
    startStream,
    stopStream,
  };
}
