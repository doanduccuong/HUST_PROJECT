# CẤU TRÚC HIỆN TẠI VÀ DỮ LIỆU CỦA PROJECT

## 1. Phạm vi hệ thống

Project là hệ thống CRM bán lẻ kết hợp phân tích khuôn mặt và tín hiệu biểu cảm. Hệ thống hiện có bốn khối chính:

```text
Next.js frontend
    ↓ REST/JWT
Spring Boot CRM API
    ├── PostgreSQL/pgvector
    └── FastAPI face service
            ├── phát hiện/căn chỉnh khuôn mặt
            ├── nhận dạng biểu cảm
            └── trích xuất embedding nhận diện danh tính
```

Luồng nhận dạng biểu cảm bắt buộc là:

```text
Ảnh hoặc video
→ phát hiện khuôn mặt
→ căn chỉnh/cắt khuôn mặt
→ mô hình FER
→ xác suất bảy lớp biểu cảm
```

Nhận diện danh tính là nhánh độc lập, không phải điều kiện bắt buộc để chạy FER.

## 2. Cấu trúc thư mục được giữ

```text
DO_AN/
├── README.md
├── docker-compose.yml
├── postgres_backup.sql
├── products.xlsx
├── pyrightconfig.json
├── CRM-system-be/                 # Python/FastAPI và AI
├── CRM-system-be-java/            # Spring Boot CRM API
├── CRM-system-fe/                 # Next.js frontend
├── fer-benchmark/                 # So sánh và xuất kết quả mô hình FER
├── Do_an/
│   ├── Báo cáo/                   # LaTeX và main.pdf
│   └── training/                  # Thực nghiệm identity/C2FPW
├── demo/                          # Ghi chú demo tối thiểu
├── scripts/                       # Smoke test end-to-end
├── CODEBASE_CURRENT_STRUCTURE.md
├── CODEBASE_VS_REPORT_GAP_ANALYSIS.md
└── FER_MODEL_COMPARISON_PLAN.md
```

Các thư mục dependency, cache và build không được lưu như source chính. Chúng được tạo lại bằng package manager khi cần.

## 3. Bộ so sánh mô hình FER

Thư mục: `fer-benchmark/`

Bộ công cụ này giữ riêng hai loại dữ liệu để tránh ghi nhầm số liệu khảo sát thành kết quả của đồ án:

- `literature_results.json`: số liệu do tác giả EfficientFace, DAN, POSTER++ và ResEmoteNet công bố;
- `benchmark.py`: xuất bảng khảo sát ra CSV/Markdown/LaTeX/PNG và tính Accuracy, Macro Precision, Macro Recall, Macro F1, ma trận nhầm lẫn, p50/p95/p99 từ file dự đoán thực;
- `test_benchmark.py`: test công thức chỉ số, dữ liệu lỗi và toàn bộ định dạng export;
- `datasets/ckplus/ckextended.csv`: 920 ảnh xám 48x48 mã hóa trong CSV; benchmark bảy lớp dùng 182 mẫu thuộc PublicTest và PrivateTest sau khi loại `contempt`;
- `datasets/ckplus/manifest.json`: nguồn, giấy phép do nơi phân phối công bố, checksum và giao thức chọn mẫu;
- `outputs/`: bảng và biểu đồ sinh lại được để đưa vào báo cáo.

Phần khảo sát và quy tắc lựa chọn đã được đưa vào mục 2.2.4 của báo cáo. Dataset kiểm tra bổ sung CK+ Extended đã có trong workspace. Kết quả benchmark bốn mô hình chưa được tạo vì checkpoint chính thức chưa được cấu hình và RAF-DB/AffectNet vẫn cần quyền truy cập riêng.

## 4. Python/FastAPI

Thư mục: `CRM-system-be/`

Vai trò:

- nhận ảnh qua HTTP;
- phát hiện và căn chỉnh khuôn mặt;
- kiểm tra chất lượng ảnh;
- trả vector xác suất bảy lớp biểu cảm;
- tạo embedding FaceNet512 cho nhánh nhận diện danh tính;
- áp dụng projector cho embedding;
- cung cấp các route cũ phục vụ đăng ký, check-in và dashboard.

