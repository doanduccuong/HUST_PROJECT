export const FRAME_INTERVAL_MS = 1000;
export const MAX_FRAME_WIDTH = 640;

export function calculateFrameSize(videoWidth, videoHeight, maxWidth = MAX_FRAME_WIDTH) {
  if (!videoWidth || !videoHeight) return { width: 0, height: 0 };
  const scale = Math.min(1, maxWidth / videoWidth);
  return {
    width: Math.max(1, Math.round(videoWidth * scale)),
    height: Math.max(1, Math.round(videoHeight * scale)),
  };
}

export function canvasToJpegBlob(canvas, quality = 0.82) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Không tạo được JPEG frame."))),
      "image/jpeg",
      quality,
    );
  });
}
