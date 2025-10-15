/**
 * Supabase Database Verification
 *
 * Verifies that style_references table exists and is properly configured
 * Run: npx tsx verify-db.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: join(__dirname, '../../../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function verifyDatabase() {
  console.log('🔍 AIDA Style Selector - Database Verification');
  console.log('==============================================\n');

  let allChecks = true;

  // 1. Check table exists
  console.log('1️⃣  Checking table existence...');
  try {
    const { data, error, count } = await supabase
      .from('style_references')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`   ❌ Table not found: ${error.message}`);
      allChecks = false;
    } else {
      console.log(`   ✅ Table exists with ${count} records`);
    }
  } catch (err: any) {
    console.log(`   ❌ Error: ${err.message}`);
    allChecks = false;
  }

  // 2. Check test record
  console.log('\n2️⃣  Checking test record...');
  try {
    const { data, error } = await supabase
      .from('style_references')
      .select('*')
      .eq('sref_code', 'test-001')
      .single();

    if (error) {
      console.log(`   ❌ Test record not found: ${error.message}`);
      allChecks = false;
    } else {
      console.log(`   ✅ Test record found: ${data.name}`);
      console.log(`      - Category: ${data.category}`);
      console.log(`      - Tags: ${data.tags?.join(', ')}`);
      console.log(`      - Created: ${new Date(data.created_at).toLocaleString()}`);
    }
  } catch (err: any) {
    console.log(`   ❌ Error: ${err.message}`);
    allChecks = false;
  }

  // 3. Test public read access
  console.log('\n3️⃣  Testing public read access...');
  const publicClient = createClient(
    SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY || 'test'
  );

  try {
    const { data, error } = await publicClient
      .from('style_references')
      .select('sref_code, name, category')
      .limit(5);

    if (error) {
      console.log(`   ⚠️  Public access issue: ${error.message}`);
      console.log(`   (This is expected if SUPABASE_ANON_KEY is not set)`);
    } else {
      console.log(`   ✅ Public read access working (${data?.length || 0} records)`);
    }
  } catch (err: any) {
    console.log(`   ⚠️  Could not test public access: ${err.message}`);
  }

  // 4. Sample query test
  console.log('\n4️⃣  Testing sample queries...');
  try {
    // Query by category
    const { data: photoData, error: photoError } = await supabase
      .from('style_references')
      .select('sref_code, name')
      .eq('category', 'photography')
      .limit(3);

    if (photoError) {
      console.log(`   ❌ Category filter failed: ${photoError.message}`);
      allChecks = false;
    } else {
      console.log(`   ✅ Category filter (photography): ${photoData?.length || 0} results`);
    }

    // Query by tags (using array contains)
    const { data: tagData, error: tagError } = await supabase
      .from('style_references')
      .select('sref_code, name')
      .contains('tags', ['modern'])
      .limit(3);

    if (tagError) {
      console.log(`   ⚠️  Tag search: ${tagError.message}`);
    } else {
      console.log(`   ✅ Tag search (modern): ${tagData?.length || 0} results`);
    }
  } catch (err: any) {
    console.log(`   ❌ Query test failed: ${err.message}`);
    allChecks = false;
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (allChecks) {
    console.log('✅ All critical checks passed!');
    console.log('\n📊 Database is ready for use.');
  } else {
    console.log('❌ Some checks failed.');
    console.log('\n⚠️  Please run the migration SQL manually:');
    console.log('   https://supabase.com/dashboard/project/qnhozzpuchwrdasmfezz/sql/new');
    console.log('\n   Copy from: backend/services/style-selector/migrations/001_create_style_references.sql');
  }
  console.log('='.repeat(50));
}

verifyDatabase().catch(console.error);
