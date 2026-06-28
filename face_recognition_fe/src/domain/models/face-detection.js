export class FaceDetection {
  constructor({ faceDetected, maskDetected, maskProbability, bbox, landmarks, emotions, csScore, msrScore, age, gender, race } = {}) {
    this.faceDetected = faceDetected ?? false;
    this.maskDetected = maskDetected ?? false;
    this.maskProbability = maskProbability ?? 0.0;
    this.bbox = bbox ?? []; // [x1, y1, x2, y2]
    this.landmarks = landmarks ?? []; // [[x, y], ...]
    this.emotions = emotions ?? {};
    this.csScore = csScore ?? 0.0;
    this.msrScore = msrScore ?? 0.0;
    this.age = age ?? 0;
    this.gender = gender ?? "";
    this.race = race ?? "";
  }
}
