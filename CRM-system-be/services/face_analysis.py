from __future__ import annotations

import time
from typing import Any

import cv2
import numpy as np


DETECTOR_BACKEND = "opencv"
EXPRESSION_MODEL_VERSION = "DeepFace-Emotion-CNN-7class-v1"
MODEL_VERSION = (
    f"detector={DETECTOR_BACKEND};"
    f"expression={EXPRESSION_MODEL_VERSION}"
)


def _as_uint8_bgr(face_rgb: np.ndarray) -> np.ndarray:
    face = np.asarray(face_rgb)
    if face.dtype != np.uint8:
        if face.size and float(face.max()) <= 1.0:
            face = face * 255.0
        face = np.clip(face, 0, 255).astype(np.uint8)
    return cv2.cvtColor(face, cv2.COLOR_RGB2BGR)


def _first_analysis_item(result: Any) -> dict[str, Any]:
    current = result
    while isinstance(current, list) and current:
        current = current[0]
    return current if isinstance(current, dict) else {}


def _quality(face_bgr: np.ndarray, detection_confidence: float) -> dict[str, Any]:
    gray = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2GRAY)
    laplacian_variance = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    blur_score = min(laplacian_variance / 300.0, 1.0)

    brightness = float(gray.mean())
    brightness_score = max(0.0, 1.0 - abs(brightness - 127.5) / 127.5)
    confidence = max(0.0, min(float(detection_confidence), 1.0))
    score = 0.45 * confidence + 0.35 * blur_score + 0.20 * brightness_score

    reasons: list[str] = []
    if blur_score < 0.25:
        reasons.append("IMAGE_BLURRY")
    if brightness < 45:
        reasons.append("IMAGE_TOO_DARK")
    elif brightness > 215:
        reasons.append("IMAGE_TOO_BRIGHT")
    if confidence < 0.80:
        reasons.append("LOW_FACE_CONFIDENCE")
    if score < 0.45:
        reasons.append("LOW_QUALITY_SCORE")

    return {
        "score": round(score, 4),
        "blurScore": round(blur_score, 4),
        "brightnessScore": round(brightness_score, 4),
        "detectionConfidence": round(confidence, 4),
        "accepted": not reasons,
        "reasons": reasons,
    }


def analyze_image_bytes(image_bytes: bytes) -> dict[str, Any]:
    from deepface import DeepFace

    started_at = time.perf_counter()
    image_array = np.frombuffer(image_bytes, dtype=np.uint8)
    raw_image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    if raw_image is None:
        raise ValueError("Tệp tải lên không phải ảnh hợp lệ")

    faces = DeepFace.extract_faces(
        img_path=raw_image,
        detector_backend=DETECTOR_BACKEND,
        enforce_detection=True,
        align=True,
    )
    if len(faces) != 1:
        raise ValueError(
            f"Ảnh đăng ký/tìm kiếm phải có đúng 1 khuôn mặt; phát hiện {len(faces)}"
        )

    extracted = faces[0]
    face_rgb = extracted.get("face") if isinstance(extracted, dict) else None
    if face_rgb is None:
        raise ValueError("Không lấy được vùng khuôn mặt đã căn chỉnh")

    face_bgr = _as_uint8_bgr(face_rgb)

    # DeepFace.analyze tự resize về 48×48 grayscale cho CNN emotion bên trong,
    # nên không cần resize trước ở đây.
    emotion_analysis = DeepFace.analyze(
        img_path=face_bgr,
        actions=["emotion"],
        detector_backend="skip",
        enforce_detection=False,
    )
    emotion_item = _first_analysis_item(emotion_analysis)
    raw_probabilities = emotion_item.get("emotion", {})
    probabilities = {
        str(label).lower(): round(float(value) / 100.0, 6)
        for label, value in raw_probabilities.items()
    }
    dominant = str(emotion_item.get("dominant_emotion", "neutral")).lower()
    confidence = probabilities.get(dominant, 0.0)

    detection_confidence = (
        float(extracted.get("confidence", 1.0))
        if isinstance(extracted, dict)
        else 1.0
    )
    raw_region = extracted.get("facial_area", {}) if isinstance(extracted, dict) else {}
    region = {
        "x": max(0, int(raw_region.get("x", 0))),
        "y": max(0, int(raw_region.get("y", 0))),
        "width": max(0, int(raw_region.get("w", 0))),
        "height": max(0, int(raw_region.get("h", 0))),
    }

    result = {
        "modelVersion": MODEL_VERSION,
        "detectorBackend": DETECTOR_BACKEND,
        "expressionModelVersion": EXPRESSION_MODEL_VERSION,
        "faceCount": 1,
        "primaryFace": {
            "region": region,
            "expression": {
                "dominant": dominant,
                "confidence": round(confidence, 6),
                "probabilities": probabilities,
            },
            "quality": _quality(face_bgr, detection_confidence),
        },
    }
    result["inferenceMs"] = max(0, round((time.perf_counter() - started_at) * 1000))
    return result
