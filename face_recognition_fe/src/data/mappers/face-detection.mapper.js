import { FaceDetection } from "@/domain";

export function toFaceDetectionDomain(dto) {
  const stage1 = dto?.data?.stage1;
  return new FaceDetection({
    faceDetected: stage1?.face_detected ?? false,
    maskDetected: stage1?.mask_detected ?? false,
    maskProbability: stage1?.mask_probability ?? 0.0,
    bbox: stage1?.bbox ?? [],
    landmarks: stage1?.landmarks ?? [],
  });
}
