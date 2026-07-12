import sys
import os
from deepface import DeepFace

# Thêm thư mục gốc của backend vào sys.path để import database, config
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import database

class CustomerService:
    @staticmethod
    def register_customer(file_path: str, name: str, user_image: str | None = None) -> dict:
        import numpy as np
        import cv2
        # Đọc ảnh bằng numpy và cv2.imdecode để vượt qua lỗi đường dẫn tiếng Việt (ĐỒ ÁN)
        img_array = np.fromfile(file_path, np.uint8)
        raw_img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        if raw_img is None:
            raise ValueError(f"Không thể đọc tệp ảnh: {file_path}")

        # 1. Trích xuất khuôn mặt đã căn chỉnh từ ảnh đăng ký
        faces = DeepFace.extract_faces(
            img_path=raw_img,
            detector_backend="opencv",
            enforce_detection=False,
            align=True
        )
        if not faces or len(faces) == 0:
            raise ValueError("Không nhận diện được khuôn mặt trong ảnh đăng ký")
        
        first_face = faces[0]
        if not isinstance(first_face, dict):
            raise ValueError("Cấu trúc dữ liệu khuôn mặt không hợp lệ")
        face_img = first_face.get("face")
        if face_img is None:
            raise ValueError("Không thể lấy dữ liệu ảnh khuôn mặt")
            
        # Đưa ảnh về định dạng uint8 [0, 255] chuẩn để cv2.resize hoạt động ổn định
        if face_img.dtype != np.uint8:
            if face_img.max() <= 1.0:
                face_img = (face_img * 255).astype(np.uint8)
            else:
                face_img = face_img.astype(np.uint8)
        
        # Chuyển kênh màu từ RGB sang BGR
        face_img = cv2.cvtColor(face_img, cv2.COLOR_RGB2BGR)
        
        # Chuẩn hóa kích thước khuôn mặt trước khi phân vùng
        face_img = cv2.resize(face_img, (160, 160))
        
        # 2. Gọi dịch vụ phân chia khuôn mặt thành 3 vùng
        from services.facial_segmentation import segment_face_regions
        img_upper, img_mid, img_lower = segment_face_regions(face_img)
        
        # 3. Trích xuất vector đặc trưng 512 chiều cho từng vùng
        # Dùng detector_backend="skip" để bỏ qua việc phát hiện mặt lại trên ảnh đã crop
        rep_upper = DeepFace.represent(img_path=img_upper, model_name="Facenet512", enforce_detection=False, detector_backend="skip")
        rep_mid = DeepFace.represent(img_path=img_mid, model_name="Facenet512", enforce_detection=False, detector_backend="skip")
        rep_lower = DeepFace.represent(img_path=img_lower, model_name="Facenet512", enforce_detection=False, detector_backend="skip")
        
        if (not isinstance(rep_upper, list) or len(rep_upper) == 0 or not isinstance(rep_upper[0], dict) or
            not isinstance(rep_mid, list) or len(rep_mid) == 0 or not isinstance(rep_mid[0], dict) or
            not isinstance(rep_lower, list) or len(rep_lower) == 0 or not isinstance(rep_lower[0], dict)):
            raise ValueError("Không thể trích xuất đặc trưng phân vùng khuôn mặt")
            
        # Áp dụng trọng số tinh chỉnh tối ưu hóa PTTM qua projector
        from services.projector import project_embedding
        
        raw_upper = rep_upper[0].get("embedding")
        raw_mid = rep_mid[0].get("embedding")
        raw_lower = rep_lower[0].get("embedding")
        
        if raw_upper is None or raw_mid is None or raw_lower is None:
            raise ValueError("Vector đặc trưng rỗng")
            
        emb_upper = project_embedding(raw_upper)
        emb_mid = project_embedding(raw_mid)
        emb_lower = project_embedding(raw_lower)
        
        # 4. Phân tích tuổi và giới tính từ ảnh đăng ký (sử dụng ảnh gốc ban đầu)
        try:
            analysis = DeepFace.analyze(
                img_path=raw_img,
                actions=["age", "gender"],
                enforce_detection=False
            )
            if isinstance(analysis, list) and len(analysis) > 0:
                first_item = analysis[0]
                if isinstance(first_item, dict):
                    age = int(first_item.get("age", 30))
                    gender_data = first_item.get("gender", {})
                    gender_str = first_item.get("dominant_gender")
                    if not gender_str:
                        if isinstance(gender_data, dict):
                            gender_str = max(gender_data.keys(), key=lambda k: gender_data[k])
                        else:
                            gender_str = str(gender_data)
                else:
                    age = 30
                    gender_str = "Male"
                
                # Chuẩn hóa giới tính
                if gender_str in ["Man", "Male", "M"]:
                    gender = "Male"
                elif gender_str in ["Woman", "Female", "F"]:
                    gender = "Female"
                else:
                    gender = "Male"
            else:
                age = 30
                gender = "Male"
        except Exception:
            age = 30
            gender = "Male"
            
        # 5. Lưu thông tin vào CSDL PostgreSQL
        conn = database.get_db_connection()
        cur = conn.cursor()
        try:
            # Kiểm tra xem khách hàng đã tồn tại chưa
            cur.execute("SELECT id, gender, age FROM customers WHERE name = %s LIMIT 1;", (name,))
            row = cur.fetchone()
            
            if row:
                customer_id = row[0]
                gender = row[1]
                age = row[2]
                if user_image:
                    cur.execute("UPDATE customers SET user_image = %s WHERE id = %s;", (user_image, customer_id))
            else:
                # Tạo mới khách hàng nếu chưa tồn tại
                cur.execute(
                    """
                    INSERT INTO customers (name, gender, age, user_image)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id;
                    """,
                    (name, gender, age, user_image)
                )
                res = cur.fetchone()
                if res is None:
                    raise ValueError("Không thể tạo khách hàng mới")
                customer_id = res[0]
                
            # Chèn 3 vector phân vùng tương ứng vào bảng customer_embeddings
            regions_data = [
                ("upper", emb_upper),
                ("mid", emb_mid),
                ("lower", emb_lower)
            ]
            for region, emb in regions_data:
                vector_str = "[" + ",".join(str(x) for x in emb) + "]"
                cur.execute(
                    """
                    INSERT INTO customer_embeddings (customer_id, face_region, face_vector)
                    VALUES (%s, %s, %s);
                    """,
                    (customer_id, region, vector_str)
                )
            
            conn.commit()
            return {
                "id": customer_id,
                "name": name,
                "gender": gender,
                "age": age
            }
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cur.close()
            conn.close()

    @staticmethod
    def list_customers() -> list:
        conn = database.get_db_connection()
        from psycopg2.extras import RealDictCursor
        cur = conn.cursor(cursor_factory=RealDictCursor)
        try:
            cur.execute(
                """
                SELECT c.id, c.name, c.gender, c.age, c.user_image, c.created_at, COUNT(e.id) AS photo_count
                FROM customers c
                LEFT JOIN customer_embeddings e ON c.id = e.customer_id
                GROUP BY c.id
                ORDER BY c.id DESC;
                """
            )
            rows = cur.fetchall()
            
            results = []
            for r in rows:
                results.append({
                    "id": r["id"],
                    "name": r["name"],
                    "gender": r["gender"],
                    "age": r["age"],
                    "user_image": r["user_image"],
                    "created_at": r["created_at"].isoformat() if r["created_at"] else None,
                    "photo_count": int(r["photo_count"] / 3)
                })
            return results
        finally:
            cur.close()
            conn.close()

