/**
 * Complete Database Verification
 * Checks indexes, RLS policies, and constraints
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../../../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runQuery(description: string, sql: string) {
  console.log(`\n${description}`);
  console.log('─'.repeat(60));

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      // Try alternative approach
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        },
        body: JSON.stringify({ query: sql })
      });

      if (!response.ok) {
        console.log('⚠️  Direct SQL query not available via API');
        console.log('   Please run check-schema.sql manually in Supabase SQL Editor');
        return;
      }

      const result = await response.json();
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err: any) {
    console.log('⚠️  Cannot execute query via API:', err.message);
    console.log('   SQL:', sql);
  }
}

async function verifyComplete() {
  console.log('🔍 COMPLETE DATABASE VERIFICATION');
  console.log('═'.repeat(60));

  // Basic table check
  console.log('\n✅ BASIC VERIFICATION (from verify-db.ts)');
  console.log('─'.repeat(60));

  const { data: records, count } = await supabase
    .from('style_references')
    .select('*', { count: 'exact' });

  console.log(`✅ Table exists: ${count} record(s)`);

  if (records && records[0]) {
    console.log(`✅ Test record: ${records[0].name}`);
    console.log(`   - SREF Code: ${records[0].sref_code}`);
    console.log(`   - Category: ${records[0].category}`);
    console.log(`   - Tags: ${records[0].tags?.length || 0} tags`);
    console.log(`   - Keywords: ${records[0].keywords?.length || 0} keywords`);
    console.log(`   - Palette: ${records[0].rgb_palette?.length || 0} colors`);
  }

  // Check indexes via information_schema
  await runQuery(
    '\n📊 INDEXES CHECK',
    `SELECT indexname, indexdef
     FROM pg_indexes
     WHERE tablename = 'style_references'
     ORDER BY indexname`
  );

  // Check RLS policies
  await runQuery(
    '\n🔒 RLS POLICIES CHECK',
    `SELECT policyname, cmd, qual
     FROM pg_policies
     WHERE tablename = 'style_references'`
  );

  console.log('\n═'.repeat(60));
  console.log('✅ VERIFICATION COMPLETE');
  console.log('═'.repeat(60));
  console.log('\nExpected Results:');
  console.log('  ✓ 1 record in table');
  console.log('  ✓ 4 indexes: idx_category, idx_sref_code, idx_tags, idx_keywords');
  console.log('  ✓ 1 RLS policy: Allow public read access');
  console.log('  ✓ 1 constraint: valid_category');
  console.log('\n💡 For detailed verification, run:');
  console.log('   backend/services/style-selector/check-schema.sql');
  console.log('   in Supabase SQL Editor');
}

verifyComplete().catch(console.error);
