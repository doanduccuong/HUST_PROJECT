# KIẾN TRÚC HỆ THỐNG VÀ LUỒNG DỮ LIỆU ĐỒ ÁN (SYSTEM ARCHITECTURE & DATA FLOW)

Tài liệu này tổng hợp toàn bộ cấu trúc kiến trúc hệ thống, sơ đồ khối luồng dữ liệu (Data Flow Diagram) và giải thích chi tiết các bước xử lý từ Frontend (Next.js), qua Backend (Go), đến mô hình học sâu tự huấn luyện (ONNX) và bộ công cụ tính toán chỉ số thẩm mỹ.

---

## 1. Sơ đồ khối Luồng dữ liệu (Data Flow Diagram)

Dưới đây là sơ đồ Mermaid thể hiện cách dữ liệu ảnh đi qua các thành phần của hệ thống và trả về kết quả hiển thị cho khách hàng:

```mermaid
graph TD
    %% Styling
    classDef fe fill:#e1f5fe,stroke:#03a9f4,stroke-width:2px;
    classDef be fill:#e8f5e9,stroke:#4caf50,stroke-width:2px;
    classDef ai fill:#fff3e0,stroke:#ff9800,stroke-width:2px;
    classDef formula fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px;

    %% Client Layer (Frontend Next.js)
    subgraph Client ["PRESENTATION LAYER (Next.js FE)"]
        UI["SingleDetectTab.js (Giao diện tải ảnh)"]
        VM["use-single-detect-viewmodel.js (React Hook)"]
        DS["face-recognition.datasource.js (HTTP Client)"]
        Canvas["Vẽ Bounding Box & Landmarks (Tự động scale theo natural size)"]
    end
    class UI,VM,DS,Canvas fe;

    %% API Gateway Layer (Go Backend)
    subgraph API ["LAYERED ARCHITECTURE (Go BE)"]
        Handler["detect_handler.go (CORS & DTO Validation)"]
        Service["detector_onnx.go (ONNX Runtime Engine)"]
    end
    class Handler,Service be;

    %% AI & Core Processing Layer
    subgraph AI_Engine ["AI & IMAGE PROCESSING ENGINE"]
        FaceDet["RetinaFace (Phát hiện khuôn mặt & Trích xuất 5 Landmarks)"]
        Align["Weighted Procrustes Alignment (Căn xoay nghiêng thích ứng)"]
        Filter["Bilateral Skin Filter & CLAHE (Làm mịn vết sưng đỏ y khoa)"]
        ONNX["MobileNetV2 (ONNX Model tự huấn luyện trên FER2013)"]
    end
    class FaceDet,Align,Filter,ONNX ai;

    %% Analytics & Mathematics Layer
    subgraph Analytics ["MEDICAL & AESTHETIC ANALYTICS"]
        CS_Calc["Chỉ số hài lòng khách hàng (CS Score)"]
        MSR_Calc["Tỉ lệ đối xứng cơ mặt (MSR - Theo dõi tiêm Botox/Filler)"]
        Rules["Rule-based Recommendation (Hệ khuyến nghị liệu trình tự động)"]
    end
    class CS_Calc,MSR_Calc,Rules formula;

    %% Connections
    UI -->|1. Chọn & tải ảnh| VM
    VM -->|2. Gọi Usecase & Datasource| DS
    DS -->|3. HTTP POST request (Base64/File)| Handler
    Handler -->|4. Kiểm tra DTO & Gọi Service| Service
    
    Service -->|5. Định vị khuôn mặt| FaceDet
    FaceDet -->|6. landmarks tọa độ| Align
    Align -->|7. Khuôn mặt đã căn xoay| Filter
    Filter -->|8. Ảnh chuẩn hóa sạch nhiễu| ONNX
    
    ONNX -->|9. Phân phối xác suất 7 cảm xúc| CS_Calc
    FaceDet -->|10. Tọa độ landmarks đối xứng| MSR_Calc
    MSR_Calc & Filter -->|11. Chỉ số sưng tấy & đối xứng| Rules
    
    CS_Calc & MSR_Calc & Rules -->|12. Tổng hợp JSON Response| Service
    Service -->|13. Gửi trả kết quả| Handler
    Handler -->|14. HTTP JSON Response| DS
    DS -->|15. Cập nhật State| VM
    VM -->|16. Render UI| Canvas
```

---

## 2. Giải thích Chi tiết Luồng Xử lý 5 Bước

