# KẾ HOẠCH SO SÁNH VÀ LỰA CHỌN BỘ PHÁT HIỆN KHUÔN MẶT VÀ MÔ HÌNH FER

## 1. Mục tiêu

Mục tiêu của kế hoạch là xây dựng một quy trình thực nghiệm có thể tái lập để chọn tổ hợp phù hợp nhất cho bài toán phân tích biểu cảm từ camera.

Pipeline của bài toán gồm hai bước bắt buộc:

```text
Ảnh hoặc khung hình video
→ phát hiện và căn chỉnh khuôn mặt
→ nhận dạng biểu cảm khuôn mặt
→ xác suất bảy lớp biểu cảm
```

Vì vậy không được chỉ so sánh riêng mô hình nhận dạng biểu cảm. Nếu detector phát hiện sai, crop lệch hoặc căn chỉnh kém thì mô hình FER phía sau sẽ nhận đầu vào nhiễu và kết quả biểu cảm không còn đáng tin cậy.

Việc đánh giá và lựa chọn mô hình trong báo cáo phải dựa trên benchmark tự chạy. Không sử dụng số liệu độ chính xác, FLOPs hoặc số tham số lấy từ các báo cáo/tài liệu bên ngoài để kết luận mô hình nào tốt hơn. Tài liệu kỹ thuật bên ngoài nếu cần chỉ dùng để hiểu đặc điểm kiến trúc và chọn danh sách ứng viên ban đầu; phần kết luận phải dựa trên cùng điều kiện kiểm thử, cùng tập dữ liệu, cùng phần cứng, cùng detector/alignment và cùng cách tính chỉ số.

Kế hoạch phải trả lời được năm câu hỏi:

1. Detector nào phát hiện và căn chỉnh khuôn mặt ổn định nhất trong điều kiện camera?
2. Mô hình FER nào phân loại biểu cảm tốt nhất khi đầu vào đã được căn chỉnh?
3. Tổ hợp detector + FER nào tốt nhất khi chạy end-to-end?
4. Tổ hợp nào đáp ứng được yêu cầu độ trễ trong quá trình suy luận video?
5. Kết quả nào đủ căn cứ để viết vào báo cáo, bảng biểu và phần kết luận lựa chọn mô hình?

## 2. Nguyên tắc kết luận trong báo cáo

Báo cáo cần tách rõ hai loại thông tin:

| Loại thông tin | Nguồn | Được dùng để làm gì | Có được dùng để kết luận mô hình tối ưu không? |
|---|---|---|---|
| Mô tả kỹ thuật | Tài liệu/kiến trúc của mô hình | Hiểu mô hình và chọn ứng viên đưa vào benchmark | Không |
| Benchmark tự chạy | Kết quả chạy lại trên tập dữ liệu đã nêu trong báo cáo | So sánh công bằng, lập bảng/biểu đồ, chọn mô hình phù hợp | Có |

Vì vậy phần báo cáo về lựa chọn mô hình phải có đủ bốn ý:

1. Sử dụng những tập dữ liệu nào để đánh giá.
2. So sánh những detector nào cho bước phát hiện/căn chỉnh khuôn mặt.
3. So sánh những mô hình FER nào cho bước nhận dạng biểu cảm.
4. Từ bảng benchmark tự chạy, chọn tổ hợp detector + FER phù hợp nhất với bài toán.

Nếu chưa chạy đủ benchmark, báo cáo chỉ được viết là "ứng viên ưu tiên" hoặc "giả thuyết lựa chọn", không được viết là "mô hình tối ưu".

## 3. Phạm vi

Kế hoạch phân biệt ba nhiệm vụ:

| Nhiệm vụ | Vai trò | Có nằm trong luồng FER bắt buộc không? |
|---|---|---|
| Phát hiện và căn chỉnh khuôn mặt | Tìm vị trí mặt, điểm mốc, crop và chuẩn hóa khuôn mặt | Có |
| Nhận dạng biểu cảm khuôn mặt | Phân loại vùng mặt thành bảy lớp biểu cảm | Có |
| Nhận diện danh tính | Xác định khách hàng là ai bằng embedding khuôn mặt | Không bắt buộc |

