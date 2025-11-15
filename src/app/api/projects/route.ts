import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { requireAuth } from '@/lib/auth'

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_active', true)  // Only show active projects
      .neq('slug', 'bmn')     // Explicitly exclude BMN project
    
    if (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Custom ordering: CSuite first, then Personal, then others alphabetically
    const orderedData = data?.sort((a, b) => {
      // CSuite should be first
      if (a.slug === 'csuite') return -1;
      if (b.slug === 'csuite') return 1;
      
      // Personal should be second
      if (a.slug === 'personal') return -1;
      if (b.slug === 'personal') return 1;
      
      // Others sorted alphabetically by name
      return a.name.localeCompare(b.name);
    }) || [];
    
    return NextResponse.json({ projects: orderedData })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, color = '#6366f1', description = '' } = body
    
    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
    }
    
    const { data, error } = await supabase
      .from('projects')
      .insert([{ name, slug, color, description, is_active: true }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating project:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ project: data }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}