-- Static demo dataset.
-- Flyway executes this migration once and records version 3 in flyway_schema_history.
-- Subsequent application restarts do not recreate or update these rows.

INSERT INTO customers (name, gender, age, user_image, created_at)
VALUES
    ('Nguyễn Minh Anh (Demo)', 'Female', 28, 'https://i.pravatar.cc/400?img=5',  TIMESTAMPTZ '2026-05-20 09:00:00+07'),
    ('Trần Quốc Bảo (Demo)',   'Male',   34, 'https://i.pravatar.cc/400?img=11', TIMESTAMPTZ '2026-05-22 10:00:00+07'),
    ('Lê Thu Hà (Demo)',       'Female', 31, 'https://i.pravatar.cc/400?img=32', TIMESTAMPTZ '2026-05-25 11:00:00+07'),
    ('Phạm Gia Huy (Demo)',    'Male',   26, 'https://i.pravatar.cc/400?img=12', TIMESTAMPTZ '2026-05-28 12:00:00+07'),
    ('Hoàng Ngọc Lan (Demo)',  'Female', 42, 'https://i.pravatar.cc/400?img=44', TIMESTAMPTZ '2026-06-01 09:30:00+07'),
    ('Vũ Đức Long (Demo)',     'Male',   38, 'https://i.pravatar.cc/400?img=13', TIMESTAMPTZ '2026-06-04 10:30:00+07'),
    ('Đỗ Khánh Linh (Demo)',   'Female', 25, 'https://i.pravatar.cc/400?img=47', TIMESTAMPTZ '2026-06-08 13:30:00+07'),
    ('Bùi Tuấn Kiệt (Demo)',   'Male',   30, 'https://i.pravatar.cc/400?img=14', TIMESTAMPTZ '2026-06-12 14:00:00+07'),
    ('Đặng Mai Phương (Demo)', 'Female', 36, 'https://i.pravatar.cc/400?img=49', TIMESTAMPTZ '2026-06-16 15:00:00+07'),
    ('Hồ Nhật Nam (Demo)',     'Male',   45, 'https://i.pravatar.cc/400?img=15', TIMESTAMPTZ '2026-06-20 16:00:00+07')
ON CONFLICT (name) DO NOTHING;

