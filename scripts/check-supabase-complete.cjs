/**
 * Script per verificare lo stato completo di Supabase
 * - Bucket Storage (immagini)
 * - Tabella style_references (metadata JSON)
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Usa service key per maggiori permessi

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabaseComplete() {
  console.log('🔍 Verificando stato completo Supabase...\n');
  console.log('📍 URL:', supabaseUrl);
  console.log('');

  // 1. Verifica buckets
  console.log('📦 STORAGE BUCKETS:');
  console.log('═'.repeat(60));

  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

  if (bucketsError) {
    console.error('❌ Errore nel recupero buckets:', bucketsError.message);
  } else {
    console.log(`✅ Trovati ${buckets.length} bucket(s):`);
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (public: ${bucket.public}, created: ${bucket.created_at})`);
    });
  }
  console.log('');

  // 2. Verifica contenuto bucket style-images
  console.log('🖼️  BUCKET "style-images":');
  console.log('═'.repeat(60));

  const { data: files, error: filesError } = await supabase.storage
    .from('style-images')
    .list('', { limit: 1000 });

  if (filesError) {
    console.error('❌ Errore nel recupero file:', filesError.message);
  } else {
    console.log(`✅ Trovate ${files.length} cartelle/file:`);

    // Raggruppa per categoria (prima directory)
    const categories = {};
    files.forEach(file => {
      if (file.name) {
        categories[file.name] = categories[file.name] || 0;
        categories[file.name]++;
      }
    });

    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   📁 ${category}/`);
    });

    // Conta totale immagini in tutte le categorie
    let totalImages = 0;
    for (const category of Object.keys(categories)) {
      const { data: categoryFiles } = await supabase.storage
        .from('style-images')
        .list(category, { limit: 1000 });

      if (categoryFiles) {
        // Conta SREF codes (subdirectories)
        for (const srefFolder of categoryFiles) {
          if (srefFolder.name) {
            const { data: images } = await supabase.storage
              .from('style-images')
              .list(`${category}/${srefFolder.name}`, { limit: 1000 });

            if (images) {
              totalImages += images.filter(f => f.name && f.name.includes('.')).length;
            }
          }
        }
      }
    }
    console.log(`   📊 Totale immagini: ${totalImages}`);
  }
  console.log('');

  // 3. Verifica tabella style_references
  console.log('🗄️  TABELLA "style_references":');
  console.log('═'.repeat(60));

  const { data: styles, error: stylesError, count } = await supabase
    .from('style_references')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (stylesError) {
    console.error('❌ Errore nel recupero stili:', stylesError.message);
  } else {
    console.log(`✅ Trovati ${count} stili nella tabella`);
    console.log('');

    // Analizza primo stile come esempio
    if (styles && styles.length > 0) {
      const sample = styles[0];
      console.log('📋 Esempio primo stile:');
      console.log(`   ID: ${sample.id}`);
      console.log(`   SREF Code: ${sample.sref_code || 'N/A'}`);
      console.log(`   Nome: ${sample.name}`);
      console.log(`   Categoria: ${sample.category}`);
      console.log(`   Thumbnail URL: ${sample.thumbnail_url ? '✅' : '❌ MANCANTE'}`);
      console.log(`   Image URLs: ${Array.isArray(sample.image_urls) ? `✅ (${sample.image_urls.length})` : '❌ MANCANTE'}`);
      console.log(`   Tags: ${Array.isArray(sample.tags) ? `✅ (${sample.tags.length})` : '❌ MANCANTE'}`);
      console.log(`   Keywords: ${Array.isArray(sample.keywords) ? `✅ (${sample.keywords.length})` : '❌ MANCANTE'}`);
      console.log(`   RGB Palette: ${sample.rgb_palette ? '✅' : '❌ MANCANTE'}`);
      console.log('');
    }

    // Statistiche complete
    console.log('📊 STATISTICHE:');
    console.log('   Stili con thumbnail URL:', styles.filter(s => s.thumbnail_url).length);
    console.log('   Stili con image URLs:', styles.filter(s => Array.isArray(s.image_urls) && s.image_urls.length > 0).length);
    console.log('   Stili con tags:', styles.filter(s => Array.isArray(s.tags) && s.tags.length > 0).length);
    console.log('   Stili con keywords:', styles.filter(s => Array.isArray(s.keywords) && s.keywords.length > 0).length);
    console.log('   Stili con rgb_palette:', styles.filter(s => s.rgb_palette).length);
  }
  console.log('');

  // 4. Test accesso pubblico a un'immagine
  console.log('🌐 TEST ACCESSO PUBBLICO:');
  console.log('═'.repeat(60));

  if (styles && styles.length > 0 && styles[0].thumbnail_url) {
    const testUrl = styles[0].thumbnail_url;
    console.log(`📸 Testando URL: ${testUrl}`);

    try {
      const response = await fetch(testUrl);
      if (response.ok) {
        console.log(`✅ Immagine accessibile pubblicamente (HTTP ${response.status})`);
        console.log(`   Content-Type: ${response.headers.get('content-type')}`);
        console.log(`   Content-Length: ${response.headers.get('content-length')} bytes`);
      } else {
        console.log(`❌ Immagine NON accessibile (HTTP ${response.status})`);
      }
    } catch (error) {
      console.error('❌ Errore nel fetch:', error.message);
    }
  } else {
    console.log('⚠️  Nessun thumbnail URL disponibile per il test');
  }
  console.log('');

  // 5. Riepilogo finale
  console.log('📝 RIEPILOGO:');
  console.log('═'.repeat(60));
  console.log(`Bucket esistenti: ${buckets ? buckets.length : 0}`);
  console.log(`File in storage: ${files ? files.length : 0}`);
  console.log(`Stili nel database: ${count || 0}`);
  console.log('');
}

checkSupabaseComplete()
  .then(() => {
    console.log('✅ Verifica completata!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Errore durante la verifica:', error);
    process.exit(1);
  });
