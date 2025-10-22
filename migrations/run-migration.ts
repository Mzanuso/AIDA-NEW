/**
 * Migration Runner
 * Executes SQL migrations against Supabase database
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('   Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigration(migrationFile: string) {
  const migrationPath = path.join(__dirname, migrationFile);

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationFile}`);
    process.exit(1);
  }

  console.log(`📄 Reading migration: ${migrationFile}`);
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log(`🔄 Executing SQL migration...`);

  try {
    // Execute the SQL using Supabase RPC
    // Note: This requires the migration SQL to be executed via raw SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If exec_sql doesn't exist, try direct execution
      // This will work if we have direct database access
      console.log('⚠️  exec_sql RPC not found, attempting direct execution...');

      // For Supabase, we need to use the database connection directly
      // Since we're using the service role key, we can execute raw SQL
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        },
        body: JSON.stringify({ sql_query: sql })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      console.log('✅ Migration executed successfully via HTTP');
    } else {
      console.log('✅ Migration executed successfully via RPC');
    }

  } catch (err: any) {
    console.error('❌ Migration failed:', err.message);
    console.error('\n📋 Manual Execution Required:');
    console.error('   1. Go to Supabase Dashboard → SQL Editor');
    console.error(`   2. Open: ${migrationPath}`);
    console.error('   3. Copy and paste the SQL');
    console.error('   4. Click "Run"\n');
    console.error('OR use psql:');
    console.error(`   psql $DATABASE_URL -f ${migrationPath}\n`);
    process.exit(1);
  }
}

// Run the migration
const migrationFile = process.argv[2] || '001_workflow_states.sql';
runMigration(migrationFile).then(() => {
  console.log('\n✅ Migration completed successfully!');
  process.exit(0);
}).catch((err) => {
  console.error('\n❌ Migration runner failed:', err);
  process.exit(1);
});
