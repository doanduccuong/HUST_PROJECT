ALTER TABLE experience_sessions
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'CLOSED',
    ADD COLUMN IF NOT EXISTS source_type VARCHAR(30) NOT NULL DEFAULT 'IMPORT',
    ADD COLUMN IF NOT EXISTS total_frames INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS accepted_frames INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS rejected_frames INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS transition_count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_frame_sequence BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS final_state VARCHAR(30);

ALTER TABLE experience_state_events
    ADD COLUMN IF NOT EXISTS frame_sequence BIGINT,
    ADD COLUMN IF NOT EXISTS captured_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS quality_score DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS accepted BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS reject_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS inference_ms BIGINT,
    ADD COLUMN IF NOT EXISTS previous_state VARCHAR(30),
    ADD COLUMN IF NOT EXISTS state_changed BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS transition_reason VARCHAR(100),
    ADD COLUMN IF NOT EXISTS smoothed_probabilities JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS uq_experience_event_session_sequence
    ON experience_state_events(session_id, frame_sequence)
    WHERE frame_sequence IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_experience_events_session_observed
    ON experience_state_events(session_id, observed_at);

CREATE INDEX IF NOT EXISTS idx_experience_events_source_observed
    ON experience_state_events(source, observed_at DESC);
