#!/usr/bin/env python3
"""Reproducible FER survey exports and prediction-level evaluation."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
from pathlib import Path
from typing import Any, Iterable

JsonDict = dict[str, Any]

LABELS = ("angry", "disgust", "fear", "happy", "sad", "surprise", "neutral")
CKPLUS_LABELS = {0: "angry", 1: "disgust", 2: "fear", 3: "happy", 4: "sad", 5: "surprise", 6: "neutral", 7: "contempt"}

def percentile(values: list[float], quantile: float) -> float:
    if not values:
        raise ValueError("cannot calculate a percentile from an empty list")
    ordered = sorted(values)
    index = (len(ordered) - 1) * quantile
    lower = math.floor(index)
    upper = math.ceil(index)
    if lower == upper:
        return ordered[lower]
    return ordered[lower] + (ordered[upper] - ordered[lower]) * (index - lower)


def evaluate_rows(rows: Iterable[dict[str, str]]) -> JsonDict:
    matrix = [[0 for _ in LABELS] for _ in LABELS]
    latencies: list[float] = []
    count = 0
    for line_number, row in enumerate(rows, start=2):
        true_label = row.get("true_label", "").strip().lower()
        pred_label = row.get("pred_label", "").strip().lower()
        if true_label not in LABELS or pred_label not in LABELS:
            raise ValueError(f"line {line_number}: labels must be one of {LABELS}")
        matrix[LABELS.index(true_label)][LABELS.index(pred_label)] += 1
        if row.get("latency_ms", "").strip():
            latency = float(row["latency_ms"])
            if latency < 0:
                raise ValueError(f"line {line_number}: latency_ms must be non-negative")
            latencies.append(latency)
        count += 1
    if count == 0:
        raise ValueError("prediction file contains no samples")

    correct = sum(matrix[i][i] for i in range(len(LABELS)))
    per_class: dict[str, dict[str, float | int]] = {}
    precisions: list[float] = []
    recalls: list[float] = []
    f1s: list[float] = []
    for i, label in enumerate(LABELS):
        tp = matrix[i][i]
        fp = sum(matrix[r][i] for r in range(len(LABELS))) - tp
        fn = sum(matrix[i]) - tp
        support = sum(matrix[i])
        precision = tp / (tp + fp) if tp + fp else 0.0
        recall = tp / (tp + fn) if tp + fn else 0.0
        f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
        precisions.append(precision)
        recalls.append(recall)
        f1s.append(f1)
        per_class[label] = {
            "precision": precision,
            "recall": recall,
            "f1": f1,
            "support": support,
        }

    result: JsonDict = {
        "sample_count": count,
        "accuracy": correct / count,
        "macro_precision": sum(precisions) / len(precisions),
        "macro_recall": sum(recalls) / len(recalls),
        "macro_f1": sum(f1s) / len(f1s),
        "labels": list(LABELS),
        "confusion_matrix": matrix,
        "per_class": per_class,
    }
    if latencies:
        result["latency_ms"] = {
            "count": len(latencies),
            "mean": sum(latencies) / len(latencies),
            "p50": percentile(latencies, 0.50),
            "p95": percentile(latencies, 0.95),
            "p99": percentile(latencies, 0.99),
        }
    return result


def _latency_summary(latencies: list[float]) -> dict[str, float | int]:
    if not latencies:
        return {}
    return {
        "count": len(latencies),
        "mean": sum(latencies) / len(latencies),
        "p50": percentile(latencies, 0.50),
        "p95": percentile(latencies, 0.95),
        "p99": percentile(latencies, 0.99),
    }


def evaluate_detector_rows(rows: Iterable[dict[str, str]]) -> JsonDict:
    sample_count = 0
    positive_frames = 0
    detected_positive_frames = 0
    no_face_frames = 0
    false_positive_frames = 0
    exact_count_matches = 0
    invalid_crops = 0
    latencies: list[float] = []
    ious: list[float] = []
    condition_stats: dict[str, dict[str, int]] = {}

    for line_number, row in enumerate(rows, start=2):
        try:
            expected = int(row.get("expected_face_count", "").strip())
            detected = int(row.get("detected_face_count", "").strip())
        except ValueError as exc:
            raise ValueError(f"line {line_number}: expected_face_count and detected_face_count must be integers") from exc
        if expected < 0 or detected < 0:
            raise ValueError(f"line {line_number}: face counts must be non-negative")

        if row.get("latency_ms", "").strip():
            latency = float(row["latency_ms"])
            if latency < 0:
                raise ValueError(f"line {line_number}: latency_ms must be non-negative")
            latencies.append(latency)
        if row.get("bbox_iou", "").strip():
            iou = float(row["bbox_iou"])
            if not 0 <= iou <= 1:
                raise ValueError(f"line {line_number}: bbox_iou must be in [0, 1]")
            ious.append(iou)
        if row.get("valid_crop", "").strip().lower() in {"false", "0", "no"}:
            invalid_crops += 1

        sample_count += 1
        if expected > 0:
            positive_frames += 1
            if detected > 0:
                detected_positive_frames += 1
        else:
            no_face_frames += 1
            if detected > 0:
                false_positive_frames += 1
        if expected == detected:
            exact_count_matches += 1

        tags = [tag.strip() for tag in row.get("condition_tags", "").split("|") if tag.strip()]
        for tag in tags:
            stats = condition_stats.setdefault(tag, {"samples": 0, "expected_positive": 0, "detected_positive": 0})
            stats["samples"] += 1
            if expected > 0:
                stats["expected_positive"] += 1
                if detected > 0:
                    stats["detected_positive"] += 1

    if sample_count == 0:
        raise ValueError("detector prediction file contains no samples")

    condition_report = {}
    for tag, stats in condition_stats.items():
        positives = stats["expected_positive"]
        condition_report[tag] = {
            **stats,
            "detection_rate": stats["detected_positive"] / positives if positives else None,
        }

    result: JsonDict = {
        "sample_count": sample_count,
        "positive_frames": positive_frames,
        "no_face_frames": no_face_frames,
        "detection_rate": detected_positive_frames / positive_frames if positive_frames else 0.0,
        "miss_rate": 1 - (detected_positive_frames / positive_frames) if positive_frames else 0.0,
        "false_positive_rate": false_positive_frames / no_face_frames if no_face_frames else 0.0,
        "exact_count_accuracy": exact_count_matches / sample_count,
        "invalid_crop_rate": invalid_crops / sample_count,
        "condition_report": condition_report,
    }
    if ious:
        result["mean_bbox_iou"] = sum(ious) / len(ious)
    latency = _latency_summary(latencies)
    if latency:
        result["latency_ms"] = latency
    return result


def _classification_with_missing(rows: Iterable[dict[str, str]]) -> JsonDict:
    matrix = [[0 for _ in LABELS] for _ in LABELS]
    missed_by_class = {label: 0 for label in LABELS}
    total = 0
    valid_predictions = 0
    for line_number, row in enumerate(rows, start=2):
        true_label = row.get("true_label", "").strip().lower()
        pred_label = row.get("pred_label", "").strip().lower()
        if true_label not in LABELS:
            raise ValueError(f"line {line_number}: true_label must be one of {LABELS}")
        total += 1
        if not pred_label:
            missed_by_class[true_label] += 1
            continue
        if pred_label not in LABELS:
            raise ValueError(f"line {line_number}: pred_label must be one of {LABELS} or blank")
        matrix[LABELS.index(true_label)][LABELS.index(pred_label)] += 1
        valid_predictions += 1
    if total == 0:
        raise ValueError("end-to-end prediction file contains no samples")

    correct = sum(matrix[i][i] for i in range(len(LABELS)))
    per_class: dict[str, dict[str, float | int]] = {}
    f1s: list[float] = []
    precisions: list[float] = []
    recalls: list[float] = []
    for i, label in enumerate(LABELS):
        tp = matrix[i][i]
        fp = sum(matrix[r][i] for r in range(len(LABELS))) - tp
        fn = sum(matrix[i]) - tp + missed_by_class[label]
        support = sum(matrix[i]) + missed_by_class[label]
        precision = tp / (tp + fp) if tp + fp else 0.0
        recall = tp / (tp + fn) if tp + fn else 0.0
        f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
        precisions.append(precision)
        recalls.append(recall)
        f1s.append(f1)
        per_class[label] = {"precision": precision, "recall": recall, "f1": f1, "support": support}
    return {
        "sample_count": total,
        "valid_predictions": valid_predictions,
        "no_result_rate": 1 - (valid_predictions / total),
        "accuracy": correct / total,
        "macro_precision": sum(precisions) / len(precisions),
        "macro_recall": sum(recalls) / len(recalls),
        "macro_f1": sum(f1s) / len(f1s),
        "labels": list(LABELS),
        "confusion_matrix": matrix,
        "missed_by_class": missed_by_class,
        "per_class": per_class,
    }


def evaluate_e2e_rows(rows: Iterable[dict[str, str]]) -> JsonDict:
    cached_rows = list(rows)
    result = _classification_with_missing(cached_rows)
    latencies: list[float] = []
    detected = 0
    for line_number, row in enumerate(cached_rows, start=2):
        if row.get("latency_ms", "").strip():
            latency = float(row["latency_ms"])
            if latency < 0:
                raise ValueError(f"line {line_number}: latency_ms must be non-negative")
            latencies.append(latency)
        if row.get("face_detected", "").strip().lower() in {"true", "1", "yes"} or row.get("pred_label", "").strip():
            detected += 1
    result["detection_rate"] = detected / result["sample_count"]
    latency = _latency_summary(latencies)
    if latency:
        result["latency_ms"] = latency
    return result


def _fmt(value: object, digits: int = 2) -> str:
    if value is None:
        return "--"
    if isinstance(value, float):
        return f"{value:.{digits}f}"
    return str(value)


def inspect_ckplus(dataset_path: Path, manifest_path: Path) -> JsonDict:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    digest = hashlib.sha256(dataset_path.read_bytes()).hexdigest()
    if digest != manifest["sha256"]:
        raise ValueError(f"dataset checksum mismatch: expected {manifest['sha256']}, got {digest}")
    included_usage = set(manifest["benchmark_protocol"]["included_usage"])
    counts_all = {name: 0 for name in CKPLUS_LABELS.values()}
    counts_selected = {name: 0 for name in LABELS}
    usage_counts: dict[str, int] = {}
    total = 0
    selected = 0
    with dataset_path.open(encoding="utf-8", newline="") as stream:
        for line_number, row in enumerate(csv.DictReader(stream), start=2):
            try:
                label_id = int(row["emotion"])
            except (KeyError, ValueError) as exc:
                raise ValueError(f"line {line_number}: invalid emotion label") from exc
            if label_id not in CKPLUS_LABELS:
                raise ValueError(f"line {line_number}: unsupported emotion label {label_id}")
            pixels = row.get("pixels", "").split()
            if len(pixels) != 48 * 48:
                raise ValueError(f"line {line_number}: expected 2304 pixels, got {len(pixels)}")
            if any(not token.isdigit() or not 0 <= int(token) <= 255 for token in pixels):
                raise ValueError(f"line {line_number}: pixel values must be integers in [0, 255]")
            usage = row.get("Usage", "")
            label = CKPLUS_LABELS[label_id]
            counts_all[label] += 1
            usage_counts[usage] = usage_counts.get(usage, 0) + 1
            total += 1
            if usage in included_usage and label in LABELS:
                counts_selected[label] += 1
                selected += 1
    expected = manifest["benchmark_protocol"]["expected_samples"]
    if total != manifest["rows_total"] or selected != expected:
        raise ValueError(f"dataset count mismatch: total={total}, selected={selected}, expected selected={expected}")
    return {
        "dataset": manifest["name"],
        "sha256": digest,
        "total_rows": total,
        "selected_test_rows": selected,
        "usage_counts": usage_counts,
        "class_counts_all": counts_all,
        "class_counts_selected": counts_selected,
        "protocol": manifest["benchmark_protocol"],
    }


def select_model(summaries: list[JsonDict], max_p95_ms: float) -> JsonDict:
    if not summaries:
        raise ValueError("at least one benchmark summary is required")
    datasets = {str(item.get("dataset", "")) for item in summaries}
    if len(datasets) != 1:
        raise ValueError("all models must be evaluated on the same dataset")
    ranked: list[JsonDict] = []
    for item in summaries:
        latency = item.get("latency_ms")
        if not isinstance(latency, dict) or "p95" not in latency:
            raise ValueError(f"{item.get('model', 'unknown model')}: latency p95 is required")
        row = dict(item)
        row["eligible"] = float(latency["p95"]) <= max_p95_ms
        ranked.append(row)
    eligible = [item for item in ranked if item["eligible"]]
    if not eligible:
        raise ValueError(f"no model satisfies p95 <= {max_p95_ms:.2f} ms")
    eligible.sort(
        key=lambda item: (
            float(item["macro_f1"]),
            float(item["accuracy"]),
            -float(item["latency_ms"]["p95"]),
        ),
        reverse=True,
    )
    winner = eligible[0]
    return {
        "dataset": next(iter(datasets)),
        "decision_rule": "Filter by p95 latency, then maximize Macro-F1; use Accuracy and lower p95 as tie-breakers.",
        "max_p95_ms": max_p95_ms,
        "selected_model": winner["model"],
        "rationale": (
            f"{winner['model']} satisfies p95 <= {max_p95_ms:.2f} ms and has the highest Macro-F1 "
            f"({float(winner['macro_f1']):.4f}) among eligible models."
        ),
        "models": ranked,
    }


def select_detector(summaries: list[JsonDict], max_p95_ms: float, min_detection_rate: float) -> JsonDict:
    if not summaries:
        raise ValueError("at least one detector summary is required")
    datasets = {str(item.get("dataset", "")) for item in summaries}
    if len(datasets) != 1:
        raise ValueError("all detectors must be evaluated on the same dataset")
    ranked: list[JsonDict] = []
    for item in summaries:
        latency = item.get("latency_ms")
        if not isinstance(latency, dict) or "p95" not in latency:
            raise ValueError(f"{item.get('detector', 'unknown detector')}: latency p95 is required")
        row = dict(item)
        row["eligible"] = (
            float(row["detection_rate"]) >= min_detection_rate
            and float(latency["p95"]) <= max_p95_ms
            and float(row["false_positive_rate"]) == 0.0
        )
        ranked.append(row)
    eligible = [item for item in ranked if item["eligible"]]
    if not eligible:
        raise ValueError("no detector satisfies the configured quality gates")
    eligible.sort(
        key=lambda item: (
            float(item["detection_rate"]),
            float(item["exact_count_accuracy"]),
            -float(item["latency_ms"]["p95"]),
        ),
        reverse=True,
    )
    winner = eligible[0]
    return {
        "dataset": next(iter(datasets)),
        "decision_rule": "Require detection-rate and p95 gates, reject false positives on no-face frames, then maximize detection rate and exact-count accuracy.",
        "max_p95_ms": max_p95_ms,
        "min_detection_rate": min_detection_rate,
        "selected_detector": winner["detector"],
        "rationale": (
            f"{winner['detector']} satisfies the detector quality gates and has the strongest detection score "
            f"among eligible detectors on {next(iter(datasets))}."
        ),
        "detectors": ranked,
    }


def select_e2e(
    summaries: list[JsonDict],
    max_p95_ms: float,
    min_detection_rate: float,
    min_macro_f1: float,
) -> JsonDict:
    if not summaries:
        raise ValueError("at least one end-to-end summary is required")
    datasets = {str(item.get("dataset", "")) for item in summaries}
    if len(datasets) != 1:
        raise ValueError("all end-to-end runs must be evaluated on the same dataset")
    ranked: list[JsonDict] = []
    for item in summaries:
        latency = item.get("latency_ms")
        if not isinstance(latency, dict) or "p95" not in latency:
            raise ValueError(f"{item.get('combination', 'unknown combination')}: latency p95 is required")
        row = dict(item)
        row["eligible"] = (
            float(row["detection_rate"]) >= min_detection_rate
            and float(row["macro_f1"]) >= min_macro_f1
            and float(latency["p95"]) <= max_p95_ms
        )
        ranked.append(row)
    eligible = [item for item in ranked if item["eligible"]]
    if not eligible:
        raise ValueError("no end-to-end combination satisfies the configured quality gates")
    eligible.sort(
        key=lambda item: (
            float(item["macro_f1"]),
            float(item["detection_rate"]),
            -float(item["no_result_rate"]),
            -float(item["latency_ms"]["p95"]),
        ),
        reverse=True,
    )
    winner = eligible[0]
    return {
        "dataset": next(iter(datasets)),
        "decision_rule": "Apply detection, Macro-F1 and p95 gates, then maximize Macro-F1; use detection rate, no-result rate and lower p95 as tie-breakers.",
        "max_p95_ms": max_p95_ms,
        "min_detection_rate": min_detection_rate,
        "min_macro_f1": min_macro_f1,
        "selected_combination": winner["combination"],
        "rationale": (
            f"{winner['combination']} satisfies all gates and has the highest Macro-F1 "
            f"({float(winner['macro_f1']):.4f}) among eligible end-to-end runs."
        ),
        "combinations": ranked,
    }


def export_evaluation(result: JsonDict, model: str, dataset: str, output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    stem = f"{model}_{dataset}".lower().replace(" ", "_").replace("+", "plus")
    enriched = {"model": model, "dataset": dataset, **result}
    (output_dir / f"{stem}.json").write_text(
        json.dumps(enriched, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    summary = {
        "model": model,
        "dataset": dataset,
        "sample_count": result["sample_count"],
        "accuracy": result["accuracy"],
        "macro_precision": result["macro_precision"],
        "macro_recall": result["macro_recall"],
        "macro_f1": result["macro_f1"],
    }
    latency = result.get("latency_ms", {})
    for key in ("mean", "p50", "p95", "p99"):
        summary[f"latency_{key}_ms"] = latency.get(key, "") if isinstance(latency, dict) else ""
    with (output_dir / f"{stem}_summary.csv").open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=list(summary))
        writer.writeheader()
        writer.writerow(summary)
    export_confusion_matrix_png(
        result["confusion_matrix"],
        list(result["labels"]),
        f"{model} on {dataset}",
        output_dir / f"{stem}_confusion_matrix.png",
    )


def export_confusion_matrix_png(matrix: list[list[int]], labels: list[str], title: str, path: Path) -> None:
    import matplotlib.pyplot as plt

    fig, ax = plt.subplots(figsize=(6.2, 5.6), dpi=180)
    image = ax.imshow(matrix, cmap="Blues")
    ax.set_title(title)
    ax.set_xlabel("Predicted label")
    ax.set_ylabel("True label")
    ax.set_xticks(range(len(labels)), labels, rotation=45, ha="right")
    ax.set_yticks(range(len(labels)), labels)
    max_value = max(max(row) for row in matrix) if matrix else 0
    threshold = max_value / 2 if max_value else 0
    for y, row in enumerate(matrix):
        for x, value in enumerate(row):
            color = "white" if value > threshold else "black"
            ax.text(x, y, str(value), ha="center", va="center", color=color, fontsize=8)
    fig.colorbar(image, ax=ax, fraction=0.046, pad=0.04)
    fig.tight_layout()
    fig.savefig(path, bbox_inches="tight")
    plt.close(fig)


def export_selection(selection: JsonDict, output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "benchmark_selection.json").write_text(
        json.dumps(selection, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    rows = []
    for model in selection["models"]:
        latency = model["latency_ms"]
        rows.append({
            "model": model["model"],
            "dataset": model["dataset"],
            "sample_count": model["sample_count"],
            "accuracy": model["accuracy"],
            "macro_f1": model["macro_f1"],
            "p95_ms": latency["p95"],
            "eligible": model["eligible"],
            "selected": model["model"] == selection["selected_model"],
        })
    fields = list(rows[0])
    with (output_dir / "benchmark_comparison.csv").open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
    with (output_dir / "controlled_fer_comparison.csv").open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
    md = [
        "# Controlled FER benchmark",
        "",
        f"Decision: **{selection['selected_model']}**",
        "",
        f"> {selection['rationale']}",
        "",
        "| Model | Accuracy | Macro-F1 | p95 (ms) | Eligible | Selected |",
        "|---|---:|---:|---:|---|---|",
    ]
    for row in rows:
        md.append(
            f"| {row['model']} | {float(row['accuracy']):.4f} | {float(row['macro_f1']):.4f} | "
            f"{float(row['p95_ms']):.2f} | {row['eligible']} | {row['selected']} |"
        )
    (output_dir / "benchmark_comparison.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    (output_dir / "controlled_fer_comparison.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    tex = [
        r"\begin{tabular}{lrrrr}", r"\hline",
        r"Mô hình & Accuracy & Macro-F1 & p95 (ms) & Đạt ngưỡng \\", r"\hline",
    ]
    for row in rows:
        name = str(row["model"]).replace("++", r"{+}{+}")
        tex.append(
            f"{name} & {float(row['accuracy']):.4f} & {float(row['macro_f1']):.4f} & "
            f"{float(row['p95_ms']):.2f} & {'Có' if row['eligible'] else 'Không'} \\\\"
        )
    tex.extend([r"\hline", r"\end{tabular}", ""])
    (output_dir / "benchmark_comparison.tex").write_text("\n".join(tex), encoding="utf-8")
    (output_dir / "controlled_fer_comparison.tex").write_text("\n".join(tex), encoding="utf-8")
    _write_bar_chart(rows, "model", "macro_f1", "Controlled FER benchmark", "Macro-F1", output_dir / "controlled_fer_comparison.png")


def _write_bar_chart(rows: list[JsonDict], label_key: str, value_key: str, title: str, ylabel: str, path: Path) -> None:
    import matplotlib.pyplot as plt

    labels = [str(row[label_key]) for row in rows]
    values = [float(row[value_key]) for row in rows]
    fig, ax = plt.subplots(figsize=(9.2, 4.8), dpi=180)
    bars = ax.bar(labels, values, color="#2563EB")
    ax.set_title(title)
    ax.set_ylabel(ylabel)
    ax.set_ylim(0, max(1.0, max(values) * 1.15 if values else 1.0))
    ax.grid(axis="y", alpha=0.25)
    ax.bar_label(bars, fmt="%.3f", padding=2, fontsize=8)
    ax.tick_params(axis="x", labelrotation=15)
    fig.tight_layout()
    fig.savefig(path, bbox_inches="tight")
    plt.close(fig)


def export_detector_evaluation(result: JsonDict, detector: str, dataset: str, output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    stem = f"{detector}_{dataset}_detector".lower().replace(" ", "_").replace("+", "plus")
    enriched = {"detector": detector, "dataset": dataset, **result}
    (output_dir / f"{stem}.json").write_text(
        json.dumps(enriched, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def export_e2e_evaluation(result: JsonDict, detector: str, fer_model: str, dataset: str, output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    combination = f"{detector} + {fer_model}"
    stem = f"{detector}_{fer_model}_{dataset}_e2e".lower().replace(" ", "_").replace("+", "plus")
    enriched = {"detector": detector, "fer_model": fer_model, "combination": combination, "dataset": dataset, **result}
    (output_dir / f"{stem}.json").write_text(
        json.dumps(enriched, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    export_confusion_matrix_png(
        result["confusion_matrix"],
        list(result["labels"]),
        f"{combination} on {dataset}",
        output_dir / f"{stem}_confusion_matrix.png",
    )


def export_detector_selection(selection: JsonDict, output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "detector_selection.json").write_text(
        json.dumps(selection, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    rows = []
    for detector in selection["detectors"]:
        latency = detector["latency_ms"]
        rows.append({
            "detector": detector["detector"],
            "dataset": detector["dataset"],
            "sample_count": detector["sample_count"],
            "detection_rate": detector["detection_rate"],
            "false_positive_rate": detector["false_positive_rate"],
            "exact_count_accuracy": detector["exact_count_accuracy"],
            "invalid_crop_rate": detector["invalid_crop_rate"],
            "p95_ms": latency["p95"],
            "eligible": detector["eligible"],
            "selected": detector["detector"] == selection["selected_detector"],
        })
    fields = list(rows[0])
    with (output_dir / "detector_comparison.csv").open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
    md = [
        "# Detector benchmark",
        "",
        f"Decision: **{selection['selected_detector']}**",
        "",
        f"> {selection['rationale']}",
        "",
        "| Detector | Detection Rate | False Positive Rate | Exact Count Accuracy | p95 (ms) | Eligible | Selected |",
        "|---|---:|---:|---:|---:|---|---|",
    ]
    for row in rows:
        md.append(
            f"| {row['detector']} | {float(row['detection_rate']):.4f} | {float(row['false_positive_rate']):.4f} | "
            f"{float(row['exact_count_accuracy']):.4f} | {float(row['p95_ms']):.2f} | {row['eligible']} | {row['selected']} |"
        )
    (output_dir / "detector_comparison.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    tex = [
        r"\begin{tabular}{lrrrr}", r"\hline",
        r"Detector & Detection Rate & False Positive & Exact Count & p95 (ms) \\", r"\hline",
    ]
    for row in rows:
        tex.append(
            f"{row['detector']} & {float(row['detection_rate']):.4f} & {float(row['false_positive_rate']):.4f} & "
            f"{float(row['exact_count_accuracy']):.4f} & {float(row['p95_ms']):.2f} \\\\"
        )
    tex.extend([r"\hline", r"\end{tabular}", ""])
    (output_dir / "detector_comparison.tex").write_text("\n".join(tex), encoding="utf-8")
    _write_bar_chart(
        rows,
        "detector",
        "p95_ms",
        "Detector latency benchmark",
        "p95 latency (ms)",
        output_dir / "detector_comparison.png",
    )


def export_e2e_selection(selection: JsonDict, output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "final_selection.json").write_text(
        json.dumps(selection, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    rows = []
    for item in selection["combinations"]:
        latency = item["latency_ms"]
        rows.append({
            "combination": item["combination"],
            "dataset": item["dataset"],
            "sample_count": item["sample_count"],
            "detection_rate": item["detection_rate"],
            "macro_f1": item["macro_f1"],
            "accuracy": item["accuracy"],
            "no_result_rate": item["no_result_rate"],
            "p95_ms": latency["p95"],
            "eligible": item["eligible"],
            "selected": item["combination"] == selection["selected_combination"],
        })
    fields = list(rows[0])
    with (output_dir / "end_to_end_comparison.csv").open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
    md = [
        "# End-to-end detector + FER benchmark",
        "",
        f"Decision: **{selection['selected_combination']}**",
        "",
        f"> {selection['rationale']}",
        "",
        "| Combination | Detection Rate | Macro-F1 | Accuracy | No Result Rate | p95 (ms) | Eligible | Selected |",
        "|---|---:|---:|---:|---:|---:|---|---|",
    ]
    for row in rows:
        md.append(
            f"| {row['combination']} | {float(row['detection_rate']):.4f} | {float(row['macro_f1']):.4f} | "
            f"{float(row['accuracy']):.4f} | {float(row['no_result_rate']):.4f} | {float(row['p95_ms']):.2f} | "
            f"{row['eligible']} | {row['selected']} |"
        )
    (output_dir / "end_to_end_comparison.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    (output_dir / "final_selection.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    tex = [
        r"\begin{tabular}{lrrrr}", r"\hline",
        r"Tổ hợp & Detection Rate & Macro-F1 & No Result & p95 (ms) \\", r"\hline",
    ]
    for row in rows:
        name = str(row["combination"]).replace("++", r"{+}{+}")
        tex.append(
            f"{name} & {float(row['detection_rate']):.4f} & {float(row['macro_f1']):.4f} & "
            f"{float(row['no_result_rate']):.4f} & {float(row['p95_ms']):.2f} \\\\"
        )
    tex.extend([r"\hline", r"\end{tabular}", ""])
    (output_dir / "end_to_end_comparison.tex").write_text("\n".join(tex), encoding="utf-8")
    _write_bar_chart(rows, "combination", "macro_f1", "End-to-end benchmark", "Macro-F1", output_dir / "end_to_end_comparison.png")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)
    evaluate = subparsers.add_parser("evaluate")
    evaluate.add_argument("--predictions", type=Path, required=True)
    evaluate.add_argument("--model", required=True)
    evaluate.add_argument("--dataset", required=True)
    evaluate.add_argument("--output-dir", type=Path, default=Path(__file__).with_name("outputs"))
    inspect_dataset = subparsers.add_parser("inspect-dataset")
    inspect_dataset.add_argument(
        "--dataset", type=Path,
        default=Path(__file__).with_name("datasets") / "ckplus" / "ckextended.csv",
    )
    inspect_dataset.add_argument(
        "--manifest", type=Path,
        default=Path(__file__).with_name("datasets") / "ckplus" / "manifest.json",
    )
    inspect_dataset.add_argument("--output-dir", type=Path, default=Path(__file__).with_name("outputs"))
    compare = subparsers.add_parser("compare")
    compare.add_argument("--summaries", type=Path, nargs="+", required=True)
    compare.add_argument("--max-p95-ms", type=float, default=200.0)
    compare.add_argument("--output-dir", type=Path, default=Path(__file__).with_name("outputs"))
    detector = subparsers.add_parser("evaluate-detector")
    detector.add_argument("--predictions", type=Path, required=True)
    detector.add_argument("--detector", required=True)
    detector.add_argument("--dataset", required=True)
    detector.add_argument("--output-dir", type=Path, default=Path(__file__).with_name("outputs"))
    compare_detectors = subparsers.add_parser("compare-detectors")
    compare_detectors.add_argument("--summaries", type=Path, nargs="+", required=True)
    compare_detectors.add_argument("--max-p95-ms", type=float, default=150.0)
    compare_detectors.add_argument("--min-detection-rate", type=float, default=0.90)
    compare_detectors.add_argument("--output-dir", type=Path, default=Path(__file__).with_name("outputs"))
    e2e = subparsers.add_parser("evaluate-e2e")
    e2e.add_argument("--predictions", type=Path, required=True)
    e2e.add_argument("--detector", required=True)
    e2e.add_argument("--fer-model", required=True)
    e2e.add_argument("--dataset", required=True)
    e2e.add_argument("--output-dir", type=Path, default=Path(__file__).with_name("outputs"))
    compare_e2e = subparsers.add_parser("compare-e2e")
    compare_e2e.add_argument("--summaries", type=Path, nargs="+", required=True)
    compare_e2e.add_argument("--max-p95-ms", type=float, default=800.0)
    compare_e2e.add_argument("--min-detection-rate", type=float, default=0.90)
    compare_e2e.add_argument("--min-macro-f1", type=float, default=0.50)
    compare_e2e.add_argument("--output-dir", type=Path, default=Path(__file__).with_name("outputs"))
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.command == "inspect-dataset":
        report = inspect_ckplus(args.dataset, args.manifest)
        args.output_dir.mkdir(parents=True, exist_ok=True)
        (args.output_dir / "dataset_report.json").write_text(
            json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return
    if args.command == "compare":
        summaries = [json.loads(path.read_text(encoding="utf-8")) for path in args.summaries]
        export_selection(select_model(summaries, args.max_p95_ms), args.output_dir)
        return
    if args.command == "evaluate-detector":
        with args.predictions.open(encoding="utf-8", newline="") as stream:
            result = evaluate_detector_rows(csv.DictReader(stream))
        export_detector_evaluation(result, args.detector, args.dataset, args.output_dir)
        return
    if args.command == "compare-detectors":
        summaries = [json.loads(path.read_text(encoding="utf-8")) for path in args.summaries]
        export_detector_selection(select_detector(summaries, args.max_p95_ms, args.min_detection_rate), args.output_dir)
        return
    if args.command == "evaluate-e2e":
        with args.predictions.open(encoding="utf-8", newline="") as stream:
            result = evaluate_e2e_rows(csv.DictReader(stream))
        export_e2e_evaluation(result, args.detector, args.fer_model, args.dataset, args.output_dir)
        return
    if args.command == "compare-e2e":
        summaries = [json.loads(path.read_text(encoding="utf-8")) for path in args.summaries]
        export_e2e_selection(
            select_e2e(summaries, args.max_p95_ms, args.min_detection_rate, args.min_macro_f1),
            args.output_dir,
        )
        return
    with args.predictions.open(encoding="utf-8", newline="") as stream:
        result = evaluate_rows(csv.DictReader(stream))
    export_evaluation(result, args.model, args.dataset, args.output_dir)


if __name__ == "__main__":
    main()