WITH order_seed (
    customer_name,
    order_code,
    product_name,
    amount,
    status,
    created_at,
    paid_at
) AS (
    VALUES
        ('Nguyễn Minh Anh (Demo)', 'DEMO-CUST-001-A', 'iPhone 15 128GB',             899.0,  'PAID',      TIMESTAMPTZ '2026-05-25 10:00:00+07', TIMESTAMPTZ '2026-05-25 10:30:00+07'),
        ('Nguyễn Minh Anh (Demo)', 'DEMO-CUST-001-B', 'AirPods Pro 2',               249.0,  'DELIVERED', TIMESTAMPTZ '2026-07-05 14:00:00+07', NULL),
        ('Trần Quốc Bảo (Demo)',   'DEMO-CUST-002-A', 'Samsung Galaxy S24',          799.0,  'PAID',      TIMESTAMPTZ '2026-05-29 11:00:00+07', TIMESTAMPTZ '2026-05-29 11:20:00+07'),
        ('Trần Quốc Bảo (Demo)',   'DEMO-CUST-002-B', 'Galaxy Watch 6',              299.0,  'PAID',      TIMESTAMPTZ '2026-07-08 16:00:00+07', TIMESTAMPTZ '2026-07-08 16:15:00+07'),
        ('Lê Thu Hà (Demo)',       'DEMO-CUST-003-A', 'MacBook Air M3',             1299.0,  'PAID',      TIMESTAMPTZ '2026-06-03 09:30:00+07', TIMESTAMPTZ '2026-06-03 10:00:00+07'),
        ('Lê Thu Hà (Demo)',       'DEMO-CUST-003-B', 'USB-C Multiport Hub',          79.0,  'CANCELLED', TIMESTAMPTZ '2026-07-10 13:00:00+07', NULL),
        ('Phạm Gia Huy (Demo)',    'DEMO-CUST-004-A', 'iPad Air M2',                 699.0,  'PAID',      TIMESTAMPTZ '2026-06-07 15:00:00+07', TIMESTAMPTZ '2026-06-07 15:25:00+07'),
        ('Phạm Gia Huy (Demo)',    'DEMO-CUST-004-B', 'Apple Pencil Pro',            129.0,  'DELIVERED', TIMESTAMPTZ '2026-07-12 10:00:00+07', NULL),
        ('Hoàng Ngọc Lan (Demo)',  'DEMO-CUST-005-A', 'Sony WH-1000XM5',             349.0,  'PAID',      TIMESTAMPTZ '2026-06-11 10:30:00+07', TIMESTAMPTZ '2026-06-11 10:50:00+07'),
        ('Hoàng Ngọc Lan (Demo)',  'DEMO-CUST-005-B', 'USB-C Charger 65W',            45.0,  'PAID',      TIMESTAMPTZ '2026-07-14 17:00:00+07', TIMESTAMPTZ '2026-07-14 17:10:00+07'),
        ('Vũ Đức Long (Demo)',     'DEMO-CUST-006-A', 'Dell XPS 13',                1499.0,  'PAID',      TIMESTAMPTZ '2026-06-15 11:30:00+07', TIMESTAMPTZ '2026-06-15 12:00:00+07'),
        ('Vũ Đức Long (Demo)',     'DEMO-CUST-006-B', 'Logitech MX Master 3S',        99.0,  'DELIVERED', TIMESTAMPTZ '2026-07-15 12:00:00+07', NULL),
        ('Đỗ Khánh Linh (Demo)',   'DEMO-CUST-007-A', 'Xiaomi 14',                   699.0,  'PAID',      TIMESTAMPTZ '2026-06-19 14:00:00+07', TIMESTAMPTZ '2026-06-19 14:20:00+07'),
        ('Đỗ Khánh Linh (Demo)',   'DEMO-CUST-007-B', 'Redmi Buds 5 Pro',             79.0,  'CREATED',   TIMESTAMPTZ '2026-07-16 15:00:00+07', NULL),
        ('Bùi Tuấn Kiệt (Demo)',   'DEMO-CUST-008-A', 'ASUS ROG Zephyrus G14',      1599.0,  'PAID',      TIMESTAMPTZ '2026-06-23 16:00:00+07', TIMESTAMPTZ '2026-06-23 16:30:00+07'),
        ('Bùi Tuấn Kiệt (Demo)',   'DEMO-CUST-008-B', 'ROG Mechanical Keyboard',     129.0,  'CANCELLED', TIMESTAMPTZ '2026-07-17 16:30:00+07', NULL),
        ('Đặng Mai Phương (Demo)', 'DEMO-CUST-009-A', 'Canon EOS R50',              1099.0,  'PAID',      TIMESTAMPTZ '2026-06-27 09:00:00+07', TIMESTAMPTZ '2026-06-27 09:30:00+07'),
        ('Đặng Mai Phương (Demo)', 'DEMO-CUST-009-B', 'SanDisk Extreme 128GB',        49.0,  'PAID',      TIMESTAMPTZ '2026-07-18 10:00:00+07', TIMESTAMPTZ '2026-07-18 10:10:00+07'),
        ('Hồ Nhật Nam (Demo)',     'DEMO-CUST-010-A', 'LG OLED C3 55 inch',         1899.0,  'PAID',      TIMESTAMPTZ '2026-07-01 13:00:00+07', TIMESTAMPTZ '2026-07-01 13:30:00+07'),
        ('Hồ Nhật Nam (Demo)',     'DEMO-CUST-010-B', 'LG Soundbar SC9S',            499.0,  'DELIVERED', TIMESTAMPTZ '2026-07-20 18:00:00+07', NULL)
)
INSERT INTO so_sales_order (
    so_code,
    lead_name,
    lead_phone,
    product_name,
    amount,
    assigned,
    customer_id,
    staff_id,
    quantity,
    currency,
    status,
    paid_at,
    created_at
)
SELECT
    seed.order_code,
    customer.name,
    '0901' || LPAD(customer.id::text, 6, '0'),
    seed.product_name,
    seed.amount,
    'Demo CRM Manager',
    customer.id,
    (SELECT user_id FROM or_user WHERE username = 'manager' LIMIT 1),
    1,
    'USD',
    seed.status,
    seed.paid_at,
    seed.created_at
FROM order_seed seed
JOIN customers customer
  ON customer.name = seed.customer_name
