from __future__ import annotations

from typing import Any

import cv2
import numpy as np
from deepface import DeepFace

from services.facial_segmentation import segment_face_regions
from services.projector import project_embedding


MODEL_NAME = "Facenet512"
MODEL_VERSION = "Facenet512+regional-projector-v1"


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


def _embedding(region: np.ndarray) -> list[float]:
    representation = DeepFace.represent(
        img_path=region,
        model_name=MODEL_NAME,
        detector_backend="skip",
        enforce_detection=False,
    )
    item = _first_analysis_item(representation)
    raw_embedding = item.get("embedding")
    if not isinstance(raw_embedding, list) or len(raw_embedding) != 512:
        raise ValueError("Không trích xuất được embedding FaceNet512 hợp lệ")

    projected = np.asarray(project_embedding(raw_embedding), dtype=np.float32)
    norm = float(np.linalg.norm(projected))
    if norm > 0:
        projected = projected / norm
    return projected.tolist()


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

    return {
        "score": round(score, 4),
        "blurScore": round(blur_score, 4),
        "brightnessScore": round(brightness_score, 4),
        "detectionConfidence": round(confidence, 4),
        "accepted": score >= 0.45 and confidence >= 0.70,
        "reasons": reasons,
    }


def analyze_image_bytes(image_bytes: bytes) -> dict[str, Any]:
    image_array = np.frombuffer(image_bytes, dtype=np.uint8)
    raw_image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    if raw_image is None:
        raise ValueError("Tệp tải lên không phải ảnh hợp lệ")

    faces = DeepFace.extract_faces(
        img_path=raw_image,
        detector_backend="opencv",
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

    face_bgr = cv2.resize(_as_uint8_bgr(face_rgb), (160, 160))
    upper, mid, lower = segment_face_regions(face_bgr)

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

    return {
        "modelVersion": MODEL_VERSION,
        "faceCount": 1,
        "primaryFace": {
            "embeddings": {
                "upper": _embedding(upper),
                "mid": _embedding(mid),
                "lower": _embedding(lower),
            },
            "expression": {
                "dominant": dominant,
                "confidence": round(confidence, 6),
                "probabilities": probabilities,
            },
            "quality": _quality(face_bgr, detection_confidence),
        },
    }
