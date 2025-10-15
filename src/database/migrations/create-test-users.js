/**
 * Create Test Users
 *
 * Creates test users in the database for testing the conversation system
 */

import postgres from 'postgres';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

const sql = postgres(process.env.DATABASE_URL, { max: 1, ssl: 'require' });

async function createTestUsers() {
  console.log('👥 Creating test users...\n');

  try {
    // Insert test users
    const users = await sql`
      INSERT INTO users (email, name, "createdAt", "updatedAt")
      VALUES
        ('test@aida.com', 'Test User', NOW(), NOW()),
        ('demo@aida.com', 'Demo User', NOW(), NOW())
      ON CONFLICT (email) DO UPDATE
        SET name = EXCLUDED.name
      RETURNING id, email, name
    `;

    console.log(`✅ Created ${users.length} test users:`);
    users.forEach(u => console.log(`  - ${u.name} (${u.email}) - ID: ${u.id}`));
    console.log('');

    console.log('✅ Test users ready! 🎉');
    console.log('\n📋 You can now test with these user IDs:');
    users.forEach(u => console.log(`  - User ID: ${u.id}`));

  } catch (error) {
    console.error('❌ Failed to create test users:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

createTestUsers();
