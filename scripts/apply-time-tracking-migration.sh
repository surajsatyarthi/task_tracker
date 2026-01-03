#!/bin/bash

# Apply time tracking migration to Supabase
# Usage: ./apply-time-tracking-migration.sh

set -e

echo "🔄 Applying time tracking migration to Supabase..."

# Read the migration SQL
MIGRATION_SQL=$(cat supabase/migrations/20260102_add_time_tracking.sql)

# Use Node.js to apply the migration via Supabase client
node << 'EOF'
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const migrationSQL = `
ALTER TABLE tasks 
  ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS timer_minutes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS manual_minutes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS timer_started_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS timer_running BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_timer_sync TIMESTAMP WITH TIME ZONE DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_timer_running ON tasks(timer_running) WHERE timer_running = true;
CREATE INDEX IF NOT EXISTS idx_tasks_timer_started ON tasks(timer_started_at) WHERE timer_started_at IS NOT NULL;
`;

async function applyMigration() {
  try {
    console.log('📝 Executing migration SQL...');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      // Try direct query if rpc doesn't work
      console.log('⚠️  RPC method not available, trying direct queries...');
      
      // Check if columns exist first
      const { data: columns, error: checkError } = await supabase
        .from('tasks')
        .select('*')
        .limit(1);
      
      if (checkError) {
        console.error('❌ Error checking table:', checkError);
        process.exit(1);
      }
      
      // Check if estimated_minutes column exists
      const firstRow = columns[0];
      if (firstRow && 'estimated_minutes' in firstRow) {
        console.log('✅ Time tracking columns already exist!');
        process.exit(0);
      } else {
        console.log('⚠️  Columns don\'t exist. Migration needs to be applied via Supabase dashboard.');
        console.log('\n📋 Please run this SQL in Supabase SQL Editor:');
        console.log('=====================================');
        console.log(migrationSQL);
        console.log('=====================================');
        process.exit(1);
      }
    } else {
      console.log('✅ Migration applied successfully!');
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

applyMigration();
EOF

echo "✅ Migration check complete"
