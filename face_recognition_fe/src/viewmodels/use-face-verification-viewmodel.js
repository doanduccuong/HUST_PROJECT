import { useState, useRef } from "react";
import { FaceRecognitionDataSource, FaceRecognitionRepository } from "@/data";
import { VerifyFacesUseCase } from "@/domain";

export function useFaceVerificationViewModel() {
  const [currentImg, setCurrentImg] = useState(null);
  const [galleryImg, setGalleryImg] = useState(null);
  const [currentPreview, setCurrentPreview] = useState(null);
  const [galleryPreview, setGalleryPreview] = useState(null);

  const currentCanvasRef = useRef(null);
  const galleryCanvasRef = useRef(null);
  const currentImgRef = useRef(null);
  const galleryImgRef = useRef(null);

  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyError, setVerifyError] = useState("");

  const dataSource = new FaceRecognitionDataSource();
  const repository = new FaceRecognitionRepository(dataSource);
  const verifyFacesUseCase = new VerifyFacesUseCase(repository);

  const handleCurrentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCurrentImg(file);
      setCurrentPreview(URL.createObjectURL(file));
      setVerifyResult(null);
      setVerifyError("");

      const canvas = currentCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleGalleryChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGalleryImg(file);
      setGalleryPreview(URL.createObjectURL(file));
      setVerifyResult(null);
      setVerifyError("");

      const canvas = galleryCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const clearCurrent = () => {
    setCurrentImg(null);
    setCurrentPreview(null);
    setVerifyResult(null);
  };

  const clearGallery = () => {
    setGalleryImg(null);
    setGalleryPreview(null);
    setVerifyResult(null);
  };

  const handleVerify = async () => {
    if (!currentImg || !galleryImg) {
      setVerifyError("Please import both images first.");
      return;
    }

    setIsVerifying(true);
    setVerifyError("");
    setVerifyResult(null);

    try {
      const result = await verifyFacesUseCase.execute(currentImg, galleryImg);
      setVerifyResult(result);

      // Wait for state updates, then draw overlays
      setTimeout(() => {
        drawVerificationOverlays(result);
      }, 150);
    } catch (err) {
      setVerifyError("Failed to communicate with Go backend. Make sure it is running on :8080.");
    } finally {
      setIsVerifying(false);
    }
  };

  const drawVerificationOverlays = (data) => {
    const cCanvas = currentCanvasRef.current;
    const cImg = currentImgRef.current;
    if (cCanvas && cImg && data.targetBbox) {
      const dims = data.targetDims && data.targetDims.length === 2 
        ? data.targetDims 
        : [cImg.naturalWidth, cImg.naturalHeight];
      drawSingleOverlay(cCanvas, cImg, data.targetBbox, data.targetLandmarks, dims, data.maskDetected);
    }

    const gCanvas = galleryCanvasRef.current;
    const gImg = galleryImgRef.current;
    if (gCanvas && gImg && data.galleryBbox) {
      const dims = data.galleryDims && data.galleryDims.length === 2 
        ? data.galleryDims 
        : [gImg.naturalWidth, gImg.naturalHeight];
      drawSingleOverlay(gCanvas, gImg, data.galleryBbox, data.galleryLandmarks, dims, false);
    }
  };

  const drawSingleOverlay = (canvas, img, bbox, landmarks, originalDims, isMasked) => {
    if (originalDims[0] === 0 || originalDims[1] === 0) return;
    const ctx = canvas.getContext("2d");

    // Position and size the canvas exactly matching the displayed image coordinates
    canvas.style.left = `${img.offsetLeft}px`;
    canvas.style.top = `${img.offsetTop}px`;
    canvas.style.width = `${img.clientWidth}px`;
    canvas.style.height = `${img.clientHeight}px`;

    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = canvas.width / originalDims[0];
    const scaleY = canvas.height / originalDims[1];

    const x1 = bbox[0] * scaleX;
    const y1 = bbox[1] * scaleY;
    const x2 = bbox[2] * scaleX;
    const y2 = bbox[3] * scaleY;
    const boxW = x2 - x1;
    const boxH = y2 - y1;

    const color = isMasked ? "#10B981" : "#EF4444";
    const glowColor = isMasked ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)";

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

    // Draw Adaptive Local Patches (Upper, Middle, Lower)
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;

    // 1. Eyes & Forehead (Upper)
    ctx.strokeStyle = "rgba(59, 130, 246, 0.7)"; // Blue
    ctx.strokeRect(x1, y1, boxW, boxH * 0.55);
    ctx.fillStyle = "rgba(59, 130, 246, 0.05)";
    ctx.fillRect(x1, y1, boxW, boxH * 0.55);

    // 2. Nose (Middle)
    ctx.strokeStyle = "rgba(245, 158, 11, 0.7)"; // Orange/Amber
    ctx.strokeRect(x1 + boxW * 0.15, y1 + boxH * 0.35, boxW * 0.70, boxH * 0.40);
    ctx.fillStyle = "rgba(245, 158, 11, 0.05)";
    ctx.fillRect(x1 + boxW * 0.15, y1 + boxH * 0.35, boxW * 0.70, boxH * 0.40);

    // 3. Mouth & Chin (Lower)
    ctx.strokeStyle = "rgba(16, 185, 129, 0.7)"; // Green
    ctx.strokeRect(x1, y1 + boxH * 0.60, boxW, boxH * 0.40);
    ctx.fillStyle = "rgba(16, 185, 129, 0.05)";
    ctx.fillRect(x1, y1 + boxH * 0.60, boxW, boxH * 0.40);

    ctx.setLineDash([]); // Reset line dash

    if (landmarks && landmarks.length > 0) {
      landmarks.forEach((pt) => {
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

    ctx.fillStyle = color;
    const labelText = isMasked ? "PLASTIC SURGERY MODE" : "PS-RESISTANT SCAN";
    ctx.font = "bold 11px Inter, sans-serif";
    const textW = ctx.measureText(labelText).width;
    ctx.fillRect(x1, y1 - 20, textW + 12, 18);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(labelText, x1 + 6, y1 - 7);
  };

  return {
    currentImg,
    galleryImg,
    currentPreview,
    galleryPreview,
    currentCanvasRef,
    galleryCanvasRef,
    currentImgRef,
    galleryImgRef,
    isVerifying,
    verifyResult,
    verifyError,
    handleCurrentChange,
    handleGalleryChange,
    clearCurrent,
    clearGallery,
    handleVerify,
    drawVerificationOverlays,
  };
}
