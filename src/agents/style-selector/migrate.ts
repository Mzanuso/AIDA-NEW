/**
 * Supabase Migration Runner
 *
 * Executes SQL migrations on Supabase database
 * Run: npx tsx migrate.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: join(__dirname, '../../../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration(filename: string) {
  console.log(`\n📋 Running migration: ${filename}`);

  try {
    // Read SQL file
    const sqlPath = join(__dirname, 'migrations', filename);
    const sql = readFileSync(sqlPath, 'utf-8');

    console.log('📄 SQL loaded, executing...\n');

    // Execute SQL using Supabase RPC
    // Note: For complex migrations, we'll use the REST API directly
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      // If RPC doesn't work, try direct SQL execution via pg
      console.log('⚠️  RPC not available, using alternative method...');
      console.log('📝 SQL to execute:\n');
      console.log(sql);
      console.log('\n⚠️  Please run this SQL manually in Supabase SQL Editor:');
      console.log(`   https://supabase.com/dashboard/project/qnhozzpuchwrdasmfezz/sql/new`);
      return false;
    }

    const result = await response.json();
    console.log('✅ Migration completed successfully!');
    console.log('Result:', result);
    return true;

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    return false;
  }
}

async function verifyTable() {
  console.log('\n🔍 Verifying table creation...');

  try {
    const { data, error, count } = await supabase
      .from('style_references')
      .select('*', { count: 'exact' });

    if (error) {
      console.error('❌ Error querying table:', error.message);
      return false;
    }

    console.log(`✅ Table exists! Found ${count} records`);

    if (data && data.length > 0) {
      console.log('\n📊 Sample record:');
      console.log(JSON.stringify(data[0], null, 2));
    }

    return true;

  } catch (error: any) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 AIDA Style Selector - Database Migration');
  console.log('==========================================');
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
  console.log(`🔑 Service key: ${SUPABASE_SERVICE_KEY.substring(0, 20)}...`);

  // Run migration
  const migrated = await runMigration('001_create_style_references.sql');

  if (!migrated) {
    console.log('\n⚠️  Manual migration required. Please:');
    console.log('1. Go to Supabase SQL Editor');
    console.log('2. Copy the SQL from migrations/001_create_style_references.sql');
    console.log('3. Execute it manually');
    console.log('4. Run this script again to verify');
  }

  // Verify
  await verifyTable();

  console.log('\n✅ Migration process complete!');
}

main().catch(console.error);
