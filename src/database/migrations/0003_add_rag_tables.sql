-- Migration: Add RAG tables for Orchestrator
-- Created: 2025-10-07
-- Description: Adds tables for semantic search, campaigns, preferences, and cost tracking

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- =========================================
-- PROJECT EMBEDDINGS
-- =========================================
CREATE TABLE IF NOT EXISTS project_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "projectId" UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  embedding vector(1536), -- OpenAI text-embedding-3-small dimension
  "embeddingType" VARCHAR(50) NOT NULL DEFAULT 'combined',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  
  UNIQUE("projectId", "embeddingType")
);

-- Indexes for fast vector search
CREATE INDEX IF NOT EXISTS project_embeddings_vector_idx 
  ON project_embeddings 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS project_embeddings_project_idx 
  ON project_embeddings("projectId");

COMMENT ON TABLE project_embeddings IS 'Stores vector embeddings of projects for semantic search';

-- =========================================
-- USER FILES
-- =========================================
CREATE TABLE IF NOT EXISTS user_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "fileType" VARCHAR(20) NOT NULL CHECK ("fileType" IN ('text', 'image', 'video')),
  "fileName" VARCHAR(255) NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "textContent" TEXT, -- for text files
  embedding vector(1536), -- text embedding
  metadata JSONB DEFAULT '{}', -- extracted info, keywords, etc
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS user_files_vector_idx 
  ON user_files 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS user_files_user_idx ON user_files("userId");
CREATE INDEX IF NOT EXISTS user_files_type_idx ON user_files("fileType");
CREATE INDEX IF NOT EXISTS user_files_created_idx ON user_files("createdAt");

COMMENT ON TABLE user_files IS 'Stores user uploaded files with embeddings for semantic search';

-- =========================================
-- CAMPAIGNS
-- =========================================
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  theme VARCHAR(100), -- 'food', 'fashion', 'tech', etc
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS campaigns_user_idx ON campaigns("userId");
CREATE INDEX IF NOT EXISTS campaigns_status_idx ON campaigns(status);
CREATE INDEX IF NOT EXISTS campaigns_created_idx ON campaigns("createdAt");

COMMENT ON TABLE campaigns IS 'Themed collections of projects (e.g., Food Q1 Campaign)';

-- =========================================
-- PROJECT CAMPAIGNS (Many-to-Many)
-- =========================================
CREATE TABLE IF NOT EXISTS project_campaigns (
  "projectId" UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  "campaignId" UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY ("projectId", "campaignId")
);

-- Indexes
CREATE INDEX IF NOT EXISTS project_campaigns_project_idx ON project_campaigns("projectId");
CREATE INDEX IF NOT EXISTS project_campaigns_campaign_idx ON project_campaigns("campaignId");

COMMENT ON TABLE project_campaigns IS 'Links projects to campaigns (many-to-many)';

-- =========================================
-- USER PREFERENCES
-- =========================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL, -- 'food', 'fashion', 'general', etc
  "preferredStyleId" UUID REFERENCES styles(id),
  "preferredDuration" INTEGER, -- seconds
  "preferredTone" VARCHAR(100), -- 'professional', 'casual', etc
  "confidenceScore" DECIMAL(3,2) CHECK ("confidenceScore" >= 0 AND "confidenceScore" <= 1),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  
  UNIQUE("userId", category)
);

-- Indexes
CREATE INDEX IF NOT EXISTS user_preferences_user_idx ON user_preferences("userId");
CREATE INDEX IF NOT EXISTS user_preferences_category_idx ON user_preferences(category);
CREATE INDEX IF NOT EXISTS user_preferences_updated_idx ON user_preferences("updatedAt");

COMMENT ON TABLE user_preferences IS 'User preferences learned from behavior patterns';

-- =========================================
-- PROJECT FEEDBACK
-- =========================================
CREATE TABLE IF NOT EXISTS project_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "projectId" UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  "feedbackText" TEXT,
  sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS project_feedback_project_idx ON project_feedback("projectId");
CREATE INDEX IF NOT EXISTS project_feedback_rating_idx ON project_feedback(rating);
CREATE INDEX IF NOT EXISTS project_feedback_sentiment_idx ON project_feedback(sentiment);
CREATE INDEX IF NOT EXISTS project_feedback_created_idx ON project_feedback("createdAt");

COMMENT ON TABLE project_feedback IS 'User feedback on projects for learning and improvement';

-- =========================================
-- COST TRACKING
-- =========================================
CREATE TABLE IF NOT EXISTS cost_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "taskId" VARCHAR(100) NOT NULL,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  component VARCHAR(50) NOT NULL, -- 'orchestrator', 'writer', 'director', 'midjourney', 'kling'
  "tokensUsed" INTEGER,
  "apiCalls" INTEGER DEFAULT 1,
  "costDollars" DECIMAL(10,4),
  "cacheHitRate" DECIMAL(3,2) CHECK ("cacheHitRate" >= 0 AND "cacheHitRate" <= 1),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS cost_tracking_task_idx ON cost_tracking("taskId");
CREATE INDEX IF NOT EXISTS cost_tracking_user_idx ON cost_tracking("userId");
CREATE INDEX IF NOT EXISTS cost_tracking_component_idx ON cost_tracking(component);
CREATE INDEX IF NOT EXISTS cost_tracking_created_idx ON cost_tracking("createdAt");

COMMENT ON TABLE cost_tracking IS 'Tracks API costs and token usage for monitoring';

-- =========================================
-- TRIGGERS
-- =========================================

-- Trigger to auto-update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW."updatedAt" = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- GRANT PERMISSIONS (adjust as needed)
-- =========================================
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- =========================================
-- END MIGRATION
-- =========================================
