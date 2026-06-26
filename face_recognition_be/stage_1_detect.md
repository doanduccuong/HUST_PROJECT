# Tài Liệu Kỹ Thuật: Triển Khai Giai Đoạn 1 (Detect) trên Go Backend

Tài liệu này mô tả chi tiết phương thức hiện thực, cấu trúc mã nguồn, giải thuật tiền xử lý hình ảnh và đặc tả API của **Giai đoạn 1 (Detect)** trong hệ thống Backend nhận dạng thích ứng (`face_recognition_be`).

---

## 1. Kiến Trúc và Các Thành Phần Chính (Software Architecture)
Mã nguồn Go được tổ chức theo kiến trúc sạch (Clean Architecture) phân tách rõ ràng trách nhiệm giữa các tầng:

*   **Tầng Routing (`cmd/server/main.go`)**:
    *   Sử dụng router **Go Chi** (`github.com/go-chi/chi/v5`) để tiếp nhận HTTP requests.
    *   Thiết lập luồng khởi tạo môi trường (Initialize Environment) và hủy môi trường (Destroy Environment) của **ONNX Runtime** để giải phóng tài nguyên hệ thống khi tắt server.
*   **Tầng Handler (`internal/app/handler/detect_handler.go`)**:
    *   Tiếp nhận file ảnh upload qua phương thức `POST /api/v1/detect` (Multipart Form-Data, key `image`).
    *   Giới hạn dung lượng request tối đa 10MB và validate định dạng ảnh đầu vào (chỉ chấp nhận `.jpg`, `.jpeg`, `.png`).
    *   Giải mã luồng nhị phân của ảnh sang đối tượng ma trận ảnh `image.Image` chuẩn của Go.
*   **Tầng Service (`internal/app/service/detector_onnx.go`)**:
    *   Quản lý các phiên suy luận (Advanced Inference Sessions) độc lập thông qua gói `onnxruntime_go` (CGO wrapper).
    *   Tự động phát hiện và liên kết với thư viện động `libonnxruntime.dylib` từ cache.
    *   Tích hợp giải thuật tiền xử lý và chạy suy luận đồng thời mô hình RetinaFace và MobileNetV2.

---

## 2. Giải Thuật Tiền Xử Lý Hình Ảnh (Image Preprocessing)
Mô hình học sâu (đặc biệt là RetinaFace) yêu cầu cấu trúc tensor đầu vào rất nghiêm ngặt. Hàm `preprocessImage` trong Go xử lý qua các bước sau:

1.  **Nội suy hình học (Resize):**
    *   Sử dụng cơ chế nội suy song tuyến (Bilinear Interpolation) của gói `golang.org/x/image/draw` để co/giãn ảnh về kích thước mong muốn:
        *   Mô hình RetinaFace: $640 \times 640$ pixels.
        *   Mô hình MobileNetV2 Mask Classifier: $224 \times 224$ pixels.
2.  **Định dạng Tensor (CHW Layout):**
    *   Mặc định hình ảnh trong Go được lưu trữ dạng hàng-cột xen kẽ kênh màu (HWC - Height, Width, Channel). 
    *   Ta chuyển đổi về dạng phẳng một chiều (Planar - CHW) có kích thước `[1 * 3 * Height * Width]`.
3.  **Trừ giá trị trung bình (Mean Subtraction):**
    *   Để tương thích với các đặc trưng ảnh được học trong RetinaFace, ta thực hiện căn chỉnh dải màu bằng cách trừ giá trị trung bình kênh màu tương ứng:
        *   Kênh Red (R): Trừ $104.0$
        *   Kênh Green (G): Trừ $117.0$
        *   Kênh Blue (B): Trừ $123.0$
    *   *Công thức toán học thực thi trong Go:*
        ```go
        tensorData[idx] = float32(c.R) - 104.0        // Kênh R
        tensorData[size+idx] = float32(c.G) - 117.0   // Kênh G
        tensorData[2*size+idx] = float32(c.B) - 123.0 // Kênh B
        ```

---

## 3. Đặc Tả Giao Diện API (API Specifications)

### HTTP Request
*   **URL**: `http://localhost:8080/api/v1/detect`
*   **Method**: `POST`
*   **Headers**: `Content-Type: multipart/form-data`
*   **Body**:
    *   `image`: File (File ảnh JPG, JPEG hoặc PNG, kích thước tối đa 10MB)

### HTTP Response (Thành công)
```json
{
  "status": "success",
  "message": "Image processed successfully",
  "data": {
    "filename": "customer_checkin.jpg",
    "size": 184025,
    "stage1": {
      "bbox": [100, 80, 250, 300],
      "face_detected": true,
      "landmarks": [
        [140, 150],
        [200, 148],
        [170, 190],
        [145, 230],
        [195, 228]
      ],
      "mask_detected": true,
      "mask_probability": 0.92
    }
  }
}
```

---

## 4. Chế Độ Fallback / Placeholder Mode
Để thuận tiện cho quá trình phát triển độc lập (Frontend có thể gọi API Backend kiểm thử luồng ngay lập tức mà không cần nạp mô hình nặng), Backend được thiết lập cơ chế kiểm tra sự tồn tại của mô hình:
*   Nếu không có file `retinaface.onnx` hoặc `mask_classifier.onnx` trong thư mục `assets/models/`, server sẽ xuất thông báo cảnh báo `WARNING` lúc khởi động và tự động chạy ở chế độ giả lập để trả về kết quả giả định của Giai đoạn 1.
