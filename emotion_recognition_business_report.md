# BÁO CÁO NGHIỆP VỤ: PHÂN TÍCH HÀNH TRÌNH VÀ TRẠNG THÁI TRẢI NGHIỆM KHÁCH HÀNG
## Mô hình nhiều camera tích hợp Customer 360 và CRM bán lẻ

---

## 1. Phạm vi và mục tiêu

Hệ thống sử dụng **4 camera tối thiểu và 6 camera khuyến nghị** để ghi nhận hành trình khách hàng qua các khu vực chính. Một hành trình bắt đầu tại Entrance và kết thúc tại Checkout hoặc Exit.

Phân bố camera:

| Số camera | Khu vực | Mục đích |
|---|---|---|
| `CAM-01` | Entrance | Thời điểm vào, nhận diện ứng viên, bắt đầu hành trình |
| `CAM-02` | Consultation | Tương tác với sale, `ENGAGED`, `CONFUSED` |
| `CAM-03` | Service/Technical | Chờ xử lý, sự cố, `IMPATIENT`, `DISSATISFIED` |
| `CAM-04` | Checkout | Liên kết giao dịch, trạng thái trước/sau mua |
| `CAM-05` | Waiting — khuyến nghị | Đo thời gian chờ và điểm nghẽn |
| `CAM-06` | Exit — khuyến nghị | Trạng thái cuối và thời điểm rời cửa hàng |

Trong phạm vi này, hệ thống hỗ trợ:

- Nhận dạng khách hàng thành viên khi có cơ sở xử lý dữ liệu phù hợp.
- Theo dõi khách trong từng camera bằng `local_track_id`.
- Liên kết các track giữa camera thành một `journey_id`.
- Phân tích tín hiệu biểu hiện khuôn mặt theo chuỗi thời gian.
- Kết hợp biểu hiện, thời gian tương tác, thời gian chờ và sự kiện CRM/POS để suy luận trạng thái trải nghiệm.
- Tổng hợp Customer 360 gồm nhân viên tư vấn, đơn hàng và trạng thái tại từng zone.
- Tính KPI theo zone và toàn hành trình, hỗ trợ quản lý xác định điểm nghẽn.

### 1.1. Nội dung ngoài phạm vi

Hệ thống **không thực hiện và không tuyên bố**:

- Theo dõi ngoài các zone/camera đã cấu hình và thông báo.
- Ép liên kết hai track khi cross-camera confidence không đạt ngưỡng.
- Khẳng định biểu hiện khuôn mặt phản ánh chính xác cảm xúc nội tâm.
- Tự động quy trách nhiệm hoặc thưởng/phạt nhân viên.
- Đại diện kết quả của một chi nhánh pilot cho toàn bộ chuỗi.
- Lưu toàn bộ video vô thời hạn.

---

## 2. Đơn vị phân tích nghiệp vụ

Đơn vị cơ bản là một `Customer Journey Session` — một lần khách đi qua các zone được giám sát.

```text
Entrance
→ Consultation
→ Service/Technical hoặc Waiting (tùy chọn)
→ Checkout hoặc Exit without purchase
→ Exit
```

State machine của phiên:

```text
NEW
→ ENTERED
→ CONSULTING
→ SERVICE/WAITING (nếu có)
→ CHECKOUT hoặc NO_PURCHASE
→ EXITED
```

Một session hợp lệ cần có:

- `session_code`;
- `journey_id`;
- danh sách `camera_id`, `zone_code` và `local_track_id`;
- confidence của từng liên kết cross-camera;
- thời điểm bắt đầu và kết thúc;
- tổng thời gian hành trình và dwell time theo zone;
- các trạng thái trải nghiệm theo thời gian và zone;
- kết quả giao dịch nếu CRM/POS cung cấp;
- chất lượng ảnh và độ tin cậy của mô hình.

---

## 3. Sáu trạng thái trải nghiệm trong hành trình

Các nhãn dưới đây là **trạng thái trải nghiệm nghiệp vụ được suy luận từ nhiều tín hiệu**, không phải kết luận tuyệt đối về cảm xúc nội tâm của khách hàng.

### 3.1. `DELIGHTED` — Rất hài lòng

Khách thể hiện phản ứng tích cực rõ ràng sau tương tác hoặc khi hoàn tất dịch vụ.

Tín hiệu:

- xác suất biểu hiện tích cực cao và duy trì trong một khoảng thời gian;
- giao dịch/dịch vụ hoàn tất thành công;
- trạng thái cuối tích cực hơn trạng thái ban đầu;
- không có sự kiện tiêu cực chưa được xử lý ở cuối phiên.

Hành động nghiệp vụ:

- ghi nhận phiên phục vụ tốt;
- xem xét nhân rộng kịch bản tư vấn;
- đề xuất upsell chỉ khi ngữ cảnh giao dịch còn phù hợp.

### 3.2. `ENGAGED` — Đang quan tâm

Khách chủ động tham gia tương tác, theo dõi tư vấn hoặc thao tác với sản phẩm/dịch vụ tại quầy.

