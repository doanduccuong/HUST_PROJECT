import uuid

from fastapi import APIRouter, File, HTTPException, UploadFile

from api.schemas.face_analysis import FaceAnalysisResponse
from services.face_analysis import analyze_image_bytes


router = APIRouter(prefix="/internal/v1/faces", tags=["internal-face-analysis"])
MAX_IMAGE_BYTES = 10 * 1024 * 1024
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.post("/analyze", response_model=FaceAnalysisResponse)
async def analyze_face(file: UploadFile = File(...)):
    trace_id = str(uuid.uuid4())
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail="Chỉ hỗ trợ ảnh JPEG, PNG hoặc WebP",
        )

    image_bytes = await file.read(MAX_IMAGE_BYTES + 1)
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Tệp ảnh rỗng")
    if len(image_bytes) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Ảnh vượt quá giới hạn 10 MB")

    try:
        result = analyze_image_bytes(image_bytes)
        return {"traceId": trace_id, **result}
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Không thể phân tích khuôn mặt (traceId={trace_id})",
        ) from exc