### BƯỚC 1: Tương tác tại Frontend (Next.js Client)
1. Người dùng (bác sĩ hoặc tư vấn viên tại spa) thực hiện tải lên 1 bức ảnh chân dung của khách hàng tại tab **Single Image Detect & Analysis**.
2. React ViewModel (`use-single-detect-viewmodel.js`) tiếp nhận file ảnh, chuyển đổi thành dữ liệu Base64 hoặc FormData.
3. Lớp Datasource (`face-recognition.datasource.js`) gửi một HTTP POST request chứa file ảnh tới Backend Go (`http://localhost:8080/api/v1/detect`).

### BƯỚC 2: Tiếp nhận và Điều phối tại Backend (Go API Server)
1. Handler (`detect_handler.go`) tiếp nhận request, giải mã file ảnh và thực hiện kiểm tra cấu trúc dữ liệu bằng DTO đầu vào nhằm lọc các file không hợp lệ hoặc lỗi định dạng.
2. Handler chuyển giao dữ liệu ảnh cho lớp Service (`detector_onnx.go`) để gọi mô-đun AI xử lý ảnh.

### BƯỚC 3: Phát hiện & Căn chỉnh thích ứng (AI Engine)
1. **Phát hiện khuôn mặt:** Sử dụng thuật toán **RetinaFace** để xác định vị trí khuôn mặt (Bounding Box) và trích xuất tọa độ 5 điểm mốc (landmarks) chính gồm: mắt trái, mắt phải, mũi, khóe miệng trái và khóe miệng phải.
2. **Căn chỉnh (Alignment):** Sử dụng thuật toán **Weighted Procrustes Alignment** xoay khuôn mặt thẳng đứng mà không làm lệch trục giải phẫu tự nhiên của khách hàng.
3. **Lọc nhiễu y khoa (Preprocessing):** Sử dụng bộ lọc **Skin Bilateral Filter** kết hợp với **CLAHE** để tự động làm mịn các vết đỏ hoặc sưng tấy tạm thời sau phẫu thuật thẩm mỹ, đồng thời giữ nguyên độ sắc nét của các mốc giải phẫu cốt lõi.

### BƯỚC 4: Nhận diện Cảm xúc & Tính toán Chỉ số (Model Inference & Analytics)
1. **Dự đoán cảm xúc:** Ảnh khuôn mặt sau khi chuẩn hóa được đưa vào mô hình học sâu **MobileNetV2** (dưới định dạng ONNX mà chúng ta tự huấn luyện trên tập dữ liệu FER2013). Mô hình trả về phân phối xác suất của 7 trạng thái cảm xúc ($P_{happy}, P_{sad}, P_{angry}, \dots$) với độ trễ cực thấp ($\approx 8$ms).
2. **Tính điểm Hài lòng khách hàng ($CS$):** Tính toán điểm số từ 0 đến 100 dựa trên phân phối xác suất cảm xúc:
   $$CS = 100 \times \max\left(0, \min\left(1, P_{happy} + 0.7 P_{neutral} + 0.3 P_{surprise} - 0.5 P_{sad} - 0.8 P_{angry} - 0.6 P_{fear} - 0.4 P_{disgust}\right)\right)$$
3. **Tính tỉ lệ đối xứng cơ mặt ($MSR$):** Trích xuất tọa độ các mốc đối xứng giải phẫu ở nửa mặt trái và phải (như khóe miệng ngoài, đỉnh chân mày...) so với trục trung tâm (sống mũi, nhân trung):
   $$MSR = 1.0 - \frac{1}{N} \sum_{i=1}^{N} \frac{|d_{left}^{(i)} - d_{right}^{(i)}|}{d_{left}^{(i)} + d_{right}^{(i)}}$$
4. **Hệ khuyến nghị liệu trình tự động:** Dựa vào chỉ số đối xứng $MSR$ (ví dụ: nếu $MSR < 0.90$, tức cơ mặt bị lệch tạm thời sau tiêm botox/filler) và chỉ số sưng tấy để đưa ra các gợi ý điều trị phục hồi tương ứng.

### BƯỚC 5: Trả kết quả & Vẽ Canvas trên Frontend
1. Bộ xử lý AI trả kết quả về cho Go Backend. Go đóng gói thành một HTTP JSON Response trả về cho Next.js Client.
2. Next.js ViewModel tiếp nhận kết quả, cập nhật trạng thái UI.
3. Giao diện tự động **vẽ đè Bounding Box và các điểm Landmarks chính xác lên khuôn mặt** thông qua Canvas (tự động scale đúng tỉ lệ phóng to/thu nhỏ ảnh trên màn hình trình duyệt), đồng thời hiển thị trực quan các chỉ số cảm xúc, điểm hài lòng $CS$, điểm đối xứng $MSR$ và khung khuyến nghị liệu trình y khoa của bác sĩ.
