import fs from 'fs'
import { spawn } from 'child_process'

function readEnvFile(path) {
  const out = {}
  if (!fs.existsSync(path)) return out
  const lines = fs.readFileSync(path, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    let val = trimmed.slice(idx + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith('\'') && val.endsWith('\''))) {
      val = val.slice(1, -1)
    }
    out[key] = val
  }
  return out
}

const fileEnv = readEnvFile('.env.local')
const required = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']
const missing = []
for (const k of required) {
  const v = process.env[k] || fileEnv[k]
  if (!v || String(v).trim() === '') missing.push(k)
}

if (missing.length > 0) {
  console.error('Missing environment variables:', missing.join(', '))
  console.error('Add them to .env.local and re-run: npm run setup')
  process.exit(1)
}

const child = spawn('npm', ['run', 'dev'], { stdio: 'inherit', shell: true })
child.on('exit', (code) => process.exit(code ?? 0))