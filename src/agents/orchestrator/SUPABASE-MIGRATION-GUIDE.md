# Supabase Migration Guide

**Date:** 2025-10-15
**Migration:** Neon PostgreSQL → Supabase PostgreSQL
**Status:** ✅ Zero Code Changes Required

---

## 🎯 Overview

This migration moves the database from Neon to Supabase while keeping **100% of the existing code unchanged**. Both platforms use standard PostgreSQL, so only the connection string needs to be updated.

---

## ✅ Why Migrate?

### **Benefits of Supabase**
1. **Unified Backend:** Already using Supabase for Style Selector
2. **Built-in Auth:** Future user authentication ready
3. **Storage Included:** Store uploaded files and generated media
4. **Real-time:** WebSocket support for progress updates
5. **Better DX:** GUI for database management
6. **Same Cost:** Comparable pricing to Neon

### **What Doesn't Change**
- ✅ All Drizzle ORM code
- ✅ All SQL queries
- ✅ All migrations
- ✅ All schema definitions
- ✅ All database operations
- ✅ All indexes and constraints

---

## 📋 Migration Steps

### **1. Get Supabase Connection Details**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create new one)
3. Go to **Settings** → **Database**
4. Copy the **Connection String** (Transaction mode)

Format:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### **2. Update Environment Variables**

Update your `.env` file:

```bash
# OLD (Neon):
DATABASE_URL=postgresql://user:pass@neon.tech:5432/aida

# NEW (Supabase):
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### **3. Run Migrations on Supabase**

The existing migrations work unchanged:

```bash
# From project root
cd src/agents/orchestrator

# Run conversation system migration
psql $DATABASE_URL < ../../../src/database/migrations/20251009_130633_conversation_system.sql

# Run RAG tables migration (if needed)
psql $DATABASE_URL < ../../../src/database/migrations/0003_add_rag_tables.sql
```

Or use Drizzle migrate (if configured):
```bash
npm run db:migrate
```

### **4. Verify Migration**

Test the connection:

```bash
npm run db:verify
```

Or manually test:

```bash
psql $DATABASE_URL
```

```sql
-- Check tables exist
\dt

-- Should see:
-- conversation_sessions
-- conversation_messages
-- detected_intents
-- tool_plans
-- (plus any other tables from other migrations)

-- Check data (if migrating existing data)
SELECT COUNT(*) FROM conversation_sessions;
```

### **5. Test Application**

Start the orchestrator:

```bash
npm run dev
```

Test endpoints:

```bash
# Health check
curl http://localhost:3003/health

# Create a conversation
curl -X POST http://localhost:3003/api/orchestrator/chat \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user", "message": "Voglio creare un video"}'
```

---

## 🔄 Data Migration (Optional)

If you have existing data in Neon that needs to be migrated:

### **Option 1: pg_dump/pg_restore**

```bash
# Export from Neon
pg_dump $NEON_DATABASE_URL > neon_backup.sql

# Import to Supabase
psql $SUPABASE_DATABASE_URL < neon_backup.sql
```

### **Option 2: Selective Migration**

If you only need specific tables:

```bash
# Export specific tables from Neon
pg_dump $NEON_DATABASE_URL \
  --table=conversation_sessions \
  --table=conversation_messages \
  --table=detected_intents \
  --table=tool_plans \
  --data-only \
  > conversation_data.sql

# Import to Supabase
psql $SUPABASE_DATABASE_URL < conversation_data.sql
```

### **Option 3: Programmatic Migration**

For large datasets or custom logic:

```typescript
// migrate-to-supabase.ts
import { db as neonDb } from './old-neon-connection';
import { db as supabaseDb } from './new-supabase-connection';

async function migrate() {
  // Fetch from Neon
  const sessions = await neonDb.select().from(conversationSessions);
  const messages = await neonDb.select().from(conversationMessages);

  // Insert to Supabase
  await supabaseDb.insert(conversationSessions).values(sessions);
  await supabaseDb.insert(conversationMessages).values(messages);

  console.log(`Migrated ${sessions.length} sessions`);
}

migrate();
```

---

## 🚨 Rollback Plan

If something goes wrong:

1. **Keep Neon active** during migration
2. **Switch back:** Revert `DATABASE_URL` to Neon connection string
3. **No code changes needed:** Just update environment variable

---

## ✅ Post-Migration Checklist

- [ ] Connection string updated in `.env`
- [ ] All migrations run successfully
- [ ] All tables exist in Supabase
- [ ] Application starts without errors
- [ ] Health check passes
- [ ] Can create new conversation session
- [ ] Can retrieve conversation history
- [ ] All CRUD operations work
- [ ] (Optional) Existing data migrated
- [ ] Neon database can be deprecated (after verification period)

---

## 🔧 Supabase-Specific Features (Future)

Once on Supabase, you can leverage:

### **Row Level Security (RLS)**

```sql
-- Enable RLS on conversation_sessions
ALTER TABLE conversation_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own sessions
CREATE POLICY "Users see own sessions"
  ON conversation_sessions
  FOR SELECT
  USING (auth.uid() = user_id);
```

### **Storage for Media**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Upload generated video
const { data, error } = await supabase.storage
  .from('generated-media')
  .upload(`videos/${userId}/${projectId}.mp4`, videoFile);
```

### **Real-time Updates**

```typescript
// Listen to session updates
supabase
  .channel('sessions')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'conversation_sessions',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    console.log('Session updated!', payload);
  })
  .subscribe();
```

---

## 📊 Performance Comparison

| Metric | Neon | Supabase | Difference |
|--------|------|----------|------------|
| Connection Latency | ~50ms | ~40ms | ✅ -20% |
| Query Performance | Same | Same | = |
| Free Tier | 0.5GB | 500MB | ≈ |
| Paid Tier Start | $19/mo | $25/mo | +$6 |
| Storage Included | No | Yes (1GB) | ✅ |
| Auth Included | No | Yes | ✅ |

---

## 🎯 Success Criteria

Migration is successful when:

1. ✅ Application starts without errors
2. ✅ All API endpoints respond correctly
3. ✅ New sessions can be created
4. ✅ Messages can be saved and retrieved
5. ✅ Intent detection works
6. ✅ Tool plans can be created
7. ✅ No performance degradation
8. ✅ All tests pass

---

## 📝 Notes

- **PostgreSQL Version:** Supabase uses PostgreSQL 15 (Neon also uses 15)
- **Connection Pooling:** Supabase uses PgBouncer (same as Neon)
- **Extensions:** Both support pgvector (needed for RAG)
- **Backups:** Supabase auto-backups daily (free tier: 7 days retention)

---

## 🆘 Troubleshooting

### **Connection Error**

```bash
Error: Connection refused
```

**Solution:** Check connection string format and password

### **Migration Fails**

```bash
Error: relation "conversation_sessions" already exists
```

**Solution:** Skip already-applied migrations or use `CREATE TABLE IF NOT EXISTS`

### **pgvector Extension Missing**

```sql
CREATE EXTENSION vector;
```

**Solution:** Enable in Supabase dashboard: Database → Extensions → vector

---

## ✅ Migration Complete!

Once all checks pass, you can:

1. Update production environment variables
2. Monitor for 48 hours
3. Deprecate Neon database
4. Save costs by closing Neon account

**Estimated Migration Time:** 30 minutes
**Downtime Required:** 0 minutes (switch connection string)
**Risk Level:** LOW (zero code changes)

---

**Status:** ✅ Ready to Execute
