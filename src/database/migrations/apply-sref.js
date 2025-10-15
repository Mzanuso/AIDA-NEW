import pg from 'pg';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_UMGStokPn7W6@ep-dark-sun-adl74ar1-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

console.log('🔄 Applying SREF migration...');

const sql = readFileSync(join(__dirname, '0004_extend_sref_metadata.sql'), 'utf-8');

pool.query(sql)
  .then(() => {
    console.log('✅ Migration complete!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  })
  .finally(() => pool.end());
