import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from root .env
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface StyleData {
  sref_code: string;
  name: string;
  category: string;
  description?: string;
  tags: string[];
  keywords: string[];
  rgb_palette: string[];
  thumbnail_url: string;
  image_urls: string[];
  technical_details: {
    medium: string[];
    style: string[];
    rendering_style?: string;
  };
}

interface MetadataFull {
  sref_code: string;
  name: string;
  category: string;
  style_attributes?: {
    primary_characteristics?: string[];
    color_palette?: {
      dominant_colors?: string[];
    };
  };
  technical_specs?: {
    rendering_style?: string;
    post_processing?: string[];
  };
  aesthetic_profile?: {
    emotional_tone?: string;
    artistic_influences?: string[];
  };
  metadata?: {
    tags?: string[];
  };
}

interface MetadataBase {
  images_paths?: string[];
}

function extractColors(palette: { dominant_colors?: string[] } | undefined): string[] {
  if (!palette?.dominant_colors) return [];
  return palette.dominant_colors.slice(0, 5);
}

function mapCategoryToSref(srefCode: string, dataDir: string): string | null {
  const categories = ['3d_render', 'editorial', 'fashion_design', 'fine_art', 'illustration', 'photography'];

  for (const category of categories) {
    const categoryPath = path.join(dataDir, category, srefCode);
    if (fs.existsSync(categoryPath)) {
      return category;
    }
  }

  const rootPath = path.join(dataDir, srefCode);
  if (fs.existsSync(rootPath)) {
    const fullMetaPath = path.join(rootPath, 'metadata_full.json');
    if (fs.existsSync(fullMetaPath)) {
      try {
        const fullMeta: MetadataFull = JSON.parse(fs.readFileSync(fullMetaPath, 'utf8'));
        return fullMeta.category || 'fine_art';
      } catch {
        return 'fine_art';
      }
    }
  }

  return null;
}

function getSrefPath(srefCode: string, dataDir: string): string | null {
  const categories = ['3d_render', 'editorial', 'fashion_design', 'fine_art', 'illustration', 'photography'];

  for (const category of categories) {
    const categoryPath = path.join(dataDir, category, srefCode);
    if (fs.existsSync(categoryPath)) {
      return categoryPath;
    }
  }

  const rootPath = path.join(dataDir, srefCode);
  if (fs.existsSync(rootPath)) {
    return rootPath;
  }

  return null;
}

async function processSref(
  srefCode: string,
  category: string,
  dataDir: string,
  counters: { imported: number; skipped: number; errors: number }
): Promise<void> {
  const srefPath = getSrefPath(srefCode, dataDir);
  if (!srefPath) {
    counters.skipped++;
    return;
  }

  const baseMetaPath = path.join(srefPath, 'metadata_base.json');
  const fullMetaPath = path.join(srefPath, 'metadata_full.json');

  if (!fs.existsSync(baseMetaPath) || !fs.existsSync(fullMetaPath)) {
    console.log(`⏭️  Skipping ${srefCode}: Missing metadata files`);
    counters.skipped++;
    return;
  }

  try {
    const baseMeta: MetadataBase = JSON.parse(fs.readFileSync(baseMetaPath, 'utf8'));
    const fullMeta: MetadataFull = JSON.parse(fs.readFileSync(fullMetaPath, 'utf8'));

    const thumbnailUrl = `https://qnhozzpuchwrdasmfezz.supabase.co/storage/v1/object/public/style-images/${category}/${srefCode}/thumbnail.webp`;

    const imageUrls: string[] = [];
    const imagesDir = path.join(srefPath, 'images');
    if (fs.existsSync(imagesDir)) {
      const imageFiles = fs.readdirSync(imagesDir)
        .filter(f => f.endsWith('.webp') || f.endsWith('.png') || f.endsWith('.jpg'))
        .sort();

      for (let i = 0; i < Math.min(imageFiles.length, 4); i++) {
        imageUrls.push(`https://qnhozzpuchwrdasmfezz.supabase.co/storage/v1/object/public/style-images/${category}/${srefCode}/image_${i + 1}.webp`);
      }
    }

    // Use folder category (not metadata category) to ensure it matches valid enum
    const styleData: StyleData = {
      sref_code: srefCode,
      name: fullMeta.name || `Style ${srefCode}`,
      category: category,  // Always use folder category
      description: fullMeta.aesthetic_profile?.emotional_tone || '',
      tags: fullMeta.metadata?.tags || [],
      keywords: fullMeta.style_attributes?.primary_characteristics || [],
      rgb_palette: extractColors(fullMeta.style_attributes?.color_palette),
      thumbnail_url: thumbnailUrl,
      image_urls: imageUrls,
      technical_details: {
        medium: fullMeta.technical_specs?.post_processing || [],
        style: fullMeta.aesthetic_profile?.artistic_influences || [],
        rendering_style: fullMeta.technical_specs?.rendering_style
      }
    };

    const { error } = await supabase
      .from('style_references')
      .insert({
        sref_code: styleData.sref_code,
        name: styleData.name,
        description: styleData.description,
        category: styleData.category,
        thumbnail_url: styleData.thumbnail_url,
        image_urls: styleData.image_urls,
        tags: styleData.tags,
        keywords: styleData.keywords,
        rgb_palette: styleData.rgb_palette,
        technical_details: styleData.technical_details
      });

    if (error) {
      if (error.code === '23505') {
        console.log(`⏭️  Skipping ${styleData.name} (${srefCode}): Already exists`);
        counters.skipped++;
      } else {
        console.error(`❌ Error importing ${srefCode}:`, error.message);
        counters.errors++;
      }
    } else {
      console.log(`✅ Imported: ${styleData.name} (${srefCode})`);
      counters.imported++;
    }

  } catch (err) {
    console.error(`❌ Error processing ${srefCode}:`, err);
    counters.errors++;
  }
}

async function importStyles() {
  const dataDir = path.join(__dirname, '../../../../data/sref_v2');
  const counters = { imported: 0, skipped: 0, errors: 0 };

  const allEntries = fs.readdirSync(dataDir);

  for (const entry of allEntries) {
    const entryPath = path.join(dataDir, entry);
    const stats = fs.statSync(entryPath);

    if (!stats.isDirectory()) continue;

    const categoryDirs = ['3d_render', 'editorial', 'fashion_design', 'fine_art', 'illustration', 'photography'];
    if (categoryDirs.includes(entry)) {
      const categoryEntries = fs.readdirSync(entryPath);
      for (const srefCode of categoryEntries) {
        await processSref(srefCode, entry, dataDir, counters);
      }
    } else {
      const category = mapCategoryToSref(entry, dataDir);
      if (category) {
        await processSref(entry, category, dataDir, counters);
      }
    }
  }

  console.log(`\n📊 Import Summary:`);
  console.log(`   ✅ Imported: ${counters.imported}`);
  console.log(`   ⏭️  Skipped: ${counters.skipped}`);
  console.log(`   ❌ Errors: ${counters.errors}`);
}

importStyles().then(() => {
  console.log('\n✅ Import completed!');
  process.exit(0);
}).catch((err) => {
  console.error('\n❌ Import failed:', err);
  process.exit(1);
});
