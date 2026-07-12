import os
import numpy as np

# Đường dẫn đến tệp trọng số tinh chỉnh (nằm ở thư mục gốc của backend)
WEIGHTS_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "facenet512_projector_weights.npz"))

# Tải trước trọng số nếu tệp tồn tại để tránh quá tải I/O mỗi khi gọi API
_W = None
_b = None

if os.path.exists(WEIGHTS_PATH):
    try:
        data = np.load(WEIGHTS_PATH)
        _W = data["kernel"]  # Ma trận (512, 512)
        _b = data["bias"]    # Vector (512,)
        print(f"[PROJECTOR] Đã tải thành công trọng số tinh chỉnh tại: {WEIGHTS_PATH}")
    except Exception as e:
        print(f"[PROJECTOR] Cảnh báo: Lỗi đọc tệp trọng số tinh chỉnh: {str(e)}")
else:
    print(f"[PROJECTOR] Cảnh báo: Không tìm thấy tệp trọng số tinh chỉnh tại '{WEIGHTS_PATH}'. Sử dụng đặc trưng mặc định.")

def project_embedding(emb: list) -> list:
    """
    Chiếu vector đặc trưng gốc 512 chiều sang không gian đặc trưng tối ưu PTTM
    và thực hiện chuẩn hóa L2.
    """
    global _W, _b
    
    # Nếu không có trọng số tinh chỉnh, trả về vector gốc như cũ
    if _W is None or _b is None:
        return emb
        
    try:
        # Chuyển đổi sang numpy array
        emb_arr = np.array(emb, dtype=np.float32)
        
        # 1. Nhân ma trận với trọng số đã huấn luyện và cộng bias
        projected = np.dot(emb_arr, _W) + _b
        
        # 2. Chuẩn hóa L2 (L2 Normalization) về dạng vector đơn vị
        norm = np.linalg.norm(projected)
        if norm > 0:
            projected = projected / norm
            
        # Trả về dưới dạng list Python thông thường
        return projected.tolist()
    except Exception as e:
        print(f"[PROJECTOR] Lỗi thực hiện chiếu vector: {str(e)}. Sử dụng đặc trưng gốc.")
        return emb
