-- Add user_id column to tasks table for single-user app
-- Run this in Supabase SQL Editor

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);

-- Optional: Set default user_id for all existing tasks (if any)
-- Replace 'your-user-id' with actual user ID from auth.users table
-- UPDATE tasks SET user_id = 'your-user-id' WHERE user_id IS NULL;
