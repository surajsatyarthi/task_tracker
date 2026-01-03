'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Task } from '@/types/task';
import { supabase } from '@/contexts/AuthContext';

export function useTaskTimer(task: Task | null) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(task?.timer_running || false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncRef = useRef<number>(0);
  
  // Calculate initial elapsed time
  useEffect(() => {
    if (!task) return;
    
    if (task.timer_running && task.timer_started_at) {
      const startTime = new Date(task.timer_started_at).getTime();
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(elapsed);
      setIsRunning(true);
    } else {
      setElapsedSeconds(0);
      setIsRunning(false);
    }
  }, [task?.id, task?.timer_running, task?.timer_started_at]);
  
  // Auto-sync every 30 seconds
  const syncTimer = useCallback(async () => {
    if (!task || !isRunning) return;
    
    const totalMinutes = (task.timer_minutes || 0) + Math.floor(elapsedSeconds / 60);
    
    try {
      const session = await supabase.auth.getSession();
      await fetch(`/api/tasks/${task.id}/timer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session?.access_token}`,
        },
        body: JSON.stringify({
          action: 'sync',
          syncMinutes: totalMinutes,
        }),
      });
      lastSyncRef.current = Date.now();
    } catch (error) {
      console.error('Timer sync failed:', error);
    }
  }, [task, isRunning, elapsedSeconds]);
  
  // Timer tick
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    
    intervalRef.current = setInterval(() => {
      setElapsedSeconds(prev => {
        const newSeconds = prev + 1;
        
        // Auto-sync every 30 seconds
        if (newSeconds % 30 === 0) {
          syncTimer();
        }
        
        return newSeconds;
      });
    }, 1000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, syncTimer]);
  
  // Actions
  const startTimer = useCallback(async () => {
    if (!task) return;
    
    const session = await supabase.auth.getSession();
    const response = await fetch(`/api/tasks/${task.id}/timer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.data.session?.access_token}`,
      },
      body: JSON.stringify({ action: 'start' }),
    });
    
    if (response.ok) {
      setIsRunning(true);
      setElapsedSeconds(0);
      // Trigger parent to refetch task
      window.dispatchEvent(new CustomEvent('task-timer-changed', { detail: { taskId: task.id } }));
    }
  }, [task]);
  
  const pauseTimer = useCallback(async () => {
    if (!task) return;
    
    // Sync current time before pausing
    const totalMinutes = (task.timer_minutes || 0) + Math.floor(elapsedSeconds / 60);
    
    const session = await supabase.auth.getSession();
    const response = await fetch(`/api/tasks/${task.id}/timer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.data.session?.access_token}`,
      },
      body: JSON.stringify({ 
        action: 'pause',
        timer_minutes: totalMinutes 
      }),
    });
    
    if (response.ok) {
      setIsRunning(false);
      // Keep elapsed seconds - don't reset
      window.dispatchEvent(new CustomEvent('task-timer-changed', { detail: { taskId: task.id } }));
    }
  }, [task, elapsedSeconds]);
  
  const stopTimer = useCallback(async () => {
    if (!task) return;
    
    // Sync before stopping
    await syncTimer();
    
    const session = await supabase.auth.getSession();
    const response = await fetch(`/api/tasks/${task.id}/timer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.data.session?.access_token}`,
      },
      body: JSON.stringify({ action: 'stop' }),
    });
    
    if (response.ok) {
      setIsRunning(false);
      setElapsedSeconds(0);
      window.dispatchEvent(new CustomEvent('task-timer-changed', { detail: { taskId: task.id } }));
    }
  }, [task, syncTimer]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRunning) {
        syncTimer(); // Final sync
      }
    };
  }, [isRunning, syncTimer]);
  
  const totalMinutes = task ? (task.timer_minutes || 0) + Math.floor(elapsedSeconds / 60) : 0;
  const displayMinutes = Math.floor(elapsedSeconds / 60);
  const displaySeconds = elapsedSeconds % 60;
  
  return {
    isRunning,
    elapsedSeconds,
    totalMinutes,
    displayMinutes,
    displaySeconds,
    startTimer,
    pauseTimer,
    stopTimer,
  };
}
