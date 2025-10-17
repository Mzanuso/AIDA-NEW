#!/usr/bin/env node

/**
 * Migrate Style Images to Supabase Storage
 *
 * Steps:
 * 1. Create 'style-images' bucket (if not exists)
 * 2. Upload all images from old project to Supabase Storage
 * 3. Update style_references table with public URLs
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const OLD_PROJECT_PATH = 'D:/AIDA CLEAN OLD/AIDA-CLEAN/data/sref_v2';
const BUCKET_NAME = 'style-images';

// Step 1: Create bucket
async function createBucket() {
  console.log('\n📦 Step 1: Creating Storage Bucket...');
  console.log('─'.repeat(60));

  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

  if (bucketExists) {
    console.log(`✅ Bucket "${BUCKET_NAME}" already exists`);
    return true;
  }

  const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
    public: true,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ['image/webp', 'image/png', 'image/jpeg']
  });

  if (error) {
    console.error(`❌ Error creating bucket: ${error.message}`);
    return false;
  }

  console.log(`✅ Bucket "${BUCKET_NAME}" created successfully`);
  return true;
}

// Step 2: Get all styles from database
async function getStyles() {
  console.log('\n📊 Step 2: Fetching styles from database...');
  console.log('─'.repeat(60));

  const { data: styles, error } = await supabase
    .from('style_references')
    .select('id, sref_code, category, thumbnail_url, image_urls');

  if (error) {
    console.error(`❌ Error fetching styles: ${error.message}`);
    return [];
  }

  console.log(`✅ Found ${styles.length} styles to migrate\n`);
  return styles;
}

// Step 3: Upload single image to Supabase
async function uploadImage(localPath, remotePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(localPath)) {
      console.log(`   ⚠️  File not found: ${localPath}`);
      return null;
    }

    const fileBuffer = fs.readFileSync(localPath);
    const fileExt = path.extname(localPath);
    const contentType = fileExt === '.webp' ? 'image/webp' :
                       fileExt === '.png' ? 'image/png' : 'image/jpeg';

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(remotePath, fileBuffer, {
        contentType,
        upsert: true
      });

    if (error) {
      console.log(`   ❌ Upload failed: ${error.message}`);
      return null;
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(remotePath);

    return publicData.publicUrl;

  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return null;
  }
}

// Step 4: Migrate images for all styles
async function migrateImages(styles) {
  console.log('\n📤 Step 3: Uploading images to Supabase...');
  console.log('─'.repeat(60));

  let successCount = 0;
  let failCount = 0;

  for (const style of styles) {
    console.log(`\n🎨 Processing SREF ${style.sref_code} (${style.category})`);

    const newImageUrls = [];
    let newThumbnailUrl = null;

    // Process thumbnail
    if (style.thumbnail_url) {
      const localPath = path.join(OLD_PROJECT_PATH, style.thumbnail_url.replace(/^\/data\/sref_v2\//, ''));
      const remotePath = `${style.category}/${style.sref_code}/thumbnail${path.extname(localPath)}`;

      console.log(`   📷 Uploading thumbnail...`);
      const publicUrl = await uploadImage(localPath, remotePath);

      if (publicUrl) {
        newThumbnailUrl = publicUrl;
        console.log(`   ✅ Thumbnail uploaded`);
      }
    }

    // Process all images
    if (Array.isArray(style.image_urls)) {
      for (let i = 0; i < style.image_urls.length; i++) {
        const imageUrl = style.image_urls[i];
        const localPath = path.join(OLD_PROJECT_PATH, imageUrl.replace(/^\/data\/sref_v2\//, ''));
        const remotePath = `${style.category}/${style.sref_code}/image_${i + 1}${path.extname(localPath)}`;

        console.log(`   📷 Uploading image ${i + 1}/${style.image_urls.length}...`);
        const publicUrl = await uploadImage(localPath, remotePath);

        if (publicUrl) {
          newImageUrls.push(publicUrl);
          console.log(`   ✅ Image ${i + 1} uploaded`);
        }
      }
    }

    // Update database with new URLs
    if (newThumbnailUrl || newImageUrls.length > 0) {
      const { error: updateError } = await supabase
        .from('style_references')
        .update({
          thumbnail_url: newThumbnailUrl || style.thumbnail_url,
          image_urls: newImageUrls.length > 0 ? newImageUrls : style.image_urls
        })
        .eq('id', style.id);

      if (updateError) {
        console.log(`   ❌ Failed to update database: ${updateError.message}`);
        failCount++;
      } else {
        console.log(`   ✅ Database updated with new URLs`);
        successCount++;
      }
    } else {
      console.log(`   ⚠️  No images found for this style`);
      failCount++;
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log(`\n✅ Migration complete!`);
  console.log(`   Success: ${successCount} styles`);
  console.log(`   Failed: ${failCount} styles\n`);
}

// Run migration
(async () => {
  console.log('🚀 Starting Image Migration to Supabase...');

  const bucketCreated = await createBucket();
  if (!bucketCreated) {
    console.error('\n❌ Cannot proceed without bucket. Exiting.');
    process.exit(1);
  }

  const styles = await getStyles();
  if (styles.length === 0) {
    console.error('\n❌ No styles found. Exiting.');
    process.exit(1);
  }

  await migrateImages(styles);

  console.log('✅ All done!\n');
})();
