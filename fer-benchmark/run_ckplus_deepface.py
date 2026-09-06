#!/usr/bin/env python3
"""Run the installed DeepFace pipeline on the checked-in CK+ test split.

This script creates prediction-level CSV files first, then delegates metric and
table generation to ``benchmark.py``.  It never writes hand-authored metric
values into the report artifacts.
"""

from __future__ import annotations

import argparse
import csv
import json
import time
from pathlib import Path

import cv2
import numpy as np
from deepface import DeepFace
from deepface.models.demography import Emotion

from benchmark import (
    CKPLUS_LABELS,
    evaluate_detector_rows,
    evaluate_e2e_rows,
    evaluate_rows,
    export_detector_evaluation,
    export_detector_selection,
    export_e2e_evaluation,
    export_e2e_selection,
    export_evaluation,
    export_selection,
    select_detector,
    select_e2e,
    select_model,
)


DATASET_NAME = "CKPlus-7-reproducibility"
FER_MODEL_NAME = "CNN FER 7-class"
DEFAULT_DETECTORS = ("opencv", "mtcnn", "retinaface")


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--dataset",
        type=Path,
        default=Path(__file__).with_name("datasets") / "ckplus" / "ckextended.csv",
    )
    parser.add_argument(
        "--output-dir", type=Path, default=Path(__file__).with_name("outputs")
    )
    parser.add_argument("--detectors", nargs="+", default=list(DEFAULT_DETECTORS))
    parser.add_argument("--limit", type=int, default=None)
    return parser.parse_args()


def _load_samples(path: Path, limit: int | None) -> list[tuple[str, str, np.ndarray]]:
    samples: list[tuple[str, str, np.ndarray]] = []
    with path.open(encoding="utf-8", newline="") as stream:
        for source_index, row in enumerate(csv.DictReader(stream)):
            label = CKPLUS_LABELS[int(row["emotion"])]
            if row["Usage"] not in {"PublicTest", "PrivateTest"} or label == "contempt":
                continue
            pixels = np.fromstring(row["pixels"], sep=" ", dtype=np.uint8)
            if pixels.size != 48 * 48:
                raise ValueError(f"sample {source_index} does not contain 2304 pixels")
            gray = pixels.reshape(48, 48)
            bgr = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)
            samples.append((f"ckplus-{source_index:04d}", label, bgr))
            if limit is not None and len(samples) >= limit:
                break
    if not samples:
        raise ValueError("no CK+ seven-class test samples were selected")
    return samples


def _as_uint8_bgr(face_rgb: np.ndarray) -> np.ndarray:
    face = np.asarray(face_rgb)
    if face.dtype != np.uint8:
        if face.size and float(face.max()) <= 1.0:
            face = face * 255.0
        face = np.clip(face, 0, 255).astype(np.uint8)
    return cv2.cvtColor(face, cv2.COLOR_RGB2BGR)


def _predict_emotion(model: object, face_bgr: np.ndarray) -> str:
    scores = model.predict(np.expand_dims(face_bgr, axis=0))
    return Emotion.labels[int(np.argmax(scores))]