ON CONFLICT (so_code) DO NOTHING;

WITH interaction_seed (customer_name, order_code, interaction_type, channel, outcome, started_at, notes) AS (
    VALUES
        ('Nguyễn Minh Anh (Demo)', 'DEMO-CUST-001-A', 'IN_STORE_CONSULTATION', 'IN_PERSON', 'PURCHASED',  TIMESTAMPTZ '2026-05-25 09:20:00+07', 'Seed tĩnh: tư vấn iPhone 15.'),
        ('Nguyễn Minh Anh (Demo)', 'DEMO-CUST-001-B', 'FOLLOW_UP',              'PHONE',     'DELIVERED',  TIMESTAMPTZ '2026-07-06 09:00:00+07', 'Seed tĩnh: chăm sóc sau mua AirPods Pro 2.'),
        ('Trần Quốc Bảo (Demo)',   'DEMO-CUST-002-A', 'IN_STORE_CONSULTATION', 'IN_PERSON', 'PURCHASED',  TIMESTAMPTZ '2026-05-29 10:15:00+07', 'Seed tĩnh: tư vấn Galaxy S24.'),
        ('Trần Quốc Bảo (Demo)',   'DEMO-CUST-002-B', 'FOLLOW_UP',              'PHONE',     'PURCHASED',  TIMESTAMPTZ '2026-07-09 09:30:00+07', 'Seed tĩnh: chăm sóc sau mua Galaxy Watch 6.'),
        ('Lê Thu Hà (Demo)',       'DEMO-CUST-003-A', 'PRODUCT_DEMO',           'IN_PERSON', 'PURCHASED',  TIMESTAMPTZ '2026-06-03 08:45:00+07', 'Seed tĩnh: trải nghiệm MacBook Air M3.'),
        ('Lê Thu Hà (Demo)',       'DEMO-CUST-003-B', 'FOLLOW_UP',              'PHONE',     'CANCELLED',  TIMESTAMPTZ '2026-07-11 10:00:00+07', 'Seed tĩnh: xác nhận hủy USB-C Hub.'),
        ('Phạm Gia Huy (Demo)',    'DEMO-CUST-004-A', 'PRODUCT_DEMO',           'IN_PERSON', 'PURCHASED',  TIMESTAMPTZ '2026-06-07 14:20:00+07', 'Seed tĩnh: trải nghiệm iPad Air M2.'),
        ('Phạm Gia Huy (Demo)',    'DEMO-CUST-004-B', 'FOLLOW_UP',              'PHONE',     'DELIVERED',  TIMESTAMPTZ '2026-07-13 09:00:00+07', 'Seed tĩnh: chăm sóc sau mua Apple Pencil Pro.'),
        ('Hoàng Ngọc Lan (Demo)',  'DEMO-CUST-005-A', 'IN_STORE_CONSULTATION', 'IN_PERSON', 'PURCHASED',  TIMESTAMPTZ '2026-06-11 09:40:00+07', 'Seed tĩnh: tư vấn Sony WH-1000XM5.'),
        ('Hoàng Ngọc Lan (Demo)',  'DEMO-CUST-005-B', 'FOLLOW_UP',              'PHONE',     'PURCHASED',  TIMESTAMPTZ '2026-07-15 09:00:00+07', 'Seed tĩnh: chăm sóc sau mua sạc USB-C.'),
        ('Vũ Đức Long (Demo)',     'DEMO-CUST-006-A', 'PRODUCT_DEMO',           'IN_PERSON', 'PURCHASED',  TIMESTAMPTZ '2026-06-15 10:30:00+07', 'Seed tĩnh: trải nghiệm Dell XPS 13.'),
        ('Vũ Đức Long (Demo)',     'DEMO-CUST-006-B', 'FOLLOW_UP',              'PHONE',     'DELIVERED',  TIMESTAMPTZ '2026-07-16 09:30:00+07', 'Seed tĩnh: chăm sóc sau mua chuột Logitech.'),
        ('Đỗ Khánh Linh (Demo)',   'DEMO-CUST-007-A', 'IN_STORE_CONSULTATION', 'IN_PERSON', 'PURCHASED',  TIMESTAMPTZ '2026-06-19 13:10:00+07', 'Seed tĩnh: tư vấn Xiaomi 14.'),
        ('Đỗ Khánh Linh (Demo)',   'DEMO-CUST-007-B', 'FOLLOW_UP',              'PHONE',     'INTERESTED', TIMESTAMPTZ '2026-07-17 09:00:00+07', 'Seed tĩnh: theo dõi nhu cầu Redmi Buds.'),
        ('Bùi Tuấn Kiệt (Demo)',   'DEMO-CUST-008-A', 'PRODUCT_DEMO',           'IN_PERSON', 'PURCHASED',  TIMESTAMPTZ '2026-06-23 15:00:00+07', 'Seed tĩnh: trải nghiệm ASUS ROG G14.'),
        ('Bùi Tuấn Kiệt (Demo)',   'DEMO-CUST-008-B', 'FOLLOW_UP',              'PHONE',     'CANCELLED',  TIMESTAMPTZ '2026-07-18 09:30:00+07', 'Seed tĩnh: xác nhận hủy bàn phím ROG.'),
        ('Đặng Mai Phương (Demo)', 'DEMO-CUST-009-A', 'PRODUCT_DEMO',           'IN_PERSON', 'PURCHASED',  TIMESTAMPTZ '2026-06-27 08:15:00+07', 'Seed tĩnh: trải nghiệm Canon EOS R50.'),
        ('Đặng Mai Phương (Demo)', 'DEMO-CUST-009-B', 'FOLLOW_UP',              'PHONE',     'PURCHASED',  TIMESTAMPTZ '2026-07-19 09:00:00+07', 'Seed tĩnh: chăm sóc sau mua thẻ nhớ SanDisk.'),
        ('Hồ Nhật Nam (Demo)',     'DEMO-CUST-010-A', 'IN_STORE_CONSULTATION', 'IN_PERSON', 'PURCHASED',  TIMESTAMPTZ '2026-07-01 12:10:00+07', 'Seed tĩnh: tư vấn LG OLED C3.'),
        ('Hồ Nhật Nam (Demo)',     'DEMO-CUST-010-B', 'FOLLOW_UP',              'PHONE',     'DELIVERED',  TIMESTAMPTZ '2026-07-21 09:30:00+07', 'Seed tĩnh: chăm sóc sau mua LG Soundbar.')
)
INSERT INTO sales_interactions (
    customer_id,
    staff_id,
    order_id,
    interaction_type,
    channel,
    started_at,
    ended_at,
    outcome,
    notes
)
SELECT
    customer.id,
    (SELECT user_id FROM or_user WHERE username = 'manager' LIMIT 1),
    sale_order.so_id,
    seed.interaction_type,
    seed.channel,
    seed.started_at,
    seed.started_at + INTERVAL '20 minutes',
    seed.outcome,
    seed.notes
