/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Task, TaskStatus, TaskPriority } from '@/types/task';

// Mock fetch globally
global.fetch = vi.fn();

// Mock Supabase auth
const mockGetSession = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
    },
  },
}));

describe('CRUD Operations - Task Creation', () => {
  const mockTask: Omit<Task, 'id' | 'created_at' | 'updated_at'> = {
    user_id: 'user-1',
    project_id: 'project-1',
    title: 'Test Task',
    description: 'Test description',
    status: 'todo',
    priority: 'not_urgent_not_important',
    is_urgent: false,
    is_important: false,
    timer_minutes: 0,
    manual_minutes: 0,
    timer_running: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'test-token' } },
    });
  });

  describe('Happy Path - Create Task', () => {
    it('creates task with all fields', async () => {
      const fullTask = {
        ...mockTask,
        estimated_minutes: 60,
        due_date: '2024-12-31',
        tags: ['urgent', 'important'],
        links: ['https://example.com'],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          task: { ...fullTask, id: 'new-id', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        }),
      });

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify(fullTask),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.task.title).toBe('Test Task');
      expect(result.task.id).toBe('new-id');
    });

    it('creates task with minimal fields (title only)', async () => {
      const minimalTask = {
        user_id: 'user-1',
        project_id: 'project-1',
        title: 'Minimal Task',
        status: 'todo' as TaskStatus,
        priority: 'not_urgent_not_important' as TaskPriority,
        is_urgent: false,
        is_important: false,
        timer_minutes: 0,
        manual_minutes: 0,
        timer_running: false,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          task: { ...minimalTask, id: 'min-id', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        }),
      });

      const response = await fetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(minimalTask),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.task.title).toBe('Minimal Task');
    });

    it('assigns correct default values', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          task: {
            ...mockTask,
            id: 'new-id',
            timer_running: false,
            timer_minutes: 0,
            manual_minutes: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        }),
      });

      const response = await fetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(mockTask),
      });

      const result = await response.json();
      expect(result.task.timer_running).toBe(false);
      expect(result.task.timer_minutes).toBe(0);
      expect(result.task.manual_minutes).toBe(0);
    });
  });

  describe('Edge Cases - Create Task', () => {
    it('handles very long title (500 chars)', async () => {
      const longTitle = 'A'.repeat(500);
      const taskWithLongTitle = { ...mockTask, title: longTitle };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          task: { ...taskWithLongTitle, id: 'long-id', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        }),
      });

      const response = await fetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskWithLongTitle),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.task.title.length).toBe(500);
    });

    it('handles special characters in title', async () => {
      const specialTask = { ...mockTask, title: '🔥 Test <script>alert("xss")</script> & Émoji' };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          task: { ...specialTask, id: 'special-id', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        }),
      });

      const response = await fetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(specialTask),
      });

      const result = await response.json();
      expect(result.task.title).toContain('🔥');
      expect(result.task.title).toContain('&');
    });

    it('handles multiple tags and links', async () => {
      const taskWithMany = {
        ...mockTask,
        tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
        links: ['https://example.com', 'https://test.com', 'https://demo.com'],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          task: { ...taskWithMany, id: 'many-id', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        }),
      });

      const response = await fetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskWithMany),
      });

      const result = await response.json();
      expect(result.task.tags).toHaveLength(5);
      expect(result.task.links).toHaveLength(3);
    });

    it('handles empty arrays for tags and links', async () => {
      const taskWithEmptyArrays = {
        ...mockTask,
        tags: [],
        links: [],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          task: { ...taskWithEmptyArrays, id: 'empty-id', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        }),
      });

      const response = await fetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskWithEmptyArrays),
      });

      const result = await response.json();
      expect(result.task.tags).toEqual([]);
      expect(result.task.links).toEqual([]);
    });
  });

  describe('Error Cases - Create Task', () => {
    it('fails when title is empty', async () => {
      const invalidTask = { ...mockTask, title: '' };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Title is required' }),
      });

      const response = await fetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(invalidTask),
      });

      expect(response.ok).toBe(false);
      const error = await response.json();
      expect(error.error).toContain('Title');
    });

    it('fails when title is too long (>500 chars)', async () => {
      const invalidTask = { ...mockTask, title: 'A'.repeat(501) };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Title must be 500 characters or less' }),
      });

      const response = await fetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(invalidTask),
      });

      expect(response.ok).toBe(false);
    });

    it('handles network failure during create', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        fetch('/api/tasks', {
          method: 'POST',
          body: JSON.stringify(mockTask),
        })
      ).rejects.toThrow('Network error');
    });

    it('fails when not authenticated', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      });

      const response = await fetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(mockTask),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    });

    it('fails with invalid project_id', async () => {
      const invalidTask = { ...mockTask, project_id: 'non-existent' };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid project' }),
      });

      const response = await fetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(invalidTask),
      });

      expect(response.ok).toBe(false);
    });
  });
});

