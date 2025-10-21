-- Technical Planner Workflow State Management
-- Purpose: Persist workflow state for crash recovery and progress tracking
-- Author: MS-025 Technical Planner Core Implementation
-- Date: 2025-10-21

CREATE TABLE IF NOT EXISTS workflow_states (
  workflow_id TEXT PRIMARY KEY,
  project_brief_id TEXT NOT NULL,
  user_id TEXT NOT NULL,

  -- Workflow progress tracking
  current_step TEXT NOT NULL DEFAULT 'initialized',
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed', 'paused')),

  -- Technical plan data
  technical_plan JSONB,
  model_selections JSONB,
  cost_estimate JSONB,
  execution_steps JSONB,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,

  -- Indexes for fast lookups
  CONSTRAINT unique_project_brief UNIQUE (project_brief_id)
);

-- Index for querying by user
CREATE INDEX IF NOT EXISTS idx_workflow_states_user_id ON workflow_states(user_id);

-- Index for querying by status
CREATE INDEX IF NOT EXISTS idx_workflow_states_status ON workflow_states(status);

-- Index for querying recent workflows
CREATE INDEX IF NOT EXISTS idx_workflow_states_created_at ON workflow_states(created_at DESC);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workflow_states_updated_at
  BEFORE UPDATE ON workflow_states
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE workflow_states ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own workflow states
CREATE POLICY workflow_states_user_isolation ON workflow_states
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', TRUE));

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON workflow_states TO authenticated;
GRANT USAGE ON SEQUENCE workflow_states_id_seq TO authenticated;

COMMENT ON TABLE workflow_states IS 'Stores Technical Planner workflow state for crash recovery and progress tracking';
COMMENT ON COLUMN workflow_states.current_step IS 'Current workflow step: initialized, analyzing, planning, selecting_models, estimating_cost, completed';
COMMENT ON COLUMN workflow_states.progress_percentage IS 'Progress from 0-100 for user feedback';
COMMENT ON COLUMN workflow_states.technical_plan IS 'Full technical plan with asset breakdown and requirements';
COMMENT ON COLUMN workflow_states.model_selections IS 'AI model selections from SmartRouter';
COMMENT ON COLUMN workflow_states.cost_estimate IS 'Budget breakdown and cost projections';
