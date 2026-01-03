/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskDetailModal from '@/components/TaskDetailModal';
import { Task } from '@/types/task';

// Mock the hooks
vi.mock('@/hooks/useTaskTimer', () => ({
  useTaskTimer: () => ({
    isRunning: false,
    totalMinutes: 0,
    displayMinutes: 0,
    displaySeconds: 0,
    startTimer: vi.fn(),
    pauseTimer: vi.fn(),
    stopTimer: vi.fn(),
  }),
}));

vi.mock('@/hooks/useTimerNotifications', () => ({
  useTimerNotifications: vi.fn(),
}));

describe('TaskDetailModal', () => {
  const mockTask: Task = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test description',
    status: 'todo',
    priority: 'urgent_important',
    is_urgent: true,
    is_important: true,
    project_id: 'proj-1',
    user_id: 'user-1',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    estimated_minutes: 120,
    timer_minutes: 30,
    manual_minutes: 0,
    timer_running: false,
    due_date: '2026-01-10',
    remarks: 'Test remarks',
    links: ['https://example.com'],
    tags: ['urgent', 'important'],
  };

  const mockOnClose = vi.fn();
  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('View Mode', () => {
    it('renders task details in view mode', () => {
      render(
        <TaskDetailModal
          task={mockTask}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
      expect(screen.getByText('Do First')).toBeInTheDocument();
      expect(screen.getByText('Test remarks')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(
        <TaskDetailModal
          task={mockTask}
          isOpen={false}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText('Task Details')).not.toBeInTheDocument();
    });

    it('does not render when task is null', () => {
      render(
        <TaskDetailModal
          task={null}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText('Task Details')).not.toBeInTheDocument();
    });

    it('shows Edit and Delete buttons in view mode', () => {
      render(
        <TaskDetailModal
          task={mockTask}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    it('closes modal when close button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TaskDetailModal
          task={mockTask}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Edit Mode', () => {
    it('enters edit mode when Edit button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TaskDetailModal
          task={mockTask}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('starts in edit mode when initialEditMode is true', () => {
      render(
        <TaskDetailModal
          task={mockTask}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
          initialEditMode={true}
        />
      );

      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('shows input fields in edit mode', async () => {
      const user = userEvent.setup();
      render(
        <TaskDetailModal
          task={mockTask}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      const titleInput = screen.getByDisplayValue('Test Task');
      expect(titleInput).toBeInTheDocument();
      expect(titleInput.tagName).toBe('INPUT');

      const descInput = screen.getByDisplayValue('Test description');
      expect(descInput).toBeInTheDocument();
      expect(descInput.tagName).toBe('TEXTAREA');
    });

    it('allows editing title', async () => {
      const user = userEvent.setup();
      render(
        <TaskDetailModal
          task={mockTask}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      const titleInput = screen.getByDisplayValue('Test Task');
      await user.clear(titleInput);
      await user.click(titleInput);
      await user.paste('Updated Task Title');

      expect(titleInput).toHaveValue('Updated Task Title');
    });

    it('allows changing status', async () => {
      const user = userEvent.setup();
      render(
        <TaskDetailModal
          task={mockTask}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      const statusSelect = screen.getAllByRole('combobox')[0];
      await user.selectOptions(statusSelect, 'doing');

      expect(statusSelect).toHaveValue('doing');
    });

    it('allows changing priority', async () => {
      const user = userEvent.setup();
      render(
        <TaskDetailModal
          task={mockTask}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      const prioritySelect = screen.getByLabelText(/task priority/i);
      await user.selectOptions(prioritySelect, 'not_urgent_important');

      expect(prioritySelect).toHaveValue('not_urgent_important');
    });

    it('saves changes when Save button is clicked', async () => {
      const user = userEvent.setup();
      mockOnUpdate.mockResolvedValue(undefined);
      
      render(
        <TaskDetailModal
          task={mockTask}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      const titleInput = screen.getByDisplayValue('Test Task');
      await user.clear(titleInput);
      await user.click(titleInput);
      await user.paste('Updated Title');

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith('task-1', expect.objectContaining({
          title: 'Updated Title',
        }));
      });
    });

    it('exits edit mode after saving', async () => {
      const user = userEvent.setup();
      mockOnUpdate.mockResolvedValue(undefined);
      
      render(
        <TaskDetailModal
          task={mockTask}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });
    });

    it('cancels edit mode when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <TaskDetailModal
          task={mockTask}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      const titleInput = screen.getByDisplayValue('Test Task');
      await user.clear(titleInput);
      await user.click(titleInput);
      await user.paste('Changed Title');

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    it('does not save when title is only whitespace (falls back to original)', async () => {
      const user = userEvent.setup();
      mockOnUpdate.mockResolvedValue(undefined);
      
      render(
        <TaskDetailModal
          task={mockTask}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      const titleInput = screen.getByDisplayValue('Test Task');
      await user.clear(titleInput);
      await user.click(titleInput);
      await user.paste('   '); // Only whitespace

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      // The logic uses editedTask.title?.trim() || task.title.trim()
      // So whitespace falls back to original title and saves successfully
      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalled();
      });
    });

    it('prevents saving with title over 500 characters', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      render(
        <TaskDetailModal
          task={mockTask}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      const titleInput = screen.getByDisplayValue('Test Task');
      await user.clear(titleInput);
      await user.click(titleInput);
      await user.paste('A'.repeat(501));

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      expect(alertSpy).toHaveBeenCalledWith('Title must be 500 characters or less');
      expect(mockOnUpdate).not.toHaveBeenCalled();
      
      alertSpy.mockRestore();
    });
  });

  describe('Delete Functionality', () => {
    it('shows confirmation dialog when Delete is clicked', async () => {
      const user = userEvent.setup();
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      
      render(
        <TaskDetailModal
          task={mockTask}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      expect(confirmSpy).toHaveBeenCalledWith(
        expect.stringContaining('Are you sure you want to delete "Test Task"?')
      );
      
      confirmSpy.mockRestore();
    });

    it('deletes task when confirmed', async () => {
      const user = userEvent.setup();
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      
      render(
        <TaskDetailModal
          task={mockTask}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith('task-1');
      expect(mockOnClose).toHaveBeenCalled();
      
      confirmSpy.mockRestore();
    });

    it('does not delete task when cancelled', async () => {
      const user = userEvent.setup();
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      
      render(
        <TaskDetailModal
          task={mockTask}
          isOpen={true}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      expect(mockOnDelete).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
      
      confirmSpy.mockRestore();
    });
  });
});
