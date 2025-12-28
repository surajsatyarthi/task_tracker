-- Fix RLS policies to allow INSERT, UPDATE, DELETE operations
-- The original schema only had SELECT policies, blocking all modifications

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Projects are viewable by everyone" ON projects;
DROP POLICY IF EXISTS "Tasks are viewable by everyone" ON tasks;
DROP POLICY IF EXISTS "Task progress is viewable by everyone" ON task_progress;
DROP POLICY IF EXISTS "CSV imports are viewable by everyone" ON csv_imports;

-- Create comprehensive RLS policies for single-user app
-- Since this is a single-user app, allow all operations for everyone (anon and authenticated)

-- Projects policies
CREATE POLICY "Enable all operations on projects" ON projects FOR ALL USING (true) WITH CHECK (true);

-- Tasks policies  
CREATE POLICY "Enable all operations on tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);

-- Task progress policies
CREATE POLICY "Enable all operations on task_progress" ON task_progress FOR ALL USING (true) WITH CHECK (true);

-- CSV imports policies
CREATE POLICY "Enable all operations on csv_imports" ON csv_imports FOR ALL USING (true) WITH CHECK (true);
