// Bootstrap file - carica .env PRIMA di tutto
import dotenv from 'dotenv';
import path from 'path';

// Carica .env locale (ha priorità)
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Poi carica .env root per eventuali variabili mancanti
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

console.log('🔐 Environment loaded:');
console.log('  OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅' : '❌');
console.log('  FAL_API_KEY:', process.env.FAL_API_KEY ? '✅' : '❌');
console.log('  KIE_API_KEY:', process.env.KIE_API_KEY ? '✅' : '❌');
console.log('  ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? '✅' : '❌');

// Ora importa il server
import('./server-main');
