import csv
import json
import tempfile
import unittest
from pathlib import Path

from benchmark import (
    LABELS,
    evaluate_detector_rows,
    evaluate_e2e_rows,
    evaluate_rows,
    export_detector_evaluation,
    export_detector_selection,
    export_e2e_evaluation,
    export_e2e_selection,
    export_evaluation,
    export_selection,
    inspect_ckplus,
    percentile,
    select_detector,
    select_e2e,
    select_model,
)


class MetricsTest(unittest.TestCase):
    def test_perfect_predictions(self):
        rows = [
            {"true_label": label, "pred_label": label, "latency_ms": str(i + 1)}
            for i, label in enumerate(LABELS)
        ]
        result = evaluate_rows(rows)
        self.assertEqual(result["sample_count"], 7)
        self.assertEqual(result["accuracy"], 1.0)
        self.assertEqual(result["macro_f1"], 1.0)
        self.assertAlmostEqual(result["latency_ms"]["p95"], 6.7)

    def test_confusion_and_macro_f1_include_missing_classes(self):
        rows = [
            {"true_label": "happy", "pred_label": "happy"},
            {"true_label": "sad", "pred_label": "happy"},
        ]
        result = evaluate_rows(rows)
        self.assertEqual(result["accuracy"], 0.5)
        self.assertEqual(result["confusion_matrix"][LABELS.index("sad")][LABELS.index("happy")], 1)
        self.assertLess(result["macro_f1"], 0.2)

    def test_invalid_label_fails(self):
        with self.assertRaisesRegex(ValueError, "labels must be"):
            evaluate_rows([{"true_label": "joy", "pred_label": "happy"}])

    def test_negative_latency_fails(self):
        with self.assertRaisesRegex(ValueError, "non-negative"):
            evaluate_rows([{"true_label": "happy", "pred_label": "happy", "latency_ms": "-1"}])

    def test_empty_input_fails(self):
        with self.assertRaisesRegex(ValueError, "no samples"):
            evaluate_rows([])

    def test_percentile_interpolates(self):
        self.assertEqual(percentile([1, 2, 3, 4], 0.5), 2.5)


class ExportTest(unittest.TestCase):
    def test_evaluation_exports_json_and_csv(self):
        result = evaluate_rows([{"true_label": "happy", "pred_label": "happy", "latency_ms": "5"}])
        with tempfile.TemporaryDirectory() as tmp:
            output = Path(tmp)
            export_evaluation(result, "Test Model", "Test Set", output)
            payload = json.loads((output / "test_model_test_set.json").read_text(encoding="utf-8"))
            self.assertEqual(payload["model"], "Test Model")
            self.assertEqual(payload["accuracy"], 1.0)
            self.assertGreater((output / "test_model_test_set_confusion_matrix.png").stat().st_size, 0)


