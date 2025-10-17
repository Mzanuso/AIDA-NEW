/**
 * Script per aggiungere colonne metadata alla tabella style_references
 * usando Supabase SQL query
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addMetadataColumns() {
  console.log('🔧 Aggiornamento schema Supabase...\n');

  // SQL per aggiungere colonne (IF NOT EXISTS è sicuro da eseguire più volte)
  const sql = `
    -- Aggiungi colonne array se non esistono
    DO $$
    BEGIN
      -- mood_tags
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                     WHERE table_name='style_references' AND column_name='mood_tags') THEN
        ALTER TABLE style_references ADD COLUMN mood_tags TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Colonna mood_tags aggiunta';
      END IF;

      -- subjects
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                     WHERE table_name='style_references' AND column_name='subjects') THEN
        ALTER TABLE style_references ADD COLUMN subjects TEXT[] DEFAULT '{}';
        RAISE NOTICE 'Colonna subjects aggiunta';
      END IF;

      -- style_attributes
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                     WHERE table_name='style_references' AND column_name='style_attributes') THEN
        ALTER TABLE style_references ADD COLUMN style_attributes JSONB;
        RAISE NOTICE 'Colonna style_attributes aggiunta';
      END IF;

      -- technical_specs
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                     WHERE table_name='style_references' AND column_name='technical_specs') THEN
        ALTER TABLE style_references ADD COLUMN technical_specs JSONB;
        RAISE NOTICE 'Colonna technical_specs aggiunta';
      END IF;

      -- aesthetic_profile
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                     WHERE table_name='style_references' AND column_name='aesthetic_profile') THEN
        ALTER TABLE style_references ADD COLUMN aesthetic_profile JSONB;
        RAISE NOTICE 'Colonna aesthetic_profile aggiunta';
      END IF;

      -- midjourney_params
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                     WHERE table_name='style_references' AND column_name='midjourney_params') THEN
        ALTER TABLE style_references ADD COLUMN midjourney_params JSONB;
        RAISE NOTICE 'Colonna midjourney_params aggiunta';
      END IF;
    END$$;
  `;

  try {
    console.log('📝 Esecuzione SQL...');
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // Se exec_sql non esiste, proviamo con il metodo diretto
      console.warn('⚠️  RPC exec_sql non disponibile, uso metodo alternativo...');

      // Verifica colonne esistenti
      const { data: columns, error: columnsError } = await supabase
        .from('style_references')
        .select('*')
        .limit(1);

      if (columnsError) {
        throw columnsError;
      }

      const existingColumns = columns && columns.length > 0 ? Object.keys(columns[0]) : [];

      console.log('\n📋 Colonne esistenti:');
      existingColumns.forEach(col => console.log(`   - ${col}`));

      const requiredColumns = [
        'mood_tags',
        'subjects',
        'style_attributes',
        'technical_specs',
        'aesthetic_profile',
        'midjourney_params'
      ];

      const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));

      if (missingColumns.length === 0) {
        console.log('\n✅ Tutte le colonne necessarie sono già presenti!');
      } else {
        console.log('\n⚠️  Colonne mancanti:');
        missingColumns.forEach(col => console.log(`   - ${col}`));
        console.log('\n📝 Esegui manualmente questo SQL nel SQL Editor di Supabase:');
        console.log('\n' + sql);
        console.log('\nOppure usa il file: scripts/update-supabase-schema.sql');
      }
    } else {
      console.log('✅ Schema aggiornato con successo!');
    }

    // Verifica finale
    console.log('\n🔍 Verifica colonne...');
    const { data: sample } = await supabase
      .from('style_references')
      .select('*')
      .limit(1)
      .single();

    if (sample) {
      const columns = Object.keys(sample);
      const hasAllColumns = [
        'mood_tags',
        'subjects',
        'style_attributes',
        'technical_specs',
        'aesthetic_profile',
        'midjourney_params'
      ].every(col => columns.includes(col));

      if (hasAllColumns) {
        console.log('✅ Tutte le colonne metadata sono presenti!');
      } else {
        console.log('⚠️  Alcune colonne potrebbero mancare');
      }

      console.log('\n📊 Colonne totali:', columns.length);
    }

  } catch (error) {
    console.error('❌ Errore:', error.message);
    console.log('\n💡 Soluzione:');
    console.log('   1. Vai su Supabase Dashboard → SQL Editor');
    console.log('   2. Esegui il file: scripts/update-supabase-schema.sql');
    console.log('   3. Riprova questo script');
  }
}

addMetadataColumns()
  .then(() => {
    console.log('\n✅ Operazione completata!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Errore fatale:', error);
    process.exit(1);
  });
