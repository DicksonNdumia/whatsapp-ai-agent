-- Idempotent: safe to run on every startup, and safe on the existing `messages` table.

CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  phone TEXT NOT NULL,
  sender_name TEXT,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE messages ADD COLUMN IF NOT EXISTS id BIGSERIAL;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS direction TEXT NOT NULL DEFAULT 'in';
ALTER TABLE messages ADD COLUMN IF NOT EXISTS wa_message_id TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS msg_type TEXT NOT NULL DEFAULT 'text';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema() AND table_name = 'messages'
      AND column_name = 'created_at' AND data_type = 'timestamp without time zone'
  ) THEN
    ALTER TABLE messages ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_messages_phone_id ON messages (phone, id DESC);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages (created_at);
CREATE UNIQUE INDEX IF NOT EXISTS uq_messages_wa_id ON messages (wa_message_id) WHERE wa_message_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS conversations (
  phone TEXT PRIMARY KEY,
  sender_name TEXT,
  paused BOOLEAN NOT NULL DEFAULT false,
  paused_reason TEXT,
  paused_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leads (
  id BIGSERIAL PRIMARY KEY,
  phone TEXT NOT NULL,
  name TEXT,
  project_type TEXT,
  budget TEXT,
  timeline TEXT,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads (phone);

CREATE TABLE IF NOT EXISTS meeting_requests (
  id BIGSERIAL PRIMARY KEY,
  phone TEXT NOT NULL,
  name TEXT,
  preferred_time TEXT,
  topic TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usage_log (
  id BIGSERIAL PRIMARY KEY,
  phone TEXT,
  kind TEXT NOT NULL,
  model TEXT,
  prompt_tokens INT NOT NULL DEFAULT 0,
  output_tokens INT NOT NULL DEFAULT 0,
  total_tokens INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_usage_created ON usage_log (created_at);

CREATE TABLE IF NOT EXISTS jobs (
  id BIGSERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 4,
  run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  locked_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_jobs_pending ON jobs (status, run_at);
