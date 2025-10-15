-- Verification Queries for style_references Table
-- Run these in Supabase SQL Editor to verify complete setup

-- 1. Check table structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'style_references'
ORDER BY ordinal_position;

-- 2. Check indexes
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'style_references'
ORDER BY indexname;

-- 3. Check RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'style_references';

-- 4. Check constraints
SELECT
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
JOIN pg_class cl ON cl.oid = c.conrelid
WHERE cl.relname = 'style_references'
ORDER BY conname;

-- 5. Verify test data
SELECT
  sref_code,
  name,
  category,
  array_length(tags, 1) as tag_count,
  array_length(image_urls, 1) as image_count,
  created_at
FROM style_references
WHERE sref_code = 'test-001';
