import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { requireAuth } from '@/lib/auth'

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const projectSlug = searchParams.get('project')

    let query = supabase
      .from('tasks')
      .select(`
        *,
        projects(*)
      `)
      .order('created_at', { ascending: false })

    if (projectSlug) {
      // First get the project ID by slug for accurate filtering
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('slug', projectSlug)
        .eq('is_active', true)
        .single()

      if (project) {
        query = query.eq('project_id', project.id)
      } else {
        // Project not found, return empty array
        return NextResponse.json({ tasks: [] })
      }
    }

    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching tasks:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ tasks: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
});

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json()
    const { title, project_id, status = 'todo', priority = 'not_urgent_not_important', description, due_date, links = [], tags = [], remarks, estimated_minutes } = body
    
    console.log('[POST /api/tasks] Creating task:', { title, project_id, status, priority, estimated_minutes })
    
    // Validation
    if (!title || !project_id) {
      const errorMsg = `Missing required fields: ${!title ? 'title' : ''} ${!project_id ? 'project_id' : ''}`
      console.error('[POST /api/tasks] Validation error:', errorMsg)
      return NextResponse.json({ error: 'Title and project_id are required', details: errorMsg }, { status: 400 })
    }

    if (title.length > 500) {
      console.error('[POST /api/tasks] Title too long:', title.length)
      return NextResponse.json({ error: 'Title must be 500 characters or less' }, { status: 400 })
    }

    if (description && description.length > 5000) {
      console.error('[POST /api/tasks] Description too long:', description.length)
      return NextResponse.json({ error: 'Description must be 5000 characters or less' }, { status: 400 })
    }
    
    // Parse priority to get flags
    const is_urgent = priority === 'urgent_important' || priority === 'urgent_not_important'
    const is_important = priority === 'urgent_important' || priority === 'not_urgent_important'
    
    // For single-user app, we don't need user_id
    const taskData = {
      title,
      project_id,
      status,
      priority,
      is_urgent,
      is_important,
      description: description || null,
      due_date: due_date || null,
      links: links.length > 0 ? links : null,
      tags: tags.length > 0 ? tags : null,
      remarks: remarks || null,
      estimated_minutes: estimated_minutes || null,
      timer_minutes: 0,
      manual_minutes: 0,
      timer_running: false,
    }
    
    console.log('[POST /api/tasks] Inserting task data:', taskData)
    
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single()
    
    if (error) {
      console.error('[POST /api/tasks] Supabase error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return NextResponse.json({ 
        error: error.message || 'Failed to create task',
        details: error.details,
        hint: error.hint
      }, { status: 500 })
    }
    
    console.log('[POST /api/tasks] Task created successfully:', data?.id)
    return NextResponse.json({ task: data }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/tasks] Unexpected error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ 
      error: errorMessage,
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
});