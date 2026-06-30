import os
import sys
import cv2
import numpy as np
from pathlib import Path
from sklearn.base import BaseEstimator, ClassifierMixin
from sklearn.model_selection import GridSearchCV
from sklearn.metrics import accuracy_score

# 1. Khai báo các đường dẫn
ROOT_PATH = Path("/Users/sotatek/Desktop/ĐỒ ÁN/training")
ALIGNED_BEFORE = ROOT_PATH / 'C2FPW_aligned' / 'Before'
ALIGNED_AFTER = ROOT_PATH / 'C2FPW_aligned' / 'After'
WEIGHTS_PATH = ROOT_PATH / "facenet512_projector_weights.npz"

# Import DeepFace từ backend
sys.path.append("/Users/sotatek/Desktop/ĐỒ ÁN/face_recognition_be")
from deepface import DeepFace

# Load trọng số Projector
data = np.load(WEIGHTS_PATH)
W = data["kernel"]
b = data["bias"]

class BioFusionClassifier(BaseEstimator, ClassifierMixin):
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

    def score(self, X, y):
        y_pred = self.predict(X)
        return accuracy_score(y, y_pred)

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
    
    if not rep_up or not rep_mid or not rep_low:
        return None
        
    # Chiếu qua Projector
    emb_up = project(rep_up[0]["embedding"])
    emb_mid = project(rep_mid[0]["embedding"])
    emb_low = project(rep_low[0]["embedding"])
    
    return {
        "upper": emb_up,
        "mid": emb_mid,
        "lower": emb_low
    }

def cosine_distance(v1, v2):
    return 1.0 - np.dot(v1, v2)

def main():
    val_subjects = [f"S{i:03d}" for i in range(1, 91)]
    print(f"Bắt đầu trích xuất đặc trưng cho {len(val_subjects)} đối tượng (S001 -> S090)...")
    
    subject_features_before = {}
    subject_features_after = {}
    
    for sid in val_subjects:
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
                
    print(f"Đã trích xuất xong đặc trưng của {len(subject_features_before)} đối tượng hợp lệ.")
    
    # 2. Xây dựng tập cặp đối sánh (Positive và Negative Pairs)
    pos_pairs = []
    neg_pairs = []
    
    subjects = list(subject_features_before.keys())
    for i, sid_a in enumerate(subjects):
        if sid_a in subject_features_after:
            for feat_after in subject_features_after[sid_a]:
                pos_pairs.append((subject_features_before[sid_a], feat_after))
                
        for sid_b in subjects:
            if sid_b != sid_a and sid_b in subject_features_after:
                for feat_after in subject_features_after[sid_b]:
                    neg_pairs.append((subject_features_before[sid_a], feat_after))
                    
    import random
    random.seed(42)
    neg_pairs = random.sample(neg_pairs, min(len(neg_pairs), len(pos_pairs) * 5))
    
    # Chuẩn bị dữ liệu đầu vào cho Scikit-learn
    X_list = []
    y_list = []
    
    for f1, f2 in pos_pairs:
        d_up = cosine_distance(f1["upper"], f2["upper"])
        d_mid = cosine_distance(f1["mid"], f2["mid"])
        d_low = cosine_distance(f1["lower"], f2["lower"])
        X_list.append([d_up, d_mid, d_low])
        y_list.append(1) # Positive pair -> label 1
        
    for f1, f2 in neg_pairs:
        d_up = cosine_distance(f1["upper"], f2["upper"])
        d_mid = cosine_distance(f1["mid"], f2["mid"])
        d_low = cosine_distance(f1["lower"], f2["lower"])
        X_list.append([d_up, d_mid, d_low])
        y_list.append(0) # Negative pair -> label 0
        
    X = np.array(X_list)
    y = np.array(y_list)
    
    print(f"Tổng số cặp đối sánh: {len(X)}")
    
    # 3. Sử dụng GridSearchCV từ Scikit-learn để quét tìm siêu tham số tối ưu
    param_grid = [
        {"w_upper": [0.33], "w_mid": [0.33], "threshold": np.arange(0.1, 0.6, 0.005).tolist()},
        {"w_upper": [0.20], "w_mid": [0.30], "threshold": np.arange(0.1, 0.6, 0.005).tolist()},
        {"w_upper": [0.30], "w_mid": [0.50], "threshold": np.arange(0.1, 0.6, 0.005).tolist()},
        {"w_upper": [0.50], "w_mid": [0.30], "threshold": np.arange(0.1, 0.6, 0.005).tolist()}
    ]
    
    # Định nghĩa chỉ số chia (evaluate trên tập hiện tại trực tiếp)
    cv_split = [(np.arange(len(X)), np.arange(len(X)))]
    
    print("\n=================== KẾT QUẢ GRID SEARCH (SCIKIT-LEARN GridSearchCV) ===================")
    
    for i, p_grid in enumerate(param_grid):
        grid_search = GridSearchCV(
            estimator=BioFusionClassifier(),
            param_grid=p_grid,
            cv=cv_split,
            scoring='accuracy',
            n_jobs=-1
        )
        grid_search.fit(X, y)
        
        best_params = grid_search.best_params_
        best_score = grid_search.best_score_
        
        name_map = [
            "Trọng số đồng đều (0.33, 0.33, 0.33)",
            "Tập trung vùng Hạ (0.20, 0.30, 0.50)",
            "Tập trung vùng Trung (0.30, 0.50, 0.20)",
            "Đề xuất tối ưu (0.50, 0.30, 0.20)"
        ]
        
        print(f"{name_map[i]}:")
        print(f"  -> Độ chính xác cực đại: {best_score * 100:.2f}% (tại ngưỡng Threshold = {best_params['threshold']:.3f})")
        
    print("========================================================================================\n")

if __name__ == "__main__":
    main()
