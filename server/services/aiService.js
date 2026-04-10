const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

let openai;
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
} else {
    console.warn('[AI_SERVICE] OPENAI_API_KEY is missing. AI features will be disabled.');
}


/**
 * Transcribes an audio chunk using OpenAI Whisper
 * @param {Buffer} buffer - Audio data buffer
 * @param {string} meetingId - Meeting identifier for logging
 * @returns {Promise<string>} - Transcribed text
 */
const transcribeAudio = async (buffer, meetingId) => {
    try {
        if (!process.env.OPENAI_API_KEY) {
            console.warn('[AI_SERVICE] Missing OPENAI_API_KEY. Transcription skipped.');
            return '';
        }

        // Temporary file for Whisper (it requires a file input or a ReadStream with a filename)
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
        
        const tempFilePath = path.join(tempDir, `chunk_${meetingId}_${Date.now()}.webm`);
        fs.writeFileSync(tempFilePath, buffer);

        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tempFilePath),
            model: "whisper-1",
        });

        // Cleanup temp file
        fs.unlinkSync(tempFilePath);

        return transcription.text;
    } catch (error) {
        console.error(`[AI_SERVICE] Transcription error for meeting ${meetingId}:`, error.message);
        return '';
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

        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
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

        const result = JSON.parse(response.choices[0].message.content);
        return result;
    } catch (error) {
        console.error('[AI_SERVICE] Intelligence generation error:', error.message);
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
        if (!openai) return "AI services are currently unavailable. Please check the API key configuration.";

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are an intelligent meeting assistant for the IntellMeet platform. 
                    You help users by answering questions based on the meeting's live transcript. 
                    Be professional, concise, and helpful. 
                    Context from current meeting: ${context || "No transcript available yet."}`
                },
                {
                    role: "user",
                    content: query
                }
            ]
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('[AI_SERVICE] Chat error:', error.message);
        return "I'm sorry, I encountered an error while processing your request.";
    }
};

module.exports = {
    transcribeAudio,
    generateMeetingIntelligence,
    getAIResponse
};

