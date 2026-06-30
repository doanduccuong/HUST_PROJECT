import sys
import os
from psycopg2.extras import RealDictCursor

# Thêm thư mục gốc của backend vào sys.path để import database, config
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import database

class DashboardService:
    @staticmethod
    def get_stats() -> dict:
        conn = database.get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        try:
            # Lấy số lượng giảng viên đã đăng ký
            cur.execute("SELECT COUNT(*) AS count FROM customers;")
            total_members = cur.fetchone()["count"]
            
            return {
                "total_members": total_members
            }
        finally:
            cur.close()
            conn.close()
