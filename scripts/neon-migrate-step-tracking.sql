-- Migration: Add step-tracking and multi-tree support to tree_sessions
--
-- Run this against your Neon database:
--   psql $NEON_DATABASE_URL -f scripts/neon-migrate-step-tracking.sql

-- New columns for multi-tree + step tracking
ALTER TABLE tree_sessions
  ADD COLUMN IF NOT EXISTS tree_type TEXT NOT NULL DEFAULT 'posso_avere',
  ADD COLUMN IF NOT EXISTS completed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS last_node_id TEXT,
  ADD COLUMN IF NOT EXISTS user_name TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Back-fill existing rows as completed posso_avere sessions
UPDATE tree_sessions
  SET completed = TRUE,
      last_node_id = outcome_id,
      updated_at = now()
  WHERE completed = FALSE AND outcome_id IS NOT NULL;

-- Make outcome columns nullable (step-tracking rows won't have them yet)
ALTER TABLE tree_sessions
  ALTER COLUMN outcome_id DROP NOT NULL,
  ALTER COLUMN outcome_slug DROP NOT NULL;
