import os
import shutil
import uuid
from fastapi import APIRouter, File, UploadFile, HTTPException
from services.checkin import CheckinService
import config
import database

router = APIRouter()

@router.post("/api/checkin")
async def checkin(file: UploadFile = File(...)):
    temp_filename = f"chk_{uuid.uuid4()}_{file.filename}"
    temp_file_path = os.path.join(config.TEMP_PATH, temp_filename)
    
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        result = CheckinService.checkin_customer(temp_file_path)
        
        if result["identified"]:
            # Lấy thông tin giới tính và độ tuổi từ DB
            conn = database.get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT gender, age FROM customers WHERE name = %s LIMIT 1;", (result["name"],))
            row = cur.fetchone()
            cur.close()
            conn.close()
            
            gender = row[0] if row else "Unknown"
            age = row[1] if row else 0
            
            return {
                "status": "success",
                "identified": True,
                "name": result["name"],
                "gender": gender,
                "age": age,
                "distance": result["distance"],
                "closest_name": result.get("closest_name"),
                "closest_distance": result.get("closest_distance"),
                "emotion": result["emotion"]
            }
        else:
            return {
                "status": "success",
                "identified": False,
                "name": "Khách mới",
                "distance": result["distance"],
                "closest_name": result.get("closest_name"),
                "closest_distance": result.get("closest_distance"),
                "message": "Không tìm thấy khách hàng trùng khớp (Khách mới)",
                "emotion": result["emotion"]
            }
            
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý check-in: {str(e)}")
    finally:
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass
