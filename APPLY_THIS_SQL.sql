-- Copy and paste this entire SQL into Supabase SQL Editor
-- Then click "RUN" button

ALTER TABLE tasks 
  ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS timer_minutes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS manual_minutes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS timer_started_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS timer_running BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_timer_sync TIMESTAMP WITH TIME ZONE DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_timer_running ON tasks(timer_running) WHERE timer_running = true;
CREATE INDEX IF NOT EXISTS idx_tasks_timer_started ON tasks(timer_started_at) WHERE timer_started_at IS NOT NULL;
