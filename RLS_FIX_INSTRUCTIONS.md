# 🚨 DRAG-AND-DROP ERROR - FIX REQUIRED

## Root Cause Analysis (RCA)

### ❌ THE PROBLEM
When you drag a card between quadrants in the Eisenhower Matrix, you get:
```
Error Loading Data
Cannot coerce the result to a single JSON object
```

### 🔍 ROOT CAUSE
1. **Row Level Security (RLS)** is enabled on the `tasks` table in Supabase
2. The current RLS policies **ONLY allow SELECT** (reading data)
3. **NO policies exist for UPDATE, INSERT, or DELETE operations**
4. When the frontend tries to update a task's priority:
   - The UPDATE query runs
   - RLS blocks it (no UPDATE policy exists)
   - 0 rows are affected
   - The `.single()` method expects 1 row, gets 0
   - Error: "Cannot coerce the result to a single JSON object"

### ✅ PROOF
I tested with both keys:
- **ANON KEY** (what frontend uses): ❌ FAILS with RLS error
- **SERVICE ROLE KEY** (bypasses RLS): ✅ WORKS perfectly

This confirms RLS is blocking the updates.

## 🛠️ THE FIX

You need to add RLS policies that allow UPDATE/INSERT/DELETE operations.

### EASIEST METHOD: Supabase Dashboard SQL Editor

1. **Open this URL**:
   ```
   https://supabase.com/dashboard/project/hbtdufnybrlvszimfcio/sql/new
   ```

2. **Copy and paste this SQL**:
   ```sql
   -- Fix RLS policies to allow all operations
   DROP POLICY IF EXISTS "Projects are viewable by everyone" ON projects;
   DROP POLICY IF EXISTS "Tasks are viewable by everyone" ON tasks;
   DROP POLICY IF EXISTS "Task progress is viewable by everyone" ON task_progress;
   DROP POLICY IF EXISTS "CSV imports are viewable by everyone" ON csv_imports;

   CREATE POLICY "Enable all operations on projects" ON projects FOR ALL USING (true) WITH CHECK (true);
   CREATE POLICY "Enable all operations on tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
   CREATE POLICY "Enable all operations on task_progress" ON task_progress FOR ALL USING (true) WITH CHECK (true);
   CREATE POLICY "Enable all operations on csv_imports" ON csv_imports FOR ALL USING (true) WITH CHECK (true);
   ```

3. **Click "RUN"**

4. **Verify it worked**:
   ```bash
   node scripts/test_drag_drop.js
   ```
   
   Expected output:
   ```
   ✅ DRAG-AND-DROP FIXED!
   ✅ Task updated successfully with ANON KEY
   ✅ Eisenhower Matrix drag-and-drop will work now
   ```

## 📁 Files Created

- ✅ `supabase/migrations/20241228_fix_rls_policies.sql` - The migration SQL
- ✅ `scripts/test_drag_drop.js` - Test script to verify fix
- ✅ `RLS_FIX_INSTRUCTIONS.md` - This file

## ⏱️ Time Saved

Once you apply this 30-second fix, drag-and-drop will work immediately. No deployment needed - it's a database-only change.

## 🔐 Security Note

Since this is a single-user app, allowing all operations with `USING (true) WITH CHECK (true)` is appropriate. For multi-user apps, you'd add user-based filters.
