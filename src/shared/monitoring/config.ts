export const LANGFUSE_CONFIG = {
  publicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
  secretKey: process.env.LANGFUSE_SECRET_KEY || '',
  baseUrl: process.env.LANGFUSE_BASE_URL || 'https://cloud.langfuse.com',
  enabled: process.env.LANGFUSE_ENABLED !== 'false',
  flushInterval: 5000, // ms
};
