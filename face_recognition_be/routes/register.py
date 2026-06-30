import os
import shutil
import uuid
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from services.customer import CustomerService
import config

router = APIRouter()

@router.post("/api/register")
async def register(file: UploadFile = File(...), name: str = Form(...)):
    name_clean = name.strip()
    if not name_clean:
        raise HTTPException(status_code=400, detail="Tên khách hàng không hợp lệ")
        
    temp_filename = f"reg_{uuid.uuid4()}_{file.filename}"
    temp_file_path = os.path.join(config.TEMP_PATH, temp_filename)
    
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        result = CustomerService.register_customer(temp_file_path, name_clean)
        
        return {
            "status": "success",
            "message": f"Đăng ký khách hàng '{name_clean}' thành công",
            "path": f"db://customers/{result['id']}"
        }
        
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi đăng ký khách hàng: {str(e)}")
    finally:
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass
