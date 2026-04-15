const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '../server/.env' });

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        // We can't actually list models directly without v1 API client, 
        // but we can try a very basic 'gemini-1.5-flash' again with a different call.
        
        console.log("Testing gemini-1.5-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("hello");
        console.log("Success:", result.response.text());
    } catch (error) {
        console.error("Failed:", error.message);
    }
}

listModels();
