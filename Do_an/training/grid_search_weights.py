import os
import sys
import json
import random
import cv2
import numpy as np
from pathlib import Path

# 1. Khai báo các đường dẫn
ROOT_PATH = Path(__file__).resolve().parent
ALIGNED_BEFORE = ROOT_PATH / 'C2FPW_aligned' / 'Before'
ALIGNED_AFTER = ROOT_PATH / 'C2FPW_aligned' / 'After'
WEIGHTS_PATH = ROOT_PATH / "facenet512_projector_weights.npz"

# Cho phép DeepFace tìm các module backend khi chạy benchmark.
sys.path.append(str(ROOT_PATH.parent.parent / "CRM-system-be"))

# Load trọng số Projector
data = np.load(WEIGHTS_PATH)
W = data["kernel"]
b = data["bias"]

class BioFusionClassifier:
    """
    Bộ phân lớp tùy biến kế thừa Scikit-learn để thực hiện 
    dung hợp trọng số sinh học mức điểm số (Score-level Fusion).
    """
    def __init__(self, w_upper=0.33, w_mid=0.33, threshold=0.35):
        self.w_upper = w_upper
        self.w_mid = w_mid
        self.threshold = threshold

    def fit(self, X, y=None):
        # Thuật toán không chứa tham số học sâu cần huấn luyện lại
        return self

    def predict(self, X):
        X = np.array(X)
        w_low = 1.0 - self.w_upper - self.w_mid
        # Tính khoảng cách dung hợp tuyến tính
        d_fusion = self.w_upper * X[:, 0] + self.w_mid * X[:, 1] + w_low * X[:, 2]
        # Trả về 1 (cùng danh tính) nếu khoảng cách < ngưỡng, ngược lại trả về 0 (khác danh tính)
        return (d_fusion < self.threshold).astype(int)

    def score(self, X, y, sample_weight=None):
        y_pred = self.predict(X)
        matches = (np.asarray(y) == y_pred).astype(np.float32)
        if sample_weight is None:
            return float(matches.mean())
        weights = np.asarray(sample_weight, dtype=np.float32)
        return float(np.average(matches, weights=weights))

def project(emb):
    emb_arr = np.array(emb, dtype=np.float32)
    proj = np.dot(emb_arr, W) + b
    norm = np.linalg.norm(proj)
    if norm > 0:
        proj = proj / norm
    return proj

def segment_face_regions(img):
    H, W = img.shape[:2]
    blurred_img = cv2.GaussianBlur(img, (51, 51), 0)
    img_upper = blurred_img.copy()
    img_mid = blurred_img.copy()
    img_lower = blurred_img.copy()
    
    img_upper[0 : int(H * 0.45), :] = img[0 : int(H * 0.45), :]
    img_mid[int(H * 0.30) : int(H * 0.70), :] = img[int(H * 0.30) : int(H * 0.70), :]
    img_lower[int(H * 0.55) : , :] = img[int(H * 0.55) : , :]
    return img_upper, img_mid, img_lower

def extract_features(img_path):
    from deepface import DeepFace

    img = cv2.imread(str(img_path))
    if img is None:
        return None
    img = cv2.resize(img, (160, 160))
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # Phân vùng
    img_up, img_mid, img_low = segment_face_regions(img)
    
    # Trích xuất đặc trưng nền tảng
    rep_up = DeepFace.represent(img_path=img_up, model_name="Facenet512", enforce_detection=False, detector_backend="skip")
    rep_mid = DeepFace.represent(img_path=img_mid, model_name="Facenet512", enforce_detection=False, detector_backend="skip")
    rep_low = DeepFace.represent(img_path=img_low, model_name="Facenet512", enforce_detection=False, detector_backend="skip")
    
    if (not isinstance(rep_up, list) or len(rep_up) == 0 or not isinstance(rep_up[0], dict) or
        not isinstance(rep_mid, list) or len(rep_mid) == 0 or not isinstance(rep_mid[0], dict) or
        not isinstance(rep_low, list) or len(rep_low) == 0 or not isinstance(rep_low[0], dict)):
        return None
        
    raw_up = rep_up[0].get("embedding")
    raw_mid = rep_mid[0].get("embedding")
    raw_low = rep_low[0].get("embedding")
    
    if raw_up is None or raw_mid is None or raw_low is None:
        return None
        
    # Chiếu qua Projector
    emb_up = project(raw_up)
    emb_mid = project(raw_mid)
    emb_low = project(raw_low)
    
    return {
        "upper": emb_up,
        "mid": emb_mid,
        "lower": emb_low
    }

def cosine_distance(v1, v2):
    return 1.0 - np.dot(v1, v2)

def subject_splits():
    splits = {
        "train": [f"S{i:03d}" for i in range(1, 71)],
        "validation": [f"S{i:03d}" for i in range(71, 81)],
        "test": [f"S{i:03d}" for i in range(81, 91)],
    }
    all_subjects = [subject for values in splits.values() for subject in values]
    if len(all_subjects) != len(set(all_subjects)):
        raise ValueError("Subject leakage detected between train/validation/test splits")
    return splits


