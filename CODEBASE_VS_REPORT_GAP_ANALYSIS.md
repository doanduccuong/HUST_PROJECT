# Phân tích khoảng cách giữa codebase thực tế và báo cáo đồ án

## 1. Mục đích và phạm vi

Tài liệu này đối chiếu kiến trúc, thuật toán, chức năng và kết quả thực nghiệm được mô tả trong báo cáo đồ án với trạng thái hiện tại của mã nguồn.

Nguồn đối chiếu chính:

- Báo cáo: `Do_an/Báo cáo/main.pdf`.
- Dịch vụ AI: `CRM-system-be`.
- Backend nghiệp vụ: `CRM-system-be-java`.
- Frontend: `CRM-system-fe`.
- Huấn luyện và thử nghiệm: `Do_an/training`.
- Hạ tầng chạy local: `docker-compose.yml`.

> [!NOTE]
> Tài liệu này ban đầu ghi lại baseline trước khi đồng bộ. Tính đến 26/08/2026, pipeline P0 `webcam/MP4 → frame → FastAPI → EMA/state → session/event` đã được triển khai và smoke-test end-to-end. Các phần mô tả “hiện trạng chưa có” bên dưới cần được hiểu là phát hiện tại thời điểm audit ban đầu; bảng cập nhật ngay sau phần kết luận tổng quan là trạng thái code mới nhất.

### Quy ước đánh giá

| Trạng thái | Ý nghĩa |
|---|---|
| **Đã có** | Có implementation thực tế và được nối vào luồng vận hành |
| **Có một phần** | Có schema, UI hoặc logic rời rạc nhưng chưa hoàn chỉnh/end-to-end |
| **Demo/Mock** | Kết quả chủ yếu đến từ seed, fallback hoặc dữ liệu cố định |
| **Chưa có** | Không tìm thấy implementation tương ứng |
| **Không đủ bằng chứng** | Báo cáo nêu kết quả nhưng repository chưa có artifact tái lập |

---

## 2. Kết luận tổng quan

| Khối chức năng | Hiện trạng | Đánh giá |
|---|---|---|
| CRM, khách hàng, sản phẩm, đơn hàng | Có backend và frontend | **Đã có** |
| Nhận diện danh tính bằng khuôn mặt | Có Facenet512, projector, regional embeddings và pgvector | **Đã có ở mức ảnh đơn** |
| Nhận diện 7 cảm xúc FER | DeepFace phân tích một ảnh | **Đã có ở mức ảnh đơn** |
| Quality gate | Có blur, brightness, detection confidence | **Có một phần, còn lỗi logic** |
| Camera/video realtime | Không có nguồn camera hoặc video ingestion | **Chưa có** |
| Tracking theo camera | Có trường `local_track_id`, chưa có tracker sinh dữ liệu thật | **Có schema, chưa có logic** |
| EMA và xử lý chuỗi thời gian | Không có temporal aggregation | **Chưa có** |
| Suy luận 6 trạng thái trải nghiệm | Chỉ suy luận được 4 trạng thái từ một ảnh | **Có một phần** |
| Session lifecycle | Có bảng và API đọc; chưa có API tạo/frame/đóng phiên | **Có một phần** |
| Journey nhiều điểm chạm | Đang nhóm dữ liệu theo khách hàng và ngày | **Demo/Chưa có liên kết thực** |
| Dashboard và BI | Trộn aggregate SQL, seed và fallback | **Demo/Có một phần** |
| Thực nghiệm trong báo cáo | Thiếu script, split độc lập và artifact tái lập | **Không đủ bằng chứng** |

Khoảng cách nghiêm trọng nhất của baseline nằm ở đường đi dữ liệu. Khoảng cách P0 này đã được xử lý trong đợt triển khai ngày 26/08/2026; các khoảng trống về benchmark, purchase summary, BI nâng cao và privacy vẫn còn.

### 2.1. Cập nhật sau triển khai

