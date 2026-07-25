import sys
import os
import cv2
import numpy as np
from deepface import DeepFace
from psycopg2.extras import RealDictCursor

# Thêm thư mục gốc của backend vào sys.path để import database, config
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import database
from services.facial_segmentation import segment_face_regions

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
            
            
        # 4. Kết nối CSDL và tìm khách hàng trùng khớp bằng cách duyệt qua tất cả khuôn mặt phát hiện được
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
                
                # Chuẩn hóa kích thước khuôn mặt trước khi phân vùng
                face_img = cv2.resize(face_img, (160, 160))
                
                # Cắt phân vùng
                img_upper, img_mid, img_lower = segment_face_regions(face_img)
                
                # Trích xuất vector đặc trưng bằng DeepFace
                rep_upper = DeepFace.represent(img_path=img_upper, model_name="Facenet512", enforce_detection=False, detector_backend="skip")
                rep_mid = DeepFace.represent(img_path=img_mid, model_name="Facenet512", enforce_detection=False, detector_backend="skip")
                rep_lower = DeepFace.represent(img_path=img_lower, model_name="Facenet512", enforce_detection=False, detector_backend="skip")
                
                if not rep_upper or not rep_mid or not rep_lower:
                    continue
                    
                # Áp dụng trọng số tinh chỉnh tối ưu hóa PTTM qua projector
                from services.projector import project_embedding
                
                emb_upper = None
                emb_mid = None
                emb_lower = None
                
                if (isinstance(rep_upper, list) and len(rep_upper) > 0 and isinstance(rep_upper[0], dict) and
                    isinstance(rep_mid, list) and len(rep_mid) > 0 and isinstance(rep_mid[0], dict) and
                    isinstance(rep_lower, list) and len(rep_lower) > 0 and isinstance(rep_lower[0], dict)):
                    
                    raw_upper = rep_upper[0].get("embedding")
                    raw_mid = rep_mid[0].get("embedding")
                    raw_lower = rep_lower[0].get("embedding")
                    
                    if raw_upper is not None and raw_mid is not None and raw_lower is not None:
                        emb_upper = project_embedding(raw_upper)
                        emb_mid = project_embedding(raw_mid)
                        emb_lower = project_embedding(raw_lower)
                
                if emb_upper is None or emb_mid is None or emb_lower is None:
                    continue
                
                vector_up_str = "[" + ",".join(str(x) for x in emb_upper) + "]"
                vector_mid_str = "[" + ",".join(str(x) for x in emb_mid) + "]"
                vector_low_str = "[" + ",".join(str(x) for x in emb_lower) + "]"
                
                # Câu truy vấn tính khoảng cách kết hợp tuyến tính có trọng số trực tiếp trong PostgreSQL (Weighted Fusion)
                # Trọng số: Thượng = 0.5, Trung = 0.3, Hạ = 0.2
                cur.execute(
                    """
                    SELECT 
                      c.id AS customer_id, 
                      c.name, 
                      c.gender, 
                      c.age,
                      (0.5 * (e_up.face_vector <=> %s::vector) + 
                       0.3 * (e_mid.face_vector <=> %s::vector) + 
                       0.2 * (e_low.face_vector <=> %s::vector)) AS distance
                    FROM customers c
                    JOIN customer_embeddings e_up ON c.id = e_up.customer_id AND e_up.face_region = 'upper'
                    JOIN customer_embeddings e_mid ON c.id = e_mid.customer_id AND e_mid.face_region = 'mid'
                    JOIN customer_embeddings e_low ON c.id = e_low.customer_id AND e_low.face_region = 'lower'
                    ORDER BY distance ASC
                    LIMIT 1;
                    """,
                    (vector_up_str, vector_mid_str, vector_low_str)
                )
                row = cur.fetchone()
                
                if row:
                    dist = float(row["distance"])
                    print(f"[RECOGNITION] So sánh với {row['name']}: Cosine distance = {dist:.4f} (Thấp hơn ngưỡng 0.30? {dist < 0.30})")
                    if dist < min_distance:
                        min_distance = dist
                        closest_customer_name = row["name"]
                    # Ngưỡng chấp nhận nhận diện (Threshold) sau dung hợp trọng số là 0.30
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
