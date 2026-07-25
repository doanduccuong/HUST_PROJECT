CREATE TABLE IF NOT EXISTS offers (
    offer_id INTEGER PRIMARY KEY,
    offer_name VARCHAR(500) NOT NULL,
    status VARCHAR(30) NOT NULL,
    advertiser_id INTEGER,
    advertiser_name VARCHAR(255),
    description TEXT,
    internal_information TEXT,
    landing_page TEXT,
    landing_page_preview TEXT,
    categories TEXT,
    tags TEXT,
    traffic_types TEXT,
    currency VARCHAR(8),
    expiration_date TEXT,
    source_updated_at TEXT,
    source_created_at TEXT,
    goal_1_id INTEGER,
    goal_1_name VARCHAR(255),
    goal_type_1 VARCHAR(30),
    goal_revenue_1 NUMERIC(18, 4),
    goal_payout_1 NUMERIC(18, 4),
    goal_status_1 VARCHAR(30),
    targeting TEXT,
    external_id VARCHAR(255),
    imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN offers.goal_revenue_1 IS
    'Offer goal configuration imported from products.xlsx; not realized CRM sales revenue.';
COMMENT ON COLUMN offers.goal_payout_1 IS
    'Offer payout configuration imported from products.xlsx; not a customer payment.';

CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_advertiser ON offers(advertiser_name);