Nhận diện danh tính nếu được bật thì chạy như một nhánh riêng từ vùng khuôn mặt đã căn chỉnh:

```text
Vùng khuôn mặt đã căn chỉnh
├── FER → biểu cảm và xác suất
└── nhận diện danh tính → embedding và ứng viên khách hàng
```

Đầu ra chuẩn của FER gồm bảy lớp:

```text
angry, disgust, fear, happy, sad, surprise, neutral
```

Kết quả FER chỉ phản ánh biểu cảm quan sát được trên khuôn mặt. Báo cáo không được viết theo hướng khẳng định chắc chắn trạng thái tâm lý thật của người được quan sát.

## 4. Trạng thái hiện tại cần đối chiếu

### 4.1. Pipeline đang có

Dịch vụ xử lý ảnh hiện đang phát hiện khuôn mặt bằng backend `opencv` thông qua DeepFace, sau đó dùng DeepFace để phân tích cảm xúc và dùng Facenet512 cho nhánh nhận diện danh tính.

Luồng hiện tại:

```text
Ảnh đầu vào
→ DeepFace.extract_faces(detector_backend="opencv", align=True)
→ vùng mặt đã crop/căn chỉnh
├── DeepFace.analyze(actions=["emotion"])
└── Facenet512 + regional projector
```

Điểm cần làm rõ trong báo cáo:

- DeepFace là thư viện/tầng tích hợp, không phải tên mô hình nhận dạng biểu cảm.
- `opencv`, `mtcnn`, `retinaface`, `mediapipe` là các backend phát hiện khuôn mặt.
- Bộ phân loại cảm xúc cần được mô tả riêng với checkpoint, kiến trúc, tập dữ liệu huấn luyện và giao thức đánh giá.

### 4.2. Công cụ benchmark đã có

Thư mục `fer-benchmark/` hiện đã có khung tính chỉ số từ file dự đoán và xuất artifact benchmark:

```text
fer-benchmark/
├── benchmark.py
├── test_benchmark.py
├── datasets/ckplus/
│   ├── ckextended.csv
│   └── manifest.json
└── outputs/
    └── dataset_report.json
```

Không đưa bảng hoặc biểu đồ so sánh số liệu lấy từ báo cáo/tài liệu bên ngoài vào phần đánh giá. Các artifact phục vụ kết luận phải là kết quả benchmark tự chạy.

### 4.3. Khoảng trống còn thiếu

Các phần sau chưa được kiểm chứng đầy đủ:

- chưa có benchmark riêng cho detector;
- chưa có adapter chạy thực tế cho RetinaFace, MTCNN, MediaPipe theo cùng giao diện;
- chưa có checkpoint chính thức của EfficientFace, DAN, POSTER++ và ResEmoteNet được cấu hình đồng nhất;
- chưa có bảng `detector_comparison.*`;
- chưa có bảng `controlled_fer_comparison.*`;
- chưa có bảng `end_to_end_comparison.*`;
- chưa có kết luận thực nghiệm cuối cùng dựa trên cùng dataset, cùng detector, cùng phần cứng.

## 5. Giai đoạn 1 - Benchmark detector trước

### 5.1. Detector cần so sánh

| Detector | Nguồn sử dụng | Vai trò trong thí nghiệm | Nhận xét ban đầu |
|---|---|---|---|
| OpenCV | DeepFace backend | Baseline hiện tại | Nhanh, dễ chạy, nhưng yếu hơn trong điều kiện khó |
| MTCNN | DeepFace backend hoặc adapter riêng | Detector có landmark, làm baseline chất lượng trung bình | Căn chỉnh tốt hơn OpenCV, tốc độ thấp hơn |
| RetinaFace | DeepFace backend hoặc InsightFace/RetinaFace adapter | Ứng viên ưu tiên chất lượng | Mạnh với mặt nhỏ, nghiêng, ánh sáng khó; có landmark |
| MediaPipe/BlazeFace | MediaPipe adapter | Ứng viên ưu tiên tốc độ | Rất nhanh, phù hợp realtime, cần đo lại chất lượng trên camera |

