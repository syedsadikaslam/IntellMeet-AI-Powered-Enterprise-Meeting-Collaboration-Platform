const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

let openai;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
} else {
    console.warn('[AI_SERVICE] OPENAI_API_KEY is missing.');
}

let genAI;
if (process.env.GOOGLE_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
} else {
    console.warn('[AI_SERVICE] GOOGLE_API_KEY is missing. Fallback disabled.');
}


// Throttling and Queuing Logic for OpenAI Free Tier (3 RPM)
const queue = [];
let isProcessing = false;
const MIN_GAP_MS = 21000; // ~21 seconds gap to stay safely under 3 RPM
let lastRequestTime = 0;

/**
 * Executes an AI request with throttling and automatic retries or fallback to Gemini
 * @param {Function} task - Async function that performs the OpenAI call
 * @param {string} type - 'chat' or 'intelligence'
 * @param {Object} data - Original request data for fallback
 * @param {number} retries - Number of retry attempts
 * @returns {Promise<any>}
 */
const executeAITask = async (task, type, data, retries = 1) => {
    return new Promise((resolve, reject) => {
        queue.push({ task, type, data, retries, resolve, reject });
        processQueue();
    });
};

const processQueue = async () => {
    if (isProcessing || queue.length === 0) return;
    isProcessing = true;

    while (queue.length > 0) {
        const { task, type, data, retries, resolve, reject } = queue.shift();
        
        // Ensure minimum gap between requests only for OpenAI
        const now = Date.now();
        const timeSinceLast = now - lastRequestTime;
        if (timeSinceLast < MIN_GAP_MS) {
            await new Promise(r => setTimeout(r, MIN_GAP_MS - timeSinceLast));
        }

        try {
            // Only try OpenAI if initialized
            if (openai) {
                const result = await task();
                lastRequestTime = Date.now();
                resolve(result);
            } else {
                throw new Error('OpenAI not configured');
            }
        } catch (error) {
            // If OpenAI fails (429, 401, or missing key) and we have Gemini, fallback immediately
            if (genAI) {
                console.log(`[AI_SERVICE] Falling back to Gemini for ${type}... (Reason: ${error.message})`);
                try {
                    // Using 'gemini-pro' for maximum compatibility with v1beta API
                    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
                    
                    let prompt = "";
                    if (type === 'chat') {
                        prompt = `You are a helpful meeting assistant. Context: ${data.context || "No transcript yet."}\nUser Question: ${data.query}\nResponse:`;
                    } else {
                        prompt = `Meeting Transcript: ${data.transcript}\nProvide a summary and extracted action items in JSON format:`;
                    }

                    const result = await model.generateContent(prompt);
                    const response = await result.response;
                    const text = response.text();

                    if (type === 'intelligence') {
                        const jsonMatch = text.match(/\{[\s\S]*\}/);
                        resolve(JSON.parse(jsonMatch ? jsonMatch[0] : text));
                    } else {
                        resolve(text);
                    }
                    continue; 
                } catch (geminiError) {
                    console.error('[AI_SERVICE] Gemini fallback failed:', geminiError.message);
                }
            }

            // If no Gemini or Gemini failed, handle Rate Limit (429) via retry
            if (error.status === 429 && retries > 0) {
                console.log(`[AI_SERVICE] Rate limit hit. Retrying in 15s... (${retries} left)`);
                await new Promise(r => setTimeout(r, 15000));
                queue.unshift({ task, type, data, retries: retries - 1, resolve, reject });
                break; 
            } else {
                reject(error);
            }
        }
    }

    isProcessing = false;
    if (queue.length > 0) setTimeout(processQueue, 500);
};

/**
 * Transcribes audio buffer using Whisper
 * @param {Buffer} buffer - Audio buffer (webm)
 * @param {string} meetingId - Associated meeting ID
 * @returns {Promise<string>} - Transcribed text
 */
const transcribeAudio = async (buffer, meetingId) => {
    try {
        if (!openai || !buffer) return '';

        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
        
        const tempFilePath = path.join(tempDir, `chunk_${meetingId}_${Date.now()}.webm`);
        fs.writeFileSync(tempFilePath, buffer);

        const result = await executeAITask(async () => {
            const transcription = await openai.audio.transcriptions.create({
                file: fs.createReadStream(tempFilePath),
                model: "whisper-1",
            });
            return transcription.text;
        }, 'transcription', { meetingId });

        // Cleanup temp file
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        
        return result;
    } catch (error) {
        console.error(`[AI_SERVICE] Transcription error:`, error.message);
        return ''; // Handled by client-side Web Speech API anyway
    }
};

/**
 * Generates a summary and action items from a transcript
 * @param {string} transcript - Full meeting transcript
 * @returns {Promise<{summary: string, actionItems: Array<{task: string, user: string}>}>}
 */
const generateMeetingIntelligence = async (transcript) => {
    try {
        if (!process.env.OPENAI_API_KEY || !transcript) return null;

        return await executeAITask(async () => {
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are an AI meeting assistant. Summarize the following meeting transcript and extract clear action items. Return a JSON object with 'summary' (string) and 'actionItems' (array of objects with 'task' and 'suggestedAssignee')."
                    },
                    {
                        role: "user",
                        content: transcript
                    }
                ],
                response_format: { type: "json_object" }
            });

            return JSON.parse(response.choices[0].message.content);
        }, 'intelligence', { transcript });
    } catch (error) {
        console.error('[AI_SERVICE] Intelligence generation error:', error);
        return null;
    }
};

/**
 * Provides a real-time response to user queries based on meeting context
 * @param {string} query - User question
 * @param {string} context - Current meeting transcript
 * @returns {Promise<string>} - AI response
 */
const getAIResponse = async (query, context) => {
    try {
        if (!openai && !genAI) return "AI services are currently unavailable. Please check the API key configuration.";

        const maxContextChars = 15000; 
        const truncatedContext = context && context.length > maxContextChars 
            ? "..." + context.substring(context.length - maxContextChars)
            : context;

        return await executeAITask(async () => {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `You are an intelligent meeting assistant for the IntellMeet platform. 
                        You help users by answering questions based on the meeting's live transcript. 
                        Be professional, concise, and helpful. 
                        Context from current meeting: ${truncatedContext || "No transcript available yet."}`
                    },
                    {
                        role: "user",
                        content: query
                    }
                ]
            });

            return response.choices[0].message.content;
        }, 'chat', { query, context: truncatedContext });
    } catch (error) {
        console.error('[AI_SERVICE] Chat error:', error);
        return "I'm sorry, I encountered an error while processing your request.";
    }
};

module.exports = {
    transcribeAudio,
    generateMeetingIntelligence,
    getAIResponse
};

