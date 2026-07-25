# CRM face demo

Luồng demo không dùng video giả. Hai ảnh portrait được đưa qua đúng pipeline:

`Java CRM -> Python DeepFace/FaceNet512 -> pgvector -> Customer 360`.

Metadata từ `CAM-01` đến `CAM-06`, zone, track và thời gian là dữ liệu tổng hợp,
được đánh dấu `SYNTHETIC_METADATA`/`SYNTHETIC_DEMO` trong database.

## Chạy

1. Khởi động stack với `DEMO_DATA_ENABLED=true`.
2. Đăng nhập `manager` bằng mật khẩu trong `DEMO_MANAGER_PASSWORD`.
3. Chạy:

```bash
../.venv/bin/python CRM-system-be/scripts/bootstrap_demo_faces.py
```

4. Mở `Face Search & 360`, import lại một trong hai ảnh để xem nhận diện,
lịch sử mua, sale tư vấn và cảm xúc trước/sau mua.

## Nguồn ảnh demo

- Keanu Reeves: Wikimedia Commons, file `Keanu_Reeves-2019.jpg`, CC BY 2.0.
- Emma Watson: Wikimedia Commons, file `Emma_Watson_2013.jpg`, CC BY-SA 3.0.

Chỉ dùng cho demo giáo dục; khi triển khai thật phải dùng ảnh có consent của khách.
