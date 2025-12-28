require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addUserIdColumn() {
  console.log('🔧 Adding user_id column to tasks table...\n');
  
  // Execute SQL to add user_id column
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      -- Add user_id column if it doesn't exist
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'tasks' AND column_name = 'user_id'
        ) THEN
          ALTER TABLE tasks ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
          CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
          RAISE NOTICE 'Added user_id column and index';
        ELSE
          RAISE NOTICE 'user_id column already exists';
        END IF;
      END $$;
    `
  });
  
  if (error) {
    console.log('❌ RPC method not available, using direct query instead...\n');
    
    // Alternative: Use Supabase SQL editor or add via migration
    console.log('Please run this SQL in Supabase SQL Editor:');
    console.log(`
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
    `);
    return;
  }
  
  console.log('✅ user_id column added successfully!');
}

addUserIdColumn().catch(console.error);