YOLO face detector chỉ đưa vào nếu xác định rõ checkpoint, giấy phép, tác giả và adapter. Không ghi chung chung `YOLO` nếu chưa biết biến thể cụ thể.

### 5.2. Dataset detector

Cần có tập ảnh hoặc frame gốc chưa crop, gồm:

- ảnh có đúng một khuôn mặt;
- ảnh có nhiều khuôn mặt;
- ảnh không có khuôn mặt;
- khuôn mặt chính diện;
- khuôn mặt nghiêng;
- ánh sáng yếu hoặc ngược sáng;
- khuôn mặt nhỏ trong khung hình;
- khuôn mặt bị mờ do chuyển động;
- đeo kính, khẩu trang hoặc che một phần mặt.

Mỗi mẫu cần manifest:

```text
sample_id, image_path, split, expected_face_count, bbox_gt, landmarks_gt_optional, condition_tags
```

Nếu chưa có bounding box ground truth thì vẫn có thể đo Detection Rate, False Positive trên ảnh không mặt, số mặt phát hiện được và độ trễ. Precision/Recall theo IoU chỉ được báo cáo khi có bounding box ground truth.

### 5.3. Chỉ số detector

| Nhóm chỉ số | Chỉ số |
|---|---|
| Khả năng phát hiện | Detection Rate, Miss Rate, False Positive Rate |
| Độ chính xác hộp mặt | Precision, Recall, AP hoặc IoU trung bình nếu có bbox ground truth |
| Căn chỉnh | Landmark error nếu có ground truth, tỷ lệ crop hợp lệ |
| Ảnh khó | Detection Rate theo từng condition tag |
| Hiệu năng | P50/P95/P99 latency, FPS, RAM, CPU/GPU |

### 5.4. Quy tắc chọn detector

Detector được chọn vào vòng tiếp theo phải đạt:

- không crash trên toàn bộ tập kiểm thử;
- không sinh dự đoán giả trên ảnh không có khuôn mặt;
- Detection Rate trên tập camera đạt ngưỡng đã chốt;
- P95 latency phù hợp tần suất lấy mẫu camera;
- crop/căn chỉnh không làm giảm mạnh chất lượng FER ở vòng end-to-end.

Kết quả đầu ra của giai đoạn này:

```text
fer-benchmark/outputs/detector_comparison.csv
fer-benchmark/outputs/detector_comparison.md
fer-benchmark/outputs/detector_comparison.tex
fer-benchmark/outputs/detector_comparison.png
fer-benchmark/outputs/detector_predictions.jsonl
```

## 6. Giai đoạn 2 - Benchmark FER khi detector đã cố định

### 6.1. Mô hình FER cần so sánh

| Mô hình FER | Vai trò trong benchmark |
|---|---|
| EfficientFace | Ứng viên nhẹ, ưu tiên realtime |
| DAN | Ứng viên cân bằng với attention nhiều vùng |
| POSTER++ | Ứng viên ưu tiên độ chính xác |
| ResEmoteNet | Ứng viên có kiến trúc residual/attention cần kiểm chứng lại trong cùng điều kiện |

Các mô hình trên được đưa vào danh sách vì đại diện cho các hướng kiến trúc khác nhau. Việc đưa vào danh sách không có nghĩa là mô hình đó đã được chọn. Mô hình được chọn chỉ sau khi có kết quả benchmark tự chạy.

### 6.2. Nguyên tắc cố định biến

Khi so sánh FER, detector/alignment phải được cố định. Chỉ thay đổi mô hình FER để chênh lệch kết quả có thể được quy cho bộ phân loại biểu cảm.