Tín hiệu:

- khách xuất hiện trong zone tư vấn/tương tác;
- thời gian tương tác vượt ngưỡng tối thiểu;
- có sự kiện CRM/POS như mở thông tin sản phẩm hoặc báo giá;
- chưa có biểu hiện tiêu cực kéo dài.

`ENGAGED` không đồng nghĩa với hài lòng hoặc chắc chắn mua hàng.

### 3.3. `CONFUSED` — Khó hiểu/phân vân

Khách có dấu hiệu chưa hiểu thông tin hoặc gặp khó khăn khi đưa ra quyết định.

Tín hiệu:

- biểu hiện không chắc chắn xuất hiện thành chuỗi;
- thời gian tương tác dài bất thường;
- trùng thời điểm mở nội dung trả góp, trade-in, bảo hành mở rộng hoặc chính sách phức tạp;
- phiên không tiến triển sang bước tiếp theo trong thời gian dự kiến.

Hành động nghiệp vụ:

- đơn giản hóa nội dung tư vấn;
- chuyển sang bảng so sánh trực quan;
- xác nhận lại nhu cầu và phần khách chưa hiểu.

### 3.4. `IMPATIENT` — Sốt ruột/mất kiên nhẫn

Khách phản ứng tiêu cực vì phải chờ hoặc quy trình tại quầy không tiến triển.

Tín hiệu:

- session chuyển sang `WAITING`;
- thời gian chờ vượt SLA của quầy;
- biểu hiện tiêu cực tăng hoặc duy trì;
- có hành vi di chuyển lặp lại trong vùng chờ nếu tracking hỗ trợ.

Hành động nghiệp vụ:

- thông báo thời gian xử lý còn lại;
- ưu tiên hoàn tất tác vụ đang gây chờ;
- đánh giá lại SLA và quy trình tại zone gây chờ.

### 3.5. `DISSATISFIED` — Không hài lòng

Khách có trải nghiệm tiêu cực rõ ràng và có khả năng rời bỏ, hủy giao dịch hoặc khiếu nại.

Tín hiệu:

- biểu hiện tiêu cực kéo dài;
- CRM/POS ghi nhận hủy đơn, yêu cầu hoàn tiền, khiếu nại hoặc hết hàng;
- khách rời quầy trong khi quy trình chưa hoàn tất;
- trạng thái tiêu cực không phục hồi trước khi kết thúc session.

Hành động nghiệp vụ:

- tạo incident để quản lý kiểm tra;
- xem xét nguyên nhân từ quy trình, thông tin tư vấn hoặc hàng hóa;
- không tự động quy trách nhiệm cho nhân viên chỉ dựa trên camera.

### 3.6. `NEUTRAL` — Trung tính/chưa đủ bằng chứng

Khách chưa thể hiện trạng thái tích cực hoặc tiêu cực rõ ràng, hoặc dữ liệu chưa đủ tin cậy.

Tín hiệu:

- khách mới xuất hiện;
- biểu hiện khuôn mặt trung tính;
- confidence thấp;
- khuôn mặt bị che, góc nhìn không phù hợp hoặc chất lượng ảnh không đạt.

`NEUTRAL` là trạng thái fallback an toàn. Khi chất lượng dữ liệu không đạt, hệ thống nên lưu thêm cờ `LOW_QUALITY` hoặc `UNKNOWN` thay vì cố gán trạng thái khác.

---

## 4. Cách xử lý một hành trình nhiều camera

Ví dụ:

```text
18:00:00  CAM-01 Entrance: khách vào           → NEUTRAL
18:00:20  CAM-02 Consultation: gặp Sales       → ENGAGED
18:02:10  CAM-02: mở nội dung trả góp          → CONFUSED candidate
18:04:00  CAM-05 Waiting: chờ xử lý hồ sơ      → NEUTRAL
18:06:30  CAM-05: chờ vượt SLA                 → IMPATIENT
18:07:30  CAM-04 Checkout: thanh toán thành công → DELIGHTED
18:08:00  CAM-06 Exit: khách rời cửa hàng      → COMPLETED
```

Mỗi camera tạo `local_track_id`; cross-camera association nối chúng thành một `journey_id`. Hệ thống lưu toàn bộ chuỗi theo zone, không chỉ giữ một nhãn cuối cùng. Nhãn tổng kết được xác định từ trạng thái cuối, kết quả giao dịch và khả năng phục hồi sau sự cố.

---

## 5. KPI theo zone và toàn hành trình

Không tính KPI theo số frame. Đơn vị mẫu là session hợp lệ để tránh khách đứng lâu bị đếm nhiều lần.

### 5.1. Confusion Benchmark Index

```text
CBI_zone =
Số journey có CONFUSED tại zone tư vấn
/
Tổng journey đi qua zone tư vấn
```

Mục tiêu ban đầu để pilot: `CBI <= 8%`. Ngưỡng phải được hiệu chỉnh sau khi có dữ liệu thật.

### 5.2. Impatience Benchmark Index

```text
IBI_zone =
Số journey có IMPATIENT tại zone chờ
/
Tổng journey đi qua zone chờ
```

