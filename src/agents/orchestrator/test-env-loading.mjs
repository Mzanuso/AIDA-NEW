// Test per capire quale .env viene caricato
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔍 Analisi caricamento .env:');
console.log('__dirname:', __dirname);

// Test 1: .env locale
const result1 = dotenv.config({ path: path.resolve(__dirname, '.env') });
console.log('\n📁 .env locale:');
console.log('  Path:', path.resolve(__dirname, '.env'));
console.log('  Caricato:', result1.error ? '❌ No' : '✅ Sì');
console.log('  OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Presente' : '❌ Assente');

// Test 2: .env root
const result2 = dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
console.log('\n📁 .env root:');
console.log('  Path:', path.resolve(__dirname, '../../../.env'));
console.log('  Caricato:', result2.error ? '❌ No' : '✅ Sì');
console.log('  OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Presente' : '❌ Assente');

// Test 3: Verifica finale
console.log('\n✅ Risultato finale:');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY?.substring(0, 20) + '...');
console.log('FAL_API_KEY:', process.env.FAL_API_KEY?.substring(0, 20) + '...');
console.log('KIE_API_KEY:', process.env.KIE_API_KEY?.substring(0, 20) + '...');
