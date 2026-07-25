CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    gender VARCHAR(50),
    age INTEGER,
    user_image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_embeddings (
    id BIGSERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    face_region VARCHAR(16) NOT NULL,
    face_vector vector(512) NOT NULL,
    model_version VARCHAR(100) NOT NULL DEFAULT 'legacy',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_customer_embedding_region UNIQUE (customer_id, face_region)
);

ALTER TABLE customer_embeddings
    ADD COLUMN IF NOT EXISTS model_version VARCHAR(100) NOT NULL DEFAULT 'legacy',
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS so_sales_order (
    so_id SERIAL PRIMARY KEY,
    so_code VARCHAR(255) NOT NULL UNIQUE,
    lead_name VARCHAR(255),
    lead_phone VARCHAR(100),
    product_name VARCHAR(255),
    delivery_service VARCHAR(255),
    cross_sell VARCHAR(255),
    affiliate_id VARCHAR(255),
    sub_id1 VARCHAR(255),
    amount DOUBLE PRECISION,
    agency VARCHAR(255),
    assigned VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE so_sales_order
    ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id),
    ADD COLUMN IF NOT EXISTS staff_id INTEGER,
    ADD COLUMN IF NOT EXISTS product_id INTEGER,
    ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS currency VARCHAR(8) NOT NULL DEFAULT 'USD',
    ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'CREATED',
    ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS sales_interactions (
    id BIGSERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    staff_id INTEGER,
    order_id INTEGER REFERENCES so_sales_order(so_id) ON DELETE SET NULL,
    interaction_type VARCHAR(30) NOT NULL,
    channel VARCHAR(30) NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    outcome VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS experience_sessions (
    id UUID PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    camera_id VARCHAR(50) NOT NULL,
    zone VARCHAR(50) NOT NULL,
    local_track_id VARCHAR(100) NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    data_origin VARCHAR(20) NOT NULL DEFAULT 'SYNTHETIC_METADATA',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS experience_state_events (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES experience_sessions(id) ON DELETE CASCADE,
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    camera_id VARCHAR(50) NOT NULL,
    zone VARCHAR(50) NOT NULL,
    observed_at TIMESTAMPTZ NOT NULL,
    raw_expression VARCHAR(30) NOT NULL,
    raw_expression_confidence DOUBLE PRECISION NOT NULL,
    experience_state VARCHAR(30) NOT NULL,
    state_confidence DOUBLE PRECISION NOT NULL,
    expression_probabilities JSONB NOT NULL DEFAULT '{}'::jsonb,
    source VARCHAR(30) NOT NULL DEFAULT 'MODEL',
    model_version VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_experience_summary (
    order_id INTEGER PRIMARY KEY REFERENCES so_sales_order(so_id) ON DELETE CASCADE,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    pre_purchase_state VARCHAR(30),
    post_purchase_state VARCHAR(30),
    pre_purchase_score DOUBLE PRECISION,
    post_purchase_score DOUBLE PRECISION,
    experience_delta DOUBLE PRECISION,
    confidence DOUBLE PRECISION,
    evidence_count INTEGER NOT NULL DEFAULT 0,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS face_search_audit (
    search_id UUID PRIMARY KEY,
    trace_id VARCHAR(100),
    requested_by INTEGER,
    source VARCHAR(30) NOT NULL,
    result_status VARCHAR(30) NOT NULL,
    selected_customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    best_distance DOUBLE PRECISION,
    quality_score DOUBLE PRECISION,
    dominant_expression VARCHAR(30),
    experience_state VARCHAR(30),
    candidate_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_customer_embeddings_region
    ON customer_embeddings(customer_id, face_region);
CREATE INDEX IF NOT EXISTS idx_orders_customer_created
    ON so_sales_order(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_staff_created
    ON so_sales_order(staff_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_interactions_customer_started
    ON sales_interactions(customer_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_experience_events_customer_observed
    ON experience_state_events(customer_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_experience_events_session_observed
    ON experience_state_events(session_id, observed_at);