FROM interaction_seed seed
JOIN customers customer
  ON customer.name = seed.customer_name
JOIN so_sales_order sale_order
  ON sale_order.so_code = seed.order_code
WHERE NOT EXISTS (
    SELECT 1
    FROM sales_interactions existing
    WHERE existing.customer_id = customer.id
      AND existing.notes = seed.notes
);

WITH journey_seed (
    customer_name,
    seed_key,
    journey_started_at,
    expressions,
    states
) AS (
    VALUES
        ('Nguyễn Minh Anh (Demo)', 'customer-001', TIMESTAMPTZ '2026-07-24 09:15:00+07',
         ARRAY['neutral', 'angry', 'fear', 'surprise', 'happy', 'happy'],
         ARRAY['NEUTRAL', 'IMPATIENT', 'CONFUSED', 'ENGAGED', 'DELIGHTED', 'DELIGHTED']),
        ('Trần Quốc Bảo (Demo)', 'customer-002', TIMESTAMPTZ '2026-07-24 16:10:00+07',
         ARRAY['neutral', 'neutral', 'surprise', 'happy', 'happy', 'happy'],
         ARRAY['NEUTRAL', 'NEUTRAL', 'ENGAGED', 'ENGAGED', 'DELIGHTED', 'DELIGHTED']),
        ('Lê Thu Hà (Demo)', 'customer-003', TIMESTAMPTZ '2026-07-24 10:30:00+07',
         ARRAY['neutral', 'surprise', 'fear', 'fear', 'neutral', 'neutral'],
         ARRAY['NEUTRAL', 'CONFUSED', 'CONFUSED', 'CONFUSED', 'NEUTRAL', 'NEUTRAL']),
        ('Phạm Gia Huy (Demo)', 'customer-004', TIMESTAMPTZ '2026-07-24 15:30:00+07',
         ARRAY['neutral', 'neutral', 'surprise', 'surprise', 'happy', 'happy'],
         ARRAY['NEUTRAL', 'NEUTRAL', 'ENGAGED', 'ENGAGED', 'ENGAGED', 'DELIGHTED']),
        ('Hoàng Ngọc Lan (Demo)', 'customer-005', TIMESTAMPTZ '2026-07-25 11:00:00+07',
         ARRAY['neutral', 'angry', 'fear', 'angry', 'sad', 'sad'],
         ARRAY['NEUTRAL', 'IMPATIENT', 'CONFUSED', 'IMPATIENT', 'DISSATISFIED', 'DISSATISFIED']),
        ('Vũ Đức Long (Demo)', 'customer-006', TIMESTAMPTZ '2026-07-25 09:45:00+07',
         ARRAY['neutral', 'neutral', 'surprise', 'happy', 'happy', 'happy'],
         ARRAY['NEUTRAL', 'NEUTRAL', 'ENGAGED', 'ENGAGED', 'DELIGHTED', 'DELIGHTED']),
        ('Đỗ Khánh Linh (Demo)', 'customer-007', TIMESTAMPTZ '2026-07-25 16:20:00+07',
         ARRAY['neutral', 'angry', 'fear', 'surprise', 'happy', 'happy'],
         ARRAY['NEUTRAL', 'IMPATIENT', 'CONFUSED', 'ENGAGED', 'DELIGHTED', 'DELIGHTED']),
        ('Bùi Tuấn Kiệt (Demo)', 'customer-008', TIMESTAMPTZ '2026-07-25 14:10:00+07',
         ARRAY['neutral', 'surprise', 'fear', 'fear', 'neutral', 'neutral'],
         ARRAY['NEUTRAL', 'CONFUSED', 'CONFUSED', 'CONFUSED', 'NEUTRAL', 'NEUTRAL']),
        ('Đặng Mai Phương (Demo)', 'customer-009', TIMESTAMPTZ '2026-07-26 10:20:00+07',
         ARRAY['neutral', 'neutral', 'surprise', 'happy', 'happy', 'happy'],
         ARRAY['NEUTRAL', 'NEUTRAL', 'ENGAGED', 'ENGAGED', 'DELIGHTED', 'DELIGHTED']),
        ('Hồ Nhật Nam (Demo)', 'customer-010', TIMESTAMPTZ '2026-07-26 16:40:00+07',
         ARRAY['neutral', 'angry', 'fear', 'surprise', 'happy', 'happy'],
         ARRAY['NEUTRAL', 'IMPATIENT', 'CONFUSED', 'ENGAGED', 'DELIGHTED', 'DELIGHTED'])
),
journey_step (step_number, camera_id, zone) AS (
    VALUES
        (1, 'CAM-01', 'ENTRANCE'),
        (2, 'CAM-02', 'WAITING'),
        (3, 'CAM-03', 'CONSULTING'),
        (4, 'CAM-04', 'PRODUCT'),
        (5, 'CAM-05', 'CHECKOUT'),
        (6, 'CAM-06', 'EXIT')
)
INSERT INTO experience_sessions (
    id,
    customer_id,
    camera_id,
    zone,
    local_track_id,
    started_at,
    ended_at,
    data_origin
)
SELECT
    MD5('crm-static-v3-' || seed.seed_key || '-' || step.camera_id)::uuid,
    customer.id,
    step.camera_id,
    step.zone,
    'track-static-v3-' || seed.seed_key || '-' || step.step_number,
    seed.journey_started_at + ((step.step_number - 1) * INTERVAL '10 minutes'),
    seed.journey_started_at + ((step.step_number - 1) * INTERVAL '10 minutes') + INTERVAL '6 minutes',
    'SYNTHETIC_METADATA'