| Khối chức năng | Trạng thái mới | Ghi chú |
|---|---|---|
| Quality gate | **Đã sửa** | Reject nhất quán khi blur/dark/bright/low confidence/low aggregate score |
| Face analysis contract | **Đã bổ sung** | Có face region và `inferenceMs` |
| Webcam/MP4 | **Đã có** | Browser capture 1 FPS, one request in flight |
| Session lifecycle | **Đã có** | `start`, `frame`, `close`, sequence/counter/idempotent close |
| EMA và 6 experience states | **Đã có** | EMA, minimum frames, dwell và hysteresis theo session |
| Persistence thật | **Đã có** | Session/event mang nguồn `REAL_MODEL`; Flyway V6/V7 |
| Timeline realtime | **Đã có** | Chỉ ghi transition ổn định khi `stateChanged=true` |
| Dashboard/log data mode | **Đã có** | `REAL_ONLY` mặc định; tách demo; bỏ fallback ở real mode |
| Training split | **Đã sửa code** | Subject-disjoint train/validation/test; chưa có benchmark artifact mới |
| Purchase summary thật | **Chưa có** | Chỉ mới thêm/tách `data_origin` |
| Transition matrix/zone aggregate đầy đủ | **Chưa đủ** | Cần làm tiếp nếu giữ phạm vi báo cáo |
| Thực nghiệm và Pearson | **Chưa đủ bằng chứng** | Phải chạy lại và lưu raw artifact |

Evidence hiện có: 48 automated tests xanh và Docker smoke test 3 frame thật qua toàn bộ pipeline.

---

## 3. Thu nhận video và camera

### 3.1. Yêu cầu trong báo cáo

- Nhận luồng video hoặc các frame liên tục từ camera tại cửa hàng.
- Gắn camera với từng khu vực/điểm chạm.
- Xử lý liên tục thay vì upload một ảnh độc lập.
- Hình thành phiên trải nghiệm theo thời gian.

### 3.2. Hiện trạng code

- FastAPI chỉ nhận file ảnh JPEG, PNG hoặc WebP.
- Endpoint AI hiện tại là `POST /internal/v1/faces/analyze`.
- Frontend hiện có luồng upload ảnh, chưa có `getUserMedia`, video player làm nguồn frame hoặc RTSP adapter.
- Chưa có scheduler/frame sampler để gửi 1–2 frame mỗi giây.
- Chưa có WebSocket, SSE hoặc cơ chế polling phục vụ kết quả realtime.

### 3.3. Đánh giá

**Chưa có.** Hệ thống chỉ xử lý ảnh đơn. Trường `camera_id` và `zone` trong database không chứng minh được camera ingestion đã được triển khai.

### 3.4. Hướng hoàn thiện tối thiểu

Để demo đúng phạm vi đồ án, chưa cần RTSP hoặc nhiều camera. Có thể hỗ trợ hai nguồn ở frontend:

1. Webcam bằng `navigator.mediaDevices.getUserMedia`.
2. File MP4 có sẵn phát trong thẻ `<video>`.

Frontend lấy mẫu 1–2 FPS, chuyển mỗi frame thành JPEG và gửi qua session API. Cả webcam và MP4 phải đi qua cùng pipeline AI thật.

### 3.5. Tiêu chí hoàn thành

- Tạo được session từ webcam hoặc MP4.
- Gửi liên tục ít nhất 60 frame trong một phiên mà không lỗi.
- Mỗi response có timestamp, quality, raw emotion, smoothed state và latency.
- Session được đóng đúng cách và xuất hiện trong journey/dashboard.

---

## 4. Contract giữa báo cáo, Spring Boot và FastAPI

| Hạng mục | Báo cáo | Code hiện tại | Đánh giá |
|---|---|---|---|
| Endpoint AI | `/internal/v1/emotions/analyze` | `/internal/v1/faces/analyze` | **Không khớp** |
| Kích thước ảnh chuẩn | `224×224` | Runtime resize `160×160` | **Không khớp** |
| Input | Frame từ luồng video | Multipart image file | **Có một phần** |
| Emotion output | Xác suất 7 nhãn FER | Có 7 xác suất từ DeepFace | **Đã có** |
| Quality output | Score và trạng thái chấp nhận | Có | **Có một phần** |
| Inference latency | Có `inferenceMs` | Response chưa có | **Chưa có** |
| Model version | Version phục vụ truy vết | Có nhưng đang gộp identity/projector | **Có một phần** |
| Face bounding box | Cần cho overlay/tracking | Response chính chưa cung cấp đầy đủ | **Chưa đủ** |

Contract cần được định nghĩa bằng một schema duy nhất và dùng chung trong báo cáo, Java client, FastAPI response và frontend.

