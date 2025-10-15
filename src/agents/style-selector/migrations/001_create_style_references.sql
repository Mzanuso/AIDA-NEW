-- AIDA Style References Table
-- Migration: 001_create_style_references
-- Created: 2025-10-13

-- Drop table if exists (for development)
DROP TABLE IF EXISTS style_references CASCADE;

-- Create style_references table
CREATE TABLE style_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sref_code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,

  -- Images
  thumbnail_url TEXT,
  image_urls TEXT[] DEFAULT '{}',

  -- Visual characteristics
  tags TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  rgb_palette TEXT[] DEFAULT '{}',

  -- Technical details
  technical_details JSONB DEFAULT '{}'::jsonb,
  composition_features JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_category CHECK (category IN (
    'fine_art',
    'editorial',
    'fashion_design',
    'photography',
    'illustration',
    '3d_render'
  ))
);

-- Indexes for performance
CREATE INDEX idx_category ON style_references(category);
CREATE INDEX idx_sref_code ON style_references(sref_code);
CREATE INDEX idx_tags ON style_references USING GIN(tags);
CREATE INDEX idx_keywords ON style_references USING GIN(keywords);

-- Enable Row Level Security
ALTER TABLE style_references ENABLE ROW LEVEL SECURITY;

-- Public read access policy
CREATE POLICY "Allow public read access"
  ON style_references
  FOR SELECT
  USING (true);

-- Insert test record
INSERT INTO style_references (
  sref_code,
  name,
  description,
  category,
  thumbnail_url,
  image_urls,
  tags,
  keywords,
  rgb_palette,
  technical_details
) VALUES (
  'test-001',
  'Test Style - Minimal Modern',
  'A test style reference for development and testing',
  'photography',
  '/data/sref/photography/06858/images/001.webp',
  ARRAY['/data/sref/photography/06858/images/001.png'],
  ARRAY['minimal', 'modern', 'clean', 'test'],
  ARRAY['minimalist', 'contemporary', 'professional'],
  ARRAY['#FFFFFF', '#000000', '#F5F5F5'],
  '{"medium": ["digital", "photography"], "style": ["minimalist", "contemporary"]}'::jsonb
);

-- Verify
SELECT COUNT(*) as total_records FROM style_references;
SELECT * FROM style_references WHERE sref_code = 'test-001';
