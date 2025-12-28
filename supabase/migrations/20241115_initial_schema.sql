-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#6366f1',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'doing', 'done', 'on_hold', 'help_me')),
  priority VARCHAR(30) DEFAULT 'not_urgent_not_important' CHECK (priority IN ('urgent_important', 'urgent_not_important', 'not_urgent_important', 'not_urgent_not_important')),
  is_urgent BOOLEAN DEFAULT false,
  is_important BOOLEAN DEFAULT false,
  owner VARCHAR(255),
  department VARCHAR(255),
  due_date DATE,
  completed_date DATE,
  remarks TEXT,
  links TEXT[], -- Array of strings for links
  tags TEXT[], -- Array of strings for tags
  original_csv_row INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create task_progress table for daily tracking
CREATE TABLE IF NOT EXISTS task_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  progress_value VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, date)
);

-- Create csv_imports table for tracking imports
CREATE TABLE IF NOT EXISTS csv_imports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  filename VARCHAR(500) NOT NULL,
  total_rows INTEGER,
  successful_imports INTEGER DEFAULT 0,
  failed_imports INTEGER DEFAULT 0,
  import_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  import_summary JSONB
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_task_progress_task_id ON task_progress(task_id);
CREATE INDEX IF NOT EXISTS idx_csv_imports_project_id ON csv_imports(project_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default projects (4 projects for personal use)
INSERT INTO projects (name, slug, color, description) VALUES
  ('Personal', 'personal', '#6366f1', 'Personal tasks and goals'),
  ('CSuite', 'csuite', '#dc2626', 'CSuite project tasks'),
  ('Health', 'health', '#f59e0b', 'Health and wellness tracking'),
  ('Journaling', 'journaling', '#8b5cf6', 'Daily journaling and reflection')
ON CONFLICT (slug) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE csv_imports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies for now, will add user-based policies later)
CREATE POLICY "Projects are viewable by everyone" ON projects FOR SELECT USING (true);
CREATE POLICY "Tasks are viewable by everyone" ON tasks FOR SELECT USING (true);
CREATE POLICY "Task progress is viewable by everyone" ON task_progress FOR SELECT USING (true);
CREATE POLICY "CSV imports are viewable by everyone" ON csv_imports FOR SELECT USING (true);

-- Grant permissions
GRANT ALL ON projects TO anon;
GRANT ALL ON tasks TO anon;
GRANT ALL ON task_progress TO anon;
GRANT ALL ON csv_imports TO anon;
GRANT ALL ON projects TO authenticated;
GRANT ALL ON tasks TO authenticated;
GRANT ALL ON task_progress TO authenticated;
GRANT ALL ON csv_imports TO authenticated;