### Tiêu chí hoàn thành

- OpenAPI mô tả đầy đủ request/response.
- Java DTO khớp hoàn toàn với FastAPI schema.
- Có `traceId`, `modelVersion`, `inferenceMs`, face box, quality và probabilities.
- Thống nhất một kích thước preprocessing và cập nhật lại báo cáo.

---

## 5. Quality gate

### 5.1. Phần đã có

FastAPI đã tính:

- Laplacian variance cho độ nét.
- Brightness score.
- Detection confidence.
- Quality score tổng hợp.
- Danh sách lý do như `IMAGE_BLURRY`, `IMAGE_TOO_DARK`, `IMAGE_TOO_BRIGHT` và `LOW_FACE_CONFIDENCE`.

### 5.2. Lỗi logic hiện tại

Điều kiện chấp nhận:

```text
score >= 0.45 AND confidence >= 0.70
```

Trong khi lý do confidence thấp dùng ngưỡng:

```text
confidence < 0.80 → LOW_FACE_CONFIDENCE
```

Vì vậy, một ảnh có confidence từ `0.70` đến dưới `0.80` có thể đồng thời:

- `accepted = true`.
- Có reason `LOW_FACE_CONFIDENCE`.

Ngoài ra, `accepted` không yêu cầu danh sách reason phải rỗng. Một ảnh rất mờ vẫn có thể được chấp nhận nếu brightness và detection confidence đủ cao.

### 5.3. Khoảng cách với báo cáo

- Chưa có threshold được hiệu chỉnh bằng tập validation.
- Chưa lưu quality của từng frame vào `experience_state_events`.
- Chưa có thống kê tỷ lệ frame bị loại theo camera/zone.
- Chưa chứng minh ảnh bị reject không đi tiếp vào EMA và BI.

### 5.4. Tiêu chí hoàn thành

- Dùng cùng một bộ threshold cho `accepted` và `reasons`.
- `accepted = false` nếu vi phạm bất kỳ điều kiện bắt buộc nào.
- Frame bị reject không cập nhật EMA.
- Lưu `quality_score`, `accepted` và reject reasons để audit.
- Có test cho ảnh mờ, quá tối, quá sáng, không có mặt và nhiều khuôn mặt.

---

## 6. FER và suy luận trạng thái trải nghiệm

### 6.1. FER đã có

DeepFace trả bảy nhãn:

```text
angry, disgust, fear, happy, sad, surprise, neutral
```

Đây là cảm xúc thô trên một ảnh, chưa phải trạng thái trải nghiệm đã tổng hợp theo thời gian.

### 6.2. Classifier hiện tại

Spring Boot dùng heuristic:

| Điều kiện | Trạng thái |
|---|---|
| `max(angry, disgust, sad) >= 0.45` | `DISSATISFIED` |
| `happy >= 0.55` | `DELIGHTED` |
| `max(fear, surprise) >= 0.40` | `CONFUSED` |
| Còn lại | `NEUTRAL` |

Code hiện chỉ có thể sinh bốn trạng thái. Chính classifier ghi rõ `ENGAGED` và `IMPATIENT` cần chuỗi thời gian/hành vi.

### 6.3. Phần còn thiếu

- EMA với hệ số `alpha` được cấu hình.
- Quy tắc tối thiểu số frame hợp lệ.
- Dwell time.
- Hysteresis để tránh flickering.
- Ma trận hoặc quy tắc chuyển trạng thái.
- Logic `ENGAGED` và `IMPATIENT`.
- Xử lý gap khi nhiều frame liên tiếp bị reject.
- Reset trạng thái khi session kết thúc.

### 6.4. Đánh giá

**Có một phần.** FER ảnh đơn đã có, nhưng suy luận trải nghiệm theo chuỗi thời gian chưa được triển khai.

### 6.5. Tiêu chí hoàn thành

- Kết quả state không thay đổi chỉ vì một frame nhiễu.
- `ENGAGED` và `IMPATIENT` được sinh từ rule có dwell time rõ ràng.
- Có unit test cho chuỗi xác suất và các transition chính.
- Cấu hình EMA/threshold nằm ngoài source code hoặc có version rõ ràng.

---

## 7. Session lifecycle và persistence

### 7.1. Phần đã có

Database có:

- `experience_sessions`.
- `experience_state_events`.
- `purchase_experience_summary`.

