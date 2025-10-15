# Style Selector Database Migrations

## Supabase Project
- **Project ID**: qnhozzpuchwrdasmfezz
- **URL**: https://qnhozzpuchwrdasmfezz.supabase.co
- **Dashboard**: https://supabase.com/dashboard/project/qnhozzpuchwrdasmfezz

## Migration 001: Create style_references Table

### Manual Execution (Recommended)

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/qnhozzpuchwrdasmfezz/sql/new

2. **Copy and Execute SQL**
   - Open file: `001_create_style_references.sql`
   - Copy entire content
   - Paste in SQL Editor
   - Click "Run" button

3. **Verify Results**
   - Check that you see: "Success. No rows returned"
   - Or: "1 row(s) affected" for INSERT
   - Verify test record appears at bottom

### What This Migration Does

Creates the `style_references` table with:

- **Core fields**: id, sref_code, name, description, category
- **Images**: thumbnail_url, image_urls (array)
- **Visual data**: tags, keywords, rgb_palette (arrays)
- **Technical details**: technical_details, composition_features (JSONB)
- **Metadata**: created_at, updated_at (timestamps)

**Indexes**:
- Category (for filtering)
- SREF code (unique lookup)
- Tags (GIN index for array search)
- Keywords (GIN index for array search)

**Security**:
- Row Level Security enabled
- Public read access (SELECT for all users)

**Test Data**:
- Inserts 1 test record (sref_code: 'test-001')

### Verification Queries

After running migration, verify with:

```sql
-- Count records
SELECT COUNT(*) FROM style_references;

-- View test record
SELECT * FROM style_references WHERE sref_code = 'test-001';

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'style_references';

-- Verify RLS policies
SELECT * FROM pg_policies
WHERE tablename = 'style_references';
```

### Automated Execution (Optional)

If you have SUPABASE_SERVICE_ROLE_KEY in `.env`:

```bash
cd backend/services/style-selector
npx tsx migrate.ts
```

## Next Steps

After migration:
1. Update `style.service.ts` to use Supabase instead of mock data
2. Create data import script for SREF files
3. Test API endpoints with real data
