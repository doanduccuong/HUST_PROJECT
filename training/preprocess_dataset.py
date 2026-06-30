import os
import cv2
import numpy as np
import sys
sys.path.append("/Users/sotatek/Desktop/ĐỒ ÁN/face_recognition_be")
from deepface import DeepFace
from pathlib import Path

# Thiết lập đường dẫn thư mục gốc
ROOT_PATH = Path("/Users/sotatek/Desktop/ĐỒ ÁN/C2FPW-RecFac")
SOURCE_BEFORE = ROOT_PATH / 'C2FPW_Before'
SOURCE_AFTER = ROOT_PATH / 'C2FPW_After'
ALIGNED_BEFORE = ROOT_PATH / 'C2FPW_aligned' / 'Before'
ALIGNED_AFTER = ROOT_PATH / 'C2FPW_aligned' / 'After'

os.makedirs(ALIGNED_BEFORE, exist_ok=True)
os.makedirs(ALIGNED_AFTER, exist_ok=True)

def align_and_save_faces(source_dir, dest_dir):
    print(f"\nBắt đầu tiền xử lý thư mục: {source_dir.name}...")
    files = sorted(os.listdir(source_dir))
    success_count = 0
    total_files = len(files)
    
    for idx, filename in enumerate(files):
        if not filename.endswith('.jpg'):
            continue
            
        src_path = os.path.join(source_dir, filename)
        dest_path = os.path.join(dest_dir, filename)
        
        # Bỏ qua nếu ảnh đã được tiền xử lý trước đó
        if os.path.exists(dest_path):
            success_count += 1
            continue
            
        try:
            # 1. Đọc ảnh nhị phân để bỏ qua lỗi đường dẫn tiếng Việt (non-ASCII)
            img_arr = np.fromfile(src_path, np.uint8)
            img = cv2.imdecode(img_arr, cv2.IMREAD_COLOR)
            if img is None:
                continue
                
            # 2. Phát hiện và căn chỉnh mặt qua DeepFace
            faces = DeepFace.extract_faces(
                img_path=img,
                detector_backend="opencv",
                enforce_detection=False,
                align=True
            )
            
            if faces:
                face_img = faces[0]["face"]
                # Chuẩn hóa kiểu dữ liệu về uint8 [0, 255]
                if face_img.dtype != np.uint8:
                    if face_img.max() <= 1.0:
                        face_img = (face_img * 255).astype(np.uint8)
                    else:
                        face_img = face_img.astype(np.uint8)
                
                # Chuyển đổi màu từ RGB (mặc định của extract_faces) sang BGR trước khi ghi đĩa bằng OpenCV
                face_img_bgr = cv2.cvtColor(face_img, cv2.COLOR_RGB2BGR)
                
                # Thay đổi kích thước khuôn mặt đã căn chỉnh về chuẩn 224x224
                face_img_resized = cv2.resize(face_img_bgr, (224, 224))
                
                # Ghi ảnh đã căn chỉnh ra đĩa
                _, img_encoded = cv2.imencode('.jpg', face_img_resized)
                img_encoded.tofile(dest_path)
                success_count += 1
                
        except Exception as e:
            # Nếu gặp lỗi phát hiện mặt hoặc lỗi OpenCV, bỏ qua ảnh lỗi đó
            pass
            
        # Hiển thị tiến trình định kỳ mỗi 50 ảnh
        if (idx + 1) % 100 == 0 or (idx + 1) == total_files:
            print(f"  Tiến độ: {idx + 1}/{total_files} ({((idx+1)/total_files)*100:.1f}%) | Thành công căn chỉnh: {success_count}")
            
    print(f"Hoàn tất! Đã trích xuất và căn chỉnh {success_count} khuôn mặt vào {dest_dir.name}.")

def main():
    # 1. Tiền xử lý ảnh trong thư mục C2FPW_Before
    align_and_save_faces(SOURCE_BEFORE, ALIGNED_BEFORE)
    
    # 2. Tiền xử lý ảnh trong thư mục C2FPW_After
    align_and_save_faces(SOURCE_AFTER, ALIGNED_AFTER)

if __name__ == "__main__":
    main()
