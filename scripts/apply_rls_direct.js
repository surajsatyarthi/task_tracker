#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Direct database connection
const client = new Client({
  connectionString: process.env.DATABASE_URL || 
    `postgresql://postgres.hbtdufnybrlvszimfcio:${encodeURIComponent('Loki@8890')}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
  ssl: { rejectUnauthorized: false }
});

async function applyRLSFix() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Read migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20241228_fix_rls_policies.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the SQL
    console.log('🔧 Applying RLS policy fixes...\n');
    await client.query(sql);
    
    console.log('✅ RLS policies updated successfully!\n');
    
    // Verify by testing an update
    console.log('🧪 Testing UPDATE operation...');
    const testResult = await client.query(`
      UPDATE tasks 
      SET updated_at = NOW() 
      WHERE id = (SELECT id FROM tasks LIMIT 1)
      RETURNING id;
    `);
    
    if (testResult.rowCount > 0) {
      console.log('✅ UPDATE works!\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await client.end();
  }
}

applyRLSFix();
