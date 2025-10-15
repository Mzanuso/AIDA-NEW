-- Migration: Orchestrator V2 - Conversational System
-- Created: 2025-10-09
-- Description: Add conversation sessions, messages, detected intents, and tool plans tables

-- =============================================================================
-- 1. CONVERSATION SESSIONS
-- =============================================================================
CREATE TABLE conversation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'abandoned')) DEFAULT 'active',
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_conv_sessions_user ON conversation_sessions(user_id);
CREATE INDEX idx_conv_sessions_status ON conversation_sessions(status);
CREATE INDEX idx_conv_sessions_updated ON conversation_sessions(updated_at DESC);

COMMENT ON TABLE conversation_sessions IS 'Tracks conversation sessions between user and orchestrator';
COMMENT ON COLUMN conversation_sessions.metadata IS 'Flexible storage for session context, user preferences, etc.';

-- =============================================================================
-- 2. CONVERSATION MESSAGES
-- =============================================================================
CREATE TABLE conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES conversation_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conv_messages_session ON conversation_messages(session_id);
CREATE INDEX idx_conv_messages_created ON conversation_messages(created_at DESC);
CREATE INDEX idx_conv_messages_role ON conversation_messages(role);

COMMENT ON TABLE conversation_messages IS 'Stores individual messages in conversation threads';
COMMENT ON COLUMN conversation_messages.metadata IS 'Stores extracted intent, confidence scores, psychological insights';

-- =============================================================================
-- 3. DETECTED INTENTS
-- =============================================================================
CREATE TABLE detected_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES conversation_sessions(id) ON DELETE CASCADE,
  purpose TEXT CHECK (purpose IN ('brand', 'personal', 'tutorial', 'entertainment', 'unknown')),
  platform TEXT CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'website', 'unknown')),
  style TEXT CHECK (style IN ('cinematic', 'casual', 'minimalist', 'energetic', 'unknown')),
  media_type TEXT CHECK (media_type IN ('image', 'video', 'music', 'mixed', 'unknown')),
  budget_sensitivity TEXT CHECK (budget_sensitivity IN ('low', 'medium', 'high', 'unknown')),
  has_script BOOLEAN DEFAULT false,
  has_visuals BOOLEAN DEFAULT false,
  inferred_specs JSONB DEFAULT '{}'::jsonb,
  confidence FLOAT CHECK (confidence >= 0.0 AND confidence <= 1.0) DEFAULT 0.0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT detected_intents_session_unique UNIQUE (session_id)
);

CREATE INDEX idx_detected_intents_session ON detected_intents(session_id);
CREATE INDEX idx_detected_intents_purpose ON detected_intents(purpose);
CREATE INDEX idx_detected_intents_media_type ON detected_intents(media_type);

COMMENT ON TABLE detected_intents IS 'Extracted user intentions from conversation analysis';
COMMENT ON COLUMN detected_intents.inferred_specs IS 'Inferred technical specs: aspect_ratio, duration, quality_level, etc.';
COMMENT ON COLUMN detected_intents.confidence IS 'Confidence score 0.0-1.0 for intent accuracy';

-- =============================================================================
-- 4. TOOL PLANS
-- =============================================================================
CREATE TABLE tool_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES conversation_sessions(id) ON DELETE CASCADE,
  selected_tools JSONB NOT NULL,
  estimated_cost DECIMAL(10,4) NOT NULL CHECK (estimated_cost >= 0),
  reasoning TEXT,
  status TEXT NOT NULL CHECK (status IN ('proposed', 'approved', 'executing', 'completed', 'failed')) DEFAULT 'proposed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tool_plans_session ON tool_plans(session_id);
CREATE INDEX idx_tool_plans_status ON tool_plans(status);
CREATE INDEX idx_tool_plans_created ON tool_plans(created_at DESC);

COMMENT ON TABLE tool_plans IS 'Selected tools and execution plans for media generation';
COMMENT ON COLUMN tool_plans.selected_tools IS 'JSON: {imageGenerator: "recraft-v3", videoGenerator: "sora-2-pro", ...}';
COMMENT ON COLUMN tool_plans.reasoning IS 'Why these specific tools were selected (for transparency)';

-- =============================================================================
-- TRIGGERS FOR updated_at
-- =============================================================================

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to conversation_sessions
CREATE TRIGGER update_conversation_sessions_updated_at
  BEFORE UPDATE ON conversation_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to detected_intents
CREATE TRIGGER update_detected_intents_updated_at
  BEFORE UPDATE ON detected_intents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to tool_plans
CREATE TRIGGER update_tool_plans_updated_at
  BEFORE UPDATE ON tool_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- GRANTS (adjust based on your role setup)
-- =============================================================================

-- Grant permissions to application role (adjust role name as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON conversation_sessions TO app_role;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON conversation_messages TO app_role;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON detected_intents TO app_role;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON tool_plans TO app_role;

-- =============================================================================
-- VALIDATION QUERIES (for testing after migration)
-- =============================================================================

-- Test 1: Create a sample session
-- INSERT INTO conversation_sessions (user_id) VALUES ('00000000-0000-0000-0000-000000000001');

-- Test 2: Create a sample message
-- INSERT INTO conversation_messages (session_id, role, content)
-- VALUES ('session-uuid-here', 'user', 'Voglio fare un video');

-- Test 3: Create a sample intent
-- INSERT INTO detected_intents (session_id, purpose, media_type, confidence)
-- VALUES ('session-uuid-here', 'brand', 'video', 0.85);

-- Test 4: Create a sample tool plan
-- INSERT INTO tool_plans (session_id, selected_tools, estimated_cost, reasoning)
-- VALUES ('session-uuid-here', '{"videoGenerator": "sora-2-pro"}'::jsonb, 1.20, 'High quality video needed');

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
