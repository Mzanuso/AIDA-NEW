# Database Migrations

## How to Run Migrations

### Option 1: Supabase Dashboard (Recommended)
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Copy the contents of `001_workflow_states.sql`
6. Paste and click **Run**

### Option 2: psql Command Line
```bash
psql $DATABASE_URL -f migrations/001_workflow_states.sql
```

### Option 3: Node.js Script
```bash
npx tsx migrations/run-migration.ts 001_workflow_states.sql
```

## Migration Files

- `001_workflow_states.sql` - Technical Planner workflow state table
  - Creates `workflow_states` table
  - Adds indexes for performance
  - Sets up Row Level Security (RLS)
  - Creates auto-update trigger for `updated_at`

## Verification

After running the migration, verify with:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'workflow_states';
```

Expected output: `workflow_states`
