import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest) {
  try {
    const token = process.env.VERCEL_TOKEN
    const projectId = process.env.VERCEL_PROJECT_ID
    if (!token || !projectId) {
      return NextResponse.json({ error: 'Missing Vercel token or project id', ready: false }, { status: 400 })
    }
    const res = await fetch(`https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=1`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch deployment status', ready: false }, { status: 500 })
    }
    const data = await res.json() as { deployments?: Array<{ url: string; readyState: string; meta?: Record<string, unknown> }> }
    const latest = data.deployments?.[0]
    if (!latest) {
      return NextResponse.json({ ready: false, status: 'not_found' })
    }
    return NextResponse.json({
      ready: latest.readyState === 'READY',
      status: latest.readyState,
      url: latest.url ? `https://${latest.url}` : undefined
    })
  } catch {
    return NextResponse.json({ error: 'Unexpected error', ready: false }, { status: 500 })
  }
}