FROM journey_seed seed
JOIN customers customer
  ON customer.name = seed.customer_name
CROSS JOIN journey_step step
ON CONFLICT (id) DO NOTHING;

WITH journey_seed (
    customer_name,
    seed_key,
    journey_started_at,
    expressions,
    states
) AS (
    VALUES
        ('Nguyễn Minh Anh (Demo)', 'customer-001', TIMESTAMPTZ '2026-07-24 09:15:00+07',
         ARRAY['neutral', 'angry', 'fear', 'surprise', 'happy', 'happy'],
         ARRAY['NEUTRAL', 'IMPATIENT', 'CONFUSED', 'ENGAGED', 'DELIGHTED', 'DELIGHTED']),
        ('Trần Quốc Bảo (Demo)', 'customer-002', TIMESTAMPTZ '2026-07-24 16:10:00+07',
         ARRAY['neutral', 'neutral', 'surprise', 'happy', 'happy', 'happy'],
         ARRAY['NEUTRAL', 'NEUTRAL', 'ENGAGED', 'ENGAGED', 'DELIGHTED', 'DELIGHTED']),
        ('Lê Thu Hà (Demo)', 'customer-003', TIMESTAMPTZ '2026-07-24 10:30:00+07',
         ARRAY['neutral', 'surprise', 'fear', 'fear', 'neutral', 'neutral'],
         ARRAY['NEUTRAL', 'CONFUSED', 'CONFUSED', 'CONFUSED', 'NEUTRAL', 'NEUTRAL']),
        ('Phạm Gia Huy (Demo)', 'customer-004', TIMESTAMPTZ '2026-07-24 15:30:00+07',
         ARRAY['neutral', 'neutral', 'surprise', 'surprise', 'happy', 'happy'],
         ARRAY['NEUTRAL', 'NEUTRAL', 'ENGAGED', 'ENGAGED', 'ENGAGED', 'DELIGHTED']),
        ('Hoàng Ngọc Lan (Demo)', 'customer-005', TIMESTAMPTZ '2026-07-25 11:00:00+07',
         ARRAY['neutral', 'angry', 'fear', 'angry', 'sad', 'sad'],
         ARRAY['NEUTRAL', 'IMPATIENT', 'CONFUSED', 'IMPATIENT', 'DISSATISFIED', 'DISSATISFIED']),
        ('Vũ Đức Long (Demo)', 'customer-006', TIMESTAMPTZ '2026-07-25 09:45:00+07',
         ARRAY['neutral', 'neutral', 'surprise', 'happy', 'happy', 'happy'],
         ARRAY['NEUTRAL', 'NEUTRAL', 'ENGAGED', 'ENGAGED', 'DELIGHTED', 'DELIGHTED']),
        ('Đỗ Khánh Linh (Demo)', 'customer-007', TIMESTAMPTZ '2026-07-25 16:20:00+07',
         ARRAY['neutral', 'angry', 'fear', 'surprise', 'happy', 'happy'],
         ARRAY['NEUTRAL', 'IMPATIENT', 'CONFUSED', 'ENGAGED', 'DELIGHTED', 'DELIGHTED']),
        ('Bùi Tuấn Kiệt (Demo)', 'customer-008', TIMESTAMPTZ '2026-07-25 14:10:00+07',
         ARRAY['neutral', 'surprise', 'fear', 'fear', 'neutral', 'neutral'],
         ARRAY['NEUTRAL', 'CONFUSED', 'CONFUSED', 'CONFUSED', 'NEUTRAL', 'NEUTRAL']),
        ('Đặng Mai Phương (Demo)', 'customer-009', TIMESTAMPTZ '2026-07-26 10:20:00+07',
         ARRAY['neutral', 'neutral', 'surprise', 'happy', 'happy', 'happy'],
         ARRAY['NEUTRAL', 'NEUTRAL', 'ENGAGED', 'ENGAGED', 'DELIGHTED', 'DELIGHTED']),
        ('Hồ Nhật Nam (Demo)', 'customer-010', TIMESTAMPTZ '2026-07-26 16:40:00+07',
         ARRAY['neutral', 'angry', 'fear', 'surprise', 'happy', 'happy'],
         ARRAY['NEUTRAL', 'IMPATIENT', 'CONFUSED', 'ENGAGED', 'DELIGHTED', 'DELIGHTED'])
),
journey_step (step_number, camera_id, zone) AS (
    VALUES
        (1, 'CAM-01', 'ENTRANCE'),
        (2, 'CAM-02', 'WAITING'),
        (3, 'CAM-03', 'CONSULTING'),
        (4, 'CAM-04', 'PRODUCT'),
        (5, 'CAM-05', 'CHECKOUT'),
        (6, 'CAM-06', 'EXIT')
)
INSERT INTO experience_state_events (
    session_id,
    customer_id,
    camera_id,
    zone,
    observed_at,
    raw_expression,
    raw_expression_confidence,
    experience_state,
    state_confidence,
    expression_probabilities,
    source,
    model_version
)
SELECT
    MD5('crm-static-v3-' || seed.seed_key || '-' || step.camera_id)::uuid,
    customer.id,
    step.camera_id,
    step.zone,
    seed.journey_started_at + ((step.step_number - 1) * INTERVAL '10 minutes') + INTERVAL '3 minutes',
    seed.expressions[step.step_number],
    0.78,
    seed.states[step.step_number],
    0.80,
    CASE
        WHEN seed.expressions[step.step_number] = 'neutral'
            THEN JSONB_BUILD_OBJECT('neutral', 0.78)
        ELSE JSONB_BUILD_OBJECT(seed.expressions[step.step_number], 0.78, 'neutral', 0.22)
    END,
    'SYNTHETIC_DEMO',
    'demo-sequence-v2'
