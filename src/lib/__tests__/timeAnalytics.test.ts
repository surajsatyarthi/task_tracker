import {
  calculateTotalTime,
  getEfficiencyScore,
  calculateVariance,
  groupTasksByDate,
  getTopOvertimeTasks,
  groupTimeByProject,
  groupTimeByPriority,
  calculateOverallStats,
  formatTimeMinutes
} from '../timeAnalytics';
import { Task } from '@/types/task';

describe('timeAnalytics', () => {
  describe('calculateTotalTime', () => {
    it('should return sum of timer and manual minutes', () => {
      const task: Task = {
        id: '1',
        title: 'Test Task',
        timer_minutes: 30,
        manual_minutes: 20,
        status: 'todo',
        priority: 'urgent_important',
        project_id: 'test',
        user_id: 'user1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      expect(calculateTotalTime(task)).toBe(50);
    });

    it('should handle null/undefined values', () => {
      const task: Task = {
        id: '1',
        title: 'Test Task',
        timer_minutes: null,
        manual_minutes: undefined,
        status: 'todo',
        priority: 'urgent_important',
        project_id: 'test',
        user_id: 'user1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      expect(calculateTotalTime(task)).toBe(0);
    });

    it('should handle only timer minutes', () => {
      const task: Task = {
        id: '1',
        title: 'Test Task',
        timer_minutes: 45,
        status: 'todo',
        priority: 'urgent_important',
        project_id: 'test',
        user_id: 'user1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      expect(calculateTotalTime(task)).toBe(45);
    });
  });

  describe('getEfficiencyScore', () => {
    it('should return "on-time" for variance within ±10%', () => {
      expect(getEfficiencyScore(100, 95)).toBe('on-time');
      expect(getEfficiencyScore(100, 105)).toBe('on-time');
      expect(getEfficiencyScore(100, 100)).toBe('on-time');
    });

    it('should return "overtime" for variance > 10%', () => {
      expect(getEfficiencyScore(100, 111)).toBe('overtime');
      expect(getEfficiencyScore(100, 200)).toBe('overtime');
    });

    it('should return "undertime" for variance < -10%', () => {
      expect(getEfficiencyScore(100, 89)).toBe('undertime');
      expect(getEfficiencyScore(100, 50)).toBe('undertime');
    });

    it('should return "no-estimate" when estimate is 0', () => {
      expect(getEfficiencyScore(0, 50)).toBe('no-estimate');
      expect(getEfficiencyScore(0, 0)).toBe('no-estimate');
    });

    it('should handle exact 10% boundaries', () => {
      expect(getEfficiencyScore(100, 110)).toBe('on-time');
      expect(getEfficiencyScore(100, 90)).toBe('on-time');
    });
  });

  describe('calculateVariance', () => {
    it('should calculate positive variance for overtime', () => {
      expect(calculateVariance(100, 150)).toBe(50);
    });

    it('should calculate negative variance for undertime', () => {
      expect(calculateVariance(100, 75)).toBe(-25);
    });

    it('should return 0 for exact match', () => {
      expect(calculateVariance(100, 100)).toBe(0);
    });

    it('should return 0 when estimate is 0', () => {
      expect(calculateVariance(0, 50)).toBe(0);
    });

    it('should handle decimal values', () => {
      expect(calculateVariance(100, 133.33)).toBeCloseTo(33.33, 1);
    });
  });

  describe('groupTasksByDate', () => {
    it('should group tasks by date and sum minutes', () => {
      const now = new Date();
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          timer_minutes: 30,
          manual_minutes: 20,
          status: 'done',
          priority: 'urgent_important',
          project_id: 'test',
          user_id: 'user1',
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        },
        {
          id: '2',
          title: 'Task 2',
          timer_minutes: 40,
          manual_minutes: 10,
          status: 'done',
          priority: 'urgent_important',
          project_id: 'test',
          user_id: 'user1',
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        }
      ];

      const result = groupTasksByDate(tasks, 7);
      expect(result).toHaveLength(7);
      expect(result[6].minutes).toBe(100); // 50 + 50
    });

    it('should handle empty tasks array', () => {
      const result = groupTasksByDate([], 7);
      expect(result).toHaveLength(7);
      expect(result.every(day => day.minutes === 0)).toBe(true);
    });

    it('should create entries for all days in range', () => {
      const result = groupTasksByDate([], 30);
      expect(result).toHaveLength(30);
    });
  });

  describe('getTopOvertimeTasks', () => {
    it('should return tasks sorted by variance descending', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          estimated_minutes: 100,
          timer_minutes: 150,
          status: 'done',
          priority: 'urgent_important',
          project_id: 'test',
          user_id: 'user1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Task 2',
          estimated_minutes: 100,
          timer_minutes: 200,
          status: 'done',
          priority: 'urgent_important',
          project_id: 'test',
          user_id: 'user1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const result = getTopOvertimeTasks(tasks, 10);
      expect(result).toHaveLength(2);
      expect(result[0].variance).toBeGreaterThan(result[1].variance);
      expect(result[0].task.id).toBe('2'); // 100% variance
      expect(result[1].task.id).toBe('1'); // 50% variance
    });

    it('should limit results to specified count', () => {
      const tasks: Task[] = Array.from({ length: 15 }, (_, i) => ({
        id: `${i}`,
        title: `Task ${i}`,
        estimated_minutes: 100,
        timer_minutes: 150,
        status: 'done' as const,
        priority: 'urgent_important' as const,
        project_id: 'test',
        user_id: 'user1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const result = getTopOvertimeTasks(tasks, 5);
      expect(result).toHaveLength(5);
    });

    it('should filter out tasks without estimates', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          timer_minutes: 150,
          status: 'done',
          priority: 'urgent_important',
          project_id: 'test',
          user_id: 'user1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const result = getTopOvertimeTasks(tasks, 10);
      expect(result).toHaveLength(0);
    });

    it('should only include overtime tasks (positive variance)', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Overtime',
          estimated_minutes: 100,
          timer_minutes: 150,
          status: 'done',
          priority: 'urgent_important',
          project_id: 'test',
          user_id: 'user1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Undertime',
          estimated_minutes: 100,
          timer_minutes: 50,
          status: 'done',
          priority: 'urgent_important',
          project_id: 'test',
          user_id: 'user1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const result = getTopOvertimeTasks(tasks, 10);
      expect(result).toHaveLength(1);
      expect(result[0].task.id).toBe('1');
    });
  });

  describe('groupTimeByProject', () => {
    it('should group time by project', () => {
      const projects = [
        { id: 'p1', name: 'Project 1', color: '#ff0000' },
        { id: 'p2', name: 'Project 2', color: '#00ff00' }
      ];

      const tasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          project_id: 'p1',
          timer_minutes: 60,
          status: 'done',
          priority: 'urgent_important',
          user_id: 'user1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Task 2',
          project_id: 'p2',
          timer_minutes: 90,
          status: 'done',
          priority: 'urgent_important',
          user_id: 'user1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const result = groupTimeByProject(tasks, projects);
      expect(result).toHaveLength(2);
      
      const project1 = result.find(p => p.name === 'Project 1');
      const project2 = result.find(p => p.name === 'Project 2');
      
      expect(project1).toBeDefined();
      expect(project1?.value).toBe(60);
      expect(project2).toBeDefined();
      expect(project2?.value).toBe(90);
    });

    it('should filter out projects with zero time', () => {
      const projects = [
        { id: 'p1', name: 'Project 1', color: '#ff0000' },
        { id: 'p2', name: 'Project 2', color: '#00ff00' }
      ];

      const tasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          project_id: 'p1',
          timer_minutes: 60,
          status: 'done',
          priority: 'urgent_important',
          user_id: 'user1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const result = groupTimeByProject(tasks, projects);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Project 1');
    });
  });

  describe('groupTimeByPriority', () => {
    it('should group time by priority quadrant', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          priority: 'urgent_important',
          timer_minutes: 60,
          status: 'done',
          project_id: 'test',
          user_id: 'user1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Task 2',
          priority: 'not_urgent_important',
          timer_minutes: 90,
          status: 'done',
          project_id: 'test',
          user_id: 'user1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const result = groupTimeByPriority(tasks);
      expect(result.length).toBeGreaterThan(0);
      
      // Find entries by checking if they exist and have correct values
      const urgentImportant = result.find(p => p.value === 60);
      const notUrgentImportant = result.find(p => p.value === 90);
      
      expect(urgentImportant).toBeDefined();
      expect(notUrgentImportant).toBeDefined();
    });

    it('should filter out priorities with zero time', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          priority: 'urgent_important',
          timer_minutes: 60,
          status: 'done',
          project_id: 'test',
          user_id: 'user1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const result = groupTimeByPriority(tasks);
      expect(result).toHaveLength(1);
    });
  });

  describe('calculateOverallStats', () => {
    it('should calculate correct statistics', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          estimated_minutes: 100,
          timer_minutes: 100,
          status: 'done',
          priority: 'urgent_important',
          project_id: 'test',
          user_id: 'user1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Task 2',
          estimated_minutes: 100,
          timer_minutes: 150,
          status: 'done',
          priority: 'urgent_important',
          project_id: 'test',
          user_id: 'user1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const result = calculateOverallStats(tasks);
      expect(result.totalMinutes).toBe(250);
      expect(result.totalHours).toBe(4);
      expect(result.averageMinutes).toBe(125);
      expect(result.tasksTracked).toBe(2);
      expect(result.completedTasks).toBe(2);
      expect(result.efficiencyScore).toBe(125);
      expect(result.onTimeCount).toBe(1);
      expect(result.overtimeCount).toBe(1);
    });

    it('should handle empty tasks array', () => {
      const result = calculateOverallStats([]);
      expect(result.totalMinutes).toBe(0);
      expect(result.averageMinutes).toBe(0);
      expect(result.tasksTracked).toBe(0);
    });

    it('should only count completed tasks with time', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          timer_minutes: 100,
          status: 'done',
          priority: 'urgent_important',
          project_id: 'test',
          user_id: 'user1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Task 2',
          timer_minutes: 50,
          status: 'todo',
          priority: 'urgent_important',
          project_id: 'test',
          user_id: 'user1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const result = calculateOverallStats(tasks);
      expect(result.completedTasks).toBe(1);
      expect(result.tasksTracked).toBe(2);
    });
  });

  describe('formatTimeMinutes', () => {
    it('should format zero minutes', () => {
      expect(formatTimeMinutes(0)).toBe('0m');
    });

    it('should format less than 1 minute', () => {
      expect(formatTimeMinutes(0.5)).toBe('< 1m');
    });

    it('should format minutes only', () => {
      expect(formatTimeMinutes(45)).toBe('45m');
    });

    it('should format hours only', () => {
      expect(formatTimeMinutes(120)).toBe('2h');
    });

    it('should format hours and minutes', () => {
      expect(formatTimeMinutes(125)).toBe('2h 5m');
    });

    it('should round minutes', () => {
      expect(formatTimeMinutes(125.7)).toBe('2h 6m');
    });
  });
});
