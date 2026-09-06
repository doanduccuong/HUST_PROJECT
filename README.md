# Retail Emotion CRM

Hệ thống CRM bán lẻ gồm Next.js, Spring Boot, FastAPI và PostgreSQL/pgvector. Hệ thống thu nhận ảnh hoặc khung hình, phát hiện/căn chỉnh khuôn mặt, phân loại biểu cảm, tổng hợp theo phiên và hiển thị dữ liệu trải nghiệm trên dashboard.

## Chạy toàn bộ hệ thống

```bash
docker compose up --build -d
```

Các dịch vụ:

- Frontend: `http://localhost:3000`
- Spring Boot API: `http://localhost:8081`
- FastAPI face service: `http://localhost:8000`
- PostgreSQL: `localhost:5433`

Dừng hệ thống:

```bash
docker compose down
```

## Tài liệu chính

- [Cấu trúc source và dữ liệu](CODEBASE_CURRENT_STRUCTURE.md)
- [Khoảng cách giữa code và báo cáo](CODEBASE_VS_REPORT_GAP_ANALYSIS.md)
- [Kế hoạch so sánh detector và mô hình FER](FER_MODEL_COMPARISON_PLAN.md)
- [Bộ benchmark và bảng so sánh FER](fer-benchmark/README.md)

## Dữ liệu chính

- `products.xlsx`: nguồn cấu hình product/offer.
- `postgres_backup.sql`: dữ liệu khởi tạo PostgreSQL.
- `Do_an/training/C2FPW_aligned`: dữ liệu thực nghiệm identity/PTTM, không dùng cho FER.
- `CRM-system-be/facenet512_projector_weights.npz`: trọng số projector dùng lúc chạy.
- `fer-benchmark/datasets/ckplus/ckextended.csv`: tập kiểm thử FER bổ sung gồm dữ liệu ảnh 48x48 mã hóa trong CSV.

RAF-DB, AffectNet-7, FER2013 đầy đủ và dữ liệu camera nội bộ chưa có trong workspace. Khi thêm phải tuân thủ quyền phân phối và cung cấp manifest/checksum; không commit ảnh hoặc video gốc nếu giấy phép không cho phép.
