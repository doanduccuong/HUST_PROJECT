-- Keep Flyway V3 immutable after it has been applied.
-- This migration removes the demo marker from all human-facing names.

UPDATE customers
SET name = REPLACE(name, ' (Demo)', '')
WHERE name IN (
    'Keanu Reeves (Demo)',
    'Emma Watson (Demo)',
    'Nguyễn Minh Anh (Demo)',
    'Trần Quốc Bảo (Demo)',
    'Lê Thu Hà (Demo)',
    'Phạm Gia Huy (Demo)',
    'Hoàng Ngọc Lan (Demo)',
    'Vũ Đức Long (Demo)',
    'Đỗ Khánh Linh (Demo)',
    'Bùi Tuấn Kiệt (Demo)',
    'Đặng Mai Phương (Demo)',
    'Hồ Nhật Nam (Demo)'
);

UPDATE so_sales_order
SET lead_name = REPLACE(lead_name, ' (Demo)', '')
WHERE lead_name LIKE '% (Demo)';

UPDATE or_user
SET fullname = 'CRM Manager'
WHERE username = 'manager'
  AND fullname = 'Demo CRM Manager';

UPDATE so_sales_order
SET assigned = 'CRM Manager'
WHERE assigned = 'Demo CRM Manager';