Backend có các API đọc journeys, sessions, events và purchase summaries.

### 7.2. Phần chưa có

Chưa có luồng API ghi hoàn chỉnh tương đương:

```http
POST /api/v1/experience/sessions
POST /api/v1/experience/sessions/{sessionId}/frames
POST /api/v1/experience/sessions/{sessionId}/close
```

Luồng tìm kiếm khuôn mặt hiện ghi `face_search_audit`; nó không tự tạo experience session/event.

### 7.3. Schema event còn thiếu

`experience_state_events` chưa có đầy đủ:

- `quality_score`.
- `accepted`.
- Reject reasons.
- `inference_ms`.
- `previous_state` và transition reason.
- Frame/source timestamp riêng nếu khác thời gian ghi DB.

### 7.4. Tiêu chí hoàn thành

- Start session tạo record hợp lệ và trả session ID.
- Frame API kiểm tra session đang mở.
- Chỉ frame accepted mới cập nhật temporal state.
- Không nhất thiết lưu mọi frame; lưu transition và heartbeat định kỳ.
- Close session idempotent và tạo summary.
- Có transaction/integration test cho toàn bộ vòng đời.

---

## 8. Tracking, touchpoint và journey

### 8.1. Hiện trạng

- Schema có `camera_id`, `zone` và `local_track_id`.
- Không có detector/tracker tạo `local_track_id` từ video thật.
- Không có logic ghép track qua nhiều camera.
- Journey hiện nhóm session theo `customer_id` và ngày.
- Truy vấn journey dùng `WHERE es.customer_id IS NOT NULL`, nên hành trình khách ẩn danh bị loại.
- Seed V3 tạo sẵn sáu camera/zone và local track ID giả lập.

### 8.2. Mâu thuẫn cần làm rõ

Nếu phạm vi đồ án chỉ hỗ trợ khách hàng đã nhận diện, báo cáo phải nói rõ. Nếu báo cáo tuyên bố theo dõi cả khách ẩn danh hoặc liên kết đa camera, code hiện chưa đáp ứng.

### 8.3. Đánh giá

**Có schema và dữ liệu demo, chưa có tracking thực tế.** Không nên mô tả `local_track_id` trong database như bằng chứng tracker đã hoạt động.

### 8.4. Tiêu chí hoàn thành tối thiểu cho demo

- Một người, một camera, một session tại một thời điểm.
- `local_track_id` được tạo khi bắt đầu session thay vì lấy từ seed SQL.
- Zone/camera đi từ request thật vào session/event.
- Journey hiển thị phiên vừa chạy sau khi đóng session.

Cross-camera tracking có thể đưa ra ngoài phạm vi nếu báo cáo được điều chỉnh tương ứng.

---

## 9. Dashboard, timeline, heatmap và analytics

### 9.1. Emotion timeline

Frontend chưa có biểu đồ emotion timeline theo thời gian thực đúng nghĩa. Experience Logs có thể đọc event từ API, nhưng một số nội dung journey và alert vẫn là mock cố định.

Đánh giá: **Chưa có timeline hoàn chỉnh.** Không nên mô tả toàn bộ Experience Logs là mock, nhưng cũng không nên coi danh sách event là một timeline realtime.

### 9.2. Heatmap và zone analytics

Hiện có:

- Metadata `camera_id` và `zone`.
- Một số truy vấn aggregate theo zone/ca làm việc.
- Dữ liệu zone trong seed.

Chưa có:

- Tọa độ không gian hoặc sơ đồ cửa hàng.
- Dữ liệu mật độ từ tracking.
- Heatmap component.
- Pipeline camera thật tạo số liệu zone.

Đánh giá: **Có metadata và aggregate rời rạc, chưa có heatmap.**

### 9.3. Transition matrix

Không tìm thấy logic ghi nhận và tổng hợp `T(i→j)`. Chưa có transition matrix backend hoặc frontend.

Đánh giá: **Chưa có.**

### 9.4. Dữ liệu fallback/hard-code

Backend có các fallback hoặc giá trị cố định, bao gồm:

| Chỉ số | Giá trị fallback/cố định |
|---|---:|
| CBI | `7.0` |
| IBI | `6.0` |
| DRI | `3.1` |
| EDC | `65.5` |
| Tech Desk IBI | `18.2` |
| Mobile Zone CBI | `14.5` |