FROM journey_seed seed
JOIN customers customer
  ON customer.name = seed.customer_name
CROSS JOIN journey_step step
WHERE NOT EXISTS (
    SELECT 1
    FROM experience_state_events existing
    WHERE existing.session_id = MD5('crm-static-v3-' || seed.seed_key || '-' || step.camera_id)::uuid
      AND existing.camera_id = step.camera_id
);

WITH summary_seed (
    customer_name,
    order_code,
    pre_purchase_state,
    post_purchase_state,
    pre_purchase_score,
    post_purchase_score
) AS (
    VALUES
        ('Nguyễn Minh Anh (Demo)', 'DEMO-CUST-001-A', 'IMPATIENT', 'DELIGHTED',    0.25, 0.92),
        ('Trần Quốc Bảo (Demo)',   'DEMO-CUST-002-A', 'NEUTRAL',   'DELIGHTED',    0.50, 0.92),
        ('Lê Thu Hà (Demo)',       'DEMO-CUST-003-A', 'CONFUSED',  'NEUTRAL',      0.38, 0.50),
        ('Phạm Gia Huy (Demo)',    'DEMO-CUST-004-A', 'NEUTRAL',   'DELIGHTED',    0.50, 0.92),
        ('Hoàng Ngọc Lan (Demo)',  'DEMO-CUST-005-A', 'IMPATIENT', 'DISSATISFIED', 0.25, 0.10),
        ('Vũ Đức Long (Demo)',     'DEMO-CUST-006-A', 'NEUTRAL',   'DELIGHTED',    0.50, 0.92),
        ('Đỗ Khánh Linh (Demo)',   'DEMO-CUST-007-A', 'IMPATIENT', 'DELIGHTED',    0.25, 0.92),
        ('Bùi Tuấn Kiệt (Demo)',   'DEMO-CUST-008-A', 'CONFUSED',  'NEUTRAL',      0.38, 0.50),
        ('Đặng Mai Phương (Demo)', 'DEMO-CUST-009-A', 'NEUTRAL',   'DELIGHTED',    0.50, 0.92),
        ('Hồ Nhật Nam (Demo)',     'DEMO-CUST-010-A', 'IMPATIENT', 'DELIGHTED',    0.25, 0.92)
)
INSERT INTO purchase_experience_summary (
    order_id,
    customer_id,
    pre_purchase_state,
    post_purchase_state,
    pre_purchase_score,
    post_purchase_score,
    experience_delta,
    confidence,
    evidence_count,
    calculated_at
)
SELECT
    sale_order.so_id,
    customer.id,
    seed.pre_purchase_state,
    seed.post_purchase_state,
    seed.pre_purchase_score,
    seed.post_purchase_score,
    seed.post_purchase_score - seed.pre_purchase_score,
    0.82,
    6,
    TIMESTAMPTZ '2026-07-27 10:00:00+07'
FROM summary_seed seed
JOIN customers customer
  ON customer.name = seed.customer_name
JOIN so_sales_order sale_order
  ON sale_order.so_code = seed.order_code
ON CONFLICT (order_id) DO NOTHING;