Cấu trúc chính:

```text
CRM-system-be/
├── main.py
├── config.py
├── database.py
├── requirements.txt
├── requirements-dev.txt
├── facenet512_projector_weights.npz
├── api/
│   ├── routes/face_analysis.py
│   └── schemas/face_analysis.py
├── routes/
├── services/
├── scripts/bootstrap_demo_faces.py
└── tests/
```

API nội bộ chính là `POST /internal/v1/faces/analyze`. Contract hiện trả vùng khuôn mặt, ba embedding vùng, kết quả biểu cảm, chất lượng ảnh, phiên bản mô hình và thời gian suy luận.

## 5. Spring Boot CRM API

Thư mục: `CRM-system-be-java/`

Vai trò:

- xác thực JWT và phân quyền;
- quản lý khách hàng, sản phẩm, đơn hàng, offer và nhân viên;
- gọi Python face service;
- lưu phiên và sự kiện trải nghiệm;
- làm mịn/tổng hợp chuỗi biểu cảm;
- phân loại trạng thái trải nghiệm;
- cung cấp dữ liệu dashboard, Customer 360 và nhật ký.

Cấu trúc chính:

```text
CRM-system-be-java/
├── build.gradle
├── gradlew
├── gradle/wrapper/
└── src/
    ├── main/java/com/tms/
    │   ├── api/controller/
    │   ├── api/dto/
    │   ├── api/service/
    │   ├── api/security/
    │   ├── api/config/
    │   ├── entity/
    │   └── repository/
    ├── main/resources/db/migration/
    └── test/java/com/tms/api/
```

Các thành phần trải nghiệm chính gồm `ExperienceSessionController`, `ExperienceSessionService`, `TemporalAggregationService`, `ExperienceStatePolicy`, `ExperienceLogsController` và migration `V6`–`V7`.

## 6. Next.js frontend

Thư mục: `CRM-system-fe/`

Vai trò:

- đăng nhập và quản lý phiên người dùng;
- dashboard trải nghiệm và hiệu suất bán hàng;
- danh sách khách hàng, Customer 360 và Face Search;
- thu nhận khung hình trải nghiệm;
- nhật ký phiên, sự kiện và hành trình;
- quản lý sản phẩm, đơn hàng và offer.

Cấu trúc chính:

```text
CRM-system-fe/
├── package.json
├── package-lock.json
├── next.config.mjs
├── vitest.config.js
├── vitest.setup.js
├── public/
└── src/
    ├── app/
    ├── components/
    ├── domain/
    ├── data/
    └── viewmodels/
```

`node_modules`, `.next`, `out`, `build` và coverage là file sinh lại được, không thuộc source cần giữ.

## 7. Báo cáo

Thư mục: `Do_an/Báo cáo/`

Các file cần giữ gồm source LaTeX, `References.bib`, `Figures` và `main.pdf`. Các file `.aux`, `.log`, `.toc`, `.lof`, `.lot`, `.out`, `.fls`, `.fdb_latexmk`, `.bbl` và `.blg` là file build tạm.

## 8. Dữ liệu và artifact được giữ

### 8.1. C2FPW aligned

```text
Do_an/training/C2FPW_aligned/
├── Before/     # 90 ảnh
└── After/      # 2.481 ảnh
```

Dataset này chỉ phục vụ nhận diện danh tính trước/sau can thiệp thẩm mỹ, huấn luyện projector FaceNet512 và grid search trọng số ba vùng. C2FPW không được dùng để huấn luyện hoặc đánh giá cảm xúc.

Các file tái lập được giữ:

```text
Do_an/training/C2FPW.csv
Do_an/training/C2FPW-Download.py
Do_an/training/download_c2fpw.py
Do_an/training/split_dataset.py
Do_an/training/preprocess_dataset.py
Do_an/training/train_triplet.py
Do_an/training/grid_search_weights.py
Do_an/training/test_subject_splits.py
```