Frontend còn có mảng alert cố định khớp với các con số demo trên.

### 9.5. Dữ liệu demo và cách lọc đúng

Không được chỉ lọc:

```sql
data_origin != 'SYNTHETIC_DEMO'
```

Vì code dùng hai giá trị ở hai bảng khác nhau:

```text
experience_sessions.data_origin = 'SYNTHETIC_METADATA'
experience_state_events.source = 'SYNTHETIC_DEMO'
```

Dashboard và Experience Logs phải có chế độ rõ ràng:

- `REAL_ONLY`.
- `DEMO_ONLY`.
- Hoặc `ALL`, có nhãn nguồn dữ liệu trên UI.

Mặc định khi báo cáo số liệu vận hành phải là `REAL_ONLY`.

---

## 10. Chỉ số BI, Δexp và Pearson correlation

### 10.1. Phân biệt hai khái niệm

`Δexp` và Pearson correlation không phải cùng một phép tính.

```text
Δexp = post_purchase_score - pre_purchase_score
```

Pearson correlation dùng để đo mức tương quan giữa một biến trải nghiệm và một biến kinh doanh trên nhiều quan sát.

### 10.2. Hiện trạng

- Database có bảng `purchase_experience_summary` và các cột pre/post/delta.
- Repository có dữ liệu seed cho các trường này.
- Chưa có pipeline đáng tin cậy tự tính summary từ session/event thật.
- Chưa tìm thấy code tính Pearson correlation cho kết quả thực nghiệm trong báo cáo.
- `SalesPerformanceService` có aggregate SQL kinh doanh nhưng không thay thế cho một thí nghiệm correlation có kiểm soát.

### 10.3. Đánh giá

- `Δexp`: **Có schema và dữ liệu demo, chưa có pipeline thực hoàn chỉnh.**
- Pearson correlation: **Không đủ bằng chứng tái lập.**

### 10.4. Tiêu chí hoàn thành

- Định nghĩa cửa sổ pre/post purchase rõ ràng.
- Tính summary từ event thật, không lấy giá trị seed.
- Lưu số evidence và confidence.
- Script phân tích correlation phải xuất dữ liệu đầu vào, `n`, `r`, `p-value` và biểu đồ.
- Báo cáo phải khớp với output của script.

---

## 11. Huấn luyện nhận diện danh tính và projector

### 11.1. Phần đã có

- Facenet512 embedding.
- Chia khuôn mặt thành upper/mid/lower.
- Dense projector `512→512`.
- Triplet loss.
- Trọng số projector được nạp vào FastAPI.
- So khớp pgvector với trọng số `0.5/0.3/0.2`.

### 11.2. Vấn đề đánh giá hiện tại

`train_triplet.py` dùng `S001–S070` để huấn luyện. Tuy nhiên, `grid_search_weights.py`:

- Đọc `S001–S090`, bao gồm subject đã tham gia huấn luyện.
- Dùng cùng tập chỉ số cho cả phía train và test của `GridSearchCV`:

```python
cv_split = [(np.arange(len(X)), np.arange(len(X)))]
```

Điều này tạo data leakage và không phải đánh giá độc lập.

### 11.3. Khoảng cách với báo cáo

Repository chưa chứng minh đầy đủ các tuyên bố về:

- Tập test độc lập `S071–S090`.
- Số positive/negative pairs đúng như báo cáo.
- AUC/accuracy được đo trên dữ liệu không tham gia chọn threshold.
- Khả năng tổng quát với người chưa thấy trong training.

### 11.4. Tiêu chí hoàn thành

- Split theo subject, không theo ảnh hoặc pair.
- Không dùng test set để chọn threshold/trọng số.
- Có train/validation/test độc lập.
- Lưu manifest subject và random seed.
- Xuất ROC, AUC, accuracy, FAR/FRR và threshold.

---

## 12. Thực nghiệm FER, latency và robustness

### 12.1. Artifact còn thiếu

Không tìm thấy đầy đủ script hoặc artifact tái lập cho:

- Benchmark FER trên 3.500 ảnh.
- Accuracy/F1/confusion matrix của bảy cảm xúc.
- Latency FastAPI và latency end-to-end.
- Robustness với blur, ánh sáng, góc nhìn và che khuất.
- Đánh giá camera/video theo chuỗi thời gian.

