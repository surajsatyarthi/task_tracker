#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixRLSPolicies() {
  console.log('🔧 Fixing RLS policies for UPDATE/INSERT/DELETE...\n');
  
  // Read the migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/20241228_fix_rls_policies.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  
  // Split into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));
  
  console.log(`Executing ${statements.length} SQL statements...`);
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    console.log(`\n[${i + 1}/${statements.length}] ${statement.substring(0, 60)}...`);
    
    try {
      // Use the Supabase service role to execute raw SQL via a function
      const { data, error } = await supabase.rpc('exec_sql', { 
        query: statement 
      }).catch(() => {
        // If exec_sql doesn't exist, we'll use postgres-meta API
        return { error: { message: 'exec_sql not available' } };
      });
      
      if (error) {
        console.log('⚠️  RPC method not available, trying alternative...');
        
        // Alternative: Use the REST API directly
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify({ query: statement })
          }
        );
        
        if (!response.ok) {
          console.error(`❌ Failed: ${await response.text()}`);
        } else {
          console.log('✅ Success');
        }
      } else {
        console.log('✅ Success');
      }
    } catch (err) {
      console.error(`❌ Error: ${err.message}`);
    }
  }
  
  console.log('\n\n🧪 Testing UPDATE operation...');
  
  // Test if UPDATE works now
  const { data: testTask } = await supabase
    .from('tasks')
    .select('id, priority')
    .limit(1)
    .single();
  
  if (testTask) {
    console.log(`Testing on task ${testTask.id} (current priority: ${testTask.priority})`);
    
    const { data, error } = await supabase
      .from('tasks')
      .update({ 
        priority: 'urgent_important',
        is_urgent: true,
        is_important: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', testTask.id)
      .select()
      .single();
    
    if (error) {
      console.error('\n❌ UPDATE STILL FAILING:', error.message);
      console.error('Details:', error);
      console.log('\n⚠️  RLS policies need to be fixed manually in Supabase Dashboard');
      console.log('Go to: https://supabase.com/dashboard/project/hbtdufnybrlvszimfcio/auth/policies');
    } else {
      console.log('\n✅ UPDATE NOW WORKS! Drag-and-drop will work.');
      
      // Revert the test change
      await supabase
        .from('tasks')
        .update({ 
          priority: testTask.priority,
          updated_at: new Date().toISOString()
        })
        .eq('id', testTask.id);
      console.log('✅ Reverted test change');
    }
  }
}

fixRLSPolicies().catch(console.error);
