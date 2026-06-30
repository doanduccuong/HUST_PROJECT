from fastapi import APIRouter, HTTPException
from services.customer import CustomerService

router = APIRouter()

@router.get("/api/customers")
async def get_customers():
    try:
        customers = CustomerService.list_customers()
        return customers
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi truy vấn danh sách khách hàng: {str(e)}")
