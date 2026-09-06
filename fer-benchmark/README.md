# FER model comparison

Bộ công cụ này chỉ dùng file dự đoán thực tế để tính lại Accuracy, Macro Precision, Macro Recall, Macro F1, ma trận nhầm lẫn và độ trễ trên cùng một giao thức thử nghiệm.

## Tập kiểm thử có trong project

`datasets/ckplus/ckextended.csv` chứa 920 ảnh xám 48×48 dưới dạng chuỗi pixel. File được tải từ bản CK+ Extended do tài khoản `davilsena` phân phối trên Kaggle với metadata giấy phép CC0. `manifest.json` lưu nguồn, checksum SHA-256, ánh xạ nhãn và giao thức sử dụng.

Benchmark bảy lớp chỉ lấy `PublicTest` và `PrivateTest`, đồng thời loại lớp `contempt`, còn 182 mẫu. Đây là tập kiểm tra khả năng tái lập, không thay thế RAF-DB, AffectNet hoặc dữ liệu camera cửa hàng vì ảnh CK+ chủ yếu được thu trong điều kiện kiểm soát.

Kiểm tra dataset:

```bash
python3 fer-benchmark/benchmark.py inspect-dataset
```

Chạy lại toàn bộ benchmark hiện có trên 182 mẫu CK+ (mạng CNN bảy lớp do
`EmotionClient` của DeepFace nạp, kết hợp lần lượt với OpenCV, MTCNN và
RetinaFace):

```bash
python3 fer-benchmark/run_ckplus_deepface.py \
  --detectors opencv mtcnn retinaface
```

Lệnh này tạo CSV dự đoán trong `outputs/predictions/` trước, sau đó mới tính
chỉ số và sinh `detector_comparison.*`, `controlled_fer_comparison.*` và
`end_to_end_comparison.*`. Vì vậy, các bảng LaTeX và biểu đồ PNG là đầu ra của
lần chạy mô hình, không phải số liệu nhập thủ công.

## Benchmark detector

File CSV đầu vào cho detector cần có tối thiểu `expected_face_count`, `detected_face_count`; có thể thêm `sample_id`, `latency_ms`, `bbox_iou`, `valid_crop` và `condition_tags`:

```csv
sample_id,expected_face_count,detected_face_count,latency_ms,bbox_iou,valid_crop,condition_tags
0001,1,1,18.4,0.82,true,front
0002,0,0,12.1,,true,no_face
```

Chạy đánh giá từng detector:

```bash
python3 fer-benchmark/benchmark.py evaluate-detector \
  --predictions path/to/opencv_detector_predictions.csv \
  --detector opencv \
  --dataset camera-detector-test
```

Sau khi có JSON kết quả của các detector, xuất bảng so sánh:

```bash
python3 fer-benchmark/benchmark.py compare-detectors \
  --summaries \
    fer-benchmark/outputs/opencv_camera-detector-test_detector.json \
    fer-benchmark/outputs/mtcnn_camera-detector-test_detector.json \
    fer-benchmark/outputs/retinaface_camera-detector-test_detector.json \
    fer-benchmark/outputs/mediapipe_camera-detector-test_detector.json \
  --min-detection-rate 0.90 \
  --max-p95-ms 150
```

Kết quả xuất ra `detector_comparison.csv`, `detector_comparison.md`, `detector_comparison.tex`, `detector_comparison.png` và `detector_selection.json`.

## Benchmark FER

File CSV đầu vào bắt buộc có `true_label`, `pred_label`; có thể thêm `sample_id` và `latency_ms`:

```csv
sample_id,true_label,pred_label,latency_ms
0001,happy,happy,12.4
0002,sad,neutral,11.8
```

Bảy nhãn hợp lệ là `angry`, `disgust`, `fear`, `happy`, `sad`, `surprise`, `neutral`.

```bash
python3 fer-benchmark/benchmark.py evaluate \
  --predictions path/to/predictions.csv \
  --model EfficientFace \
  --dataset RAF-DB
```

