# BẢN TÓM TẮT TOÀN DIỆN ĐỒ ÁN TỐT NGHIỆP
## ĐỀ TÀI: PHÂN TÍCH KHÁCH HÀNG DỰA TRÊN BIỂU CẢM KHUÔN MẶT THÍCH ỨNG TRONG Y KHOA THẨM MỸ

Tài liệu này tóm tắt toàn bộ đồ án, bao gồm mục tiêu, kiến trúc công nghệ, quy trình huấn luyện học sâu, các công thức toán học cốt lõi và các chỉ số hiệu năng hệ thống đạt được.

---

## 1. Mục tiêu và Ý nghĩa Thực tiễn của Đồ án
Đồ án tập trung nghiên cứu và phát triển giải pháp thị giác máy tính và học sâu tích hợp tính thích ứng cao nhằm giải quyết hai bài toán lớn trong ngành quản lý thẩm mỹ và spa:
1.  **Nhận diện & Xác thực thích ứng (Adaptive Verification):** Nhận diện chính xác danh tính khách hàng trong bối cảnh diện mạo bị thay đổi cơ học tạm thời sau can thiệp phẫu thuật (sưng tấy, đỏ da, băng gạc) hoặc bị che khuất diện rộng do đeo khẩu trang bảo vệ vết thương.
2.  **Định lượng trải nghiệm & Phục hồi thẩm mỹ (Aesthetic Analytics):**
    *   Tự động tính toán **Chỉ số hài lòng khách hàng ($CS$)** qua phân tích biểu cảm khuôn mặt động lực học cơ mặt tại quầy đón tiếp hoặc sau trị liệu.
    *   Tính toán **Tỉ lệ đối xứng cơ mặt ($MSR$)** để lượng hóa độ cân đối giải phẫu, hỗ trợ bác sĩ theo dõi tiến trình phục hồi hoặc phát hiện sớm các biến chứng liệt/lệch cơ (ví dụ: sau tiêm Botox, Filler).
    *   Đưa ra các **khuyến nghị liệu trình cá nhân hóa** dựa trên dữ liệu sưng tấy và đối xứng cơ mặt.

---

## 2. Kiến trúc Hệ thống và Phân tầng Công nghệ

Hệ thống được thiết kế theo hướng mô-đun hóa, áp dụng nghiêm ngặt các mẫu thiết kế sạch trên cả Frontend và Backend:

```
[Presentation Layer] Next.js (React Custom ViewModels & Responsive Canvas)
        │
        ▼ (HTTP API / WebSocket Protocol)
[Application Layer] Golang Backend (Layered Architecture: Handler ──> Service)
        │
        ▼ (Process Pipe stdin/stdout communication)
[Core Engine] deepfacev2 (Subprocess Python Bridge) ──> models (RetinaFace, MobileNetV2)
```

*   **Next.js Frontend (Clean Architecture):**
    *   **Domain Layer:** Định nghĩa các models thực thể cốt lõi và UseCases nghiệp vụ.
    *   **Data Layer:** Định nghĩa Zod Schemas để xác thực DTO, Mappers ánh xạ dữ liệu và Datasources xử lý kết nối.
    *   **Presentation Layer:** Tách biệt giao diện vẽ Canvas (`SingleDetectTab.js`) ra khỏi các luồng quản lý state bằng Custom React Hooks (`use-single-detect-viewmodel.js`).
*   **Golang Backend (Layered Architecture):**
    *   **cmd/server/main.go:** Thiết lập server Chi, CORS chéo nguồn cổng 3000, nạp và giải phóng bộ nhớ.
    *   **internal/app/dto/ & handler/:** Quản lý DTO trao đổi dữ liệu, kiểm tra tính hợp lệ của ảnh tải lên.
    *   **internal/app/service/detector_onnx.go:** Logic nạp mô hình ONNX qua thư viện ONNX Runtime Go bindings để suy luận trực tiếp hoặc điều phối qua Python Subprocess Bridge (`bridge.py`) nhằm duy trì tốc độ và tính đồng bộ hệ thống.

