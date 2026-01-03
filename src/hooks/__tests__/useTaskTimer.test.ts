import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTaskTimer } from '@/hooks/useTaskTimer';
import { Task } from '@/types/task';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock fetch
global.fetch = vi.fn();

// Mock supabase auth
vi.mock('@/contexts/AuthContext', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'mock-token' } }
      })
    }
  }
}));

describe('useTaskTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockTask: Task = {
    id: 'test-task-1',
    title: 'Test Task',
    user_id: 'user-1',
    status: 'doing',
    estimated_minutes: 60,
    timer_minutes: 0,
    timer_running: false,
    timer_started_at: undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  it('initializes with stopped state', () => {
    const { result } = renderHook(() => useTaskTimer(mockTask));

    expect(result.current.isRunning).toBe(false);
    expect(result.current.elapsedSeconds).toBe(0);
    expect(result.current.totalMinutes).toBe(0);
    expect(result.current.displayMinutes).toBe(0);
    expect(result.current.displaySeconds).toBe(0);
  });

  it('starts timer and increments seconds', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockResolvedValueOnce({ ok: true });

    const { result } = renderHook(() => useTaskTimer(mockTask));

    // Start timer
    await act(async () => {
      await result.current.startTimer();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/tasks/test-task-1/timer',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ action: 'start' })
      })
    );

    expect(result.current.isRunning).toBe(true);

    // Advance time by 5 seconds
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.elapsedSeconds).toBe(5);
    expect(result.current.displaySeconds).toBe(5);
  });

  it('pauses timer and preserves elapsed time', async () => {
    (global.fetch as any).mockResolvedValue({ ok: true });

    const { result } = renderHook(() => useTaskTimer(mockTask));

    // Start timer
    await act(async () => {
      await result.current.startTimer();
    });

    // Run for 10 seconds
    await act(async () => {
      vi.advanceTimersByTime(10000);
    });

    expect(result.current.elapsedSeconds).toBe(10);

    // Pause
    await act(async () => {
      await result.current.pauseTimer();
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.elapsedSeconds).toBe(10); // Should preserve time

    // Verify pause API call
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/tasks/test-task-1/timer',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ 
          action: 'pause',
          timer_minutes: 0 // 10 seconds = 0 minutes
        })
      })
    );
  });

  it('stops timer and resets elapsed time', async () => {
    (global.fetch as any).mockResolvedValue({ ok: true });

    const { result } = renderHook(() => useTaskTimer(mockTask));

    // Start and run for 15 seconds
    await act(async () => {
      await result.current.startTimer();
    });

    await act(async () => {
      vi.advanceTimersByTime(15000);
    });

    expect(result.current.elapsedSeconds).toBe(15);

    // Stop
    await act(async () => {
      await result.current.stopTimer();
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.elapsedSeconds).toBe(0); // Should reset
  });

  it('calculates total minutes correctly', async () => {
    (global.fetch as any).mockResolvedValue({ ok: true });

    const taskWithExistingTime: Task = {
      ...mockTask,
      timer_minutes: 5, // 5 minutes already logged
    };

    const { result } = renderHook(() => useTaskTimer(taskWithExistingTime));

    // Start and run for 120 seconds (2 minutes)
    await act(async () => {
      await result.current.startTimer();
    });

    await act(async () => {
      vi.advanceTimersByTime(120000);
    });

    // Total should be 5 (existing) + 2 (current) = 7 minutes
    expect(result.current.totalMinutes).toBe(7);
    expect(result.current.displayMinutes).toBe(2);
  });

  it('auto-syncs every 30 seconds', async () => {
    (global.fetch as any).mockResolvedValue({ ok: true });

    const { result } = renderHook(() => useTaskTimer(mockTask));

    // Start timer
    await act(async () => {
      await result.current.startTimer();
    });

    // Clear the start call
    vi.clearAllMocks();

    // Advance to 30 seconds
    await act(async () => {
      vi.advanceTimersByTime(30000);
      await Promise.resolve(); // Flush promises
    });

    // Should have auto-synced
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/tasks/test-task-1/timer',
      expect.objectContaining({
        body: JSON.stringify({
          action: 'sync',
          syncMinutes: 0
        })
      })
    );
  }, 10000);

  it('handles running timer from database', () => {
    const runningTask: Task = {
      ...mockTask,
      timer_running: true,
      timer_started_at: new Date(Date.now() - 10000).toISOString(), // Started 10 seconds ago
    };

    const { result } = renderHook(() => useTaskTimer(runningTask));

    expect(result.current.isRunning).toBe(true);
    expect(result.current.elapsedSeconds).toBeGreaterThanOrEqual(9);
    expect(result.current.elapsedSeconds).toBeLessThanOrEqual(11);
  });

  it('provides start, pause, and stop functions', () => {
    const { result } = renderHook(() => useTaskTimer(mockTask));

    expect(typeof result.current.startTimer).toBe('function');
    expect(typeof result.current.pauseTimer).toBe('function');
    expect(typeof result.current.stopTimer).toBe('function');
  });

  it('formats display time correctly', async () => {
    (global.fetch as any).mockResolvedValue({ ok: true });

    const { result } = renderHook(() => useTaskTimer(mockTask));

    await act(async () => {
      await result.current.startTimer();
    });

    // Run for 3 minutes and 45 seconds (225 seconds)
    await act(async () => {
      vi.advanceTimersByTime(225000);
    });

    expect(result.current.displayMinutes).toBe(3);
    expect(result.current.displaySeconds).toBe(45);
  });
});