class DetectorBenchmarkTest(unittest.TestCase):
    @staticmethod
    def summary(detector, detection_rate, false_positive_rate, exact_count_accuracy, p95, dataset="camera-test"):
        return {
            "detector": detector,
            "dataset": dataset,
            "sample_count": 10,
            "positive_frames": 8,
            "no_face_frames": 2,
            "detection_rate": detection_rate,
            "miss_rate": 1 - detection_rate,
            "false_positive_rate": false_positive_rate,
            "exact_count_accuracy": exact_count_accuracy,
            "invalid_crop_rate": 0.0,
            "latency_ms": {"count": 10, "mean": p95 / 2, "p50": p95 / 2, "p95": p95, "p99": p95},
        }

    def test_detector_metrics_include_no_face_false_positives(self):
        result = evaluate_detector_rows([
            {"expected_face_count": "1", "detected_face_count": "1", "latency_ms": "10", "condition_tags": "front"},
            {"expected_face_count": "1", "detected_face_count": "0", "latency_ms": "12", "condition_tags": "dark"},
            {"expected_face_count": "0", "detected_face_count": "1", "latency_ms": "8"},
        ])
        self.assertAlmostEqual(result["detection_rate"], 0.5)
        self.assertAlmostEqual(result["false_positive_rate"], 1.0)
        self.assertIn("dark", result["condition_report"])

    def test_select_detector_applies_quality_gates(self):
        selection = select_detector([
            self.summary("opencv", 0.80, 0.0, 0.80, 20),
            self.summary("retinaface", 0.95, 0.0, 0.90, 80),
            self.summary("fast-false-positive", 1.00, 0.5, 0.50, 10),
        ], max_p95_ms=150, min_detection_rate=0.90)
        self.assertEqual(selection["selected_detector"], "retinaface")

    def test_detector_exports_required_artifacts(self):
        selection = select_detector([
            self.summary("retinaface", 0.95, 0.0, 0.90, 80),
            self.summary("mediapipe", 0.92, 0.0, 0.85, 20),
        ], max_p95_ms=150, min_detection_rate=0.90)
        with tempfile.TemporaryDirectory() as tmp:
            output = Path(tmp)
            export_detector_evaluation(self.summary("retinaface", 0.95, 0.0, 0.90, 80), "retinaface", "camera-test", output)
            export_detector_selection(selection, output)
            for name in ("detector_comparison.csv", "detector_comparison.md", "detector_comparison.tex", "detector_comparison.png"):
                self.assertGreater((output / name).stat().st_size, 0)
            self.assertGreater((output / "retinaface_camera-test_detector.json").stat().st_size, 0)


class EndToEndBenchmarkTest(unittest.TestCase):
    @staticmethod
    def summary(combination, f1, accuracy, detection_rate, no_result_rate, p95, dataset="camera-test"):
        return {
            "combination": combination,
            "dataset": dataset,
            "sample_count": 20,
            "valid_predictions": int(20 * (1 - no_result_rate)),
            "no_result_rate": no_result_rate,
            "accuracy": accuracy,
            "macro_precision": f1,
            "macro_recall": f1,
            "macro_f1": f1,
            "detection_rate": detection_rate,
            "latency_ms": {"count": 20, "mean": p95 / 2, "p50": p95 / 2, "p95": p95, "p99": p95},
        }

    def test_e2e_metrics_penalize_missing_predictions(self):
        result = evaluate_e2e_rows([
            {"true_label": "happy", "pred_label": "happy", "face_detected": "true", "latency_ms": "20"},
            {"true_label": "sad", "pred_label": "", "face_detected": "false", "latency_ms": "18"},
        ])
        self.assertEqual(result["sample_count"], 2)
        self.assertAlmostEqual(result["no_result_rate"], 0.5)
        self.assertAlmostEqual(result["accuracy"], 0.5)
        self.assertLess(result["macro_f1"], 0.2)

    def test_select_e2e_chooses_best_eligible_combination(self):
        selection = select_e2e([
            self.summary("retinaface + poster++", 0.90, 0.92, 0.96, 0.04, 900),
            self.summary("retinaface + efficientface", 0.84, 0.88, 0.95, 0.05, 180),
            self.summary("mediapipe + efficientface", 0.78, 0.83, 0.89, 0.11, 90),
        ], max_p95_ms=800, min_detection_rate=0.90, min_macro_f1=0.50)
        self.assertEqual(selection["selected_combination"], "retinaface + efficientface")

    def test_e2e_exports_required_artifacts(self):
        selection = select_e2e([
            self.summary("retinaface + efficientface", 0.84, 0.88, 0.95, 0.05, 180),
            self.summary("mediapipe + efficientface", 0.78, 0.83, 0.90, 0.10, 90),
        ], max_p95_ms=800, min_detection_rate=0.90, min_macro_f1=0.50)
        with tempfile.TemporaryDirectory() as tmp:
            output = Path(tmp)
            result = evaluate_e2e_rows([
                {"true_label": "happy", "pred_label": "happy", "face_detected": "true", "latency_ms": "120"},
                {"true_label": "sad", "pred_label": "sad", "face_detected": "true", "latency_ms": "140"},
            ])
            export_e2e_evaluation(result, "retinaface", "efficientface", "camera-test", output)
            export_e2e_selection(selection, output)
            for name in ("end_to_end_comparison.csv", "end_to_end_comparison.md", "end_to_end_comparison.tex", "end_to_end_comparison.png", "final_selection.md"):
                self.assertGreater((output / name).stat().st_size, 0)
            self.assertGreater((output / "retinaface_efficientface_camera-test_e2e.json").stat().st_size, 0)
            self.assertGreater((output / "retinaface_efficientface_camera-test_e2e_confusion_matrix.png").stat().st_size, 0)


