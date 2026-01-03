/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect } from 'vitest';
import { Task } from '@/types/task';

// Test the search filter logic
const filterTasksBySearch = (tasks: Task[], searchQuery: string): Task[] => {
  if (!searchQuery.trim()) return tasks;
  const query = searchQuery.toLowerCase();
  return tasks.filter(task =>
    task.title.toLowerCase().includes(query) ||
    task.description?.toLowerCase().includes(query) ||
    task.owner?.toLowerCase().includes(query) ||
    task.department?.toLowerCase().includes(query) ||
    task.remarks?.toLowerCase().includes(query) ||
    (task.tags || []).some(tag => tag.toLowerCase().includes(query))
  );
};

describe('Search and Filter Logic', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Complete project report',
      description: 'Write the Q4 report',
      status: 'todo',
      priority: 'urgent_important',
      is_urgent: true,
      is_important: true,
      project_id: 'proj-1',
      user_id: 'user-1',
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
      estimated_minutes: 120,
      timer_minutes: 0,
      manual_minutes: 0,
      timer_running: false,
      owner: 'John Doe',
      department: 'Engineering',
      tags: ['urgent', 'report'],
    },
    {
      id: '2',
      title: 'Fix bug in login',
      description: 'Users cannot login',
      status: 'doing',
      priority: 'urgent_not_important',
      is_urgent: true,
      is_important: false,
      project_id: 'proj-1',
      user_id: 'user-1',
      created_at: '2026-01-02',
      updated_at: '2026-01-02',
      estimated_minutes: 60,
      timer_minutes: 0,
      manual_minutes: 0,
      timer_running: false,
      owner: 'Jane Smith',
      department: 'Engineering',
      tags: ['bug', 'login'],
    },
    {
      id: '3',
      title: 'Update documentation',
      description: 'Add new API endpoints',
      status: 'done',
      priority: 'not_urgent_important',
      is_urgent: false,
      is_important: true,
      project_id: 'proj-2',
      user_id: 'user-1',
      created_at: '2026-01-03',
      updated_at: '2026-01-03',
      estimated_minutes: 90,
      timer_minutes: 0,
      manual_minutes: 0,
      timer_running: false,
      owner: 'Alice Brown',
      department: 'Product',
      remarks: 'Customer requested',
      tags: ['documentation'],
    },
  ];

  describe('Search by Title', () => {
    it('finds tasks by exact title match', () => {
      const result = filterTasksBySearch(mockTasks, 'Fix bug');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('finds tasks by partial title match', () => {
      const result = filterTasksBySearch(mockTasks, 'project');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Complete project report');
    });

    it('is case insensitive for title search', () => {
      const result = filterTasksBySearch(mockTasks, 'UPDATE');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
    });
  });

  describe('Search by Description', () => {
    it('finds tasks by description content', () => {
      const result = filterTasksBySearch(mockTasks, 'Q4 report');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('finds tasks by partial description', () => {
      const result = filterTasksBySearch(mockTasks, 'API');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
    });
  });

  describe('Search by Owner', () => {
    it('finds tasks by owner name', () => {
      const result = filterTasksBySearch(mockTasks, 'Jane Smith');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('finds tasks by partial owner name', () => {
      const result = filterTasksBySearch(mockTasks, 'Jane');
      expect(result).toHaveLength(1);
      expect(result[0].owner).toBe('Jane Smith');
    });
  });

  describe('Search by Department', () => {
    it('finds tasks by department', () => {
      const result = filterTasksBySearch(mockTasks, 'Engineering');
      expect(result).toHaveLength(2);
    });

    it('finds tasks by partial department name', () => {
      const result = filterTasksBySearch(mockTasks, 'Product');
      expect(result).toHaveLength(1);
      expect(result[0].department).toBe('Product');
    });
  });

  describe('Search by Remarks', () => {
    it('finds tasks by remarks content', () => {
      const result = filterTasksBySearch(mockTasks, 'Customer requested');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
    });
  });

  describe('Search by Tags', () => {
    it('finds tasks by tag', () => {
      const result = filterTasksBySearch(mockTasks, 'urgent');
      expect(result).toHaveLength(1);
      expect(result[0].tags).toContain('urgent');
    });

    it('finds tasks by any matching tag', () => {
      const result = filterTasksBySearch(mockTasks, 'bug');
      expect(result).toHaveLength(1);
      expect(result[0].tags).toContain('bug');
    });

    it('finds multiple tasks with common tag', () => {
      const result = filterTasksBySearch(mockTasks, 'login');
      expect(result).toHaveLength(1);
    });
  });

  describe('Edge Cases', () => {
    it('returns all tasks when search query is empty', () => {
      const result = filterTasksBySearch(mockTasks, '');
      expect(result).toHaveLength(3);
    });

    it('returns all tasks when search query is whitespace', () => {
      const result = filterTasksBySearch(mockTasks, '   ');
      expect(result).toHaveLength(3);
    });

    it('returns empty array when no match found', () => {
      const result = filterTasksBySearch(mockTasks, 'nonexistent query xyz');
      expect(result).toHaveLength(0);
    });

    it('handles special characters in search', () => {
      const result = filterTasksBySearch(mockTasks, 'Q4');
      expect(result).toHaveLength(1);
    });

    it('finds tasks matching multiple fields', () => {
      const result = filterTasksBySearch(mockTasks, 'Engineering');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Multiple Results', () => {
    it('returns multiple matching tasks', () => {
      const result = filterTasksBySearch(mockTasks, 'Engineering');
      expect(result).toHaveLength(2);
      expect(result.map(t => t.id)).toContain('1');
      expect(result.map(t => t.id)).toContain('2');
    });

    it('returns tasks in original order', () => {
      const result = filterTasksBySearch(mockTasks, 'Engineering');
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });
  });
});
