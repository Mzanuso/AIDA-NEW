#!/usr/bin/env node

/**
 * Query Existing Styles from Supabase
 * Check current state of style_references table
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Querying existing styles from Supabase...\n');

(async () => {
  try {
    // Get all style references
    const { data: styles, error, count } = await supabase
      .from('style_references')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    console.log(`📊 Total styles in database: ${count}\n`);
    console.log('📋 Sample of 5 most recent styles:\n');
    console.log('─'.repeat(80));

    styles.forEach((style, index) => {
      console.log(`\n${index + 1}. SREF ${style.sref_code} - ${style.name}`);
      console.log(`   Category: ${style.category || 'N/A'}`);
      console.log(`   Description: ${style.description?.substring(0, 80) || 'N/A'}...`);
      console.log(`   Thumbnail URL: ${style.thumbnail_url || 'NULL ❌'}`);
      console.log(`   Image URLs: ${style.image_urls ? (Array.isArray(style.image_urls) ? style.image_urls.length + ' images' : 'Invalid format') : 'NULL ❌'}`);

      if (style.image_urls && Array.isArray(style.image_urls) && style.image_urls.length > 0) {
        console.log(`   First image: ${style.image_urls[0]}`);
      }

      console.log(`   Tags: ${style.tags ? (Array.isArray(style.tags) ? style.tags.slice(0, 3).join(', ') : 'Invalid') : 'None'}`);
      console.log(`   Created: ${style.created_at || 'N/A'}`);
    });

    console.log('\n' + '─'.repeat(80));

    // Count styles with missing images
    const { data: stylesWithoutImages, error: countError } = await supabase
      .from('style_references')
      .select('id', { count: 'exact', head: true })
      .or('thumbnail_url.is.null,image_urls.is.null');

    if (!countError) {
      console.log(`\n⚠️  Styles missing image URLs: ${stylesWithoutImages?.length || 0}`);
    }

    // Check categories
    const { data: categories } = await supabase
      .from('style_references')
      .select('category')
      .not('category', 'is', null);

    if (categories) {
      const uniqueCategories = [...new Set(categories.map(c => c.category))];
      console.log(`\n📁 Categories found: ${uniqueCategories.join(', ')}`);
    }

    console.log('\n✅ Query complete!\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
})();
