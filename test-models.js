
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

async function testModel(modelName) {
    console.log(`Testing model: ${modelName}`);
    try {
        const envContent = fs.readFileSync('.env.local', 'utf8');
        const key = envContent.split('\n').find(l => l.startsWith('GEMINI_API_KEY=')).split('=')[1].split(',')[0].trim();

        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hi");
        console.log(`Success: ${modelName}`);
        return true;
    } catch (e) {
        console.log(`Failed: ${modelName} - ${e.message}`);
        return false;
    }
}

async function run() {
    const models = [process.env.GEMINI_MODEL || "gemini-3.1-flash-lite-preview"];
    for (const m of models) {
        await testModel(m);
    }
}

run();