```text
Cùng ảnh gốc
→ cùng detector đã chọn
→ cùng chính sách crop/căn chỉnh
→ thay lần lượt từng mô hình FER
→ so sánh xác suất và nhãn biểu cảm
```

Không được dùng detector khác nhau cho từng mô hình FER trong bảng xếp hạng chính.

### 6.3. Dataset FER

Báo cáo cần nêu rõ dataset nào được sử dụng, nguồn dữ liệu, vai trò của dataset và giới hạn của từng dataset. Kế hoạch sử dụng bốn nhóm dữ liệu:

| Dataset | Mục đích | Trạng thái |
|---|---|---|
| CK+ Extended CSV | Kiểm tra pipeline, chỉ số và khả năng chạy lại trên dữ liệu có sẵn | Đã có trong `fer-benchmark/datasets/ckplus/` |
| RAF-DB | Đánh giá biểu cảm trong điều kiện gần thực tế | Cần cấu hình đường dẫn sau khi có quyền truy cập |
| AffectNet-7 | Đánh giá trên dữ liệu lớn, đa dạng | Cần cấu hình đường dẫn sau khi có quyền truy cập |
| Tập camera gán nhãn | Đánh giá sát bài toán triển khai | Cần xây dựng hoặc chuẩn hóa manifest |

CK+ Extended hiện có 920 mẫu ảnh xám 48 x 48 pixel trong file CSV. Theo giao thức benchmark bảy lớp, chỉ dùng `PublicTest` và `PrivateTest`, loại lớp `contempt`, còn lại 182 mẫu kiểm thử. Đây là bản đóng gói lại từ Kaggle, không được mô tả là split CK+ chính thức.

CK+ Extended không đủ để kết luận mô hình tốt nhất cho camera bán lẻ vì dữ liệu chủ yếu là biểu cảm tạo dáng trong điều kiện kiểm soát. Vì vậy kết luận chính phải ưu tiên kết quả trên RAF-DB/AffectNet và tập camera gán nhãn. Nếu tại thời điểm hoàn thiện báo cáo chỉ chạy được CK+ Extended, báo cáo phải ghi rõ đây là kết quả kiểm thử bổ sung, chưa đủ để khẳng định mô hình tối ưu trong môi trường camera thực tế.

### 6.4. Chỉ số FER

| Nhóm chỉ số | Chỉ số |
|---|---|
| Phân loại | Macro-F1, Weighted-F1, Balanced Accuracy, Accuracy |
| Từng lớp | Precision, Recall, F1 của từng lớp |
| Lỗi nhầm lẫn | Confusion matrix |
| Xác suất | ECE, Brier Score, NLL, reliability diagram |
| Hiệu năng | P50/P95/P99 latency, FPS, RAM/VRAM |
| Ổn định video | số lần nhãn đổi/phút, độ lệch xác suất liên tiếp, độ trễ phát hiện chuyển đổi |

Kết quả đầu ra của giai đoạn này:

```text
fer-benchmark/outputs/controlled_fer_comparison.csv
fer-benchmark/outputs/controlled_fer_comparison.md
fer-benchmark/outputs/controlled_fer_comparison.tex
fer-benchmark/outputs/controlled_fer_comparison.png
fer-benchmark/outputs/predictions/<model>/<dataset>.jsonl
fer-benchmark/outputs/confusion_matrices/<model>_<dataset>.png
```

## 7. Giai đoạn 3 - Benchmark end-to-end detector + FER

Sau khi có hai detector tốt nhất và hai mô hình FER tốt nhất, chạy ma trận bốn tổ hợp:

```text
Detector 1 + FER 1
Detector 1 + FER 2
Detector 2 + FER 1
Detector 2 + FER 2
```

Giai đoạn này mới được dùng để kết luận tổ hợp phù hợp nhất cho bài toán camera.

Chỉ số end-to-end bắt buộc:

