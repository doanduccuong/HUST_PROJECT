import os
import shutil
import uuid
from fastapi import APIRouter, File, UploadFile, HTTPException
from services.checkin import CheckinService
import config

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
            return {
                "status": "success",
                "identified": True,
                "name": result["name"],
                "distance": result["distance"],
                "emotion": result["emotion"]
            }
        else:
            return {
                "status": "success",
                "identified": False,
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