def _write_csv(path: Path, rows: list[dict[str, object]], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def _run_fer_only(samples: list[tuple[str, str, np.ndarray]], model: object, output_dir: Path) -> Path:
    rows: list[dict[str, object]] = []
    _predict_emotion(model, samples[0][2])
    for sample_id, true_label, image in samples:
        started = time.perf_counter()
        pred_label = _predict_emotion(model, image)
        latency_ms = (time.perf_counter() - started) * 1000.0
        rows.append(
            {
                "sample_id": sample_id,
                "true_label": true_label,
                "pred_label": pred_label,
                "latency_ms": f"{latency_ms:.6f}",
            }
        )
    path = output_dir / "predictions" / "deepface_emotion_cnn_ckplus.csv"
    _write_csv(path, rows, ["sample_id", "true_label", "pred_label", "latency_ms"])
    result = evaluate_rows(rows)
    export_evaluation(result, FER_MODEL_NAME, DATASET_NAME, output_dir)
    return output_dir / "deepface_emotion_cnn_ckplus-7-reproducibility.json"


def _run_detector(
    detector: str,
    samples: list[tuple[str, str, np.ndarray]],
    emotion_model: object,
    output_dir: Path,
) -> tuple[Path, Path]:
    detector_rows: list[dict[str, object]] = []
    e2e_rows: list[dict[str, object]] = []

    # CK+ stores already cropped 48x48 faces. Upscaling avoids testing only a
    # detector's minimum input-size constraint; it does not add visual detail.
    warmup = cv2.resize(samples[0][2], (224, 224), interpolation=cv2.INTER_CUBIC)
    try:
        DeepFace.extract_faces(warmup, detector_backend=detector, enforce_detection=True, align=True)
    except Exception:
        pass

    for sample_id, true_label, image in samples:
        detector_input = cv2.resize(image, (224, 224), interpolation=cv2.INTER_CUBIC)
        started = time.perf_counter()
        faces: list[dict[str, object]] = []
        try:
            extracted = DeepFace.extract_faces(
                detector_input,
                detector_backend=detector,
                enforce_detection=True,
                align=True,
            )
            faces = [item for item in extracted if isinstance(item, dict)]
        except Exception:
            faces = []
        detector_latency_ms = (time.perf_counter() - started) * 1000.0

        valid_faces = [item for item in faces if item.get("face") is not None]
        detector_rows.append(
            {
                "sample_id": sample_id,
                "expected_face_count": "1",
                "detected_face_count": str(len(valid_faces)),
                "latency_ms": f"{detector_latency_ms:.6f}",
                "valid_crop": str(bool(valid_faces)).lower(),
                "condition_tags": "ckplus_cropped|upscaled_224",
            }
        )

        pred_label = ""
        if valid_faces:
            best = max(valid_faces, key=lambda item: float(item.get("confidence", 0.0)))
            pred_label = _predict_emotion(emotion_model, _as_uint8_bgr(best["face"]))
        total_latency_ms = (time.perf_counter() - started) * 1000.0
        e2e_rows.append(
            {
                "sample_id": sample_id,
                "true_label": true_label,
                "pred_label": pred_label,
                "face_detected": str(bool(valid_faces)).lower(),
                "latency_ms": f"{total_latency_ms:.6f}",
            }
        )

    prediction_dir = output_dir / "predictions"
    detector_csv = prediction_dir / f"{detector}_ckplus_detector.csv"
    e2e_csv = prediction_dir / f"{detector}_deepface_emotion_cnn_ckplus_e2e.csv"
    _write_csv(
        detector_csv,
        detector_rows,
        ["sample_id", "expected_face_count", "detected_face_count", "latency_ms", "valid_crop", "condition_tags"],
    )
    _write_csv(
        e2e_csv,
        e2e_rows,
        ["sample_id", "true_label", "pred_label", "face_detected", "latency_ms"],
    )

    detector_result = evaluate_detector_rows(detector_rows)
    e2e_result = evaluate_e2e_rows(e2e_rows)
    export_detector_evaluation(detector_result, detector, DATASET_NAME, output_dir)
    export_e2e_evaluation(e2e_result, detector, FER_MODEL_NAME, DATASET_NAME, output_dir)
    return (
        output_dir / f"{detector}_ckplus-7-reproducibility_detector.json",
        output_dir / f"{detector}_deepface_emotion_cnn_ckplus-7-reproducibility_e2e.json",
    )


def main() -> None:
    args = _parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    samples = _load_samples(args.dataset, args.limit)
    emotion_model = DeepFace.build_model("Emotion", task="facial_attribute")

    fer_summary = _run_fer_only(samples, emotion_model, args.output_dir)
    fer_result = json.loads(fer_summary.read_text(encoding="utf-8"))
    export_selection(select_model([fer_result], max_p95_ms=200.0), args.output_dir)

    detector_summaries: list[dict[str, object]] = []
    e2e_summaries: list[dict[str, object]] = []
    for detector in args.detectors:
        detector_path, e2e_path = _run_detector(
            detector, samples, emotion_model, args.output_dir
        )
        detector_summaries.append(json.loads(detector_path.read_text(encoding="utf-8")))
        e2e_summaries.append(json.loads(e2e_path.read_text(encoding="utf-8")))

    export_detector_selection(
        select_detector(detector_summaries, max_p95_ms=5000.0, min_detection_rate=0.0),
        args.output_dir,
    )
    export_e2e_selection(
        select_e2e(
            e2e_summaries,
            max_p95_ms=5000.0,
            min_detection_rate=0.0,
            min_macro_f1=0.0,
        ),
        args.output_dir,
    )
    print(
        json.dumps(
            {
                "dataset": DATASET_NAME,
                "samples": len(samples),
                "fer_model": FER_MODEL_NAME,
                "detectors": args.detectors,
                "output_dir": str(args.output_dir),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
