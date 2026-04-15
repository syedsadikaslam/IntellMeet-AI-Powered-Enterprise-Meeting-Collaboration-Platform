const fs = require('fs');
const path = require('path');

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

/**
 * Super-Fallback: Calls Gemini via multiple endpoints and models until one works.
 * This is the ultimate fix for regional 404 errors.
 * @param {string} prompt - The text prompt to send
 * @returns {Promise<string>} - AI Response text
 */
async function callGemini(prompt) {
    if (!GOOGLE_API_KEY) {
        throw new Error("AI Error: GOOGLE_API_KEY is missing in .env");
    }

    // List of combinations to try (Endpoint version + Model name)
    const configs = [
        { ver: 'v1', model: 'gemini-1.5-flash' },
        { ver: 'v1', model: 'gemini-pro' },
        { ver: 'v1beta', model: 'gemini-1.5-flash' },
        { ver: 'v1beta', model: 'gemini-pro' },
        { ver: 'v1beta', model: 'gemini-2.0-flash-exp' }
    ];

    let lastError = null;

    for (const config of configs) {
        try {
            console.log(`[AI_SERVICE] Trying combination: ${config.ver} / ${config.model}...`);
            const url = `https://generativelanguage.googleapis.com/${config.ver}/models/${config.model}:generateContent?key=${GOOGLE_API_KEY}`;
            
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
                console.log(`[AI_SERVICE] SUCCESS: Connected via ${config.ver} / ${config.model}`);
                return data.candidates[0].content.parts[0].text;
            } else {
                const msg = data.error?.message || response.statusText;
                console.warn(`[AI_SERVICE] Combination ${config.ver}/${config.model} failed: ${msg}`);
                lastError = msg;
            }
        } catch (err) {
            console.warn(`[AI_SERVICE] Request error for ${config.model}:`, err.message);
            lastError = err.message;
        }
    }

    throw new Error(`AI Super-Fallback Failed. Last Error: ${lastError}`);
}

/**
 * Stub for transcription - Logic moved to client-side Web Speech API
 */
const transcribeAudio = async () => '';

/**
 * Generates meeting intelligence using Gemini Super-Fallback
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
 * Real-time AI Assistant response using Gemini Super-Fallback
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
