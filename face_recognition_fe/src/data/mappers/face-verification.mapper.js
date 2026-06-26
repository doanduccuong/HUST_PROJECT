import { FaceVerification } from "@/domain";

export function toFaceVerificationDomain(dto) {
  const v = dto?.data?.verification;
  return new FaceVerification({
    verified: v?.verified ?? false,
    matchingScore: v?.matching_score ?? 0.0,
    maskDetected: v?.mask_detected ?? false,
    similarities: {
      upper_face: v?.similarities?.upper_face ?? 0.0,
      middle_face: v?.similarities?.middle_face ?? 0.0,
      lower_face: v?.similarities?.lower_face ?? 0.0,
      dynamic_facs: v?.similarities?.dynamic_facs ?? 0.0,
    },
    appliedWeights: {
      alpha_1_upper: v?.applied_weights?.alpha_1_upper ?? 0.0,
      alpha_2_middle: v?.applied_weights?.alpha_2_middle ?? 0.0,
      alpha_3_lower: v?.applied_weights?.alpha_3_lower ?? 0.0,
      beta_dynamic: v?.applied_weights?.beta_dynamic ?? 0.0,
    },
    targetBbox: v?.target_bbox ?? [],
    targetLandmarks: v?.target_landmarks ?? [],
    galleryBbox: v?.gallery_bbox ?? [],
    galleryLandmarks: v?.gallery_landmarks ?? [],
    targetDims: v?.target_dims ?? [],
    galleryDims: v?.gallery_dims ?? [],
  });
}
