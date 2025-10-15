import postgres from 'postgres';
import dotenv from 'dotenv';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

const sql = postgres(process.env.DATABASE_URL, { max: 1, ssl: 'require' });

async function verify() {
  console.log('🔍 Verifying conversation tables...\n');

  // Check conversation_sessions
  console.log('1. conversation_sessions:');
  const sessionsColumns = await sql`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'conversation_sessions'
    ORDER BY ordinal_position
  `;
  sessionsColumns.forEach(c => console.log(`  - ${c.column_name}: ${c.data_type}`));

  console.log('\n✅ Migration verification complete!');
  await sql.end();
}

verify();
