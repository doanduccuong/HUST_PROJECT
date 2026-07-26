import os
import random
import uuid
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime, timedelta

def get_db_connection():
    host = os.getenv("DB_HOST", "postgres")
    port = os.getenv("DB_PORT", "5432")
    db_name = os.getenv("DB_NAME", "postgres")
    user = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASSWORD", "postgres")
    return psycopg2.connect(
        host=host, port=port, database=db_name, user=user, password=password
    )

def generate_vietnamese_name(idx):
    first_names = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"]
    mid_names = ["Thanh", "Anh", "Minh", "Duy", "Hoàng", "Đức", "Hữu", "Tuấn", "Quốc", "Ngọc", "Kim", "Thu", "Khánh", "Xuân"]
    last_names = ["Sơn Tùng", "Mono", "Chi Pu", "Lan Ngọc", "Hiếu Thứ Hai", "Trấn Thành", "Trường Giang", "Đen Vâu", "Suboi", "Karik", "Tóc Tiên", "Bích Phương", "Đông Nhi", "Isaac", "Soobin", "Binz", "Quang Hải", "Công Phượng", "Tiến Linh", "Văn Lâm"]
    
    first = random.choice(first_names)
    mid = random.choice(mid_names)
    last = random.choice(last_names)
    return f"{first} {mid} {last} #{idx}"

def generate_unit_vector(dims=512):
    vec = [random.gauss(0, 1) for _ in range(dims)]
    norm = sum(x**2 for x in vec) ** 0.5
    if norm > 0:
        vec = [x / norm for x in vec]
    return vec

