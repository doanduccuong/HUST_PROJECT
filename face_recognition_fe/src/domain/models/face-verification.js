export class FaceVerification {
  constructor({
    verified,
    matchingScore,
    maskDetected,
    similarities,
    appliedWeights,
    targetBbox,
    targetLandmarks,
    galleryBbox,
    galleryLandmarks,
    targetDims,
    galleryDims
  } = {}) {
    this.verified = verified ?? false;
    this.matchingScore = matchingScore ?? 0.0;
    this.maskDetected = maskDetected ?? false;
    this.similarities = similarities ?? { upper_face: 0, middle_face: 0, lower_face: 0, dynamic_facs: 0 };
    this.appliedWeights = appliedWeights ?? { alpha_1_upper: 0, alpha_2_middle: 0, alpha_3_lower: 0, beta_dynamic: 0 };
    this.targetBbox = targetBbox ?? [];
    this.targetLandmarks = targetLandmarks ?? [];
    this.galleryBbox = galleryBbox ?? [];
    this.galleryLandmarks = galleryLandmarks ?? [];
    this.targetDims = targetDims ?? [];
    this.galleryDims = galleryDims ?? [];
  }
}
