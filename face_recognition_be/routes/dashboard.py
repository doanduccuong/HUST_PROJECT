from fastapi import APIRouter, HTTPException
from services.dashboard import DashboardService

router = APIRouter()

@router.get("/api/dashboard-stats")
async def get_dashboard_stats():
    try:
        stats = DashboardService.get_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi truy vấn dữ liệu thống kê: {str(e)}")
