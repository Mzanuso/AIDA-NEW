/**
 * Run Conversation System Migration
 *
 * This script:
 * 1. Drops existing conversation tables (if any)
 * 2. Recreates them with corrected schema (userId as INTEGER)
 * 3. Creates test users if needed
 */

import postgres from 'postgres';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env');
  process.exit(1);
}

// Connect to database
const sql = postgres(DATABASE_URL, {
  max: 1,
  ssl: 'require'
});

async function runMigration() {
  console.log('🚀 Starting Conversation System Migration...\n');

  try {
    // Step 1: Drop existing tables
    console.log('Step 1: Dropping existing conversation tables...');
    const dropSQL = readFileSync(join(__dirname, 'drop_conversation_tables.sql'), 'utf-8');
    await sql.unsafe(dropSQL);
    console.log('✅ Tables dropped successfully\n');

    // Step 2: Create new tables with corrected schema
    console.log('Step 2: Creating conversation tables with corrected schema...');
    const createSQL = readFileSync(join(__dirname, '20251009_130633_conversation_system.sql'), 'utf-8');
    await sql.unsafe(createSQL);
    console.log('✅ Tables created successfully\n');

    // Step 3: Verify tables exist
    console.log('Step 3: Verifying tables...');
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('conversation_sessions', 'conversation_messages', 'detected_intents', 'tool_plans')
      ORDER BY table_name
    `;

    console.log(`Found ${tables.length} conversation tables:`);
    tables.forEach(t => console.log(`  - ${t.table_name}`));
    console.log('');

    // Step 4: Verify userId type is UUID
    console.log('Step 4: Verifying userId column type...');
    const columnInfo = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'conversation_sessions' AND column_name = 'user_id'
    `;

    if (columnInfo.length > 0) {
      const col = columnInfo[0];
      console.log(`  userId type: ${col.data_type} (expected: uuid)`);
      console.log(`  nullable: ${col.is_nullable}\n`);

      if (col.data_type !== 'uuid') {
        console.error(`❌ ERROR: userId should be UUID, but is ${col.data_type}`);
        process.exit(1);
      }
    }

    console.log('✅ Migration completed successfully! 🎉');
    console.log('\n📋 Next steps:');
    console.log('  1. Create test users (run: node backend/migrations/create-test-users.js)');
    console.log('  2. Test chat endpoint');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();
