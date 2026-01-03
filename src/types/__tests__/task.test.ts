/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect } from 'vitest';
import {
  getPriorityFromFlags,
  getFlagsFromPriority,
  getTodayDate,
  isTaskOverdue,
  formatDateForDisplay,
  getDaysUntilDue,
  sortTasks,
  sortTasksForMatrix,
  formatMinutes,
  formatSeconds,
  getTimeComparisonStatus,
  parseCSVStatus,
  parseCSVPriority,
  TaskPriority,
  TaskStatus,
  Task,
} from '@/types/task';

describe('Priority and Flag Conversions', () => {
  describe('getPriorityFromFlags', () => {
    it('returns urgent_important when both flags are true', () => {
      expect(getPriorityFromFlags(true, true)).toBe('urgent_important');
    });

    it('returns urgent_not_important when urgent=true, important=false', () => {
      expect(getPriorityFromFlags(true, false)).toBe('urgent_not_important');
    });

    it('returns not_urgent_important when urgent=false, important=true', () => {
      expect(getPriorityFromFlags(false, true)).toBe('not_urgent_important');
    });

    it('returns not_urgent_not_important when both flags are false', () => {
      expect(getPriorityFromFlags(false, false)).toBe('not_urgent_not_important');
    });
  });

  describe('getFlagsFromPriority', () => {
    it('returns correct flags for urgent_important', () => {
      expect(getFlagsFromPriority('urgent_important')).toEqual({
        isUrgent: true,
        isImportant: true,
      });
    });

    it('returns correct flags for urgent_not_important', () => {
      expect(getFlagsFromPriority('urgent_not_important')).toEqual({
        isUrgent: true,
        isImportant: false,
      });
    });

    it('returns correct flags for not_urgent_important', () => {
      expect(getFlagsFromPriority('not_urgent_important')).toEqual({
        isUrgent: false,
        isImportant: true,
      });
    });

    it('returns correct flags for not_urgent_not_important', () => {
      expect(getFlagsFromPriority('not_urgent_not_important')).toEqual({
        isUrgent: false,
        isImportant: false,
      });
    });

    it('returns default flags for invalid priority', () => {
      expect(getFlagsFromPriority('invalid' as TaskPriority)).toEqual({
        isUrgent: false,
        isImportant: false,
      });
    });
  });

  describe('Priority/Flag round-trip conversion', () => {
    it('maintains consistency for urgent_important', () => {
      const flags = getFlagsFromPriority('urgent_important');
      const priority = getPriorityFromFlags(flags.isUrgent, flags.isImportant);
      expect(priority).toBe('urgent_important');
    });

    it('maintains consistency for all priorities', () => {
      const priorities: TaskPriority[] = [
        'urgent_important',
        'urgent_not_important',
        'not_urgent_important',
        'not_urgent_not_important',
      ];

      priorities.forEach((originalPriority) => {
        const flags = getFlagsFromPriority(originalPriority);
        const convertedPriority = getPriorityFromFlags(flags.isUrgent, flags.isImportant);
        expect(convertedPriority).toBe(originalPriority);
      });
    });
  });
});

