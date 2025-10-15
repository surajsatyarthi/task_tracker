export type TaskStatus = 'todo' | 'doing' | 'done' | 'on_hold' | 'help_me';

export type TaskPriority = 
  | 'urgent_important' 
  | 'urgent_not_important' 
  | 'not_urgent_important' 
  | 'not_urgent_not_important';

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  
  // Eisenhower Matrix Classification
  is_urgent: boolean;
  is_important: boolean;
  
  // Assignment & Ownership
  owner?: string;
  department?: string;
  
  // Tracking
  due_date?: string;
  completed_date?: string;
  
  // Additional Data
  remarks?: string;
  links?: string[];
  tags?: string[];
  
  // Import tracking
  original_csv_row?: number;
  
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskProgress {
  id: string;
  task_id: string;
  date: string;
  progress_value: string;
  notes?: string;
  created_at: string;
}

export interface CSVImportLog {
  id: string;
  project_id: string;
  filename: string;
  total_rows: number;
  successful_imports: number;
  failed_imports: number;
  import_date: string;
  import_summary: Record<string, any>;
}

// Helper functions for priority mapping
export const getPriorityFromFlags = (isUrgent: boolean, isImportant: boolean): TaskPriority => {
  if (isUrgent && isImportant) return 'urgent_important';
  if (isUrgent && !isImportant) return 'urgent_not_important';
  if (!isUrgent && isImportant) return 'not_urgent_important';
  return 'not_urgent_not_important';
};

export const getFlagsFromPriority = (priority: TaskPriority): { isUrgent: boolean; isImportant: boolean } => {
  switch (priority) {
    case 'urgent_important':
      return { isUrgent: true, isImportant: true };
    case 'urgent_not_important':
      return { isUrgent: true, isImportant: false };
    case 'not_urgent_important':
      return { isUrgent: false, isImportant: true };
    case 'not_urgent_not_important':
      return { isUrgent: false, isImportant: false };
    default:
      return { isUrgent: false, isImportant: false };
  }
};

export const statusConfig = {
  todo: { label: 'To Do', color: 'bg-gray-100 text-gray-800', icon: '📝' },
  doing: { label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: '🔄' },
  done: { label: 'Done', color: 'bg-green-100 text-green-800', icon: '✅' },
  on_hold: { label: 'On Hold', color: 'bg-yellow-100 text-yellow-800', icon: '⏸️' },
  help_me: { label: 'Help Needed', color: 'bg-purple-100 text-purple-800', icon: '🆘' },
};

// CSV parsing helpers
export const parseCSVStatus = (status: string): TaskStatus => {
  const normalizedStatus = status.toLowerCase().trim();
  if (normalizedStatus.includes('done')) return 'done';
  if (normalizedStatus.includes('doing')) return 'doing';
  if (normalizedStatus.includes('help')) return 'help_me';
  if (normalizedStatus.includes('hold')) return 'on_hold';
  return 'todo';
};

export const parseCSVPriority = (priority: string): TaskPriority => {
  const normalizedPriority = priority.toLowerCase().trim();
  
  const isUrgent = normalizedPriority.includes('urgent');
  const isImportant = normalizedPriority.includes('imp');
  
  return getPriorityFromFlags(isUrgent, isImportant);
};