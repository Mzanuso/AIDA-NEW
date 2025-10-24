/**
 * Start Writer Agent Server
 *
 * Launches Writer microservice on port 3006 for testing
 */

import * as dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ES module equivalents of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

// Verify API key
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY not found in environment');
  console.error('Please add it to .env file');
  process.exit(1);
}

console.log('✅ ANTHROPIC_API_KEY loaded');
console.log(`   Key length: ${process.env.ANTHROPIC_API_KEY.length} characters`);
console.log();

// Import and start server
import('../src/agents/writer/server');