### 12.2. Hệ quả

Các con số trong báo cáo hiện chưa thể được kiểm chứng chỉ từ repository. Notebook hoặc ảnh biểu đồ riêng lẻ không đủ nếu thiếu:

- Dataset manifest.
- Split.
- Phiên bản model.
- Script đánh giá.
- Raw predictions.
- Cách tính metric.

### 12.3. Tiêu chí hoàn thành

- Một lệnh có thể tái chạy từng benchmark.
- Kết quả được lưu thành JSON/CSV trước khi vẽ biểu đồ.
- Có thông tin môi trường chạy và thời gian đo.
- Số liệu trong báo cáo được sinh trực tiếp từ artifact.

---

## 13. Kiến trúc và phân chia trách nhiệm

### 13.1. Python và Java

Báo cáo mô tả FastAPI như dịch vụ AI/compute, còn Spring Boot quản lý nghiệp vụ và persistence. Tuy nhiên, `CRM-system-be/main.py` vẫn còn các route đăng ký/check-in cũ:

- Ghi ảnh tạm xuống filesystem.
- Truy cập database trực tiếp.
- Trùng một phần trách nhiệm với Spring Boot.

Đánh giá: **Ranh giới service chưa được tách sạch.**

### 13.2. Frontend

Frontend có các thư mục `data`, `domain`, `viewmodels` và `components`, nhưng Clean Architecture mới được áp dụng một phần:

- Một số component gọi `ApiClient` trực tiếp.
- Một số viewmodel phụ thuộc trực tiếp vào HTTP client.
- UI, gọi API và fallback data còn trộn trong component.

Đây không phải blocker cho demo, nhưng báo cáo không nên tuyên bố kiến trúc đã được áp dụng hoàn chỉnh.

---

## 14. Bảo mật và quyền riêng tư

### 14.1. Phần đã có

- Spring Security.
- JWT authentication.
- CORS/configuration cơ bản.

### 14.2. Khoảng cách còn lại

- Docker Compose có credential demo và JWT secret mặc định.
- Demo mode được bật mặc định trong môi trường local.
- Internal FastAPI endpoint chưa thể hiện cơ chế xác thực service-to-service rõ ràng.
- Chưa có consent flow cho dữ liệu khuôn mặt.
- Chưa có retention policy.
- Chưa có API/quy trình xóa hoặc anonymize dữ liệu sinh trắc học.
- Chưa có mã hóa riêng cho embeddings ở tầng ứng dụng.
- Chưa có audit đầy đủ cho việc xem/xóa dữ liệu khuôn mặt.

### 14.3. Đánh giá

**Có bảo mật ứng dụng cơ bản, chưa đủ bằng chứng cho các cam kết quyền riêng tư mạnh trong báo cáo.**

---

## 15. Kiểm thử và khả năng vận hành

### 15.1. Kết quả kiểm tra codebase

- Java build/test chạy được, nhưng số lượng test rất ít và chủ yếu tập trung vào face match policy.
- Next.js build chạy được.
- Frontend lint còn lỗi và cảnh báo.
- Python compile thành công.
- Chưa có integration test Java → FastAPI → PostgreSQL.
- Chưa có end-to-end test cho session, video, EMA, transition và dashboard.

### 15.2. Các test bắt buộc còn thiếu

- Contract test giữa Java và FastAPI.
- Quality gate unit test.
- Temporal aggregation unit test.
- Session lifecycle integration test.
- Test dữ liệu demo không lọt vào `REAL_ONLY`.
- Test upload video/webcam frame.
- Test retry, timeout và FastAPI unavailable.
- Test migration trên database sạch.
- E2E test cho journey vừa được tạo.

### 15.3. Đánh giá

**Build được nhưng chưa đủ test để chứng minh pipeline ổn định hoặc đáp ứng báo cáo.**

---

## 16. Các điểm chưa nhất quán ngay trong báo cáo

Ngoài khoảng cách với code, một số nội dung báo cáo cần được hiệu chỉnh:

- Bảng mô tả bốn kịch bản nhưng liệt kê năm.
- Một số bảng trộn nhãn FER thô với trạng thái trải nghiệm suy luận.
- Cột “Tổng mẫu” có chỗ thể hiện tỷ lệ phần trăm thay vì số mẫu.
- Số liệu Pearson cần được tính lại từ dữ liệu gốc và ghi rõ `n`, `r`, `p-value`.
- Chưa có đủ mô tả model version, dataset split, random seed và môi trường chạy.
- Một số tuyên bố về tracking đa camera và quyền riêng tư mạnh hơn implementation thực tế.