- Detection Rate;
- Macro-F1 end-to-end;
- tỷ lệ frame không có kết quả;
- độ ổn định nhãn trên video;
- P50/P95/P99 tổng độ trễ;
- FPS khi chạy một, hai và bốn luồng camera;
- RAM/VRAM peak;
- tỷ lệ request lỗi.

Kết quả đầu ra:

```text
fer-benchmark/outputs/end_to_end_comparison.csv
fer-benchmark/outputs/end_to_end_comparison.md
fer-benchmark/outputs/end_to_end_comparison.tex
fer-benchmark/outputs/end_to_end_comparison.png
fer-benchmark/outputs/final_selection.md
```

## 8. Quy tắc lựa chọn cuối cùng

Không chọn mô hình chỉ vì Accuracy cao nhất. Tổ hợp cuối cùng phải vượt quality gate trước, sau đó mới xếp hạng.

Quality gate:

- đầu ra FER có đúng bảy lớp;
- tổng xác suất xấp xỉ 1;
- không lỗi trên toàn bộ tập test;
- Macro-F1 cao hơn baseline hiện tại;
- Recall của các lớp ít dữ liệu không quá thấp;
- P95 latency đạt ngưỡng đã chốt;
- không rò rỉ RAM/VRAM khi chạy dài;
- giấy phép sử dụng rõ ràng;
- checkpoint, cấu hình và kết quả có thể tái lập.

Điểm tổng hợp đề xuất:

\[
S = 0.35F1_{camera}
  + 0.15F1_{public}
  + 0.15Detection
  + 0.15Speed
  + 0.10Stability
  + 0.10Calibration
\]

Trong đó:

- `F1_camera`: Macro-F1 trên tập camera gán nhãn;
- `F1_public`: Macro-F1 trên benchmark công khai;
- `Detection`: điểm phát hiện khuôn mặt của detector;
- `Speed`: điểm từ P95 latency;
- `Stability`: độ ổn định chuỗi video;
- `Calibration`: độ tin cậy của xác suất đầu ra.

Các trọng số phải được khóa trước khi xem kết quả test cuối cùng. Điểm tổng hợp chỉ hỗ trợ quyết định; quality gate và biểu đồ Pareto vẫn có quyền loại mô hình.

## 9. Cấu trúc triển khai benchmark cần bổ sung

Cấu trúc mục tiêu:

```text
fer-benchmark/
├── configs/
│   ├── benchmark.yaml
│   ├── detectors.yaml
│   ├── efficientface.yaml
│   ├── dan.yaml
│   ├── poster_plus_plus.yaml
│   └── resemotenet.yaml
├── src/
│   ├── detectors/
│   │   ├── base.py
│   │   ├── opencv_detector.py
│   │   ├── mtcnn_detector.py
│   │   ├── retinaface_detector.py
│   │   └── mediapipe_detector.py
│   ├── fer_models/
│   │   ├── base.py
│   │   ├── efficientface.py
│   │   ├── dan.py
│   │   ├── poster_plus_plus.py
│   │   └── resemotenet.py
│   ├── datasets/
│   ├── metrics/
│   ├── reports/
│   └── runners/
├── tests/
│   ├── unit/
│   ├── dataset/
│   ├── detector/
│   ├── fer/
│   ├── end_to_end/
│   └── performance/
└── outputs/
```

Giao diện detector:

```python
class FaceDetector:
    def load(self, device: str) -> None: ...
    def detect(self, image) -> list[FaceDetection]: ...
    @property
    def metadata(self) -> dict: ...
```

Giao diện FER:

```python
class FerModel:
    def load(self, checkpoint_path: str, device: str) -> None: ...
    def preprocess(self, aligned_face_image): ...
    def predict(self, aligned_face_image) -> FerPrediction: ...
    @property
    def metadata(self) -> dict: ...
```

## 10. Test case bắt buộc

### 10.1. Test detector

