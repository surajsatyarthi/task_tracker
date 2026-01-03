// Check if user_id column exists in tasks table
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  console.log('\n🔍 Checking tasks table schema...\n');

  try {
    // Try to select all columns from tasks table
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error querying tasks:', error.message);
      return;
    }

    console.log('✅ Successfully queried tasks table');
    
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log('\n📋 Columns in tasks table:');
      columns.forEach(col => {
        console.log(`   - ${col}`);
      });
      
      if (columns.includes('user_id')) {
        console.log('\n✅ user_id column EXISTS');
      } else {
        console.log('\n❌ user_id column MISSING');
        console.log('\n💡 Need to run migration:');
        console.log('   ALTER TABLE tasks ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;');
      }
    } else {
      console.log('\n⚠️  No tasks found, cannot verify column structure');
      console.log('   Attempting to check with empty insert...');
      
      // Try to get column info from error
      const { error: insertError } = await supabase
        .from('tasks')
        .insert([{ title: '_test_' }])
        .select();
      
      if (insertError) {
        console.log('\n📝 Insert error details:', insertError.message);
        if (insertError.message.includes('user_id')) {
          console.log('✅ user_id column exists (error mentions it)');
        }
      }
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

checkSchema();