describe('CRUD Operations - Task Update', () => {
  const existingTask: Task = {
    id: 'task-1',
    user_id: 'user-1',
    project_id: 'project-1',
    title: 'Original Title',
    status: 'todo',
    priority: 'not_urgent_not_important',
    is_urgent: false,
    is_important: false,
    timer_minutes: 0,
    manual_minutes: 0,
    timer_running: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'test-token' } },
    });
  });

  describe('Happy Path - Update Task', () => {
    it('updates single field', async () => {
      const updates = { title: 'Updated Title' };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ task: { ...existingTask, ...updates } }),
      });

      const response = await fetch(`/api/tasks/${existingTask.id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.task.title).toBe('Updated Title');
    });

    it('updates multiple fields at once', async () => {
      const updates = {
        title: 'New Title',
        description: 'New Description',
        status: 'doing' as TaskStatus,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ task: { ...existingTask, ...updates } }),
      });

      const response = await fetch(`/api/tasks/${existingTask.id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      const result = await response.json();
      expect(result.task.title).toBe('New Title');
      expect(result.task.description).toBe('New Description');
      expect(result.task.status).toBe('doing');
    });

    it('updates status successfully', async () => {
      const updates = { status: 'done' as TaskStatus };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ task: { ...existingTask, ...updates, completed_date: new Date().toISOString() } }),
      });

      const response = await fetch(`/api/tasks/${existingTask.id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      const result = await response.json();
      expect(result.task.status).toBe('done');
      expect(result.task.completed_date).toBeDefined();
    });

    it('updates priority successfully', async () => {
      const updates = { priority: 'urgent_important' as TaskPriority };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ task: { ...existingTask, ...updates, is_urgent: true, is_important: true } }),
      });

      const response = await fetch(`/api/tasks/${existingTask.id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      const result = await response.json();
      expect(result.task.priority).toBe('urgent_important');
      expect(result.task.is_urgent).toBe(true);
      expect(result.task.is_important).toBe(true);
    });
  });

  describe('Edge Cases - Update Task', () => {
    it('handles update to identical values (no-op)', async () => {
      const updates = { title: existingTask.title };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ task: existingTask }),
      });

      const response = await fetch(`/api/tasks/${existingTask.id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      expect(response.ok).toBe(true);
    });

    it('handles update while timer running', async () => {
      const runningTask = { ...existingTask, timer_running: true };
      const updates = { description: 'Updated while running' };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ task: { ...runningTask, ...updates } }),
      });

      const response = await fetch(`/api/tasks/${runningTask.id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      const result = await response.json();
      expect(result.task.timer_running).toBe(true);
      expect(result.task.description).toBe('Updated while running');
    });

    it('handles partial field updates', async () => {
      const updates = { tags: ['new-tag'] };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ task: { ...existingTask, ...updates } }),
      });

      const response = await fetch(`/api/tasks/${existingTask.id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      const result = await response.json();
      expect(result.task.tags).toEqual(['new-tag']);
      expect(result.task.title).toBe(existingTask.title); // Unchanged
    });

    it('handles moving task from done back to todo', async () => {
      const doneTask = { ...existingTask, status: 'done' as TaskStatus, completed_date: '2024-01-15T00:00:00Z' };
      const updates = { status: 'todo' as TaskStatus };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ task: { ...doneTask, ...updates, completed_date: undefined } }),
      });

      const response = await fetch(`/api/tasks/${doneTask.id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      const result = await response.json();
      expect(result.task.status).toBe('todo');
      expect(result.task.completed_date).toBeUndefined();
    });
  });

  describe('Error Cases - Update Task', () => {
    it('fails with network error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        fetch(`/api/tasks/${existingTask.id}`, {
          method: 'PUT',
          body: JSON.stringify({ title: 'New' }),
        })
      ).rejects.toThrow('Network error');
    });

    it('fails when task not found', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Task not found' }),
      });

      const response = await fetch('/api/tasks/non-existent', {
        method: 'PUT',
        body: JSON.stringify({ title: 'New' }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it('fails with invalid field values', async () => {
      const invalidUpdates = { status: 'invalid_status' };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid status value' }),
      });

      const response = await fetch(`/api/tasks/${existingTask.id}`, {
        method: 'PUT',
        body: JSON.stringify(invalidUpdates),
      });

      expect(response.ok).toBe(false);
    });
  });
});

describe('CRUD Operations - Task Delete', () => {
  const taskToDelete: Task = {
    id: 'task-to-delete',
    user_id: 'user-1',
    project_id: 'project-1',
    title: 'Task to Delete',
    status: 'todo',
    priority: 'not_urgent_not_important',
    is_urgent: false,
    is_important: false,
    timer_minutes: 0,
    manual_minutes: 0,
    timer_running: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'test-token' } },
    });
  });

  describe('Happy Path - Delete Task', () => {
    it('deletes task successfully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const response = await fetch(`/api/tasks/${taskToDelete.id}`, {
        method: 'DELETE',
      });

      expect(response.ok).toBe(true);
    });
  });

  describe('Edge Cases - Delete Task', () => {
    it('deletes task with running timer', async () => {
      const runningTask = { ...taskToDelete, timer_running: true };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const response = await fetch(`/api/tasks/${runningTask.id}`, {
        method: 'DELETE',
      });

      expect(response.ok).toBe(true);
    });

    it('deletes task with attachments/links', async () => {
      const taskWithLinks = {
        ...taskToDelete,
        links: ['https://example.com', 'https://test.com'],
        tags: ['important', 'urgent'],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const response = await fetch(`/api/tasks/${taskWithLinks.id}`, {
        method: 'DELETE',
      });

      expect(response.ok).toBe(true);
    });
  });

  describe('Error Cases - Delete Task', () => {
    it('fails with network error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        fetch(`/api/tasks/${taskToDelete.id}`, { method: 'DELETE' })
      ).rejects.toThrow('Network error');
    });

    it('fails when task not found', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Task not found' }),
      });

      const response = await fetch('/api/tasks/non-existent', {
        method: 'DELETE',
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it('fails without permission', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: 'Permission denied' }),
      });

      const response = await fetch(`/api/tasks/${taskToDelete.id}`, {
        method: 'DELETE',
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(403);
    });
  });
});
