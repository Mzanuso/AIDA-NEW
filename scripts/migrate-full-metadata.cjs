/**
 * Script di migrazione completa metadata da JSON a Supabase
 *
 * Legge tutti i metadata_full.json dal vecchio progetto e aggiorna
 * i record Supabase con i metadata completi:
 * - tags
 * - mood_tags
 * - use_cases
 * - style_attributes
 * - technical_specs
 * - aesthetic_profile
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Path al vecchio progetto
const OLD_PROJECT_PATH = 'D:/AIDA CLEAN OLD/AIDA-CLEAN/data/sref_v2';

// Categorie da processare
const CATEGORIES = [
  '3d_render',
  'editorial',
  'fashion_design',
  'fine_art',
  'illustration',
  'photography'
];

/**
 * Legge un file JSON in modo sicuro
 */
function readJSONSafe(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`   ❌ Errore lettura ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Estrae SREF code dalla directory o dal JSON
 */
function extractSrefCode(dirName, metadata) {
  // Usa il nome della directory come SREF code (è più affidabile)
  return dirName;
}

/**
 * Trasforma metadata JSON nel formato Supabase
 */
function transformMetadata(metadata, srefCode) {
  if (!metadata) return null;

  return {
    // Tags dal metadata.tags
    tags: metadata.metadata?.tags || [],

    // Keywords generati da primary_characteristics
    keywords: metadata.style_attributes?.primary_characteristics || [],

    // Mood tags dall'aesthetic profile
    mood_tags: metadata.aesthetic_profile?.mood_tags || [],

    // Use cases
    use_cases: metadata.use_cases?.ideal_for || [],

    // Subject matter fit
    subjects: metadata.use_cases?.subject_matter_fit || [],

    // Style attributes (JSONB)
    style_attributes: metadata.style_attributes || null,

    // Technical specs (JSONB)
    technical_specs: metadata.technical_specs || null,

    // Aesthetic profile (JSONB)
    aesthetic_profile: metadata.aesthetic_profile || null,

    // Midjourney params (JSONB)
    midjourney_params: metadata.midjourney_params || null,

    // Description generata
    description: metadata.aesthetic_profile?.emotional_tone || metadata.name || null
  };
}

/**
 * Aggiorna un record Supabase con i metadata completi
 */
async function updateStyleMetadata(srefCode, transformedData) {
  try {
    const { data, error } = await supabase
      .from('style_references')
      .update(transformedData)
      .eq('sref_code', srefCode)
      .select();

    if (error) {
      console.error(`   ❌ Errore update SREF ${srefCode}:`, error.message);
      return false;
    }

    if (!data || data.length === 0) {
      console.warn(`   ⚠️  SREF ${srefCode} non trovato in Supabase`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`   ❌ Errore update SREF ${srefCode}:`, error.message);
    return false;
  }
}

/**
 * Processa una categoria
 */
async function processCategory(category) {
  const categoryPath = path.join(OLD_PROJECT_PATH, category);

  if (!fs.existsSync(categoryPath)) {
    console.warn(`⚠️  Categoria ${category} non trovata: ${categoryPath}`);
    return { processed: 0, updated: 0, errors: 0 };
  }

  const dirs = fs.readdirSync(categoryPath);
  const srefDirs = dirs.filter(d => {
    const fullPath = path.join(categoryPath, d);
    return fs.statSync(fullPath).isDirectory();
  });

  let processed = 0;
  let updated = 0;
  let errors = 0;

  for (const srefDir of srefDirs) {
    const srefPath = path.join(categoryPath, srefDir);
    const metadataPath = path.join(srefPath, 'metadata_full.json');

    // Leggi metadata_full.json
    const metadata = readJSONSafe(metadataPath);

    if (!metadata) {
      console.log(`   ⚠️  ${category}/${srefDir} - metadata_full.json non trovato o invalido`);
      errors++;
      continue;
    }

    const srefCode = extractSrefCode(srefDir, metadata);
    const transformedData = transformMetadata(metadata, srefCode);

    if (!transformedData) {
      console.log(`   ⚠️  ${category}/${srefDir} - impossibile trasformare metadata`);
      errors++;
      continue;
    }

    // Aggiorna Supabase
    const success = await updateStyleMetadata(srefCode, transformedData);

    if (success) {
      console.log(`   ✅ ${category}/${srefDir} (SREF: ${srefCode}) - aggiornato`);
      updated++;
    } else {
      errors++;
    }

    processed++;
  }

  return { processed, updated, errors };
}

/**
 * Main function
 */
async function migrateFullMetadata() {
  console.log('🚀 Migrazione Completa Metadata → Supabase');
  console.log('═'.repeat(60));
  console.log(`📂 Source: ${OLD_PROJECT_PATH}`);
  console.log(`🔗 Supabase: ${supabaseUrl}`);
  console.log('');

  let totalProcessed = 0;
  let totalUpdated = 0;
  let totalErrors = 0;

  for (const category of CATEGORIES) {
    console.log(`📁 Categoria: ${category}`);
    console.log('─'.repeat(60));

    const stats = await processCategory(category);

    totalProcessed += stats.processed;
    totalUpdated += stats.updated;
    totalErrors += stats.errors;

    console.log(`   📊 Processati: ${stats.processed}, Aggiornati: ${stats.updated}, Errori: ${stats.errors}`);
    console.log('');
  }

  console.log('═'.repeat(60));
  console.log('📊 RIEPILOGO FINALE:');
  console.log(`   Stili processati: ${totalProcessed}`);
  console.log(`   Aggiornamenti riusciti: ${totalUpdated}`);
  console.log(`   Errori: ${totalErrors}`);
  console.log(`   Successo: ${Math.round((totalUpdated / totalProcessed) * 100)}%`);
  console.log('');

  // Verifica finale
  console.log('🔍 Verifica post-migrazione...');
  const { data: styles, error } = await supabase
    .from('style_references')
    .select('sref_code, tags, keywords, mood_tags, use_cases');

  if (error) {
    console.error('❌ Errore verifica:', error.message);
  } else {
    const withTags = styles.filter(s => s.tags && s.tags.length > 0).length;
    const withKeywords = styles.filter(s => s.keywords && s.keywords.length > 0).length;
    const withMoodTags = styles.filter(s => s.mood_tags && s.mood_tags.length > 0).length;
    const withUseCases = styles.filter(s => s.use_cases && s.use_cases.length > 0).length;

    console.log(`   ✅ Stili con tags: ${withTags}/${styles.length}`);
    console.log(`   ✅ Stili con keywords: ${withKeywords}/${styles.length}`);
    console.log(`   ✅ Stili con mood_tags: ${withMoodTags}/${styles.length}`);
    console.log(`   ✅ Stili con use_cases: ${withUseCases}/${styles.length}`);
  }

  console.log('');
  console.log('✅ Migrazione completata!');
}

// Esegui migrazione
migrateFullMetadata()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Errore fatale:', error);
    process.exit(1);
  });