### 8.2. Trọng số projector

Artifact runtime được giữ tại `CRM-system-be/facenet512_projector_weights.npz`. Bản cùng tên trong `Do_an/training` là output huấn luyện có thể tạo lại.

### 8.3. Dữ liệu nghiệp vụ

- `postgres_backup.sql`: snapshot khởi tạo PostgreSQL trong Docker.
- `products.xlsx`: nguồn import product/offer configuration.

Hai file đang được `docker-compose.yml` và Spring Boot tham chiếu trực tiếp nên phải giữ.

### 8.4. Dữ liệu FER

Dataset kiểm tra bổ sung đã có:

```text
fer-benchmark/datasets/ckplus/
├── ckextended.csv
└── manifest.json
```

File CSV có 920 mẫu. Giao thức benchmark bảy lớp sử dụng 182 mẫu PublicTest và PrivateTest, loại lớp `contempt`. Đây là bản đóng gói lại từ Kaggle với metadata CC0, không được mô tả là split CK+ chính thức.

Các dataset chưa có trong workspace:

Các dataset sau mới nằm trong kế hoạch benchmark, chưa được lưu trong project:

- RAF-DB;
- AffectNet-7;
- FER2013 đầy đủ;
- tập camera/video nội bộ đã gán nhãn.

Khi bổ sung, dữ liệu phải đặt ngoài Git và có manifest, checksum, giấy phép, train/validation/test split cùng hướng dẫn tái tạo. Không commit ảnh/video gốc vào repository.

## 9. Dữ liệu và file đã loại bỏ

- `Do_an/dataset`: tập ảnh cũ không có code tham chiếu và chứa ảnh định danh cá nhân.
- `Do_an/training/C2FPW`: dữ liệu tải thô, đã có bản aligned cần dùng.
- `Do_an/training/C2FPW_Before` và `C2FPW_After`: bản sao trung gian trước khi căn chỉnh.
- `Do_an/training/facenet512_projector_weights.npz`: output trùng với artifact runtime.
- `.venv`, `node_modules`, `.next`, `.gradle`, `build`, `bin`: dependency/build có thể tái tạo.
- `tmp`, `temp`, cache Python/pytest và file build tạm LaTeX.
- tài liệu kế hoạch cũ hoặc trùng lặp tại thư mục gốc.

## 10. Các tài liệu chính còn lại

1. `README.md`: tổng quan và cách chạy project.
2. `CODEBASE_CURRENT_STRUCTURE.md`: cấu trúc source và dữ liệu hiện tại.
3. `CODEBASE_VS_REPORT_GAP_ANALYSIS.md`: khoảng cách giữa báo cáo và code.
4. `FER_MODEL_COMPARISON_PLAN.md`: kế hoạch benchmark detector và mô hình FER.
5. `fer-benchmark/README.md`: cách xuất bảng khảo sát và đánh giá file dự đoán FER.

## 11. Kiểm thử

### Python

```bash
cd CRM-system-be
python -m pip install -r requirements-dev.txt
python -m pytest -q tests
```

Chạy test subject split bằng cùng môi trường Python đã cài dependencies:

```bash
python -m pytest -q ../Do_an/training/test_subject_splits.py
```

### Java

```bash
cd CRM-system-be-java
./gradlew test
```

### Frontend

```bash
cd CRM-system-fe
npm ci
npm test
npm run lint
npm run build
```

### Docker smoke test

```bash
docker compose up --build -d
./scripts/smoke_experience_pipeline.sh
docker compose down
```

## 12. Trạng thái kiểm thử

- FER benchmark/export: 8 test passed sau khi bổ sung bộ so sánh.

- Python service: 13 test passed.
- Subject split: 2 test passed.
- Java: build/test thành công.
- Frontend: 11 test passed.

Đây là mốc trước khi xóa dependency/build cache. Sau khi cài lại dependency, cần chạy lại toàn bộ quality gate trước khi phát hành.
