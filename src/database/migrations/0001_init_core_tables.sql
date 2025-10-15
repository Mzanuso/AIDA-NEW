-- Migration: Initialize core tables
-- Created: 2025-10-07
-- Description: Creates foundational tables for users, projects, and styles

-- =========================================
-- USERS
-- =========================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
COMMENT ON TABLE users IS 'Application users';

-- =========================================
-- STYLES
-- =========================================
CREATE TABLE IF NOT EXISTS styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE styles IS 'Video/content styles (e.g., cinematic, documentary, casual)';

-- =========================================
-- PROJECTS
-- =========================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  "styleId" UUID REFERENCES styles(id),
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'failed')),
  "videoUrl" TEXT,
  metadata JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS projects_user_idx ON projects("userId");
CREATE INDEX IF NOT EXISTS projects_status_idx ON projects(status);
CREATE INDEX IF NOT EXISTS projects_created_idx ON projects("createdAt");

COMMENT ON TABLE projects IS 'User video projects';

-- =========================================
-- TRIGGERS
-- =========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW."updatedAt" = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- SEED DATA - Basic styles
-- =========================================
INSERT INTO styles (name, description) VALUES
  ('cinematic', 'Hollywood-style cinematic videos with dramatic visuals'),
  ('documentary', 'Educational documentary style with narrative'),
  ('casual', 'Casual, social media friendly style'),
  ('corporate', 'Professional corporate presentation style')
ON CONFLICT (name) DO NOTHING;

-- =========================================
-- END MIGRATION
-- =========================================
