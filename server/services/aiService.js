const fs = require('fs');
const path = require('path');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

let cachedModel = null;

/**
 * Auto-Discovery: Asks Google which models are available for this specific API key.
 * This removes all guesswork and resolves 404 errors forever.
 */
async function discoverModel() {
    if (cachedModel) return cachedModel;
    if (!GOOGLE_API_KEY) throw new Error("GOOGLE_API_KEY is missing");

    console.log("[AI_SERVICE] Starting Auto-Discovery of available models...");
    
    // Try both v1 and v1beta to find available models
    const versions = ['v1', 'v1beta'];
    for (const ver of versions) {
        try {
            const url = `https://generativelanguage.googleapis.com/${ver}/models?key=${GOOGLE_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();

            if (response.ok && data.models && data.models.length > 0) {
                // Filter for models that support generating content
                const supportedModels = data.models.filter(m => 
                    m.supportedGenerationMethods.includes('generateContent') &&
                    !m.name.includes('vision') // Prefer text/chat models
                );

                if (supportedModels.length > 0) {
                    // Pick the best one (prefer 1.5 flash, then pro, then any)
                    const preferred = supportedModels.find(m => m.name.includes('gemini-1.5-flash')) ||
                                    supportedModels.find(m => m.name.includes('gemini-pro')) ||
                                    supportedModels[0];
                    
                    cachedModel = preferred.name; // This will be like "models/gemini-1.5-flash"
                    console.log(`[AI_SERVICE] Auto-Discovery Success! Using model: ${cachedModel} via ${ver}`);
                    return cachedModel;
                }
            }
        } catch (err) {
            console.warn(`[AI_SERVICE] Discovery failed for ${ver}:`, err.message);
        }
    }

    throw new Error("AI Error: No working models found for this API Key. Please ensure the 'Generative Language API' is enabled in Google Cloud Console.");
}

/**
 * Super-Fallback with Auto-Discovery: Calls Gemini via a discovered working model.
 * @param {string} prompt - The text prompt to send
 * @returns {Promise<string>} - AI Response text
 */
async function callGemini(prompt) {
    try {
        const modelName = await discoverModel();
        // Extract version from cached result if we want to be precise, or just use v1
        const url = `https://generativelanguage.googleapis.com/v1/${modelName}:generateContent?key=${GOOGLE_API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await response.json();

        if (response.ok && data.candidates && data.candidates.length > 0) {
            return data.candidates[0].content.parts[0].text;
        } else {
            const msg = data.error?.message || response.statusText;
            // If the model we discovered suddenly fails, clear cache to re-discover next time
            cachedModel = null;
            throw new Error(msg);
        }
    } catch (error) {
        console.error('[AI_SERVICE] Gemini Call Failed:', error.message);
        throw error;
    }
}

/**
 * Stub for transcription - Logic moved to client-side Web Speech API
 */
const transcribeAudio = async () => '';

/**
 * Generates meeting intelligence using Gemini Auto-Discovery
 */
const generateMeetingIntelligence = async (transcript) => {
    try {
        if (!transcript) return null;

        const prompt = `You are a professional meeting assistant. Analyze the transcript, provide a concise summary and extract key action items. Format response strictly as JSON with keys "summary" (string) and "actionItems" (array of {task, user}).\n\nTranscript: ${transcript}`;
        
        const responseText = await callGemini(prompt);
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        return JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch (error) {
        console.error('[AI_SERVICE] Intelligence Generation Error:', error.message);
        return null;
    }
};

/**
 * Real-time AI Assistant response using Gemini Auto-Discovery
 */
const getAIResponse = async (query, context) => {
    try {
        const maxContextChars = 20000;
        const truncatedContext = context && context.length > maxContextChars 
            ? "..." + context.substring(context.length - maxContextChars)
            : context;

        const prompt = `You are the IntellMeet AI Companion. Answer the user's question based on the provided meeting context. Be helpful, professional, and concise.\n\nContext: ${truncatedContext || "No transcript available yet."}\nUser Question: ${query}\nResponse:`;
        
        return await callGemini(prompt);
    } catch (error) {
        console.error('[AI_SERVICE] Chat Assistant Error:', error.message);
        return `AI Error: ${error.message}`;
    }
};

module.exports = {
    transcribeAudio,
    generateMeetingIntelligence,
    getAIResponse
};
