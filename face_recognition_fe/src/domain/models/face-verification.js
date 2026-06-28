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
    galleryDims,
    
    // New fields
    distance,
    threshold,
    fusedDistance,
    fusedThreshold,
    eyesDistance,
    noseDistance,
    mouthDistance,
    eyesWeight,
    noseWeight,
    mouthWeight,
    model,
    detectorBackend,
    similarityMetric
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
    
    this.distance = distance ?? 0.0;
    this.threshold = threshold ?? 0.0;
    this.fusedDistance = fusedDistance ?? 0.0;
    this.fusedThreshold = fusedThreshold ?? 0.0;
    this.eyesDistance = eyesDistance ?? 0.0;
    this.noseDistance = noseDistance ?? 0.0;
    this.mouthDistance = mouthDistance ?? 0.0;
    this.eyesWeight = eyesWeight ?? 0.0;
    this.noseWeight = noseWeight ?? 0.0;
    this.mouthWeight = mouthWeight ?? 0.0;
    this.model = model ?? "";
    this.detectorBackend = detectorBackend ?? "";
    this.similarityMetric = similarityMetric ?? "";
  }
}