Mục tiêu ban đầu: `IBI <= 5%`.

### 5.3. Engagement-to-Delight Conversion

```text
EDC_journey =
Số journey đã ENGAGED và kết thúc DELIGHTED
/
Tổng journey đã ENGAGED
```

Mục tiêu ban đầu: `EDC >= 65%`.

EDC là chỉ số chuyển đổi trạng thái trải nghiệm, không được gọi trực tiếp là CSAT nếu chưa đối chiếu với khảo sát khách hàng.

### 5.4. Dissatisfaction Rate Index

```text
DRI_journey =
Số journey kết thúc DISSATISFIED
/
Tổng journey hợp lệ
```

Mục tiêu ban đầu: `DRI <= 6%`.

Mỗi KPI phải hiển thị:

- số lượng session làm mẫu;
- khoảng thời gian;
- zone/camera áp dụng;
- tỷ lệ cross-camera association thành công;
- phiên bản công thức;
- tỷ lệ session bị loại do chất lượng ảnh;
- cảnh báo khi số mẫu chưa đủ.

---

## 6. Các quyết định quản trị có thể hỗ trợ

### 6.1. Cải tiến kịch bản tư vấn

Nếu `CBI_zone` tăng tại zone Consultation và phần lớn incident trùng với màn hình trả góp/BHMĐ:

- rà soát nội dung giải thích;
- sử dụng bảng so sánh trực quan;
- A/B test hai kịch bản tại cùng quầy theo các khung thời gian kiểm soát.

### 6.2. Cải tiến thời gian xử lý giữa các zone

Nếu `IBI_zone` tăng tại Waiting hoặc Service/Technical:

- đo lại thời gian từng bước trong quy trình;
- loại bỏ thao tác nhập liệu lặp;
- thông báo SLA cho khách;
- xác định zone gây tắc nghẽn;
- đối chiếu lưu lượng và năng lực giữa Consultation, Service, Waiting và Checkout;
- đề xuất điều phối nhân sự nhưng yêu cầu quản lý xác nhận.

### 6.3. Xử lý sự cố hàng hóa hoặc giao dịch

Nếu `DISSATISFIED` trùng với `OUT_OF_STOCK`, `ORDER_CANCELLED` hoặc `REFUND_REQUESTED`:

- tạo incident;
- gợi ý phương án thay thế sản phẩm;
- cải thiện đồng bộ tồn kho và thông tin tư vấn.

### 6.4. Ghi nhận phiên phục vụ tốt

Nếu EDC cao và DRI thấp trong số mẫu đủ lớn:

- ghi nhận quy trình tại quầy hoạt động tốt;
- xác định các bước có thể chuẩn hóa;
- không dùng một session đơn lẻ để đánh giá thưởng/phạt nhân viên.

---

## 7. Giới hạn diễn giải

- Camera đo tín hiệu quan sát được, không đọc trực tiếp suy nghĩ khách hàng.
- Một trạng thái chỉ có giá trị trong phạm vi journey và zone được giám sát.
- Cross-camera association là kết quả xác suất; track không chắc chắn phải được đánh dấu thay vì ép nối.
- Root-cause do hệ thống đưa ra là nguyên nhân có khả năng liên quan, không phải bằng chứng nhân quả tuyệt đối.
- KPI cảm xúc không thay thế hoàn toàn khảo sát, phản hồi trực tiếp hoặc dữ liệu giao dịch.
- Kết quả không được tự động sử dụng để kỷ luật nhân viên.

---

## 8. Bảo mật và quyền riêng tư

- Ưu tiên xử lý frame trong bộ nhớ và chỉ lưu event số học/text.
- Không lưu ảnh debug trong môi trường pilot/production.
- Nếu bắt buộc lưu snapshot để kiểm thử, phải có mục đích, thời hạn xóa, kiểm soát truy cập và audit log rõ ràng.
- `local_track_id` là ID tạm thời trong từng camera; `journey_id` chỉ tồn tại trong phạm vi một lần ghé.
- Dữ liệu định danh khuôn mặt phải tách khỏi dữ liệu analytics.
- Chỉ liên kết với hồ sơ thành viên khi có cơ sở xử lý dữ liệu phù hợp.
- Phải có quy trình xóa dữ liệu, xử lý yêu cầu của chủ thể dữ liệu, đánh giá tác động và ứng phó sự cố.

---

## 9. Kết luận

Với 4 camera tối thiểu và 6 camera khuyến nghị, bài toán khả thi và có thể kiểm chứng là:

> Nhận diện khách hàng, liên kết hành trình qua nhiều camera, phân tích trạng thái trải nghiệm tại từng zone và hợp nhất kết quả với nhân viên tư vấn, đơn hàng và Customer 360.

Mô hình nhiều camera cho phép xác định điểm chuyển trạng thái, zone gây chờ, trạng thái trước/sau mua và kết quả cuối hành trình. Mỗi kết luận vẫn phải kèm confidence, chất lượng dữ liệu và khả năng kiểm tra lại.