| Mã | Test case | Kết quả mong đợi |
|---|---|---|
| DET-01 | Ảnh có một mặt rõ | Phát hiện đúng một mặt |
| DET-02 | Ảnh không có mặt | Trả rỗng, không sinh face giả |
| DET-03 | Ảnh nhiều mặt | Trả đúng số lượng mặt hoặc báo chính sách xử lý rõ ràng |
| DET-04 | Mặt nghiêng | Không crash, ghi nhận detection result |
| DET-05 | Ảnh thiếu sáng | Có kết quả hoặc lý do từ chối rõ ràng |
| DET-06 | Ảnh mờ | Không crash, latency vẫn được ghi |
| DET-07 | Landmark thiếu hoặc sai | Không đưa crop lỗi vào FER |
| DET-08 | Đo 1.000 lần phát hiện | Có P50/P95/P99 và FPS |

### 10.2. Test FER

| Mã | Test case | Kết quả mong đợi |
|---|---|---|
| FER-01 | Nạp checkpoint hợp lệ | Mô hình sẵn sàng suy luận |
| FER-02 | Checkpoint sai | Báo lỗi rõ ràng |
| FER-03 | Suy luận một ảnh | Trả đủ bảy lớp |
| FER-04 | Tổng xác suất | Xấp xỉ 1 |
| FER-05 | Nhãn đầu ra | Thuộc tập nhãn chuẩn |
| FER-06 | Mapping nhãn | Không mất lớp, không sai thứ tự vector |
| FER-07 | Tính Macro-F1 | Khớp kết quả kỳ vọng trên fixture |
| FER-08 | Confusion matrix | Đúng kích thước và số lượng |
| FER-09 | Ảnh lỗi | Không làm tiến trình crash |
| FER-10 | Chạy lặp cùng đầu vào | Kết quả nằm trong dung sai |

### 10.3. Test dataset

| Mã | Test case | Kết quả mong đợi |
|---|---|---|
| DATA-01 | Manifest đầy đủ | Có sample id, path, label, split, source |
| DATA-02 | Nhãn hợp lệ | Tất cả nhãn thuộc tập cho phép |
| DATA-03 | Split không rò rỉ | Không trùng mẫu giữa train/validation/test |
| DATA-04 | Subject-disjoint | Một người không xuất hiện ở nhiều split nếu có subject id |
| DATA-05 | Video-disjoint | Frame cùng video không bị chia sang nhiều split |
| DATA-06 | Checksum dataset | Dữ liệu không bị thay đổi âm thầm |
| DATA-07 | Phân bố lớp | Xuất thống kê từng lớp |
| DATA-08 | Uncertain label | Không bị ép vào bảy lớp khi thiếu đồng thuận |

### 10.4. Test end-to-end

| Mã | Test case | Kết quả mong đợi |
|---|---|---|
| E2E-01 | Ảnh hợp lệ | Có detector metadata, FER metadata và xác suất bảy lớp |
| E2E-02 | Không có mặt | Không sinh kết quả biểu cảm giả |
| E2E-03 | Nhiều mặt | Chính sách xử lý nhất quán theo chế độ đăng ký hoặc camera |
| E2E-04 | Detector đổi, FER giữ nguyên | Ghi được ảnh hưởng của detector lên FER |
| E2E-05 | FER đổi, detector giữ nguyên | Ghi được ảnh hưởng của mô hình FER |
| E2E-06 | Video ổn định | Đo dao động nhãn theo thời gian |
| E2E-07 | Video chuyển biểu cảm | Đo độ trễ phát hiện thay đổi |
| E2E-08 | Chạy dài | Không rò rỉ bộ nhớ |

### 10.5. Test báo cáo và artifact

| Mã | Test case | Kết quả mong đợi |
|---|---|---|
| ART-01 | Xuất CSV | File đọc được, đủ cột bắt buộc |
| ART-02 | Xuất Markdown | Bảng hiển thị đúng |
| ART-03 | Xuất LaTeX | Compile được trong báo cáo |
| ART-04 | Xuất PNG | Biểu đồ rõ, không mất nhãn |
| ART-05 | Lưu prediction | Có thể tính lại metrics từ prediction |
| ART-06 | Lưu cấu hình | Có detector, FER, checkpoint, dataset, hardware |
| ART-07 | Lưu log test | Có bằng chứng quality gate đã chạy |

