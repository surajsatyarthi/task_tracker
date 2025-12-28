# Task Tracker - Database Schema

## Database Tables

### Projects Table
```sql
projects {
  id: string (primary key)
  name: string (e.g., "Personal", "CSuite", "Health", "Journaling", "LinkedIn")
  slug: string (e.g., "personal", "csuite", "health", "journaling", "linkedin")
  description: string
  color: string (hex color for UI)
  is_active: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

### Tasks Table
```sql
tasks {
  id: string (primary key)
  project_id: string (foreign key to projects)
  title: string
  description: text
  status: enum ('todo', 'doing', 'done', 'on_hold', 'help_me')
  priority: enum ('urgent_important', 'urgent_not_important', 'not_urgent_important', 'not_urgent_not_important')
  
  -- Eisenhower Matrix Classification
  is_urgent: boolean
  is_important: boolean
  
  -- Assignment & Ownership
  owner: string
  department: string
  
  -- Tracking
  due_date: date (optional)
  completed_date: date (optional)
  
  -- Additional Data
  remarks: text
  links: array<string>
  tags: array<string>
  
  -- Import tracking
  original_csv_row: integer (for tracking CSV imports)
  
  created_at: timestamp
  updated_at: timestamp
}
```

### Task Progress Table (for daily tracking like CSV)
```sql
task_progress {
  id: string (primary key)
  task_id: string (foreign key to tasks)
  date: date
  progress_value: string (could be number or text like "1", "done", etc.)
  notes: text
  created_at: timestamp
}
```

### CSV Import Logs Table
```sql
csv_imports {
  id: string (primary key)
  project_id: string (foreign key to projects)
  filename: string
  total_rows: integer
  successful_imports: integer
  failed_imports: integer
  import_date: timestamp
  import_summary: json (details about what was imported)
}
```

## Eisenhower Matrix Classification

### Priority Mapping
- `urgent_important` → Do First (Red quadrant)
- `urgent_not_important` → Delegate (Orange quadrant) 
- `not_urgent_important` → Schedule (Green quadrant)
- `not_urgent_not_important` → Eliminate (Blue quadrant)

### Status Mapping from CSV
- "Done" → 'done'
- "Doing" → 'doing'  
- "To do" → 'todo'
- "On hold" → 'on_hold'
- "Help me" → 'help_me'

## Sample Data Structure

### Projects
```json
[
  { "id": "p1", "name": "Personal", "slug": "personal", "color": "#6366f1" },
  { "id": "p2", "name": "CSuite", "slug": "csuite", "color": "#dc2626" },
  { "id": "p3", "name": "Health", "slug": "health", "color": "#f59e0b" },
  { "id": "p4", "name": "Journaling", "slug": "journaling", "color": "#8b5cf6" }
]
```
  { "id": "p2", "name": "CSuite", "slug": "csuite", "color": "#dc2626" },
  { "id": "p3", "name": "Health", "slug": "health", "color": "#059669" },
  { "id": "p4", "name": "Journaling", "slug": "journaling", "color": "#7c3aed" },
  { "id": "p5", "name": "LinkedIn", "slug": "linkedin", "color": "#0a66c2" }
]
```

### Tasks with Eisenhower Classification
```json
{
  "id": "t1",
  "project_id": "p3",
  "title": "LinkedIn Banner",
  "owner": "Najib", 
  "status": "done",
  "priority": "urgent_important",
  "is_urgent": true,
  "is_important": true,
  "department": "",
  "remarks": "",
  "links": []
}
```

## API Endpoints

### Projects
- GET /api/projects
- POST /api/projects
- PUT /api/projects/:id
- DELETE /api/projects/:id

### Tasks
- GET /api/tasks
- GET /api/tasks?project=:slug
- GET /api/tasks?priority=:priority
- POST /api/tasks
- PUT /api/tasks/:id
- DELETE /api/tasks/:id
- PATCH /api/tasks/:id/status
- PATCH /api/tasks/:id/priority

### CSV Import
- POST /api/import/csv
- GET /api/import/history
- GET /api/import/:id/details

### Dashboard
- GET /api/dashboard/matrix-summary
- GET /api/dashboard/project-stats  
- GET /api/dashboard/progress-trends