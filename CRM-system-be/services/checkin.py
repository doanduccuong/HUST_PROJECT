import sys
import os
import cv2
import numpy as np
from deepface import DeepFace
from psycopg2.extras import RealDictCursor

# Thêm thư mục gốc của backend vào sys.path để import database, config
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import database

class CheckinService:
    @staticmethod
    def checkin_customer(file_path: str) -> dict:
        # Đọc ảnh bằng numpy và cv2.imdecode để tránh lỗi đường dẫn tiếng Việt (ĐỒ ÁN)
        img_array = np.fromfile(file_path, np.uint8)
        raw_img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        if raw_img is None:
            raise ValueError(f"Không thể đọc tệp ảnh: {file_path}")

        # 1. Trích xuất tất cả khuôn mặt đã căn chỉnh từ ảnh check-in
        faces = DeepFace.extract_faces(
            img_path=raw_img,
            detector_backend="opencv",
            enforce_detection=False,
            align=True
        )
        if not faces or len(faces) == 0:
            raise ValueError("Không nhận diện được khuôn mặt trong ảnh check-in")
            
        # 2. Phân tích cảm xúc hiện tại từ ảnh check-in (sử dụng ảnh gốc)
        try:
            analysis = DeepFace.analyze(
                img_path=raw_img,
                actions=["emotion"],
                enforce_detection=False
            )
            if isinstance(analysis, list) and len(analysis) > 0:
                first_item = analysis[0]
                if isinstance(first_item, dict):
                    emotion = first_item.get("dominant_emotion", "neutral")
                elif isinstance(first_item, list) and len(first_item) > 0 and isinstance(first_item[0], dict):
                    emotion = first_item[0].get("dominant_emotion", "neutral")
                else:
                    emotion = "neutral"
            elif isinstance(analysis, dict):
                emotion = analysis.get("dominant_emotion", "neutral")
            else:
                emotion = "neutral"
        except Exception:
            emotion = "neutral"
            
            
        # 3. Kết nối CSDL và tìm khách hàng trùng khớp bằng embedding toàn cục
        conn = database.get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        try:
            best_match = None
            min_distance = 1.0
            closest_customer_name = None
            
            for f in faces:
                if not isinstance(f, dict):
                    continue
                face_img = f.get("face")
                if face_img is None:
                    continue
                # Đưa ảnh về định dạng uint8 [0, 255] chuẩn để cv2.resize hoạt động ổn định
                if face_img.dtype != np.uint8:
                    if face_img.max() <= 1.0:
                        face_img = (face_img * 255).astype(np.uint8)
                    else:
                        face_img = face_img.astype(np.uint8)
                
                # Chuyển kênh màu từ RGB sang BGR
                face_img = cv2.cvtColor(face_img, cv2.COLOR_RGB2BGR)
                
                # Trích xuất vector đặc trưng toàn cục bằng DeepFace (VGGFace)
                rep = DeepFace.represent(
                    img_path=face_img,
                    model_name="VGG-Face",
                    enforce_detection=False,
                    detector_backend="skip"
                )
                
                if not rep or not isinstance(rep, list) or len(rep) == 0:
                    continue
                
                embedding = rep[0].get("embedding") if isinstance(rep[0], dict) else None
                if embedding is None:
                    continue
                
                vector_str = "[" + ",".join(str(x) for x in embedding) + "]"
                
                # Truy vấn tìm khách hàng gần nhất theo khoảng cách Cosine
                cur.execute(
                    """
                    SELECT 
                      c.id AS customer_id, 
                      c.name, 
                      c.gender, 
                      c.age,
                      (e.face_vector <=> %s::vector) AS distance
                    FROM customers c
                    JOIN customer_embeddings e ON c.id = e.customer_id
                    ORDER BY distance ASC
                    LIMIT 1;
                    """,
                    (vector_str,)
                )
                row = cur.fetchone()
                
                if row:
                    dist = float(row["distance"])
                    print(f"[RECOGNITION] So sánh với {row['name']}: Cosine distance = {dist:.4f} (Thấp hơn ngưỡng 0.30? {dist < 0.30})")
                    if dist < min_distance:
                        min_distance = dist
                        closest_customer_name = row["name"]
                    # Ngưỡng chấp nhận nhận diện (Threshold)
                    if dist < 0.30 and (best_match is None or dist < best_match["distance"]):
                        best_match = {
                            "customer_id": row["customer_id"],
                            "name": row["name"],
                            "gender": row["gender"],
                            "age": row["age"],
                            "distance": dist
                        }
            
            customer_id = None
            identified = False
            customer_name = None
            distance = min_distance
            
            if best_match:
                customer_id = best_match["customer_id"]
                customer_name = best_match["name"]
                distance = best_match["distance"]
                identified = True
                
            return {
                "customer_id": customer_id,
                "identified": identified,
                "name": customer_name,
                "distance": distance,
                "closest_name": closest_customer_name,
                "closest_distance": min_distance,
                "emotion": emotion
            }
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cur.close()
            conn.close()