def extract_subject_features(subjects):
    subject_features_before = {}
    subject_features_after = {}

    for sid in subjects:
        before_files = [ALIGNED_BEFORE / f for f in os.listdir(ALIGNED_BEFORE) if f.startswith(sid)]
        after_files = [ALIGNED_AFTER / f for f in os.listdir(ALIGNED_AFTER) if f.startswith(sid)]

        if before_files and after_files:
            features_before = extract_features(before_files[0])
            if features_before is not None:
                subject_features_before[sid] = features_before

            features_after_list = []
            for af in after_files[:5]:
                feats = extract_features(af)
                if feats is not None:
                    features_after_list.append(feats)
            if features_after_list:
                subject_features_after[sid] = features_after_list

    return subject_features_before, subject_features_after


def build_pairs(subject_features_before, subject_features_after, seed=42):
    pos_pairs = []
    neg_pairs = []

    subjects = list(subject_features_before.keys())
    for sid_a in subjects:
        if sid_a in subject_features_after:
            for feat_after in subject_features_after[sid_a]:
                pos_pairs.append((subject_features_before[sid_a], feat_after))

        for sid_b in subjects:
            if sid_b != sid_a and sid_b in subject_features_after:
                for feat_after in subject_features_after[sid_b]:
                    neg_pairs.append((subject_features_before[sid_a], feat_after))

    rng = random.Random(seed)
    neg_pairs = rng.sample(neg_pairs, min(len(neg_pairs), len(pos_pairs) * 5))

    X_list = []
    y_list = []

    for f1, f2 in pos_pairs:
        d_up = cosine_distance(f1["upper"], f2["upper"])
        d_mid = cosine_distance(f1["mid"], f2["mid"])
        d_low = cosine_distance(f1["lower"], f2["lower"])
        X_list.append([d_up, d_mid, d_low])
        y_list.append(1)

    for f1, f2 in neg_pairs:
        d_up = cosine_distance(f1["upper"], f2["upper"])
        d_mid = cosine_distance(f1["mid"], f2["mid"])
        d_low = cosine_distance(f1["lower"], f2["lower"])
        X_list.append([d_up, d_mid, d_low])
        y_list.append(0)

    return np.asarray(X_list, dtype=np.float32), np.asarray(y_list, dtype=np.int32)


def select_on_validation(X_validation, y_validation):
    weight_candidates = [
        (0.33, 0.33, "Trọng số gần đồng đều"),
        (0.20, 0.30, "Tập trung vùng Hạ"),
        (0.30, 0.50, "Tập trung vùng Trung"),
        (0.50, 0.30, "Đề xuất upper/mid/lower = 0.50/0.30/0.20"),
    ]
    thresholds = np.arange(0.1, 0.6, 0.005)
    best = None
    per_weight = []

    for w_upper, w_mid, name in weight_candidates:
        weight_best = None
        for threshold in thresholds:
            classifier = BioFusionClassifier(w_upper, w_mid, float(threshold))
            score = classifier.score(X_validation, y_validation)
            candidate = {
                "name": name,
                "w_upper": w_upper,
                "w_mid": w_mid,
                "w_lower": 1.0 - w_upper - w_mid,
                "threshold": float(threshold),
                "validation_accuracy": float(score),
            }
            if weight_best is None or score > weight_best["validation_accuracy"]:
                weight_best = candidate
            if best is None or score > best["validation_accuracy"]:
                best = candidate
        per_weight.append(weight_best)

    return best, per_weight


def main():
    splits = subject_splits()
    print("Split độc lập theo subject:")
    print("  Train:      S001 -> S070 (chỉ dùng huấn luyện projector)")
    print("  Validation: S071 -> S080 (chọn weights và threshold)")
    print("  Test:       S081 -> S090 (chỉ đánh giá cuối cùng)")

    datasets = {}
    for split_name in ("validation", "test"):
        subjects = splits[split_name]
        print(f"\nTrích xuất {split_name} features cho {len(subjects)} subject...")
        before, after = extract_subject_features(subjects)
        X, y = build_pairs(before, after, seed=42)
        if len(X) == 0:
            raise RuntimeError(f"Không tạo được pairs cho split {split_name}")
        datasets[split_name] = (X, y)
        print(f"  Hợp lệ: {len(before)} subject, {len(X)} pairs")

    X_validation, y_validation = datasets["validation"]
    best, per_weight = select_on_validation(X_validation, y_validation)

    print("\n================ KẾT QUẢ VALIDATION ================")
    for result in per_weight:
        print(
            f"{result['name']}: {result['validation_accuracy'] * 100:.2f}% "
            f"@ threshold={result['threshold']:.3f}"
        )

    X_test, y_test = datasets["test"]
    final_classifier = BioFusionClassifier(
        best["w_upper"], best["w_mid"], best["threshold"])
    test_accuracy = float(final_classifier.score(X_test, y_test))

    output = {
        "seed": 42,
        "subject_splits": splits,
        "validation_pairs": int(len(X_validation)),
        "test_pairs": int(len(X_test)),
        "selected_on_validation": best,
        "test_accuracy": test_accuracy,
    }
    output_path = ROOT_PATH / "grid_search_evaluation.json"
    output_path.write_text(json.dumps(output, indent=2), encoding="utf-8")

    print("\n================== KẾT QUẢ TEST ==================")
    print(f"Test accuracy (không dùng để chọn tham số): {test_accuracy * 100:.2f}%")
    print(f"Artifact: {output_path}")
    print("===================================================")

if __name__ == "__main__":
    main()
