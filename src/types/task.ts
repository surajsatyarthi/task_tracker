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
  import_summary: Record<string, unknown>;
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

export const priorityConfig = {
  urgent_important: { label: 'Do First', color: 'bg-red-100 text-red-800', icon: '🚨' },
  urgent_not_important: { label: 'Delegate', color: 'bg-orange-100 text-orange-800', icon: '⏰' },
  not_urgent_important: { label: 'Schedule', color: 'bg-green-100 text-green-800', icon: '📅' },
  not_urgent_not_important: { label: 'Eliminate', color: 'bg-blue-100 text-blue-800', icon: '🗑️' },
};

export const priorityColorMap = {
  urgent_important: 'bg-red-500',
  urgent_not_important: 'bg-orange-500',
  not_urgent_important: 'bg-green-500',
  not_urgent_not_important: 'bg-blue-500',
};

export const statusIconMap = {
  done: '✅',
  doing: '🔄',
  on_hold: '⏸️',
  help_me: '🆘',
  todo: '📝',
};

// Task sorting utilities
const statusOrder: Record<TaskStatus, number> = {
  'todo': 1,
  'doing': 2,
  'on_hold': 3,
  'help_me': 4,
  'done': 5,
};

const priorityOrder: Record<TaskPriority, number> = {
  'urgent_important': 1,
  'urgent_not_important': 2,
  'not_urgent_important': 3,
  'not_urgent_not_important': 4,
};

export const sortTasks = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    // First sort by status
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    
    // Then sort by priority (Eisenhower Matrix)
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Finally sort by creation date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
};

export const sortTasksForMatrix = (tasks: Task[], priority: TaskPriority): Task[] => {
  const priorityTasks = tasks.filter(task => task.priority === priority);
  return [...priorityTasks].sort((a, b) => {
    // Sort by status first
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    
    // Then by creation date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
};

// Date utility functions
export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const isTaskOverdue = (task: Task): boolean => {
  if (!task.due_date || task.status === 'done') return false;
  const today = getTodayDate();
  return task.due_date < today;
};

export const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const getDaysUntilDue = (dueDate: string): number => {
  const today = new Date(getTodayDate());
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
