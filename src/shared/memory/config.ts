export const CHROMA_CONFIG = {
  path: process.env.CHROMA_SERVER_URL || 'http://localhost:8000',
  collections: {
    conversations: 'conversations',
    technicalDecisions: 'technical_decisions',
    agentOutputs: 'agent_outputs'
  }
};
