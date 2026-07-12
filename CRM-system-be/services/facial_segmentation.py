import cv2
import numpy as np

def segment_face_regions(img: np.ndarray):
    """
    Phân chia khuôn mặt đã căn chỉnh thành 3 phân vùng dọc độc lập bằng phương pháp Làm mờ vùng (Blur-Masking):
    - Vùng Thượng (Trán & Mắt): Giữ nguyên 0 -> 45% chiều cao, làm mờ các phần còn lại.
    - Vùng Trung (Mũi & Má): Giữ nguyên 30% -> 70% chiều cao, làm mờ các phần còn lại.
    - Vùng Hạ (Môi & Cằm): Giữ nguyên 55% -> 100% chiều cao, làm mờ các phần còn lại.
    
    Phương pháp này giúp:
    1. Bảo toàn tỷ lệ khung hình (aspect ratio) của khuôn mặt.
    2. Tránh các đường biên đen sắc nét (edge transitions) gây sai lệch lớn cho mạng nơ-ron tích chập (CNN).
    3. Triệt tiêu các chi tiết đặc trưng ở các phân vùng khác bằng Gaussian Blur cực mạnh, buộc AI 
       chỉ nhận diện dựa trên phân vùng Crisp được giữ lại.
    """
    H, W = img.shape[:2]
    
    # Tạo bản làm mờ toàn bộ khuôn mặt bằng Gaussian Blur mạnh
    # Kích thước kernel (51, 51) giúp xóa bỏ hoàn toàn chi tiết (mũi, môi, cằm, mắt) nhưng giữ lại tone màu da
    blurred_img = cv2.GaussianBlur(img, (51, 51), 0)
    
    # Tạo các phân vùng từ bản làm mờ
    img_upper = blurred_img.copy()
    img_mid = blurred_img.copy()
    img_lower = blurred_img.copy()
    
    # 1. Vùng Thượng: Giữ nguyên 0 -> 45% chiều cao
    img_upper[0 : int(H * 0.45), :] = img[0 : int(H * 0.45), :]
    
    # 2. Vùng Trung: Giữ nguyên 30% -> 70% chiều cao
    img_mid[int(H * 0.30) : int(H * 0.70), :] = img[int(H * 0.30) : int(H * 0.70), :]
    
    # 3. Vùng Hạ: Giữ nguyên 55% -> 100% chiều cao
    img_lower[int(H * 0.55) : , :] = img[int(H * 0.55) : , :]
    
    return img_upper, img_mid, img_lower