---

## 3. Các Công thức Toán học và Chỉ số Cốt lõi

### A. Hàm mất mát đa nhiệm tối ưu RetinaFace (Detect)
$$
L = L_{cls}(p\_i, p\_i^{\ast}) + \lambda\_1 p\_i^{\ast} L_{box}(t\_i, t\_i^{\ast}) + \lambda\_2 p\_i^{\ast} L_{pts}(l\_i, l\_i^{\ast})
$$
*   $L_{cls}$ là hàm mất mát phân loại nhị phân (Binary Cross-Entropy Loss) để xác định sự xuất hiện của khuôn mặt.
*   $L_{box}$ hồi quy bounding box và $L_{pts}$ hồi quy tọa độ 5 điểm mốc giải phẫu (Smooth L1 Loss).
*   $p_i^*$ nhận giá trị 1 cho anchor chứa khuôn mặt và 0 cho nền, đảm bảo chỉ tính toán hồi quy cho vùng có mặt thực tế.

### B. Căn chỉnh Affine hình học Procrustes có trọng số (Align)
Để căn xoay khuôn mặt thẳng đứng mà không bị méo góc khi có mốc bị lệch do phẫu thuật hoặc khẩu trang che khuất:
$$
\min\_{M} \sum\_{i=1}^{N} w\_i \left\| Q\_i - M(P\_i) \right\|^2
$$
*   $P_i$ và $Q_i$ là điểm mốc thực tế và điểm mốc chuẩn trên khuôn mẫu.
*   $w_i \in [0, 1]$ là trọng số tin cậy. Khi đeo khẩu trang, các mốc bị che được gán $w_i = 0$, hệ thống chỉ sử dụng các điểm mốc vùng mắt, trán bất biến ($w_i \approx 1.0$) để tìm ma trận dịch chuyển Affine $M$.

### C. Lọc song phương mịn da bảo toàn đường biên giải phẫu (Normalize)
Làm mịn các nhiễu đỏ da, sưng tấy tạm thời mà không làm mất biên cạnh cấu trúc khuôn mặt:
$$
I^{filtered}(x) = \frac{1}{W\_p} \sum\_{x\_i \in \Omega} I(x\_i) g\_s(\|x\_i - x\|) f\_r(\|I(x\_i) - I(x)\|)
$$
*   Hàm không gian $g_s = \exp\left( - \frac{\|x_i - x\|^2}{2 \sigma_s^2} \right)$ làm mờ các khoảng cách lân cận.
*   Hàm màu sắc $f_r = \exp\left( - \frac{\|I(x_i) - I(x)\|^2}{2 \sigma_r^2} \right)$ ngăn chặn việc làm mờ qua các đường ranh giới có độ lệch cường độ lớn hơn $\sigma_r$ (biên cạnh).

### D. Chỉ số hài lòng khách hàng ($CS$)
$$
CS = 100 \times \max\left(0, \min\left(1, P\_{happy} + 0.7 P\_{neutral} + 0.3 P\_{surprise} - 0.5 P\_{sad} - 0.8 P\_{angry} - 0.6 P\_{fear} - 0.4 P\_{disgust}\right)\right)
$$
*   Tính toán từ phân phối xác suất 7 lớp cảm xúc được dự đoán bởi mạng học sâu MobileNetV2 tự huấn luyện.

### E. Tỉ lệ đối xứng cơ mặt giải phẫu ($MSR$)
Lượng hóa sự mất cân đối giải phẫu phục vụ theo dõi phục hồi hậu phẫu:
$$
MSR = 1.0 - \frac{1}{N} \sum\_{i=1}^{N} \frac{|d\_{left}^{(i)} - d\_{right}^{(i)}|}{d\_{left}^{(i)} + d\_{right}^{(i)}}
$$
*   $d_{left}^{(i)}, d_{right}^{(i)}$ là khoảng cách Euclid chuẩn hóa từ các mốc cơ đối xứng bên trái/phải đến trục đối xứng trung tâm (Sellion - Pronasale - Subnasale). Chỉ số $MSR \in [0, 1]$ tiến sát về 1.0 biểu thị cơ mặt phục hồi hoàn toàn cân đối.

