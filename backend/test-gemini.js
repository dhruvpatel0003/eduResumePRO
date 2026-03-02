require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('🔑 API Key: ✅ Loaded');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ 2026 WORKING MODELS
const modelNames = ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'];

async function testModels() {
  for (const modelName of modelNames) {
    try {
      console.log(`\n🧪 Testing ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Test: Say "eduResumePRO works!"');
      console.log(`✅ ${modelName}:`, result.response.text().substring(0, 50));
      return; // First working model found
    } catch (error) {
      console.log(`❌ ${modelName}:`, error.message.split('\n')[0]);
    }
  }
  console.log('\n❌ No models worked. Check API key restrictions.');
}

testModels();
