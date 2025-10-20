const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = 3002;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());

// API endpoint for styles - fetches from Supabase
app.get('/api/styles', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    console.log(`📸 GET /api/styles - Fetching ${limit} styles from Supabase`);

    const { data: styles, error } = await supabase
      .from('style_references')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Supabase error:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    // Transform Supabase data to match frontend expectations
    const transformedStyles = styles.map(style => ({
      id: style.sref_code || style.id,
      name: style.name,
      description: style.description,
      category: style.category,
      tags: style.tags || [],
      images: {
        thumbnail: style.thumbnail_url,
        full: Array.isArray(style.image_urls) ? style.image_urls : [style.thumbnail_url]
      }
    }));

    console.log(`✅ Returning ${transformedStyles.length} styles from Supabase`);

    res.json({
      data: {
        data: transformedStyles
      }
    });

  } catch (error) {
    console.error('❌ Server error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Health check
app.get('/health', async (req, res) => {
  try {
    // Test Supabase connection
    const { count, error } = await supabase
      .from('style_references')
      .select('*', { count: 'exact', head: true });

    res.json({
      status: 'ok',
      port: PORT,
      supabase: !error,
      stylesCount: count || 0
    });
  } catch (error) {
    res.json({
      status: 'error',
      port: PORT,
      supabase: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🎨 Supabase Styles Server running on http://localhost:${PORT}`);
  console.log(`📸 Styles API: GET http://localhost:${PORT}/api/styles`);
  console.log(`❤️  Health: GET http://localhost:${PORT}/health`);
  console.log(`🔗 Connected to Supabase: ${supabaseUrl}`);
});
