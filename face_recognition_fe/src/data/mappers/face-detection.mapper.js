import { FaceDetection } from "@/domain";

export function toFaceDetectionDomain(dto) {
  const stage1 = dto?.data?.stage1;
  return new FaceDetection({
    faceDetected: stage1?.face_detected ?? false,
    maskDetected: stage1?.mask_detected ?? false,
    maskProbability: stage1?.mask_probability ?? 0.0,
    bbox: stage1?.bbox ?? [],
    landmarks: stage1?.landmarks ?? [],
    emotions: stage1?.emotions ?? {},
    csScore: stage1?.cs_score ?? 0.0,
    msrScore: stage1?.msr_score ?? 0.0,
    age: stage1?.age ?? 0,
    gender: stage1?.gender ?? "",
    race: stage1?.race ?? "",
  });
}