Mỗi lần đánh giá sinh ra JSON kết quả, CSV tóm tắt và file `*_confusion_matrix.png` để đưa vào phần phân tích lỗi phân lớp.

Mỗi mô hình phải sinh một file JSON kết quả theo lệnh trên. Sau khi cả bốn mô hình đã chạy trên cùng dataset và phần cứng, xuất bảng kết luận bằng:

```bash
python3 fer-benchmark/benchmark.py compare \
  --summaries \
    fer-benchmark/outputs/efficientface_ckplus.json \
    fer-benchmark/outputs/dan_ckplus.json \
    fer-benchmark/outputs/posterplusplus_ckplus.json \
    fer-benchmark/outputs/resemotenet_ckplus.json \
  --max-p95-ms 200
```

Quy tắc chọn được khóa trước khi chạy: loại mô hình có p95 vượt ngưỡng, sau đó chọn Macro-F1 cao nhất; Accuracy và p95 thấp hơn là tiêu chí phá hòa. Kết quả được xuất ra CSV, Markdown, LaTeX và JSON, trong đó JSON ghi rõ mô hình được chọn và lý do.

Để so sánh công bằng, các mô hình phải dùng cùng tập kiểm thử, cùng bộ phát hiện/căn chỉnh khuôn mặt, cùng chính sách xử lý ảnh lỗi và cùng phần cứng. RAF-DB và AffectNet không được đưa vào kho mã nguồn khi chưa có quyền phân phối; người chạy tự cấu hình đường dẫn cục bộ sau khi được chủ sở hữu dataset cấp quyền.

Lệnh `compare` xuất thêm `controlled_fer_comparison.csv`, `controlled_fer_comparison.md`, `controlled_fer_comparison.tex` và `controlled_fer_comparison.png` để đưa vào báo cáo.

## Benchmark end-to-end detector + FER

File CSV đầu vào cho end-to-end cần có `true_label`, `pred_label`, `face_detected`; có thể thêm `sample_id` và `latency_ms`. Khi detector không phát hiện được mặt, để trống `pred_label` để phép tính Macro-F1 bị phạt đúng theo lỗi không có kết quả.

```csv
sample_id,true_label,pred_label,face_detected,latency_ms
0001,happy,happy,true,145.2
0002,sad,,false,80.4
```

Chạy đánh giá từng tổ hợp:

```bash
python3 fer-benchmark/benchmark.py evaluate-e2e \
  --predictions path/to/retinaface_efficientface_predictions.csv \
  --detector retinaface \
  --fer-model efficientface \
  --dataset camera-e2e-test
```

Sau khi có JSON kết quả của các tổ hợp, xuất bảng lựa chọn cuối cùng:

```bash
python3 fer-benchmark/benchmark.py compare-e2e \
  --summaries \
    fer-benchmark/outputs/retinaface_efficientface_camera-e2e-test_e2e.json \
    fer-benchmark/outputs/retinaface_posterplusplus_camera-e2e-test_e2e.json \
    fer-benchmark/outputs/mediapipe_efficientface_camera-e2e-test_e2e.json \
    fer-benchmark/outputs/mediapipe_posterplusplus_camera-e2e-test_e2e.json \
  --min-detection-rate 0.90 \
  --min-macro-f1 0.50 \
  --max-p95-ms 800
```

Kết quả xuất ra `end_to_end_comparison.csv`, `end_to_end_comparison.md`, `end_to_end_comparison.tex`, `end_to_end_comparison.png`, `final_selection.json` và `final_selection.md`. Đây mới là nhóm artifact dùng để kết luận tổ hợp phù hợp nhất cho bài toán.

Mỗi lần đánh giá end-to-end cũng sinh file `*_confusion_matrix.png`; các frame không phát hiện được khuôn mặt được tính vào `no_result_rate` và làm giảm chỉ số phân loại thay vì bị bỏ qua.

## Chạy test

```bash
python3 -m unittest discover -s fer-benchmark -p 'test_*.py' -v
```
