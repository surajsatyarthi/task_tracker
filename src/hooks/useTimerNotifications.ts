'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Task } from '@/types/task';

export function useTimerNotifications(task: Task | null, totalMinutes: number) {
  const notifiedAt50 = useRef(false);
  const notifiedAt80 = useRef(false);
  const notifiedAt100 = useRef(false);
  const permissionGranted = useRef(false);
  
  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    
    if (Notification.permission === 'granted') {
      permissionGranted.current = true;
      return true;
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      permissionGranted.current = permission === 'granted';
      return permission === 'granted';
    }
    
    return false;
  }, []);
  
  // Show notification
  const showNotification = useCallback((title: string, body: string) => {
    if (!permissionGranted.current) return;
    
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `task-${task?.id}`,
      requireInteraction: false,
    });
    
    // Auto-close after 10 seconds
    setTimeout(() => notification.close(), 10000);
  }, [task?.id]);
  
  // Check thresholds
  useEffect(() => {
    if (!task || !task.estimated_minutes || !task.timer_running) {
      // Reset flags when timer stops
      notifiedAt50.current = false;
      notifiedAt80.current = false;
      notifiedAt100.current = false;
      return;
    }
    
    const percentage = (totalMinutes / task.estimated_minutes) * 100;
    
    if (percentage >= 50 && !notifiedAt50.current) {
      notifiedAt50.current = true;
      showNotification(
        '⏱️ Halfway There',
        `${task.title}: 50% of estimated time used`
      );
    }
    
    if (percentage >= 80 && !notifiedAt80.current) {
      notifiedAt80.current = true;
      showNotification(
        '⚠️ Time Running Out',
        `${task.title}: 80% of estimated time used`
      );
    }
    
    if (percentage >= 100 && !notifiedAt100.current) {
      notifiedAt100.current = true;
      showNotification(
        '🚨 Time Exceeded',
        `${task.title}: Estimated time reached! Task taking longer than expected.`
      );
    }
  }, [task, totalMinutes, showNotification]);
  
  // Request permission on mount
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);
  
  return { requestPermission };
}
