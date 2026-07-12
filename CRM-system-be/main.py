from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import register, checkin, dashboard, customers

app = FastAPI(title="Face Recognition API")

# Cấu hình CORS để cho phép Next.js Frontend kết nối
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đăng ký các router riêng biệt cho mỗi API
app.include_router(register.router)
app.include_router(checkin.router)
app.include_router(dashboard.router)
app.include_router(customers.router)
