const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
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
  console.log('🔄 Applying time tracking migration...');
  
  try {
    // Try to execute SQL directly via Supabase Postgres API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: migrationSQL })
    });

    if (!response.ok) {
      console.log('⚠️  Direct SQL execution not available');
      console.log('📋 Please run this SQL in Supabase Dashboard:');
      console.log('https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1].split('.')[0] + '/sql/new');
      console.log('=====================================');
      console.log(migrationSQL);
      console.log('=====================================');
      process.exit(1);
    }

    console.log('✅ Migration applied successfully!');
    
    // Verify
    const { data, error } = await supabase.from('tasks').select('*').limit(1);
    if (data && data[0] && 'estimated_minutes' in data[0]) {
      console.log('✅ Verified: Time tracking columns exist');
    } else {
      console.log('⚠️  Verification: Columns may not be visible yet (try refreshing schema)');
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.log('\n📋 Please apply migration manually in Supabase Dashboard:');
    console.log('https://supabase.com/dashboard/project/hbtdufnybrlvszimfcio/sql/new');
    console.log('=====================================');
    console.log(migrationSQL);
    console.log('=====================================');
    process.exit(1);
  }
}

applyMigration();