def main():
    print("Starting database seeder for 1000 customers...")
    conn = get_db_connection()
    cur = conn.cursor()

    # Get active products
    cur.execute("SELECT prod_id, name, price FROM pd_product WHERE status = 1")
    products = cur.fetchall()
    if not products:
        products = [(1, "Diabenol-Neuro-PE", "149")]

    # Fetch existing customer count to offset IDs if needed
    cur.execute("SELECT COALESCE(MAX(id), 0) FROM customers WHERE id < 13")
    max_customer_id = cur.fetchone()[0]

    # Generate 1000 customers
    customers_data = []
    print("Generating 1000 customer profiles...")
    for i in range(1000):
        c_id = max_customer_id + 13 + i
        name = generate_vietnamese_name(c_id)
        gender = random.choice(["Male", "Female"])
        age = random.randint(18, 55)
        
        img_idx = (i % 99) + 1
        img_type = "men" if gender == "Male" else "women"
        user_image = f"https://randomuser.me/api/portraits/{img_type}/{img_idx}.jpg"
        
        days_ago = random.randint(0, 90)
        created_at = datetime.now() - timedelta(days=days_ago)
        created_at = created_at.replace(hour=random.randint(8, 21), minute=random.randint(0, 59))
        
        customers_data.append((c_id, name, gender, age, user_image, created_at))

    print("Inserting 1000 customers...")
    execute_values(
        cur,
        "INSERT INTO customers (id, name, gender, age, user_image, created_at) VALUES %s",
        customers_data
    )
    conn.commit()

    # Generate embeddings
    print("Generating face embeddings (3 regions per customer)...")
    embeddings_data = []
    for c_data in customers_data:
        c_id = c_data[0]
        for region in ["upper", "mid", "lower"]:
            vec = generate_unit_vector()
            vec_str = "[" + ",".join(map(str, vec)) + "]"
            embeddings_data.append((c_id, region, vec_str, "Facenet512+regional-projector-v1"))

    print("Inserting customer face embeddings...")
    execute_values(
        cur,
        "INSERT INTO customer_embeddings (customer_id, face_region, face_vector, model_version) VALUES %s",
        embeddings_data
    )
    conn.commit()

    # Generate Orders
    print("Generating 2000 sale orders...")
    orders_data = []
    cur.execute("SELECT COALESCE(MAX(so_id), 0) FROM so_sales_order WHERE customer_id < 13")
    max_so_id = cur.fetchone()[0]

    for i in range(2000):
        so_id = max_so_id + 13 + i
        so_code = f"SO{str(so_id).zfill(6)}"
        c_data = random.choice(customers_data)
        c_id = c_data[0]
        lead_name = c_data[1]
        lead_phone = f"09{random.randint(10000000, 99999999)}"
        
        prod = random.choice(products)
        prod_id = prod[0]
        product_name = prod[1]
        
        try:
            amount_str = prod[2].replace(",", "")
            amount = float(amount_str)
        except:
            amount = 149000.0
            
        delivery_service = random.choice(["GHTK", "GHN", "ViettelPost", "NinjaVan"])
        cross_sell = random.choice(["Pin sạc dự phòng", "Ốp lưng cao cấp", "Kính cường lực", ""])
        
        days_ago = random.randint(0, 90)
        created_at = datetime.now() - timedelta(days=days_ago)
        created_at = created_at.replace(hour=random.randint(8, 21), minute=random.randint(0, 59))
        
        status = random.choice(["COMPLETED", "COMPLETED", "COMPLETED", "CREATED", "CANCELLED"])
        paid_at = created_at + timedelta(minutes=random.randint(5, 60)) if status == "COMPLETED" else None
        
        orders_data.append((
            so_id, so_code, lead_name, lead_phone, product_name, delivery_service,
            cross_sell, amount, created_at, c_id, prod_id, status, paid_at
        ))

    print("Inserting sale orders...")
    execute_values(
        cur,
        "INSERT INTO so_sales_order (so_id, so_code, lead_name, lead_phone, product_name, delivery_service, cross_sell, amount, created_at, customer_id, product_id, status, paid_at) VALUES %s",
        orders_data
    )
    conn.commit()

    # Generate experience sessions and state events (25-35 per day)
    print("Generating experience sessions and events (25-35 per day)...")
    sessions_data = []
    events_data = []

    zones = ["ENTRANCE", "PRODUCT", "CONSULTING", "CHECKOUT"]
    cameras = {
        "ENTRANCE": "CAM_ENTRANCE_01",
        "PRODUCT": "CAM_PRODUCT_02",
        "CONSULTING": "CAM_CONSULTING_03",
        "CHECKOUT": "CAM_CHECKOUT_04"
    }

    emotions_pool = [
        ("DELIGHTED", "happy", 0.90),
        ("ENGAGED", "surprise", 0.85),
        ("NEUTRAL", "neutral", 0.95),
        ("CONFUSED", "sad", 0.75),
        ("IMPATIENT", "angry", 0.80),
        ("DISSATISFIED", "disgust", 0.85)
    ]
    emotions_weights = [0.40, 0.30, 0.15, 0.08, 0.05, 0.02]

    for day_offset in range(91):
        day = datetime.now() - timedelta(days=day_offset)
        num_sessions = random.randint(25, 35)
        
        for s in range(num_sessions):
            session_id = str(uuid.uuid4())
            c_data = random.choice(customers_data)
            c_id = c_data[0]
            
            zone = random.choice(zones)
            camera_id = cameras[zone]
            
            started_at = day.replace(hour=random.randint(8, 21), minute=random.randint(0, 59), second=random.randint(0, 59))
            ended_at = started_at + timedelta(minutes=random.randint(5, 45))
            
            sessions_data.append((
                session_id, c_id, camera_id, zone, f"track_{random.randint(1000, 9999)}",
                started_at, ended_at, "REAL_METADATA"
            ))
            
            choice = random.choices(emotions_pool, weights=emotions_weights)[0]
            exp_state = choice[0]
            raw_expr = choice[1]
            conf = choice[2]
            
            probs = {raw_expr: conf}
            other_exprs = ["happy", "sad", "angry", "surprise", "fear", "neutral"]
            for o in other_exprs:
                if o != raw_expr:
                    probs[o] = round(random.uniform(0.0, 1.0 - conf), 4)
            
            import json
            probs_str = json.dumps(probs)
            
            events_data.append((
                session_id, c_id, camera_id, zone, started_at, raw_expr, conf,
                exp_state, conf, probs_str, "MODEL", "Facenet512+regional-projector-v1"
            ))

    print(f"Inserting {len(sessions_data)} sessions...")
    execute_values(
        cur,
        "INSERT INTO experience_sessions (id, customer_id, camera_id, zone, local_track_id, started_at, ended_at, data_origin) VALUES %s",
        sessions_data
    )
    
    print(f"Inserting {len(events_data)} experience events...")
    execute_values(
        cur,
        "INSERT INTO experience_state_events (session_id, customer_id, camera_id, zone, observed_at, raw_expression, raw_expression_confidence, experience_state, state_confidence, expression_probabilities, source, model_version) VALUES %s",
        events_data
    )
    conn.commit()

    cur.close()
    conn.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    main()
