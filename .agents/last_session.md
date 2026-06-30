# 📌 Session Summary: Giải quyết vấn đề mất ngữ cảnh (Context Loss)
*Phiên làm việc lúc: 2026-06-29 22:30 (Giờ địa phương)*

## 🔍 Tóm tắt Session hiện tại
*   **Backend:** Đã chuyển hoàn toàn sang Python FastAPI (chạy cổng `8000`), tích hợp DeepFace. Đã sửa lỗi `tf-keras` và server hoạt động ổn định.
*   **Frontend:** Next.js (chạy cổng `3000`) đã được cấu trúc lại hoàn chỉnh theo chuẩn **Clean Architecture** (Domain -> Data -> Presentation).
*   **Database (PostgreSQL + pgvector):** Khởi chạy container `postgres-vector` qua Docker ở cổng **`5433`** (để tránh xung đột cổng `5432` trên máy).
*   **Dữ liệu thử nghiệm:** Đã chạy script `generate_data.py` sinh thành công:
    *   3.001 khách hàng (gồm 3.000 khách giả lập lưu vector 512 chiều chuẩn hóa và 1 tài khoản demo **Jane Doe**).
    *   15.062 giao dịch mua hàng ngẫu nhiên trong 12 tháng qua.
    *   24.008 lượt check-in ghi nhận cảm xúc khuôn mặt và khoảng cách tương đồng.

## 🛠️ Thống nhất về giải thuật Đối sánh & Phân tích
*   **Giải thuật so khớp:** Dùng DeepFace dịch ảnh check-in thành vector 512 chiều $\rightarrow$ Đẩy xuống Postgres so sánh khoảng cách Cosine (`<=>`) $\rightarrow$ Tìm khách hàng gần nhất (`LIMIT 1`). Nếu khoảng cách `< 0.40` thì xác nhận định danh.
*   **Mục tiêu phân tích:** Sử dụng dữ liệu định danh của khách để truy vấn hành vi tiêu dùng (phân khúc VIP, thói quen theo độ tuổi/giới tính nhận diện qua camera) và phân tích cảm xúc check-in thời gian thực.

## 🚀 Công việc tiếp theo (Next Steps)
- [ ] Lập trình kết nối PostgreSQL trong FastAPI Backend (`face_recognition_be/main.py`) để thực hiện đăng ký và check-in lưu trực tiếp vào CSDL thay vì file cục bộ.
- [ ] Lập trình giao diện Dashboard phân tích dữ liệu trên Next.js Frontend để trực quan hóa biểu đồ doanh thu theo nhóm tuổi và cảm xúc khách hàng.
