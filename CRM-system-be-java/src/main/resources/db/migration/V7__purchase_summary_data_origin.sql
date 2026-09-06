ALTER TABLE purchase_experience_summary
    ADD COLUMN IF NOT EXISTS data_origin VARCHAR(30) NOT NULL DEFAULT 'REAL_MODEL';

UPDATE purchase_experience_summary summary
SET data_origin = 'SYNTHETIC_DEMO'
WHERE EXISTS (
    SELECT 1
    FROM experience_sessions session
    WHERE session.customer_id = summary.customer_id
      AND session.data_origin IN ('SYNTHETIC_METADATA', 'SYNTHETIC_DEMO')
)
AND NOT EXISTS (
    SELECT 1
    FROM experience_sessions session
    WHERE session.customer_id = summary.customer_id
      AND session.data_origin NOT IN ('SYNTHETIC_METADATA', 'SYNTHETIC_DEMO')
);

CREATE INDEX IF NOT EXISTS idx_purchase_experience_data_origin
    ON purchase_experience_summary(data_origin, calculated_at DESC);
