#!/usr/bin/env node

/**
 * Verify Supabase Configuration
 * Checks what buckets and tables exist on Supabase
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Verifying Supabase Configuration...\n');
console.log(`📍 Project URL: ${supabaseUrl}\n`);

// Check Storage Buckets
async function checkBuckets() {
  console.log('📦 Storage Buckets:');
  console.log('─'.repeat(50));

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('❌ Error listing buckets:', error.message);
      return;
    }

    if (!buckets || buckets.length === 0) {
      console.log('⚠️  No buckets found\n');
      return;
    }

    for (const bucket of buckets) {
      console.log(`\n✅ Bucket: "${bucket.name}"`);
      console.log(`   Public: ${bucket.public ? 'Yes' : 'No'}`);
      console.log(`   Created: ${bucket.created_at}`);

      // Try to list files in bucket
      const { data: files, error: filesError } = await supabase.storage
        .from(bucket.name)
        .list('', { limit: 5 });

      if (filesError) {
        console.log(`   Files: Error - ${filesError.message}`);
      } else {
        console.log(`   Files: ${files.length > 0 ? files.length + ' found' : 'Empty'}`);
        if (files.length > 0) {
          files.slice(0, 3).forEach(file => {
            console.log(`     - ${file.name}`);
          });
        }
      }
    }

    console.log('');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Check Database Tables
async function checkTables() {
  console.log('\n📊 Database Tables:');
  console.log('─'.repeat(50));

  try {
    // Query pg_tables to get all user tables
    const { data: tables, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');

    if (error) {
      console.log('⚠️  Cannot query pg_tables directly. Checking specific tables...\n');

      // Try specific table names
      const tablesToCheck = ['styles', 'sref_styles', 'style_references', 'projects', 'users'];

      for (const tableName of tablesToCheck) {
        const { data, error: tableError } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (!tableError) {
          console.log(`✅ Table "${tableName}" exists`);
          console.log(`   Rows: ${data?.length || 0}`);
        }
      }
    } else {
      if (!tables || tables.length === 0) {
        console.log('⚠️  No tables found in public schema\n');
        return;
      }

      console.log(`\nFound ${tables.length} tables:\n`);

      for (const table of tables) {
        const tableName = table.tablename;

        // Get row count
        const { count, error: countError } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (!countError) {
          console.log(`✅ ${tableName} (${count || 0} rows)`);
        } else {
          console.log(`⚠️  ${tableName} (cannot read)`);
        }
      }

      console.log('');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Check specific style-related data
async function checkStylesData() {
  console.log('\n🎨 Style References Check:');
  console.log('─'.repeat(50));

  const styleTables = ['styles', 'sref_styles', 'style_references'];

  for (const tableName of styleTables) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .limit(3);

      if (!error && data) {
        console.log(`\n✅ Table "${tableName}": ${count} total rows`);

        if (data.length > 0) {
          console.log('   Sample columns:', Object.keys(data[0]).join(', '));
        }
      }
    } catch (err) {
      // Table doesn't exist, skip
    }
  }

  console.log('\n');
}

// Run all checks
(async () => {
  await checkBuckets();
  await checkTables();
  await checkStylesData();

  console.log('✅ Verification complete!\n');
})();
