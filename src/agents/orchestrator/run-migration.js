const postgres = require('postgres');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  const sql = postgres(process.env.DATABASE_URL);

  try {
    console.log('🔄 Reading migration file...');
    const migrationPath = path.join(__dirname, '..', '..', 'migrations', '0003_add_rag_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('🔄 Executing migration...');
    await sql.unsafe(migrationSQL);

    console.log('✅ Migration completed successfully!');

    // Verify tables were created
    console.log('\n🔍 Verifying tables...');
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN (
        'project_embeddings',
        'user_files',
        'campaigns',
        'project_campaigns',
        'user_preferences',
        'project_feedback',
        'cost_tracking'
      )
      ORDER BY table_name
    `;

    console.log('\n✅ Created tables:');
    tables.forEach(t => console.log(`   - ${t.table_name}`));

    // Check if pgvector extension is enabled
    const extensions = await sql`
      SELECT extname FROM pg_extension WHERE extname = 'vector'
    `;

    if (extensions.length > 0) {
      console.log('\n✅ pgvector extension is enabled');
    }

    console.log('\n🎉 All done!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await sql.end();
  }
}

runMigration().catch(err => {
  console.error(err);
  process.exit(1);
});
