const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Lists all active models available on this API key using the official Google Gen AI SDK
 */
async function listAvailableModels() {
  console.log('🔍 Checking active Gemini models on your API key via GoogleGenAI...\n');

  try {
    const pager = await ai.models.list();
    const models = [];
    for await (const m of pager) {
      if ((m.supportedActions || m.supportedGenerationMethods || []).includes('generateContent')) {
        models.push(m);
      }
    }

    console.log(`✅ Available Generative Models (${models.length}):`);
    console.log('====================================\n');

    models.slice(0, 15).forEach((model, index) => {
      const cleanName = model.name.replace(/^models\//, '');
      console.log(`${index + 1}. ${cleanName}`);
      console.log(`   Display Name: ${model.displayName || cleanName}`);
      console.log(`   Methods: ${(model.supportedActions || model.supportedGenerationMethods || []).join(', ')}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error listing models:', error.message);
    console.error('\n📋 Please verify your GEMINI_API_KEY in server/.env');
  }
}

/**
 * Tests the verified active Gemini models for latency and availability with @google/genai
 */
async function testModels() {
  console.log('\n🧪 Testing verified active Gemini models via @google/genai SDK...\n');

  const modelsToTest = [
    'gemini-3.5-flash-lite',
    'gemini-3-flash-preview',
    'gemini-3.5-flash',
    'gemini-3.6-flash',
    'gemini-2.5-flash'
  ];

  for (const modelName of modelsToTest) {
    const start = Date.now();
    try {
      const result = await ai.models.generateContent({
        model: modelName,
        contents: 'Say "OK"'
      });
      const text = (result.text || '').trim();
      const latency = Date.now() - start;
      console.log(`  ✅ ${modelName.padEnd(25)} - WORKS (${latency}ms) -> "${text}"`);
    } catch (error) {
      const latency = Date.now() - start;
      console.log(`  ❌ ${modelName.padEnd(25)} - FAILED (${latency}ms): ${error.message.substring(0, 80)}...`);
    }
  }

  // Also test active embedding model
  try {
    const embedStart = Date.now();
    const embedResult = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: 'Semantic search test'
    });
    const embedLatency = Date.now() - embedStart;
    const values = embedResult.embeddings ? embedResult.embeddings[0].values : embedResult.embedding.values;
    console.log(
      `  ✅ gemini-embedding-001 (Embedding)  - WORKS (${embedLatency}ms, vector len: ${values.length})`
    );
  } catch (embedError) {
    console.log(`  ❌ gemini-embedding-001            - FAILED: ${embedError.message.substring(0, 80)}...`);
  }
}

(async () => {
  await listAvailableModels();
  await testModels();
})();
