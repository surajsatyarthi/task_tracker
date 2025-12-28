# CRITICAL: RLS Policy Fix Required

## ❌ Root Cause Analysis

**Error**: "Cannot coerce the result to a single JSON object"  
**When**: Dragging cards between quadrants in Eisenhower Matrix

### The Problem:
1. Supabase has Row Level Security (RLS) enabled on `tasks` table
2. Current RLS policies ONLY allow `SELECT` (reading)
3. **NO policies exist for `UPDATE`, `INSERT`, or `DELETE`**
4. When frontend tries to UPDATE priority, RLS blocks it
5. Update returns 0 rows (blocked by RLS)
6. `.single()` expects 1 row, gets 0 → ERROR

### Evidence:
```bash
# Test with ANON key (what frontend uses):
❌ FAILED: Cannot coerce the result to a single JSON object

# Test with SERVICE ROLE key (bypasses RLS):
✅ SUCCESS: Update works
```

### Current RLS Policies (from migration):
```sql
CREATE POLICY "Tasks are viewable by everyone" ON tasks FOR SELECT USING (true);
-- ❌ NO UPDATE POLICY!
-- ❌ NO INSERT POLICY!
-- ❌ NO DELETE POLICY!
```

## ✅ The Fix

RLS policies must allow ALL operations for single-user app.

### Option 1: Apply via Supabase Dashboard (RECOMMENDED)

1. Go to: https://supabase.com/dashboard/project/hbtdufnybrlvszimfcio/auth/policies

2. **For `tasks` table**, delete existing policies and create ONE new policy:
   - Policy Name: `Enable all operations for single user app`
   - Command: `ALL`
   - Target roles: `public`
   - USING expression: `true`
   - WITH CHECK expression: `true`

3. **Repeat for these tables**:
   - `projects`
   - `task_progress`  
   - `csv_imports`

### Option 2: SQL via Supabase Dashboard SQL Editor

Go to: https://supabase.com/dashboard/project/hbtdufnybrlvszimfcio/sql/new

Run this SQL:

```sql
-- Drop restrictive policies
DROP POLICY IF EXISTS "Projects are viewable by everyone" ON projects;
DROP POLICY IF EXISTS "Tasks are viewable by everyone" ON tasks;
DROP POLICY IF EXISTS "Task progress is viewable by everyone" ON task_progress;
DROP POLICY IF EXISTS "CSV imports are viewable by everyone" ON csv_imports;

-- Create permissive policies for single-user app
CREATE POLICY "Enable all operations on projects" 
  ON projects FOR ALL 
  USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations on tasks" 
  ON tasks FOR ALL 
  USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations on task_progress" 
  ON task_progress FOR ALL 
  USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations on csv_imports" 
  ON csv_imports FOR ALL 
  USING (true) WITH CHECK (true);
```

## ✅ Verification

After applying the fix, test with:

```bash
node scripts/test_drag_drop.js
```

Expected output:
```
✅ DRAG-AND-DROP FIXED!
✅ Task updated successfully with ANON KEY
✅ Eisenhower Matrix drag-and-drop will work now
```

## Files Created

- ✅ Migration file: `supabase/migrations/20241228_fix_rls_policies.sql`
- ✅ Test script: `scripts/test_drag_drop.js`
- ✅ This documentation: `RLS_FIX_REQUIRED.md`

## Why Automated Fix Failed

The Supabase JS client doesn't support executing raw DDL (CREATE POLICY, DROP POLICY) directly.  
The SQL must be run via:
- Supabase Dashboard SQL Editor (easiest)
- Supabase CLI with direct database connection
- Database admin tool (pgAdmin, DBeaver, etc.)