Nếu không triển khai kịp, cần thu hẹp tuyên bố trong báo cáo thay vì giữ mô tả như một chức năng đã hoàn thiện.

---

## 17. Kế hoạch ưu tiên để đồng bộ code và báo cáo

### P0 — Cần cho demo end-to-end

1. Chuẩn hóa contract Java–FastAPI.
2. Sửa quality gate.
3. Thêm `inferenceMs` và face box.
4. Xây session start/frame/close API.
5. Thêm nguồn MP4 và webcam, lấy mẫu 1–2 FPS.
6. Triển khai EMA, hysteresis và transition.
7. Ghi session/event thật vào database.
8. Hiển thị timeline của phiên vừa chạy.

### P1 — Cần để số liệu dashboard đáng tin cậy

1. Tách `REAL_ONLY` và `DEMO_ONLY`.
2. Loại bỏ fallback khỏi chế độ dữ liệu thật.
3. Tính purchase summary từ event thật.
4. Tính transition matrix và zone aggregate từ database.
5. Hiển thị nguồn dữ liệu trên UI.

### P2 — Cần để bảo vệ kết quả thực nghiệm

1. Sửa split training/validation/test theo subject.
2. Loại data leakage trong grid search.
3. Viết benchmark FER, identity, latency và robustness.
4. Lưu raw results và sinh bảng/biểu đồ tự động.
5. Tính lại Pearson từ dữ liệu gốc.

### P3 — Hoàn thiện kiến trúc và vận hành

1. Loại bỏ route Python legacy hoặc tách rõ phạm vi.
2. Bổ sung integration/E2E tests.
3. Chuẩn hóa secrets và service authentication.
4. Thêm consent, retention và deletion policy.
5. Làm sạch dependency giữa frontend layers.

---

## 18. Phạm vi demo khả thi

Phạm vi tối thiểu có thể bảo vệ được mà không cần xây hệ thống camera production:

- Một người trong frame.
- Một camera hoặc một video MP4.
- 1–2 frame mỗi giây.
- Một experience session tại một thời điểm.
- Quality gate.
- Bảy xác suất FER.
- EMA và bốn trạng thái hiện có; chỉ bổ sung `ENGAGED`/`IMPATIENT` khi có rule thời gian rõ ràng.
- Timeline transition.
- Ghi dữ liệu thật vào database.
- Dashboard cập nhật sau khi đóng phiên.

Chưa cần cho demo đầu tiên:

- Nhiều người trong cùng frame.
- RTSP production.
- Nhiều camera đồng thời.
- Cross-camera re-identification.
- Kafka hoặc hệ thống streaming phân tán.

Nếu không triển khai cross-camera tracking, báo cáo phải ghi rõ giới hạn này.

---

## 19. Kết luận cuối cùng — cập nhật sau triển khai

Codebase hiện đã có nền tảng CRM/identity/FER và đã bổ sung pipeline demo realtime tối thiểu:

Khoảng trống quyết định là chưa có pipeline vận hành:

```text
Camera/MP4
    → frame sampling
    → quality gate
    → FER probabilities
    → EMA
    → experience state transition
    → session/event persistence
    → journey/dashboard/BI
```

Pipeline này đã được kiểm tra bằng ảnh thật trong Docker và dữ liệu được đọc lại ở chế độ `REAL_ONLY`. Vì vậy, phần demo P0 không còn là gap.

Tuy nhiên, vẫn chưa thể kết luận **toàn bộ** báo cáo đã được triển khai. Trước khi bảo vệ cần:

1. Hoàn thiện purchase summary và các aggregate BI nào còn giữ trong phạm vi báo cáo.
2. Chạy lại benchmark bằng subject split mới và lưu artifact tái lập.
3. Tính lại Pearson từ dữ liệu gốc.
4. Ghi rõ RTSP, multi-face, cross-camera và spatial heatmap là ngoài phạm vi/limitation.
5. Không dùng seed/fallback làm bằng chứng cho chức năng realtime hoặc hiệu quả thực nghiệm.
