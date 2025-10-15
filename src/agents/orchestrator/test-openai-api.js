// Test isolato per verificare OpenAI API
const dotenv = require('dotenv');
const path = require('path');

// Carica .env locale
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('🔍 Testing OpenAI API...');
console.log('API Key presente:', process.env.OPENAI_API_KEY ? '✅ Sì' : '❌ No');
console.log('Primi caratteri:', process.env.OPENAI_API_KEY?.substring(0, 10) + '...');

async function testOpenAI() {
  try {
    const { OpenAI } = await import('openai');
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    console.log('\n📡 Chiamata API in corso...');
    
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: "Test embedding"
    });
    
    console.log('✅ API funzionante!');
    console.log('Embedding dimensioni:', response.data[0].embedding.length);
    
  } catch (error) {
    console.error('\n❌ Errore API:');
    console.error('Tipo:', error.constructor.name);
    console.error('Messaggio:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testOpenAI();