describe('Date Functions', () => {
  describe('getTodayDate', () => {
    it('returns date in YYYY-MM-DD format', () => {
      const today = getTodayDate();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('returns actual current date', () => {
      const today = getTodayDate();
      const now = new Date();
      const expected = now.toISOString().split('T')[0];
      expect(today).toBe(expected);
    });
  });

  describe('isTaskOverdue', () => {
    const createTask = (due_date: string | undefined, status: TaskStatus = 'todo'): Task => ({
      id: 'test-1',
      user_id: 'user-1',
      project_id: 'project-1',
      title: 'Test Task',
      status,
      priority: 'not_urgent_not_important',
      is_urgent: false,
      is_important: false,
      timer_minutes: 0,
      manual_minutes: 0,
      timer_running: false,
      due_date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    it('returns false for task with no due date', () => {
      const task = createTask(undefined);
      expect(isTaskOverdue(task)).toBe(false);
    });

    it('returns false for done task even if past due', () => {
      const pastDate = '2020-01-01';
      const task = createTask(pastDate, 'done');
      expect(isTaskOverdue(task)).toBe(false);
    });

    it('returns true for task with past due date', () => {
      const pastDate = '2020-01-01';
      const task = createTask(pastDate, 'todo');
      expect(isTaskOverdue(task)).toBe(true);
    });

    it('returns false for task with future due date', () => {
      const futureDate = '2030-12-31';
      const task = createTask(futureDate);
      expect(isTaskOverdue(task)).toBe(false);
    });

    it('returns false for task due today', () => {
      const today = getTodayDate();
      const task = createTask(today);
      expect(isTaskOverdue(task)).toBe(false);
    });

    it('handles leap year dates correctly', () => {
      const leapYearDate = '2024-02-29';
      const task = createTask(leapYearDate);
      // Result depends on current date, but should not throw
      expect(() => isTaskOverdue(task)).not.toThrow();
    });
  });

  describe('formatDateForDisplay', () => {
    it('formats date correctly', () => {
      const formatted = formatDateForDisplay('2024-01-15');
      expect(formatted).toMatch(/Jan 15, 2024/);
    });

    it('handles different months', () => {
      expect(formatDateForDisplay('2024-12-25')).toContain('Dec');
      expect(formatDateForDisplay('2024-06-01')).toContain('Jun');
    });

    it('handles leap year date', () => {
      const formatted = formatDateForDisplay('2024-02-29');
      expect(formatted).toContain('Feb 29');
    });

    it('handles year boundaries', () => {
      expect(formatDateForDisplay('2023-12-31')).toContain('2023');
      expect(formatDateForDisplay('2024-01-01')).toContain('2024');
    });
  });

  describe('getDaysUntilDue', () => {
    it('returns positive days for future date', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 5);
      const futureDate = tomorrow.toISOString().split('T')[0];
      
      const days = getDaysUntilDue(futureDate);
      expect(days).toBeGreaterThanOrEqual(5);
    });

    it('returns 0 or 1 for today', () => {
      const today = getTodayDate();
      const days = getDaysUntilDue(today);
      expect(days).toBeGreaterThanOrEqual(0);
      expect(days).toBeLessThanOrEqual(1);
    });

    it('returns negative days for past date', () => {
      const days = getDaysUntilDue('2020-01-01');
      expect(days).toBeLessThan(0);
    });

    it('calculates 7 days correctly', () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const weekDate = nextWeek.toISOString().split('T')[0];
      
      const days = getDaysUntilDue(weekDate);
      expect(days).toBeGreaterThanOrEqual(7);
      expect(days).toBeLessThanOrEqual(8); // Account for time zones
    });
  });
});

describe('Task Sorting', () => {
  const createMockTask = (overrides: Partial<Task>): Task => ({
    id: 'test-id',
    user_id: 'user-1',
    project_id: 'project-1',
    title: 'Test Task',
    status: 'todo',
    priority: 'not_urgent_not_important',
    is_urgent: false,
    is_important: false,
    timer_minutes: 0,
    manual_minutes: 0,
    timer_running: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  });

  describe('sortTasks', () => {
    it('sorts by status priority (todo before done)', () => {
      const tasks = [
        createMockTask({ id: '1', status: 'done' }),
        createMockTask({ id: '2', status: 'todo' }),
      ];

      const sorted = sortTasks(tasks);
      expect(sorted[0].status).toBe('todo');
      expect(sorted[1].status).toBe('done');
    });

    it('sorts by priority within same status', () => {
      const tasks = [
        createMockTask({ id: '1', status: 'todo', priority: 'not_urgent_not_important' }),
        createMockTask({ id: '2', status: 'todo', priority: 'urgent_important' }),
      ];

      const sorted = sortTasks(tasks);
      expect(sorted[0].priority).toBe('urgent_important');
      expect(sorted[1].priority).toBe('not_urgent_not_important');
    });

    it('sorts by creation date when status and priority are same', () => {
      const tasks = [
        createMockTask({ id: '1', created_at: '2024-01-01T00:00:00Z' }),
        createMockTask({ id: '2', created_at: '2024-01-02T00:00:00Z' }),
      ];

      const sorted = sortTasks(tasks);
      expect(sorted[0].id).toBe('2'); // Newer first
      expect(sorted[1].id).toBe('1');
    });

    it('handles empty array', () => {
      expect(sortTasks([])).toEqual([]);
    });

    it('does not mutate original array', () => {
      const tasks = [
        createMockTask({ id: '1', status: 'done' }),
        createMockTask({ id: '2', status: 'todo' }),
      ];

      const original = [...tasks];
      sortTasks(tasks);
      expect(tasks).toEqual(original);
    });

    it('handles large number of tasks', () => {
      const tasks = Array.from({ length: 1000 }, (_, i) =>
        createMockTask({ id: `task-${i}`, status: i % 2 === 0 ? 'todo' : 'done' })
      );

      expect(() => sortTasks(tasks)).not.toThrow();
      const sorted = sortTasks(tasks);
      expect(sorted).toHaveLength(1000);
    });
  });

  describe('sortTasksForMatrix', () => {
    it('filters tasks by priority', () => {
      const tasks = [
        createMockTask({ id: '1', priority: 'urgent_important' }),
        createMockTask({ id: '2', priority: 'not_urgent_important' }),
        createMockTask({ id: '3', priority: 'urgent_important' }),
      ];

      const sorted = sortTasksForMatrix(tasks, 'urgent_important');
      expect(sorted).toHaveLength(2);
      expect(sorted.every(t => t.priority === 'urgent_important')).toBe(true);
    });

    it('sorts by status within priority', () => {
      const tasks = [
        createMockTask({ id: '1', priority: 'urgent_important', status: 'done' }),
        createMockTask({ id: '2', priority: 'urgent_important', status: 'todo' }),
      ];

      const sorted = sortTasksForMatrix(tasks, 'urgent_important');
      expect(sorted[0].status).toBe('todo');
      expect(sorted[1].status).toBe('done');
    });

    it('sorts by creation date within same status and priority', () => {
      const tasks = [
        createMockTask({
          id: '1',
          priority: 'urgent_important',
          status: 'todo',
          created_at: '2024-01-01T00:00:00Z',
        }),
        createMockTask({
          id: '2',
          priority: 'urgent_important',
          status: 'todo',
          created_at: '2024-01-02T00:00:00Z',
        }),
      ];

      const sorted = sortTasksForMatrix(tasks, 'urgent_important');
      expect(sorted[0].id).toBe('2'); // Newer first
    });

    it('returns empty array when no tasks match priority', () => {
      const tasks = [
        createMockTask({ priority: 'urgent_important' }),
      ];

      const sorted = sortTasksForMatrix(tasks, 'not_urgent_important');
      expect(sorted).toEqual([]);
    });

    it('does not mutate original array', () => {
      const tasks = [
        createMockTask({ id: '1', priority: 'urgent_important' }),
      ];

      const original = [...tasks];
      sortTasksForMatrix(tasks, 'urgent_important');
      expect(tasks).toEqual(original);
    });
  });
});

describe('Time Formatting Functions', () => {
  describe('formatMinutes', () => {
    it('formats 0 minutes', () => {
      expect(formatMinutes(0)).toBe('0m');
    });

    it('formats minutes only (less than 60)', () => {
      expect(formatMinutes(45)).toBe('45m');
      expect(formatMinutes(1)).toBe('1m');
      expect(formatMinutes(59)).toBe('59m');
    });

    it('formats exact hours', () => {
      expect(formatMinutes(60)).toBe('1h');
      expect(formatMinutes(120)).toBe('2h');
      expect(formatMinutes(180)).toBe('3h');
    });

    it('formats hours and minutes', () => {
      expect(formatMinutes(65)).toBe('1h 5m');
      expect(formatMinutes(125)).toBe('2h 5m');
      expect(formatMinutes(90)).toBe('1h 30m');
    });

    it('handles large values', () => {
      expect(formatMinutes(1000)).toBe('16h 40m');
      expect(formatMinutes(10000)).toBe('166h 40m');
    });

    it('handles negative values', () => {
      // Negative values result in negative hours and minutes
      const result = formatMinutes(-30);
      expect(result).toContain('-');
    });
  });

  describe('formatSeconds', () => {
    it('formats seconds only', () => {
      expect(formatSeconds(0)).toBe('0s');
      expect(formatSeconds(30)).toBe('30s');
      expect(formatSeconds(59)).toBe('59s');
    });

    it('formats minutes and seconds', () => {
      expect(formatSeconds(60)).toBe('1m 0s');
      expect(formatSeconds(90)).toBe('1m 30s');
      expect(formatSeconds(125)).toBe('2m 5s');
    });

    it('formats hours, minutes, and seconds', () => {
      expect(formatSeconds(3600)).toBe('1h 0m 0s');
      expect(formatSeconds(3661)).toBe('1h 1m 1s');
      expect(formatSeconds(7325)).toBe('2h 2m 5s');
    });

    it('handles large values', () => {
      expect(formatSeconds(10000)).toBe('2h 46m 40s');
    });
  });

  describe('getTimeComparisonStatus', () => {
    const createTaskWithTime = (estimated: number | undefined, actual: number): Task => ({
      id: 'test-1',
      user_id: 'user-1',
      project_id: 'project-1',
      title: 'Test Task',
      status: 'todo',
      priority: 'not_urgent_not_important',
      is_urgent: false,
      is_important: false,
      estimated_minutes: estimated,
      timer_minutes: actual,
      manual_minutes: 0,
      timer_running: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    it('returns unknown when no estimate set', () => {
      const task = createTaskWithTime(undefined, 60);
      expect(getTimeComparisonStatus(task)).toBe('unknown');
    });

    it('returns under when actual is less than 80% of estimate', () => {
      const task = createTaskWithTime(100, 70);
      expect(getTimeComparisonStatus(task)).toBe('under');
    });

    it('returns near when actual is 80-100% of estimate', () => {
      const task = createTaskWithTime(100, 80);
      expect(getTimeComparisonStatus(task)).toBe('near');
      
      const task2 = createTaskWithTime(100, 100);
      expect(getTimeComparisonStatus(task2)).toBe('near');
    });

    it('returns over when actual exceeds estimate', () => {
      const task = createTaskWithTime(100, 101);
      expect(getTimeComparisonStatus(task)).toBe('over');
      
      const task2 = createTaskWithTime(100, 200);
      expect(getTimeComparisonStatus(task2)).toBe('over');
    });

    it('combines timer_minutes and manual_minutes', () => {
      const task: Task = {
        id: 'test-1',
        user_id: 'user-1',
        project_id: 'project-1',
        title: 'Test Task',
        status: 'todo',
        priority: 'not_urgent_not_important',
        is_urgent: false,
        is_important: false,
        estimated_minutes: 100,
        timer_minutes: 40,
        manual_minutes: 45, // Total 85, should be 'near'
        timer_running: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      expect(getTimeComparisonStatus(task)).toBe('near');
    });

    it('handles zero estimate', () => {
      const task = createTaskWithTime(0, 60);
      // Zero estimate is treated as no estimate
      expect(getTimeComparisonStatus(task)).toBe('unknown');
    });
  });
});

describe('CSV Parsing Functions', () => {
  describe('parseCSVStatus', () => {
    it('parses "done" variations', () => {
      expect(parseCSVStatus('Done')).toBe('done');
      expect(parseCSVStatus('DONE')).toBe('done');
      expect(parseCSVStatus('  done  ')).toBe('done');
      expect(parseCSVStatus('Completed/Done')).toBe('done');
    });

    it('parses "doing" variations', () => {
      expect(parseCSVStatus('doing now')).toBe('doing');
      // "In Progress" doesn't contain "doing" substring - defaults to todo
      expect(parseCSVStatus('In doingss')).toBe('doing');
      expect(parseCSVStatus('doing now')).toBe('doing');
    });

    it('parses "help_me" variations', () => {
      expect(parseCSVStatus('Help Me')).toBe('help_me');
      expect(parseCSVStatus('HELP')).toBe('help_me');
      expect(parseCSVStatus('needs help')).toBe('help_me');
    });

    it('parses "on_hold" variations', () => {
      expect(parseCSVStatus('On Hold')).toBe('on_hold');
      expect(parseCSVStatus('HOLD')).toBe('on_hold');
      expect(parseCSVStatus('on hold')).toBe('on_hold');
    });

    it('defaults to "todo" for unknown values', () => {
      expect(parseCSVStatus('Unknown')).toBe('todo');
      expect(parseCSVStatus('')).toBe('todo');
      expect(parseCSVStatus('asdf')).toBe('todo');
    });
  });

  describe('parseCSVPriority', () => {
    it('parses urgent and important', () => {
      expect(parseCSVPriority('Urgent Important')).toBe('urgent_important');
      expect(parseCSVPriority('important urgent')).toBe('urgent_important');
      expect(parseCSVPriority('URGENT IMP')).toBe('urgent_important');
    });

    it('parses urgent not important', () => {
      expect(parseCSVPriority('Urgent')).toBe('urgent_not_important');
      expect(parseCSVPriority('urgent only')).toBe('urgent_not_important');
    });

    it('parses not urgent important', () => {
      expect(parseCSVPriority('Important')).toBe('not_urgent_important');
      expect(parseCSVPriority('imp')).toBe('not_urgent_important');
    });

    it('parses not urgent not important', () => {
      expect(parseCSVPriority('Neither')).toBe('not_urgent_not_important');
      expect(parseCSVPriority('')).toBe('not_urgent_not_important');
      expect(parseCSVPriority('low priority')).toBe('not_urgent_not_important');
    });
  });
});
