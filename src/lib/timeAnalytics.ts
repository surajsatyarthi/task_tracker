import { Task } from '@/types/task';
import { format, startOfDay, endOfDay, subDays, parseISO } from 'date-fns';

/**
 * Calculate total tracked time for a task (timer + manual minutes)
 */
export function calculateTotalTime(task: Task): number {
  return (task.timer_minutes || 0) + (task.manual_minutes || 0);
}

/**
 * Calculate efficiency score comparing estimated vs actual time
 * Returns: 'on-time' (±10%), 'overtime' (>10% over), 'undertime' (<-10% under)
 */
export function getEfficiencyScore(
  estimated: number,
  actual: number
): 'on-time' | 'overtime' | 'undertime' | 'no-estimate' {
  if (!estimated || estimated === 0) return 'no-estimate';
  const variance = ((actual - estimated) / estimated) * 100;
  
  if (variance > 10) return 'overtime';
  if (variance < -10) return 'undertime';
  return 'on-time';
}

/**
 * Calculate variance percentage between estimated and actual time
 */
export function calculateVariance(estimated: number, actual: number): number {
  if (!estimated || estimated === 0) return 0;
  return ((actual - estimated) / estimated) * 100;
}

/**
 * Group tasks by date range and sum total time
 */
export function groupTasksByDate(
  tasks: Task[],
  days: number
): Array<{ date: string; minutes: number }> {
  const result: Record<string, number> = {};
  const now = new Date();
  
  // Initialize all dates in range with 0
  for (let i = days - 1; i >= 0; i--) {
    const date = format(subDays(now, i), 'MMM dd');
    result[date] = 0;
  }
  
  // Sum time for each date
  tasks.forEach(task => {
    const totalTime = calculateTotalTime(task);
    if (totalTime > 0 && task.updated_at) {
      const taskDate = parseISO(task.updated_at);
      const dateKey = format(taskDate, 'MMM dd');
      
      // Only count if within range
      const daysAgo = Math.floor((now.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysAgo < days && result[dateKey] !== undefined) {
        result[dateKey] += totalTime;
      }
    }
  });
  
  return Object.entries(result).map(([date, minutes]) => ({
    date,
    minutes
  }));
}

/**
 * Get top N tasks with most overtime
 */
export function getTopOvertimeTasks(
  tasks: Task[],
  limit: number = 10
): Array<{ task: Task; variance: number; actual: number }> {
  return tasks
    .filter(task => {
      const estimated = task.estimated_minutes || 0;
      const actual = calculateTotalTime(task);
      return estimated > 0 && actual > 0;
    })
    .map(task => ({
      task,
      actual: calculateTotalTime(task),
      variance: calculateVariance(task.estimated_minutes || 0, calculateTotalTime(task))
    }))
    .filter(item => item.variance > 0) // Only overtime
    .sort((a, b) => b.variance - a.variance)
    .slice(0, limit);
}

/**
 * Group time by project
 */
export function groupTimeByProject(
  tasks: Task[],
  projects: Array<{ id: string; name: string; color: string }>
): Array<{ name: string; value: number; color: string }> {
  const projectTime: Record<string, { minutes: number; color: string }> = {};
  
  tasks.forEach(task => {
    const totalTime = calculateTotalTime(task);
    if (totalTime > 0) {
      const projectId = task.project_id;
      if (!projectTime[projectId]) {
        const project = projects.find(p => p.id === projectId);
        projectTime[projectId] = {
          minutes: 0,
          color: project?.color || '#6b7280'
        };
      }
      projectTime[projectId].minutes += totalTime;
    }
  });
  
  return Object.entries(projectTime)
    .map(([projectId, data]) => {
      const project = projects.find(p => p.id === projectId);
      return {
        name: project?.name || 'Unknown',
        value: data.minutes,
        color: data.color
      };
    })
    .sort((a, b) => b.value - a.value);
}

/**
 * Group time by priority quadrant
 */
export function groupTimeByPriority(
  tasks: Task[]
): Array<{ name: string; value: number; color: string }> {
  const priorityMap = {
    urgent_important: { name: 'Urgent & Important', color: '#ef4444' },
    urgent_not_important: { name: 'Urgent', color: '#f97316' },
    not_urgent_important: { name: 'Important', color: '#22c55e' },
    not_urgent_not_important: { name: 'Neither', color: '#3b82f6' }
  };
  
  const priorityTime: Record<string, number> = {
    urgent_important: 0,
    urgent_not_important: 0,
    not_urgent_important: 0,
    not_urgent_not_important: 0
  };
  
  tasks.forEach(task => {
    const totalTime = calculateTotalTime(task);
    if (totalTime > 0 && task.priority) {
      priorityTime[task.priority] += totalTime;
    }
  });
  
  return Object.entries(priorityTime)
    .map(([key, value]) => ({
      name: priorityMap[key as keyof typeof priorityMap].name,
      value,
      color: priorityMap[key as keyof typeof priorityMap].color
    }))
    .filter(item => item.value > 0);
}

/**
 * Calculate overall statistics
 */
export function calculateOverallStats(tasks: Task[]) {
  const tasksWithTime = tasks.filter(task => calculateTotalTime(task) > 0);
  const totalMinutes = tasksWithTime.reduce((sum, task) => sum + calculateTotalTime(task), 0);
  const completedTasks = tasks.filter(task => task.status === 'done');
  const completedWithTime = completedTasks.filter(task => calculateTotalTime(task) > 0);
  
  const tasksWithEstimates = tasks.filter(task => (task.estimated_minutes || 0) > 0 && calculateTotalTime(task) > 0);
  let efficiencyScore = 0;
  
  if (tasksWithEstimates.length > 0) {
    const totalEstimated = tasksWithEstimates.reduce((sum, task) => sum + (task.estimated_minutes || 0), 0);
    const totalActual = tasksWithEstimates.reduce((sum, task) => sum + calculateTotalTime(task), 0);
    efficiencyScore = totalEstimated > 0 ? (totalActual / totalEstimated) * 100 : 0;
  }
  
  return {
    totalMinutes,
    totalHours: Math.floor(totalMinutes / 60),
    averageMinutes: tasksWithTime.length > 0 ? Math.round(totalMinutes / tasksWithTime.length) : 0,
    tasksTracked: tasksWithTime.length,
    completedTasks: completedWithTime.length,
    efficiencyScore: Math.round(efficiencyScore),
    onTimeCount: tasksWithEstimates.filter(t => getEfficiencyScore(t.estimated_minutes || 0, calculateTotalTime(t)) === 'on-time').length,
    overtimeCount: tasksWithEstimates.filter(t => getEfficiencyScore(t.estimated_minutes || 0, calculateTotalTime(t)) === 'overtime').length,
    undertimeCount: tasksWithEstimates.filter(t => getEfficiencyScore(t.estimated_minutes || 0, calculateTotalTime(t)) === 'undertime').length
  };
}

/**
 * Format minutes to readable string
 */
export function formatTimeMinutes(minutes: number): string {
  if (minutes === 0) return '0m';
  if (minutes < 1) return '< 1m';
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}
