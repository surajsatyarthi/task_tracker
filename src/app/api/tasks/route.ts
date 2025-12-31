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
    const { title, project_id, status = 'todo', priority = 'not_urgent_not_important', description, due_date, links = [], tags = [], remarks } = body
    
    if (!title || !project_id) {
      return NextResponse.json({ error: 'Title and project_id are required' }, { status: 400 })
    }

    if (title.length > 500) {
      return NextResponse.json({ error: 'Title must be 500 characters or less' }, { status: 400 })
    }

    if (description && description.length > 5000) {
      return NextResponse.json({ error: 'Description must be 5000 characters or less' }, { status: 400 })
    }
    
    // Parse priority to get flags
    const is_urgent = priority === 'urgent_important' || priority === 'urgent_not_important'
    const is_important = priority === 'urgent_important' || priority === 'not_urgent_important'
    
    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        title,
        project_id,
        status,
        priority,
        is_urgent,
        is_important,
        description,
        due_date,
        links,
        tags,
        remarks,
        user_id: user.id // Associate task with user
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating task:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ task: data }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
});