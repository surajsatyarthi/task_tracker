/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import AddTaskModal from '@/components/AddTaskModal';
import { Project } from '@/types/task';

describe('AddTaskModal - Form Validation', () => {
  const mockProjects: Project[] = [
    { id: 'proj-1', name: 'Personal', slug: 'personal', user_id: 'user-1', color: '#3b82f6', is_active: true, created_at: '', updated_at: '' },
    { id: 'proj-2', name: 'Work', slug: 'work', user_id: 'user-1', color: '#8b5cf6', is_active: true, created_at: '', updated_at: '' },
  ];

  const mockOnClose = vi.fn();
  const mockOnAdd = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Happy Path - Form Validation', () => {
    it('validates required title field', async () => {
      const user = userEvent.setup();
      render(
        <AddTaskModal
          isOpen={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
          currentProject="personal"
          projects={mockProjects}
        />
      );

      // Try to submit without title
      const submitButton = screen.getByRole('button', { name: /add task/i });
      await user.click(submitButton);

      // Should show error
      expect(await screen.findByText('Title is required')).toBeInTheDocument();
      expect(mockOnAdd).not.toHaveBeenCalled();
    });

    it('accepts valid title and submits', async () => {
      const user = userEvent.setup();
      render(
        <AddTaskModal
          isOpen={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
          currentProject="personal"
          projects={mockProjects}
        />
      );

      const titleInput = screen.getByPlaceholderText('Enter task title...');
      await user.type(titleInput, 'New Task');

      const submitButton = screen.getByRole('button', { name: /add task/i });
      await user.click(submitButton);

      expect(mockOnAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Task',
          status: 'todo',
        })
      );
    });

    it('shows optional fields work correctly', async () => {
      const user = userEvent.setup();
      render(
        <AddTaskModal
          isOpen={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
          currentProject="personal"
          projects={mockProjects}
        />
      );

      const titleInput = screen.getByPlaceholderText('Enter task title...');
      await user.type(titleInput, 'Task with description');

      const descInput = screen.getByPlaceholderText('Enter task description...');
      await user.type(descInput, 'This is a description');

      const submitButton = screen.getByRole('button', { name: /add task/i });
      await user.click(submitButton);

      expect(mockOnAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Task with description',
          description: 'This is a description',
        })
      );
    });

    it('selects priority correctly', async () => {
      const user = userEvent.setup();
      render(
        <AddTaskModal
          isOpen={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
          currentProject="personal"
          projects={mockProjects}
        />
      );

      const titleInput = screen.getByPlaceholderText('Enter task title...');
      await user.type(titleInput, 'Important Task');

      const prioritySelect = screen.getByLabelText(/select task priority/i);
      await user.selectOptions(prioritySelect, 'urgent_important');

      const submitButton = screen.getByRole('button', { name: /add task/i });
      await user.click(submitButton);

      expect(mockOnAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: 'urgent_important',
          is_urgent: true,
          is_important: true,
        })
      );
    });

    it('selects project correctly', async () => {
      const user = userEvent.setup();
      render(
        <AddTaskModal
          isOpen={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
          currentProject="personal"
          projects={mockProjects}
        />
      );

      const titleInput = screen.getByPlaceholderText('Enter task title...');
      await user.type(titleInput, 'Work Task');

      const projectSelect = screen.getByLabelText(/select project for task/i);
      await user.selectOptions(projectSelect, 'proj-2');

      const submitButton = screen.getByRole('button', { name: /add task/i });
      await user.click(submitButton);

      expect(mockOnAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          project_id: 'proj-2',
        })
      );
    });
  });

  describe('Edge Cases - Title Validation', () => {
    it('enforces title max length (500 chars)', async () => {
      const user = userEvent.setup();
      render(
        <AddTaskModal
          isOpen={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
          currentProject="personal"
          projects={mockProjects}
        />
      );

      const titleInput = screen.getByPlaceholderText('Enter task title...') as HTMLInputElement;
      const longTitle = 'A'.repeat(501);

      await user.click(titleInput);
      await user.paste(longTitle);

      // Input should only accept 500 chars due to maxLength attribute
      expect(titleInput.value.length).toBeLessThanOrEqual(500);
    });

    it('shows character count', () => {
      render(
        <AddTaskModal
          isOpen={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
          currentProject="personal"
          projects={mockProjects}
        />
      );

      expect(screen.getByText(/\(0\/500\)/)).toBeInTheDocument();
    });

    it('handles empty title submission', async () => {
      const user = userEvent.setup();
      render(
        <AddTaskModal
          isOpen={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
          currentProject="personal"
          projects={mockProjects}
        />
      );

      const submitButton = screen.getByRole('button', { name: /add task/i });
      await user.click(submitButton);

      expect(await screen.findByText('Title is required')).toBeInTheDocument();
      expect(mockOnAdd).not.toHaveBeenCalled();
    });

    it('trims whitespace from title', async () => {
      const user = userEvent.setup();
      render(
        <AddTaskModal
          isOpen={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
          currentProject="personal"
          projects={mockProjects}
        />
      );

      const titleInput = screen.getByPlaceholderText('Enter task title...');
      await user.click(titleInput);
      await user.paste('  Task with spaces  ');

      const submitButton = screen.getByRole('button', { name: /add task/i });
      await user.click(submitButton);

      expect(mockOnAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Task with spaces',
        })
      );
    });
  });

  describe('Edge Cases - Description', () => {
    it('enforces description max length (5000 chars)', () => {
      render(
        <AddTaskModal
          isOpen={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
          currentProject="personal"
          projects={mockProjects}
        />
      );

      const descInput = screen.getByPlaceholderText('Enter task description...') as HTMLTextAreaElement;
      
      // Check maxLength attribute directly instead of typing
      expect(descInput.maxLength).toBe(5000);
    });

    it('shows description character count', () => {
      render(
        <AddTaskModal
          isOpen={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
          currentProject="personal"
          projects={mockProjects}
        />
      );

      expect(screen.getByText(/\(0\/5000\)/)).toBeInTheDocument();
    });
  });

  describe('Link Management', () => {
    it('adds valid URL', async () => {
      const user = userEvent.setup();
      render(
        <AddTaskModal
          isOpen={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
          currentProject="personal"
          projects={mockProjects}
        />
      );

      const linkInput = screen.getByPlaceholderText(/https:\/\/example\.com/);
      await user.click(linkInput);
      await user.paste('https://example.com');

      const addLinkButton = screen.getByLabelText('Add link to task');
      await user.click(addLinkButton);

      expect(await screen.findByText('https://example.com')).toBeInTheDocument();
    });

    it('validates URL format', async () => {
      const user = userEvent.setup();
      render(
        <AddTaskModal
          isOpen={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
          currentProject="personal"
          projects={mockProjects}
        />
      );

      const linkInput = screen.getByPlaceholderText(/https:\/\/example\.com/);
      await user.type(linkInput, 'not a valid url');

      const addLinkButton = screen.getByLabelText('Add link to task');
      await user.click(addLinkButton);

      expect(await screen.findByText('Please enter a valid URL (e.g., https://example.com)')).toBeInTheDocument();
    });

    it('removes link', async () => {
      const user = userEvent.setup();
      render(
        <AddTaskModal
          isOpen={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
          currentProject="personal"
          projects={mockProjects}
        />
      );

      const linkInput = screen.getByPlaceholderText(/https:\/\/example\.com/);
      await user.type(linkInput, 'https://test.com');

      const addLinkButton = screen.getByLabelText('Add link to task');
      await user.click(addLinkButton);

      expect(await screen.findByText('https://test.com')).toBeInTheDocument();

      const removeButton = screen.getByLabelText('Remove link https://test.com');
      await user.click(removeButton);

      expect(screen.queryByText('https://test.com')).not.toBeInTheDocument();
    });

    it('prevents duplicate links', async () => {
      const user = userEvent.setup();
      render(
        <AddTaskModal
          isOpen={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
          currentProject="personal"
          projects={mockProjects}
        />
      );

      const linkInput = screen.getByPlaceholderText(/https:\/\/example\.com/);
      
      // Add first link
      await user.type(linkInput, 'https://duplicate.com');
      const addLinkButton = screen.getByLabelText('Add link to task');
      await user.click(addLinkButton);

      // Try to add same link
      await user.type(linkInput, 'https://duplicate.com');
      await user.click(addLinkButton);

      expect(await screen.findByText('This link is already added')).toBeInTheDocument();
    });
  });

  describe('Tag Management', () => {
    it('adds tag', async () => {
      const user = userEvent.setup();
      render(
        <AddTaskModal
          isOpen={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
          currentProject="personal"
          projects={mockProjects}
        />
      );

      const tagInput = screen.getByPlaceholderText(/urgent, meeting, research/);
      await user.type(tagInput, 'important');

      const addTagButton = screen.getByLabelText('Add tag to task');
      await user.click(addTagButton);

      expect(await screen.findByText('important')).toBeInTheDocument();
    });

    it('removes tag', async () => {
      const user = userEvent.setup();
      render(
        <AddTaskModal
          isOpen={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
          currentProject="personal"
          projects={mockProjects}
        />
      );

      const tagInput = screen.getByPlaceholderText(/urgent, meeting, research/);
      await user.type(tagInput, 'test-tag');

      const addTagButton = screen.getByLabelText('Add tag to task');
      await user.click(addTagButton);

      expect(await screen.findByText('test-tag')).toBeInTheDocument();

      const removeButton = screen.getByLabelText('Remove tag test-tag');
      await user.click(removeButton);

      expect(screen.queryByText('test-tag')).not.toBeInTheDocument();
    });

    it('prevents duplicate tags', async () => {
      const user = userEvent.setup();
      render(
        <AddTaskModal
          isOpen={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
          currentProject="personal"
          projects={mockProjects}
        />
      );

      const tagInput = screen.getByPlaceholderText(/urgent, meeting, research/);
      
      // Add first tag
      await user.type(tagInput, 'duplicate');
      const addTagButton = screen.getByLabelText('Add tag to task');
      await user.click(addTagButton);

      // Try to add same tag
      await user.type(tagInput, 'duplicate');
      await user.click(addTagButton);

      expect(await screen.findByText('This tag is already added')).toBeInTheDocument();
    });
  });

  describe('Time Estimate', () => {
    it('sets hours and minutes estimate', async () => {
      const user = userEvent.setup();
      render(
        <AddTaskModal
          isOpen={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
          currentProject="personal"
          projects={mockProjects}
        />
      );

      const titleInput = screen.getByPlaceholderText('Enter task title...');
      await user.type(titleInput, 'Task with estimate');

      // Find hours and minutes inputs by their labels
      const inputs = screen.getAllByRole('spinbutton');
      const hoursInput = inputs.find(input => 
        input.getAttribute('max') === '999'
      ) as HTMLInputElement;
      const minutesInput = inputs.find(input => 
        input.getAttribute('max') === '59'
      ) as HTMLInputElement;

      await user.clear(hoursInput);
      await user.type(hoursInput, '2');
      
      await user.clear(minutesInput);
      await user.type(minutesInput, '30');

      const submitButton = screen.getByRole('button', { name: /add task/i });
      await user.click(submitButton);

      expect(mockOnAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          estimated_minutes: 150, // 2 hours * 60 + 30 minutes
        })
      );
    });

    it('handles zero estimate', async () => {
      const user = userEvent.setup();
      render(
        <AddTaskModal
          isOpen={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
          currentProject="personal"
          projects={mockProjects}
        />
      );

      const titleInput = screen.getByPlaceholderText('Enter task title...');
      await user.type(titleInput, 'Task without estimate');

      const submitButton = screen.getByRole('button', { name: /add task/i });
      await user.click(submitButton);

      expect(mockOnAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          estimated_minutes: undefined,
        })
      );
    });
  });

  describe('Modal Interactions', () => {
    it('closes modal when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(
        <AddTaskModal
          isOpen={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
          currentProject="personal"
          projects={mockProjects}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('closes modal when close button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <AddTaskModal
          isOpen={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
          currentProject="personal"
          projects={mockProjects}
        />
      );

      const closeButton = screen.getByLabelText('Close modal');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('does not render when isOpen is false', () => {
      render(
        <AddTaskModal
          isOpen={false}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
          currentProject="personal"
          projects={mockProjects}
        />
      );

      expect(screen.queryByText('Add New Task')).not.toBeInTheDocument();
    });
  });

  describe('Form Reset', () => {
    it('resets form after successful submission', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <AddTaskModal
          isOpen={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
          currentProject="personal"
          projects={mockProjects}
        />
      );

      const titleInput = screen.getByPlaceholderText('Enter task title...');
      await user.type(titleInput, 'Test Task');

      const submitButton = screen.getByRole('button', { name: /add task/i });
      await user.click(submitButton);

      // Simulate modal reopening after close
      rerender(
        <AddTaskModal
          isOpen={false}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
          currentProject="personal"
          projects={mockProjects}
        />
      );

      rerender(
        <AddTaskModal
          isOpen={true}
          onClose={mockOnClose}
          onAdd={mockOnAdd}
          currentProject="personal"
          projects={mockProjects}
        />
      );

      const titleInputAfterReset = screen.getByPlaceholderText('Enter task title...') as HTMLInputElement;
      expect(titleInputAfterReset.value).toBe('');
    });
  });
});
