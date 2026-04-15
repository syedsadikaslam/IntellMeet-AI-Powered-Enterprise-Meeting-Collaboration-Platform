const OpenAI = require('./server/node_modules/openai');
require('./server/node_modules/dotenv').config({ path: './server/.env' });

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function test() {
    try {
        console.log('Testing OpenAI connection with gpt-4o-mini...');
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: "Hello, confirm you are working." }],
        });
        console.log('Success:', response.choices[0].message.content);
    } catch (error) {
        console.error('Failure:', error);
    }
}

test();
