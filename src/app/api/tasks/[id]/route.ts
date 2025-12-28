import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { getAuthenticatedUser } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params;
  try {
    const body = await request.json()
    
    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    // Only include fields that are provided
    if (body.title !== undefined) updateData.title = body.title;
    if (body.project_id !== undefined) updateData.project_id = body.project_id;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.due_date !== undefined) updateData.due_date = body.due_date;
    if (body.completed_date !== undefined) updateData.completed_date = body.completed_date;
    if (body.links !== undefined) updateData.links = body.links || [];
    if (body.tags !== undefined) updateData.tags = body.tags || [];
    if (body.remarks !== undefined) updateData.remarks = body.remarks;
    if (body.owner !== undefined) updateData.owner = body.owner;
    if (body.department !== undefined) updateData.department = body.department;
    
    // Handle priority and flags
    if (body.priority !== undefined) {
      updateData.priority = body.priority;
      updateData.is_urgent = body.priority === 'urgent_important' || body.priority === 'urgent_not_important';
      updateData.is_important = body.priority === 'urgent_important' || body.priority === 'not_urgent_important';
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating task:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ task: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params;
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting task:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