### F. Công thức scale Responsive Canvas trên Frontend
Tự động ánh xạ tọa độ landmarks từ ảnh gốc ($W_{orig} \times H_{orig}$) lên khung hiển thị của trình duyệt ($W_{display} \times H_{display}$):
$$
u\_i = x\_i \times \frac{W\_{display}}{W\_{orig}}, \quad v\_i = y\_i \times \frac{H\_{display}}{H\_{orig}}
$$

---

## 4. Quy trình Huấn luyện Mô hình Học sâu FER (deepfacev2/train_pipeline)
Đồ án tự huấn luyện một mô hình phân loại cảm xúc khuôn mặt chuyên biệt thông qua 5 giai đoạn:
1.  **Stage 1:** Tải tự động và giải nén bộ dữ liệu **FER2013** (35.887 ảnh xám thuộc 7 lớp biểu cảm).
2.  **Stage 2:** Tiền xử lý dữ liệu và Data Augmentation (Random Rotation, Horizontal Flip, Color Jitter) chống quá khớp.
3.  **Stage 3:** Nạp backbone mạng **MobileNetV2** (pre-trained ImageNet) và thiết lập Classification Head mới ánh xạ đặc trưng ẩn $d = 1280$ chiều sang 7 lớp đầu ra.
4.  **Stage 4:** Huấn luyện trên phần cứng tăng tốc đồ họa (Apple Silicon MPS) với hàm mất mát Cross-Entropy và bộ tối ưu Adam ($lr = 0.0005$). Mô hình đạt **67.57% validation accuracy** sau 10 epochs.
5.  **Stage 5:** Xuất mô hình PyTorch tĩnh sang định dạng đồ thị **ONNX** với cơ chế Batch-size động (`dynamic_axes`) phục vụ suy luận hiệu năng cao.

---

## 5. Kết quả Thử nghiệm & Chỉ số Hiệu năng Hệ thống

Kết quả đo đạc thực nghiệm khi chạy suy luận trên cùng một phần cứng (CPU Apple M2 Pro) cho thấy ưu điểm vượt trội của giải pháp tối ưu hóa ONNX/Go đề xuất so với thư viện Keras/TensorFlow mặc định:

| Chỉ số hiệu năng đo lường | DeepFace mặc định (Keras/TF) | Giải pháp tối ưu hóa đề xuất (ONNX/Go) |
| :--- | :---: | :---: |
| **Độ trễ suy luận (Latency)** | $\sim 145$ ms | $\mathbf{\sim 8}$ ms (Nhanh gấp 18 lần) |
| **Dung lượng tệp mô hình** | $\sim 150$ MB | $\mathbf{9.1}$ MB (Nhẹ hơn 15 lần) |
| **Bộ nhớ RAM chiếm dụng** | $\sim 1.2$ GB | $\mathbf{\sim 45}$ MB (Tiết kiệm 96% RAM) |
| **Thời gian nạp mô hình** | $\sim 4.5$ s | $\mathbf{\sim 0.1}$ s |

---

## 6. Cấu trúc thư mục của Đồ án trên đĩa
*   `Báo cáo/`: Chứa toàn bộ mã nguồn báo cáo LaTeX tốt nghiệp đã được chuẩn hóa định dạng học thuật học thuật.
*   `deepfacev2/`: Chứa gói thư viện Python thích ứng tự phát triển, cầu nối tiến trình `bridge.py`, và quy trình huấn luyện học sâu `train_pipeline/`.
*   `face_recognition_be/`: Golang Backend (Layered Architecture).
*   `face_recognition_fe/`: Next.js Frontend (Clean Architecture).
*   `architecture_and_dataflow.md`: Mô tả chi tiết luồng trao đổi dữ liệu.
*   `project_summary.md`: Bản tóm tắt dự án này.