## 11. Bảng biểu cần đưa vào báo cáo

Chương 2 cần có đủ bảng để người đọc thấy quá trình đi từ benchmark đến lựa chọn:

| Tên artifact | Nội dung | Trạng thái |
|---|---|---|
| `detector_comparison` | So sánh OpenCV, MTCNN, RetinaFace, MediaPipe trên tập detector | Cần triển khai |
| `controlled_fer_comparison` | So sánh EfficientFace, DAN, POSTER++, ResEmoteNet khi detector đã cố định | Cần triển khai |
| `end_to_end_comparison` | So sánh tổ hợp detector + FER trong pipeline video | Cần triển khai |

Bảng lựa chọn cuối cùng phải lấy từ `end_to_end_comparison` hoặc `final_selection.md`, tức là kết quả thực nghiệm tự chạy trong cùng điều kiện.

## 12. Thứ tự triển khai

1. Bổ sung module benchmark detector và adapter cho OpenCV, MTCNN, RetinaFace, MediaPipe.
2. Bổ sung dataset manifest cho ảnh/frame detector.
3. Xuất `detector_comparison.*`.
4. Chọn detector cố định cho benchmark FER.
5. Bổ sung adapter cho EfficientFace, DAN, POSTER++ và ResEmoteNet.
6. Cấu hình checkpoint và dataset cho từng mô hình.
7. Xuất `controlled_fer_comparison.*`.
8. Chạy ma trận tổ hợp detector + FER.
9. Xuất `end_to_end_comparison.*` và `final_selection.md`.
10. Cập nhật Chương 2 của báo cáo bằng kết quả đã kiểm chứng.
11. Build lại PDF và kiểm tra trực quan bảng/biểu đồ.

## 13. Kết luận hiện tại trước khi chạy đủ benchmark

Ở thời điểm hiện tại, lựa chọn kỹ thuật cần được viết rõ theo hai tầng:

1. **Giả thuyết triển khai để ưu tiên kiểm chứng:** RetinaFace + EfficientFace.
2. **Lựa chọn cuối cùng sau benchmark:** mô hình đứng đầu trong `end_to_end_comparison.md` sau khi đạt quality gate về độ chính xác, độ trễ, detection rate và tính ổn định trên video.

Lý do chọn RetinaFace + EfficientFace làm hướng ưu tiên:

- RetinaFace phù hợp cho bước phát hiện và căn chỉnh khuôn mặt vì hỗ trợ landmark, ổn định hơn trong các điều kiện camera có mặt nhỏ, lệch góc hoặc ánh sáng không đều.
- EfficientFace phù hợp cho bước FER trong bài toán realtime vì hướng tới cân bằng giữa độ chính xác và chi phí tính toán, giúp giảm độ trễ trong quá trình suy luận trên chuỗi khung hình video.
- POSTER++ được giữ làm mốc tham chiếu chất lượng cao để kiểm tra xem việc tăng độ chính xác có đáng đổi bằng chi phí tính toán lớn hơn hay không.
- DAN được giữ làm phương án cân bằng.
- ResEmoteNet được giữ làm ứng viên cần tái lập, nhưng chưa được xem là lựa chọn chính nếu chưa có benchmark độc lập trong cùng điều kiện.

Trong báo cáo, không viết rằng mô hình đã "tối ưu" nếu chưa chạy đủ benchmark. Cách viết đúng là: **RetinaFace + EfficientFace là giả thuyết triển khai được ưu tiên kiểm chứng cho bài toán hiện tại**. Kết luận cuối cùng phải dựa trên bảng `end_to_end_comparison` do benchmark tự chạy sinh ra.
