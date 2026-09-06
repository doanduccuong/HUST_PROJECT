"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { experienceApi as defaultExperienceApi } from "../data/datasources/experience.api";
import {
  calculateFrameSize,
  canvasToJpegBlob,
  FRAME_INTERVAL_MS,
} from "../domain/experience/frameSampling";

export function useExperienceCaptureViewModel(api = defaultExperienceApi) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const objectUrlRef = useRef(null);
  const timerRef = useRef(null);
  const inFlightRef = useRef(false);
  const inFlightPromiseRef = useRef(null);
  const sessionRef = useRef(null);
  const sequenceRef = useRef(0);

  const [sourceType, setSourceType] = useState("VIDEO_FILE");
  const [sourceName, setSourceName] = useState("");
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState("IDLE");
  const [latestResult, setLatestResult] = useState(null);
  const [transitions, setTransitions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const releaseSource = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (objectUrlRef.current) {
      if (typeof URL.revokeObjectURL === "function") {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      objectUrlRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      videoRef.current.removeAttribute("src");
      videoRef.current.load();
    }
  }, []);

  useEffect(() => () => {
    clearTimer();
    releaseSource();
  }, [clearTimer, releaseSource]);

  const selectVideoFile = useCallback((file) => {
    if (!file || !videoRef.current) return;
    clearTimer();
    releaseSource();
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    videoRef.current.src = objectUrl;
    videoRef.current.load();
    setSourceType("VIDEO_FILE");
    setSourceName(file.name);
    setStatus("SOURCE_READY");
    setError(null);
  }, [clearTimer, releaseSource]);

  const openWebcam = useCallback(async () => {
    if (!videoRef.current || !navigator.mediaDevices?.getUserMedia) {
      setError("Trình duyệt không hỗ trợ webcam.");
      return;
    }
    clearTimer();
    releaseSource();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setSourceType("WEBCAM");
      setSourceName("Webcam trực tiếp");
      setStatus("SOURCE_READY");
      setError(null);
    } catch (cause) {
      setError(cause?.message || "Không thể truy cập webcam.");
      setStatus("ERROR");
    }
  }, [clearTimer, releaseSource]);

  const captureFrame = useCallback(async () => {
    const activeSession = sessionRef.current;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!activeSession || !video || !canvas || inFlightRef.current) return;
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) return;

    const { width, height } = calculateFrameSize(video.videoWidth, video.videoHeight);
    if (!width || !height) return;
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(video, 0, 0, width, height);

    inFlightRef.current = true;
    const sequence = ++sequenceRef.current;
    const operation = (async () => {
      const blob = await canvasToJpegBlob(canvas);
      const result = await api.analyzeFrame(
        activeSession.sessionId,
        blob,
        sequence,
        new Date().toISOString(),
      );
      setLatestResult(result);
      if (result.stateChanged) {
        setTransitions((current) => [...current, result]);
      }
      setError(null);
    })();
    inFlightPromiseRef.current = operation;
    try {
      await operation;
    } catch (cause) {
      setError(
        cause?.response?.data?.detail
          || cause?.message
          || "Không phân tích được frame.",
      );
    } finally {
      inFlightRef.current = false;
      if (inFlightPromiseRef.current === operation) {
        inFlightPromiseRef.current = null;
      }
    }
  }, [api]);

  const startSession = useCallback(async ({ cameraId, zone, customerId = null }) => {
    const video = videoRef.current;
    if (!video || !sourceName) {
      setError("Hãy chọn video hoặc mở webcam trước.");
      return;
    }
    setStatus("STARTING");
    setError(null);
    setSummary(null);
    setLatestResult(null);
    setTransitions([]);
    sequenceRef.current = 0;
    try {
      const created = await api.startSession({ cameraId, zone, customerId, sourceType });
      sessionRef.current = created;
      setSession(created);
      await video.play();
      setStatus("RUNNING");
      await captureFrame();
      timerRef.current = window.setInterval(captureFrame, FRAME_INTERVAL_MS);
    } catch (cause) {
      setStatus("ERROR");
      setError(cause?.response?.data?.detail || cause?.message || "Không tạo được session.");
    }
  }, [api, captureFrame, sourceName, sourceType]);

  const stopSession = useCallback(async () => {
    clearTimer();
    const activeSession = sessionRef.current;
    if (!activeSession) return;
    setStatus("CLOSING");
    try {
      if (inFlightPromiseRef.current) {
        await inFlightPromiseRef.current.catch(() => undefined);
      }
      const closed = await api.closeSession(activeSession.sessionId);
      setSummary(closed);
      setStatus("CLOSED");
      setError(null);
    } catch (cause) {
      setStatus("ERROR");
      setError(cause?.response?.data?.detail || cause?.message || "Không đóng được session.");
    } finally {
      sessionRef.current = null;
      setSession(null);
      if (sourceType === "WEBCAM") releaseSource();
      else if (videoRef.current) videoRef.current.pause();
    }
  }, [api, clearTimer, releaseSource, sourceType]);

  return {
    videoRef,
    canvasRef,
    sourceType,
    sourceName,
    session,
    status,
    latestResult,
    transitions,
    summary,
    error,
    selectVideoFile,
    openWebcam,
    startSession,
    stopSession,
  };
}
