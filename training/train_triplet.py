import os
import random
import cv2
import numpy as np
import tensorflow as tf
from pathlib import Path

# Thiết lập đường dẫn
ROOT_PATH = Path("/Users/sotatek/Desktop/ĐỒ ÁN/C2FPW-RecFac")
ALIGNED_BEFORE = ROOT_PATH / 'C2FPW_aligned' / 'Before'
ALIGNED_AFTER = ROOT_PATH / 'C2FPW_aligned' / 'After'

# Thêm thư mục chứa mô hình của DeepFace để load Facenet512
import sys
sys.path.append("/Users/sotatek/Desktop/ĐỒ ÁN/face_recognition_be")
from deepface import DeepFace

def load_image(path):
    img = cv2.imread(str(path))
    if img is None:
        return None
    # Resize về 160x160 cho Facenet512
    img = cv2.resize(img, (160, 160))
    # Đưa về dạng RGB và chuẩn hóa về khoảng [0, 1]
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    return img.astype(np.float32) / 255.0

def get_triplet_batch(train_subjects, batch_size=32):
    """
    Sinh các bộ ba (Anchor, Positive, Negative) trực tuyến cho quá trình huấn luyện.
    """
    anchors = []
    positives = []
    negatives = []
    
    # Quét ảnh của các subject trước và sau
    subject_photos_before = {}
    subject_photos_after = {}
    
    for sid in train_subjects:
        before_files = [ALIGNED_BEFORE / f for f in os.listdir(ALIGNED_BEFORE) if f.startswith(sid)]
        after_files = [ALIGNED_AFTER / f for f in os.listdir(ALIGNED_AFTER) if f.startswith(sid)]
        
        if before_files and after_files:
            subject_photos_before[sid] = before_files
            subject_photos_after[sid] = after_files
            
    active_subjects = list(subject_photos_before.keys())
    
    while len(anchors) < batch_size:
        # 1. Chọn ngẫu nhiên Subject X
        sid_x = random.choice(active_subjects)
        
        # 2. Lấy Anchor (ảnh Before) và Positive (ảnh After) của X
        a_path = random.choice(subject_photos_before[sid_x])
        p_path = random.choice(subject_photos_after[sid_x])
        
        # 3. Chọn ngẫu nhiên Subject Y (Y != X) để lấy Negative
        sid_y = random.choice([s for s in active_subjects if s != sid_x])
        # Negative có thể lấy từ ảnh Before hoặc After của Y
        y_photos = subject_photos_before[sid_y] + subject_photos_after[sid_y]
        n_path = random.choice(y_photos)
        
        # Đọc ảnh
        img_a = load_image(a_path)
        img_p = load_image(p_path)
        img_n = load_image(n_path)
        
        if img_a is not None and img_p is not None and img_n is not None:
            anchors.append(img_a)
            positives.append(img_p)
            negatives.append(img_n)
            
    return np.array(anchors), np.array(positives), np.array(negatives)

def main():
    print("=========================================================================")
    # 1. Định nghĩa tập Huấn luyện (Train) gồm 70 đối tượng từ S001 đến S070
    train_subjects = [f"S{i:03d}" for i in range(1, 71)]
    print(f"Bắt đầu thiết lập huấn luyện tinh chỉnh mô hình Facenet512 với Triplet Loss...")
    print(f"Số lượng đối tượng trong tập huấn luyện: {len(train_subjects)} (S001 -> S070)")
    
    # 2. Tải mô hình nền tảng Facenet512 từ DeepFace
    print("Đang tải mô hình nền tảng Facenet512...")
    model_client = DeepFace.build_model("Facenet512")
    base_model = model_client.model
    
    # Đóng băng toàn bộ trọng số của mô hình nền tảng để tránh thay đổi các lớp tích chập ban đầu
    base_model.trainable = False
    
    # 3. Xây dựng Feature Projector (Lớp chiếu đặc trưng tinh chỉnh)
    # MLP nhỏ nhận đầu ra 512 chiều của Facenet và ánh xạ sang không gian 512 chiều mới tối ưu hơn
    inputs = tf.keras.Input(shape=(160, 160, 3))
    x = base_model(inputs, training=False)
    # Lớp Dense 512 chiều có trọng số huấn luyện được
    projected = tf.keras.layers.Dense(512, activation=None, name="projector_dense")(x)
    # Chuẩn hóa L2 đầu ra để tính khoảng cách Cosine trực tiếp
    outputs = tf.keras.layers.Lambda(lambda t: tf.math.l2_normalize(t, axis=1))(projected)
    
    # Tạo mô hình huấn luyện hoàn chỉnh
    model = tf.keras.Model(inputs=inputs, outputs=outputs)
    print("Đã thiết lập mạng nơ-ron tinh chỉnh.")
    
    # Optimizer
    optimizer = tf.keras.optimizers.Adam(learning_rate=0.0005)
    
    # 4. Vòng lặp huấn luyện Custom Training Loop
    epochs = 15
    steps_per_epoch = 20
    batch_size = 32
    margin = 0.2
    
    print(f"\nBắt đầu huấn luyện {epochs} epoch (mỗi epoch chạy {steps_per_epoch} bước)...")
    
    for epoch in range(1, epochs + 1):
        epoch_loss = 0.0
        
        for step in range(1, steps_per_epoch + 1):
            # Lấy batch bộ ba
            anchors, positives, negatives = get_triplet_batch(train_subjects, batch_size)
            
            with tf.GradientTape() as tape:
                # Trích xuất embeddings
                emb_a = model(anchors, training=True)
                emb_p = model(positives, training=True)
                emb_n = model(negatives, training=True)
                
                # Tính khoảng cách Euclidean bình phương (trên không gian đã L2 normalized)
                d_ap = tf.reduce_sum(tf.square(emb_a - emb_p), axis=1)
                d_an = tf.reduce_sum(tf.square(emb_a - emb_n), axis=1)
                
                # Triplet Loss
                loss = tf.maximum(d_ap - d_an + margin, 0.0)
                mean_loss = tf.reduce_mean(loss)
                
            # Tính gradient và cập nhật trọng số (chỉ cập nhật lớp Projector Dense cuối cùng)
            trainable_vars = model.get_layer("projector_dense").trainable_variables
            gradients = tape.gradient(mean_loss, trainable_vars)
            optimizer.apply_gradients(zip(gradients, trainable_vars))
            
            epoch_loss += mean_loss.numpy()
            
        avg_loss = epoch_loss / steps_per_epoch
        print(f"Epoch {epoch}/{epochs} | Triplet Loss trung bình: {avg_loss:.4f}")
        
    # 5. Lưu trọng số đã tinh chỉnh của riêng lớp Projector Dense dưới dạng tệp numpy (.npz)
    weights_path = ROOT_PATH / "facenet512_projector_weights.npz"
    projector_layer = model.get_layer("projector_dense")
    weights = projector_layer.get_weights()  # Trả về [kernel, bias]
    np.savez(str(weights_path), kernel=weights[0], bias=weights[1])
    
    print("\n=======================================================")
    print("HOÀN TẤT HUẤN LUYỆN TINH CHỈNH!")
    print(f"Đã lưu tệp trọng số tinh chỉnh tại: {weights_path}")
    print("=======================================================")

if __name__ == "__main__":
    main()
