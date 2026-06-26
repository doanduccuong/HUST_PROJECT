export class FaceDetection {
  constructor({ faceDetected, maskDetected, maskProbability, bbox, landmarks } = {}) {
    this.faceDetected = faceDetected ?? false;
    this.maskDetected = maskDetected ?? false;
    this.maskProbability = maskProbability ?? 0.0;
    this.bbox = bbox ?? []; // [x1, y1, x2, y2]
    this.landmarks = landmarks ?? []; // [[x, y], ...]
  }
}
