const postgres = require('postgres');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runAllMigrations() {
  const sql = postgres(process.env.DATABASE_URL);

  const migrations = [
    '0001_init_core_tables.sql',
    '0003_add_rag_tables.sql'
  ];

  try {
    for (const migrationFile of migrations) {
      console.log(`\n🔄 Running migration: ${migrationFile}`);
      const migrationPath = path.join(__dirname, '..', '..', 'migrations', migrationFile);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

      await sql.unsafe(migrationSQL);
      console.log(`✅ ${migrationFile} completed`);
    }

    console.log('\n🔍 Verifying all tables...');
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    console.log('\n✅ All tables in database:');
    tables.forEach(t => console.log(`   - ${t.table_name}`));

    // Check if pgvector extension is enabled
    const extensions = await sql`
      SELECT extname FROM pg_extension WHERE extname = 'vector'
    `;

    if (extensions.length > 0) {
      console.log('\n✅ pgvector extension is enabled');
    }

    // Count records in key tables
    console.log('\n📊 Table counts:');
    const users = await sql`SELECT COUNT(*) as count FROM users`;
    const projects = await sql`SELECT COUNT(*) as count FROM projects`;
    const styles = await sql`SELECT COUNT(*) as count FROM styles`;

    console.log(`   - users: ${users[0].count}`);
    console.log(`   - projects: ${projects[0].count}`);
    console.log(`   - styles: ${styles[0].count}`);

    console.log('\n🎉 All migrations completed successfully!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    throw error;
  } finally {
    await sql.end();
  }
}

runAllMigrations().catch(err => {
  console.error(err);
  process.exit(1);
});
