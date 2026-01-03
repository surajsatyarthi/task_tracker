import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskCard from '@/components/TaskCard';
import { Task } from '@/types/task';

describe('TaskCard', () => {
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
    links: ['https://example.com'],
    tags: ['urgent'],
  };

  describe('Rendering', () => {
    it('renders task title', () => {
      render(<TaskCard task={mockTask} />);
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    it('renders task description when provided', () => {
      render(<TaskCard task={mockTask} />);
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('does not render description when not provided', () => {
      const taskWithoutDesc = { ...mockTask, description: undefined };
      render(<TaskCard task={taskWithoutDesc} />);
      expect(screen.queryByText('Test description')).not.toBeInTheDocument();
    });

    it('shows due date when provided', () => {
      render(<TaskCard task={mockTask} />);
      expect(screen.getByText(/Jan 10, 2026/)).toBeInTheDocument();
    });

    it('shows estimated time when provided', () => {
      render(<TaskCard task={mockTask} />);
      expect(screen.getByText(/2h/)).toBeInTheDocument();
      expect(screen.getByText(/est\./)).toBeInTheDocument();
    });

    it('shows links count when links exist', () => {
      render(<TaskCard task={mockTask} />);
      expect(screen.getByText(/1 link/)).toBeInTheDocument();
    });

    it('shows tags when provided', () => {
      render(<TaskCard task={mockTask} />);
      expect(screen.getByText('urgent')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onClick when card is clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<TaskCard task={mockTask} onClick={handleClick} />);
      
      const card = screen.getByRole('button');
      await user.click(card);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick when Enter key is pressed', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<TaskCard task={mockTask} onClick={handleClick} />);
      
      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard('{Enter}');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick when Space key is pressed', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(<TaskCard task={mockTask} onClick={handleClick} />);
      
      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard(' ');
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Visual States', () => {
    it('applies dragging styles when isDragging is true', () => {
      const { container } = render(<TaskCard task={mockTask} isDragging={true} />);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('shadow-2xl');
      expect(card.className).toContain('border-blue-300');
    });

    it('shows overdue styling for overdue tasks', () => {
      const overdueTask = { ...mockTask, due_date: '2020-01-01' };
      const { container } = render(<TaskCard task={overdueTask} />);
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('border-red-300');
      expect(card.className).toContain('bg-red-50');
    });

    it('highlights matching text when highlight prop is provided', () => {
      render(<TaskCard task={mockTask} highlight="Test" />);
      const marks = screen.getAllByText('Test');
      expect(marks.length).toBeGreaterThan(0);
      const highlightedMark = marks.find(el => el.tagName === 'MARK');
      expect(highlightedMark).toBeInTheDocument();
    });
  });
});
