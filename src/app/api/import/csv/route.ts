import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { supabase, supabaseAdmin } from '@/lib/supabaseClient'
import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'

function isUrl(s: string) {
  return /^https?:\/\//i.test(s)
}

function mapPriority(s: string): string {
  const v = s.trim().toLowerCase()
  if (v.includes('urgent') && v.includes('imp') && !v.includes('not')) return 'urgent_important'
  if (v.includes('urgent') && v.includes('not') && v.includes('imp')) return 'urgent_not_important'
  if (v.includes('not urgent') && v.includes('imp')) return 'not_urgent_important'
  if (v.includes('not urgent') && v.includes('not imp')) return 'not_urgent_not_important'
  if (v.includes('urgent') && v.includes('not imp')) return 'urgent_not_important'
  if (v.includes('urgent') && v.includes('imp')) return 'urgent_important'
  return 'not_urgent_important'
}

function mapStatus(s: string): string {
  const v = s.trim().toLowerCase()
  if (v === 'done') return 'done'
  if (v === 'doing') return 'doing'
  if (v === 'to do' || v === 'todo' || v === 'to-do') return 'todo'
  if (v === 'on hold' || v === 'on-hold') return 'on_hold'
  if (v === 'help me' || v === 'help_me') return 'help_me'
  return 'todo'
}

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const pCsvPath = path.resolve(process.cwd(), 'P Task - Task List.csv')
    const csaCsvPath = path.resolve(process.cwd(), 'CSA Task trackers - Tasks.csv')

    const { data: existingProjects, error: projErr } = await supabase.from('projects').select('id, slug')
    if (projErr) return NextResponse.json({ error: projErr.message }, { status: 500 })
    const projMap: Record<string, string> = {}
    for (const p of existingProjects || []) projMap[p.slug] = p.id

    async function ensureProject(slug: string, name: string, color: string) {
      if (projMap[slug]) return projMap[slug]
      const res = await supabase
        .from('projects')
        .insert([{ slug, name, color, is_active: true, description: '' }])
        .select('id')
        .single()
      if (res.error) throw new Error(res.error.message)
      projMap[slug] = (res.data as { id: string }).id
      return projMap[slug]
    }

    const personalId = await ensureProject('personal', 'Personal', '#6366f1')
    const csuiteId = await ensureProject('csuite', 'CSuite', '#dc2626')

    // Ensure storage bucket and attempt to download cloud CSVs
    try {
      await supabaseAdmin.storage.createBucket('seeds', { public: true })
    } catch {}
    const storage = supabaseAdmin.storage.from('seeds')

    async function readCsvFromStorageOrLocal(key: string, localPath: string): Promise<string | null> {
      const dl = await storage.download(key)
      if (dl.data) {
        const ab = await dl.data.arrayBuffer()
        return Buffer.from(ab).toString('utf-8')
      }
      if (fs.existsSync(localPath)) {
        const content = fs.readFileSync(localPath, 'utf-8')
        // Try to upload for future cloud use
        const _up = await storage.upload(key, new Blob([content], { type: 'text/csv' }), { upsert: true })
        return content
      }
      return null
    }

    const inserts: Array<Record<string, unknown>> = []

    const personalCsv = await readCsvFromStorageOrLocal('personal.csv', pCsvPath)
    if (personalCsv) {
      const parsed = Papa.parse<string[]>(personalCsv, { skipEmptyLines: true })
      for (const row of parsed.data) {
        const cells = Array.isArray(row) ? row : []
        if (cells.length === 0) continue
        const primary = cells[1]?.trim() || cells[0]?.trim() || ''
        if (!primary) continue
        const links = cells.filter(c => typeof c === 'string' && isUrl(c))
        const priority = 'not_urgent_important'
        const is_urgent = false
        const is_important = true
        inserts.push({
          project_id: personalId,
          title: primary,
          description: null,
          status: 'todo',
          priority,
          is_urgent,
          is_important,
          links,
          tags: [],
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }
    }

    const csuiteCsv = await readCsvFromStorageOrLocal('csuite.csv', csaCsvPath)
    if (csuiteCsv) {
      const parsed = Papa.parse<string[]>(csuiteCsv, { skipEmptyLines: true })
      for (const row of parsed.data) {
        const cells = Array.isArray(row) ? row : []
        if (cells.length === 0) continue
        const title = cells[0]?.trim() || ''
        if (!title) continue
        let priorityStr = ''
        let statusStr = ''
        let owner = ''
        for (const c of cells) {
          if (!c) continue
          const v = String(c).trim()
          if (!priorityStr && /urgent/i.test(v)) priorityStr = v
          if (!statusStr && /done|doing|to do|on hold|help me/i.test(v)) statusStr = v
          if (!owner && v && !isUrl(v) && !/urgent|imp|done|doing|to do|on hold|help me/i.test(v) && v.length < 50) owner = v
        }
        const links = cells.filter(c => typeof c === 'string' && isUrl(c))
        const priority = mapPriority(priorityStr)
        const status = mapStatus(statusStr)
        const is_urgent = priority === 'urgent_important' || priority === 'urgent_not_important'
        const is_important = priority === 'urgent_important' || priority === 'not_urgent_important'
        inserts.push({
          project_id: csuiteId,
          title,
          description: null,
          status,
          priority,
          is_urgent,
          is_important,
          owner: owner || null,
          links,
          tags: [],
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }
    }

    const { data: existingPersonal, error: ePer } = await supabase
      .from('tasks')
      .select('title')
      .eq('project_id', personalId)
    const { data: existingCsuite, error: eCs } = await supabase
      .from('tasks')
      .select('title')
      .eq('project_id', csuiteId)
    if (ePer || eCs) return NextResponse.json({ error: (ePer || eCs)!.message }, { status: 500 })
    const personalTitles = new Set((existingPersonal || []).map((t: { title: string }) => t.title.toLowerCase()))
    const csuiteTitles = new Set((existingCsuite || []).map((t: { title: string }) => t.title.toLowerCase()))
    const filtered = inserts.filter(rec => {
      const pid = rec.project_id as string
      const title = String(rec.title || '').toLowerCase()
      if (pid === personalId) return !personalTitles.has(title)
      if (pid === csuiteId) return !csuiteTitles.has(title)
      return true
    })

    const size = 100
    for (let i = 0; i < filtered.length; i += size) {
      const chunk = filtered.slice(i, i + size)
      const res = await supabase.from('tasks').insert(chunk)
      if (res.error) return NextResponse.json({ error: res.error.message }, { status: 500 })
    }

    return NextResponse.json({ imported: filtered.length })
  } catch (error) {
    console.error('CSV import error:', error);
    return NextResponse.json({
      error: 'Import failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
})