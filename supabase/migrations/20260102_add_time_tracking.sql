-- Add time tracking columns to tasks table
-- Migration created: January 2, 2026
-- Purpose: Enable timer functionality and Parkinson's Law time tracking

ALTER TABLE tasks 
  ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS timer_minutes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS manual_minutes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS timer_started_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS timer_running BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_timer_sync TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add indexes for timer queries
CREATE INDEX IF NOT EXISTS idx_tasks_timer_running ON tasks(timer_running) WHERE timer_running = true;
CREATE INDEX IF NOT EXISTS idx_tasks_timer_started ON tasks(timer_started_at) WHERE timer_started_at IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN tasks.estimated_minutes IS 'User estimated time to complete task in minutes';
COMMENT ON COLUMN tasks.timer_minutes IS 'Actual time tracked by timer in minutes';
COMMENT ON COLUMN tasks.manual_minutes IS 'Manually entered time in minutes';
COMMENT ON COLUMN tasks.timer_started_at IS 'Timestamp when timer was started';
COMMENT ON COLUMN tasks.timer_running IS 'Whether timer is currently running';
COMMENT ON COLUMN tasks.last_timer_sync IS 'Last time timer was synced to database';
