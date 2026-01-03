import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { getAuthenticatedUser } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/tasks/[id]/timer - Start/Pause/Stop/Sync timer
export async function POST(
  request: NextRequest,
  context: RouteParams
) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { action, syncMinutes } = body;
    
    // Validate action
    if (!['start', 'pause', 'stop', 'sync'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    // Get current task
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    const now = new Date().toISOString();
    const updates: Record<string, unknown> = { last_timer_sync: now };
    
    switch (action) {
      case 'start':
        // Stop any other running timers first (single timer enforcement)
        await supabase
          .from('tasks')
          .update({ timer_running: false, last_timer_sync: now })
          .eq('timer_running', true)
          .neq('id', id);
        
        // Start this timer
        updates.timer_running = true;
        updates.timer_started_at = now;
        
        // Auto-move to "doing" if not already
        if (task.status !== 'doing') {
          updates.status = 'doing';
        }
        break;
        
      case 'pause':
      case 'stop':
        // Calculate elapsed time
        if (task.timer_started_at && task.timer_running) {
          const startTime = new Date(task.timer_started_at).getTime();
          const elapsedMs = Date.now() - startTime;
          const elapsedMinutes = Math.floor(elapsedMs / 60000);
          updates.timer_minutes = (task.timer_minutes || 0) + elapsedMinutes;
        }
        
        updates.timer_running = false;
        updates.timer_started_at = null;
        break;
        
      case 'sync':
        // Sync current timer value without stopping
        if (syncMinutes !== undefined) {
          updates.timer_minutes = syncMinutes;
        }
        break;
    }
    
    // Update task
    const { data: updated, error: updateError } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    
    return NextResponse.json({ task: updated });
    
  } catch (error) {
    console.error('Timer action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
