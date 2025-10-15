-- Drop Conversation System Tables
-- This will remove all conversation data!

DROP TABLE IF EXISTS tool_plans CASCADE;
DROP TABLE IF EXISTS detected_intents CASCADE;
DROP TABLE IF EXISTS conversation_messages CASCADE;
DROP TABLE IF EXISTS conversation_sessions CASCADE;

-- Drop trigger function if it exists
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
