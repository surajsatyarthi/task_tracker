/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TimeAnalytics from '../TimeAnalytics';
import { Task, Project } from '@/types/task';

// Mock Recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />
}));

const mockProjects: Project[] = [
  { id: 'p1', name: 'Personal', slug: 'personal', color: '#3b82f6', user_id: 'user1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'p2', name: 'Work', slug: 'work', color: '#10b981', user_id: 'user1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: '1',
  title: 'Test Task',
  status: 'done',
  priority: 'urgent_important',
  project_id: 'p1',
  user_id: 'user1',
  timer_minutes: 60,
  manual_minutes: 0,
  estimated_minutes: 50,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
});

describe('TimeAnalytics', () => {
  describe('Empty State', () => {
    it('should show empty state when no tasks have time', () => {
      const tasks: Task[] = [
        createMockTask({ timer_minutes: 0, manual_minutes: 0 })
      ];

      render(<TimeAnalytics tasks={tasks} projects={mockProjects} />);
      
      expect(screen.getByText('No Time Data Yet')).toBeInTheDocument();
      expect(screen.getByText(/Start tracking time on your tasks/)).toBeInTheDocument();
    });

    it('should show onboarding tips in empty state', () => {
      render(<TimeAnalytics tasks={[]} projects={mockProjects} />);
      
      expect(screen.getByText(/Add time estimates to your tasks/)).toBeInTheDocument();
      expect(screen.getByText(/Use the timer to track actual time/)).toBeInTheDocument();
    });
  });

  describe('Stat Cards', () => {
    it('should display total time tracked', () => {
      const tasks: Task[] = [
        createMockTask({ timer_minutes: 60, manual_minutes: 30 }),
        createMockTask({ id: '2', timer_minutes: 45, manual_minutes: 15 })
      ];

      render(<TimeAnalytics tasks={tasks} projects={mockProjects} />);
      
      expect(screen.getByText('Total Time Tracked')).toBeInTheDocument();
      expect(screen.getByText('2h 30m')).toBeInTheDocument(); // 90 + 60 = 150 minutes
    });

    it('should display average per task', () => {
      const tasks: Task[] = [
        createMockTask({ timer_minutes: 60 }),
        createMockTask({ id: '2', timer_minutes: 120 })
      ];

      render(<TimeAnalytics tasks={tasks} projects={mockProjects} />);
      
      expect(screen.getByText('Average Per Task')).toBeInTheDocument();
      expect(screen.getByText('1h 30m')).toBeInTheDocument(); // (60 + 120) / 2 = 90 minutes
    });

    it('should display completed tasks count', () => {
      const tasks: Task[] = [
        createMockTask({ status: 'done', timer_minutes: 60 }),
        createMockTask({ id: '2', status: 'todo', timer_minutes: 30 }),
        createMockTask({ id: '3', status: 'done', timer_minutes: 45 })
      ];

      render(<TimeAnalytics tasks={tasks} projects={mockProjects} />);
      
      expect(screen.getByText('Tasks Completed')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('of 3 tracked')).toBeInTheDocument();
    });

    it('should calculate efficiency score', () => {
      const tasks: Task[] = [
        createMockTask({ estimated_minutes: 100, timer_minutes: 120 }) // 120% efficiency
      ];

      render(<TimeAnalytics tasks={tasks} projects={mockProjects} />);
      
      expect(screen.getByText('Efficiency Score')).toBeInTheDocument();
      expect(screen.getByText('120%')).toBeInTheDocument();
      expect(screen.getByText('Over estimate')).toBeInTheDocument();
    });

    it('should show N/A for efficiency when no estimates', () => {
      const tasks: Task[] = [
        createMockTask({ estimated_minutes: 0, timer_minutes: 60 })
      ];

      render(<TimeAnalytics tasks={tasks} projects={mockProjects} />);
      
      expect(screen.getByText('N/A')).toBeInTheDocument();
      expect(screen.getByText('Set estimates')).toBeInTheDocument();
    });
  });

  describe('Filters', () => {
    it('should render project filter with all projects', () => {
      const tasks: Task[] = [createMockTask()];

      render(<TimeAnalytics tasks={tasks} projects={mockProjects} />);
      
      const projectSelect = screen.getByRole('combobox', { name: /project/i });
      expect(projectSelect).toBeInTheDocument();
      
      // Check options exist
      fireEvent.click(projectSelect);
      expect(screen.getByText('All Projects')).toBeInTheDocument();
      expect(screen.getByText('Personal')).toBeInTheDocument();
      expect(screen.getByText('Work')).toBeInTheDocument();
    });

    it('should render date range filter', () => {
      const tasks: Task[] = [createMockTask()];

      render(<TimeAnalytics tasks={tasks} projects={mockProjects} />);
      
      const dateSelect = screen.getAllByRole('combobox')[1]; // Second select is date range
      expect(dateSelect).toBeInTheDocument();
      
      fireEvent.click(dateSelect);
      expect(screen.getByText('Last 7 days')).toBeInTheDocument();
      expect(screen.getByText('Last 30 days')).toBeInTheDocument();
      expect(screen.getByText('Last 90 days')).toBeInTheDocument();
      expect(screen.getByText('All time')).toBeInTheDocument();
    });

    it('should filter tasks by selected project', () => {
      const tasks: Task[] = [
        createMockTask({ id: '1', project_id: 'p1', timer_minutes: 60 }),
        createMockTask({ id: '2', project_id: 'p2', timer_minutes: 90 })
      ];

      render(<TimeAnalytics tasks={tasks} projects={mockProjects} />);
      
      // Initially shows all tasks (150 minutes = 2h 30m)
      expect(screen.getByText('2h 30m')).toBeInTheDocument();
      
      // Filter to only p1
      const projectSelect = screen.getByRole('combobox', { name: /project/i });
      fireEvent.change(projectSelect, { target: { value: 'p1' } });
      
      // Should only show p1 tasks (60 minutes = 1h)
      expect(screen.getByText('1h')).toBeInTheDocument();
    });

    it('should filter tasks by date range', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 60);
      
      const tasks: Task[] = [
        createMockTask({ id: '1', timer_minutes: 60, updated_at: new Date().toISOString() }),
        createMockTask({ id: '2', timer_minutes: 90, updated_at: oldDate.toISOString() })
      ];

      render(<TimeAnalytics tasks={tasks} projects={mockProjects} />);
      
      const dateSelect = screen.getAllByRole('combobox')[1];
      fireEvent.change(dateSelect, { target: { value: '30' } });
      
      // Should only show recent task (60 minutes = 1h)
      expect(screen.getByText('1h')).toBeInTheDocument();
    });
  });

  describe('Charts', () => {
    it('should render daily time chart', () => {
      const tasks: Task[] = [createMockTask({ timer_minutes: 60 })];

      render(<TimeAnalytics tasks={tasks} projects={mockProjects} />);
      
      expect(screen.getByText('Daily Time Breakdown')).toBeInTheDocument();
    });

    it('should render time by project chart when projects have data', () => {
      const tasks: Task[] = [
        createMockTask({ project_id: 'p1', timer_minutes: 60 })
      ];

      render(<TimeAnalytics tasks={tasks} projects={mockProjects} />);
      
      expect(screen.getByText('Time by Project')).toBeInTheDocument();
    });

    it('should render time by priority chart', () => {
      const tasks: Task[] = [
        createMockTask({ priority: 'urgent_important', timer_minutes: 60 })
      ];

      render(<TimeAnalytics tasks={tasks} projects={mockProjects} />);
      
      expect(screen.getByText('Time by Priority')).toBeInTheDocument();
    });

    it('should render overtime tasks list when tasks exceed estimates', () => {
      const tasks: Task[] = [
        createMockTask({ 
          estimated_minutes: 60, 
          timer_minutes: 120, 
          title: 'Overtime Task' 
        })
      ];

      render(<TimeAnalytics tasks={tasks} projects={mockProjects} />);
      
      expect(screen.getByText('Most Over-Estimate Tasks')).toBeInTheDocument();
      expect(screen.getByText('Overtime Task')).toBeInTheDocument();
      expect(screen.getByText('+100%')).toBeInTheDocument(); // 100% over
    });

    it('should not render overtime list when no tasks are overtime', () => {
      const tasks: Task[] = [
        createMockTask({ 
          estimated_minutes: 100, 
          timer_minutes: 80 
        })
      ];

      render(<TimeAnalytics tasks={tasks} projects={mockProjects} />);
      
      expect(screen.queryByText('Most Over-Estimate Tasks')).not.toBeInTheDocument();
    });
  });

  describe('Efficiency Breakdown', () => {
    it('should show efficiency breakdown when tasks have estimates', () => {
      const tasks: Task[] = [
        createMockTask({ estimated_minutes: 100, timer_minutes: 100 }), // on-time
        createMockTask({ id: '2', estimated_minutes: 100, timer_minutes: 150 }), // overtime
        createMockTask({ id: '3', estimated_minutes: 100, timer_minutes: 70 }) // undertime
      ];

      render(<TimeAnalytics tasks={tasks} projects={mockProjects} />);
      
      expect(screen.getByText('Estimation Accuracy')).toBeInTheDocument();
      expect(screen.getByText('On-time (±10%)')).toBeInTheDocument();
      expect(screen.getByText('Overtime (>10%)')).toBeInTheDocument();
      expect(screen.getByText('Undertime (<-10%)')).toBeInTheDocument();
      
      // Check counts
      expect(screen.getByText('1')).toBeInTheDocument(); // on-time count
    });

    it('should not show efficiency breakdown when no estimates', () => {
      const tasks: Task[] = [
        createMockTask({ estimated_minutes: 0, timer_minutes: 60 })
      ];

      render(<TimeAnalytics tasks={tasks} projects={mockProjects} />);
      
      expect(screen.queryByText('Estimation Accuracy')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle tasks with zero time', () => {
      const tasks: Task[] = [
        createMockTask({ timer_minutes: 0, manual_minutes: 0 })
      ];

      render(<TimeAnalytics tasks={tasks} projects={mockProjects} />);
      
      expect(screen.getByText('No Time Data Yet')).toBeInTheDocument();
    });

    it('should handle tasks without updated_at', () => {
      const tasks: Task[] = [
        createMockTask({ timer_minutes: 60, updated_at: undefined as any })
      ];

      render(<TimeAnalytics tasks={tasks} projects={mockProjects} />);
      
      // Should still render without crashing
      expect(screen.getByText('Time Analytics')).toBeInTheDocument();
    });

    it('should handle tasks with null/undefined time values', () => {
      const tasks: Task[] = [
        createMockTask({ 
          timer_minutes: null as any, 
          manual_minutes: undefined as any 
        })
      ];

      render(<TimeAnalytics tasks={tasks} projects={mockProjects} />);
      
      expect(screen.getByText('No Time Data Yet')).toBeInTheDocument();
    });

    it('should handle very large numbers', () => {
      const tasks: Task[] = [
        createMockTask({ timer_minutes: 10000 }) // ~166 hours
      ];

      render(<TimeAnalytics tasks={tasks} projects={mockProjects} />);
      
      expect(screen.getByText('166h 40m')).toBeInTheDocument();
    });

    it('should handle division by zero in efficiency', () => {
      const tasks: Task[] = [
        createMockTask({ estimated_minutes: 0, timer_minutes: 100 })
      ];

      render(<TimeAnalytics tasks={tasks} projects={mockProjects} />);
      
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });
  });
});
