import { useState, useRef } from "react";
import { FaceRecognitionDataSource, FaceRecognitionRepository } from "@/data";
import { DetectFaceUseCase } from "@/domain";

export function useSingleDetectViewModel() {
  const [detectImg, setDetectImg] = useState(null);
  const [detectPreview, setDetectPreview] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectResult, setDetectResult] = useState(null);
  const [detectError, setDetectError] = useState("");

  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  const dataSource = new FaceRecognitionDataSource();
  const repository = new FaceRecognitionRepository(dataSource);
  const detectFaceUseCase = new DetectFaceUseCase(repository);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDetectImg(file);
      setDetectPreview(URL.createObjectURL(file));
      setDetectResult(null);
      setDetectError("");

      // Clear canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const clearImage = () => {
    setDetectImg(null);
    setDetectPreview(null);
    setDetectResult(null);
    setDetectError("");
  };

  const runDetection = async () => {
    if (!detectImg) {
      setDetectError("Please import an image first.");
      return;
    }

    setIsDetecting(true);
    setDetectError("");
    setDetectResult(null);

    try {
      const result = await detectFaceUseCase.execute(detectImg);
      setDetectResult(result);

      // Draw overlay after state updates
      setTimeout(() => {
        drawOverlay(result);
      }, 150);
    } catch (err) {
      setDetectError("Failed to detect face. Make sure backend is running on :8080.");
    } finally {
      setIsDetecting(false);
    }
  };

  const drawOverlay = (result) => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !result || !result.faceDetected) return;

    const ctx = canvas.getContext("2d");

    // Position and size the canvas exactly matching the displayed image coordinates
    canvas.style.left = `${img.offsetLeft}px`;
    canvas.style.top = `${img.offsetTop}px`;
    canvas.style.width = `${img.clientWidth}px`;
    canvas.style.height = `${img.clientHeight}px`;

    // Match display size
    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const originalW = img.naturalWidth;
    const originalH = img.naturalHeight;

    const scaleX = canvas.width / originalW;
    const scaleY = canvas.height / originalH;

    const bbox = result.bbox;
    const x1 = bbox[0] * scaleX;
    const y1 = bbox[1] * scaleY;
    const x2 = bbox[2] * scaleX;
    const y2 = bbox[3] * scaleY;
    const boxW = x2 - x1;
    const boxH = y2 - y1;

    const isMasked = result.maskDetected;
    const color = isMasked ? "#10B981" : "#EF4444";
    const glowColor = isMasked ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)";

    // Bounding Box
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;
    const len = Math.min(boxW, boxH) * 0.2;

    ctx.beginPath(); ctx.moveTo(x1 + len, y1); ctx.lineTo(x1, y1); ctx.lineTo(x1, y1 + len); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2 - len, y1); ctx.lineTo(x2, y1); ctx.lineTo(x2, y1 + len); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, y2 - len); ctx.lineTo(x1, y2); ctx.lineTo(x1 + len, y2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2 - len); ctx.lineTo(x2, y2); ctx.lineTo(x2 - len, y2); ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = glowColor;
    ctx.fillRect(x1, y1, boxW, boxH);

    // Landmarks
    if (result.landmarks) {
      result.landmarks.forEach((pt) => {
        const lx = pt[0] * scaleX;
        const ly = pt[1] * scaleY;
        ctx.beginPath();
        ctx.arc(lx, ly, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "#3B82F6";
        ctx.fill();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    // Label
    ctx.fillStyle = color;
    const labelText = `${isMasked ? "MASKED" : "UNMASKED"} (${(result.maskProbability * 100).toFixed(0)}%)`;
    ctx.font = "bold 11px Inter, sans-serif";
    const textW = ctx.measureText(labelText).width;
    ctx.fillRect(x1, y1 - 20, textW + 12, 18);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(labelText, x1 + 6, y1 - 7);
  };

  return {
    detectImg,
    detectPreview,
    isDetecting,
    detectResult,
    detectError,
    canvasRef,
    imgRef,
    handleImageChange,
    clearImage,
    runDetection,
    drawOverlay,
  };
}