class DatasetTest(unittest.TestCase):
    def test_bundled_dataset_matches_manifest_and_protocol(self):
        root = Path(__file__).parent / "datasets" / "ckplus"
        report = inspect_ckplus(root / "ckextended.csv", root / "manifest.json")
        self.assertEqual(report["total_rows"], 920)
        self.assertEqual(report["selected_test_rows"], 182)
        self.assertEqual(sum(report["class_counts_selected"].values()), 182)

    def test_checksum_mismatch_fails(self):
        root = Path(__file__).parent / "datasets" / "ckplus"
        with tempfile.TemporaryDirectory() as tmp:
            bad_data = Path(tmp) / "bad.csv"
            bad_data.write_text("emotion,pixels,Usage\n", encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "checksum mismatch"):
                inspect_ckplus(bad_data, root / "manifest.json")


class SelectionTest(unittest.TestCase):
    @staticmethod
    def summary(model, f1, accuracy, p95, dataset="same-test"):
        return {
            "model": model,
            "dataset": dataset,
            "sample_count": 182,
            "accuracy": accuracy,
            "macro_precision": f1,
            "macro_recall": f1,
            "macro_f1": f1,
            "latency_ms": {"count": 182, "mean": p95 / 2, "p50": p95 / 2, "p95": p95, "p99": p95},
        }

    def test_filters_latency_then_maximizes_macro_f1(self):
        selection = select_model([
            self.summary("accurate-but-slow", 0.90, 0.95, 250),
            self.summary("deployment-winner", 0.82, 0.88, 90),
            self.summary("fast-lower-f1", 0.75, 0.85, 50),
        ], max_p95_ms=200)
        self.assertEqual(selection["selected_model"], "deployment-winner")

    def test_rejects_cross_dataset_comparison(self):
        with self.assertRaisesRegex(ValueError, "same dataset"):
            select_model([
                self.summary("a", 0.8, 0.8, 20, "dataset-a"),
                self.summary("b", 0.9, 0.9, 20, "dataset-b"),
            ], max_p95_ms=200)

    def test_rejects_when_no_model_meets_latency(self):
        with self.assertRaisesRegex(ValueError, "no model satisfies"):
            select_model([self.summary("slow", 0.9, 0.9, 250)], max_p95_ms=200)

    def test_selection_table_exports(self):
        selection = select_model([
            self.summary("model-a", 0.8, 0.85, 100),
            self.summary("model-b", 0.7, 0.80, 80),
        ], max_p95_ms=200)
        with tempfile.TemporaryDirectory() as tmp:
            output = Path(tmp)
            export_selection(selection, output)
            for name in (
                "benchmark_selection.json",
                "benchmark_comparison.csv",
                "benchmark_comparison.md",
                "benchmark_comparison.tex",
                "controlled_fer_comparison.csv",
                "controlled_fer_comparison.md",
                "controlled_fer_comparison.tex",
                "controlled_fer_comparison.png",
            ):
                self.assertGreater((output / name).stat().st_size, 0)


if __name__ == "__main__":
    unittest.main()
