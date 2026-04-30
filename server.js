import 'dotenv/config'; 
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai'; 
import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const calendar = google.calendar({
    version: 'v3',
    auth: process.env.GOOGLE_API_KEY 
});

/**
 * --- UPDATED LOGIC ---
 * 1. Restricts AI to Indian Election topics only.
 * 2. Removes all asterisks (*) from output.
 * 3. Includes polite greetings.
 */
async function generateWithFallback(query) {
    const modelList = ["gemini-2.5-flash", "gemma-3-27b", "gemma-3-12b", "gemma-3-4b"];
    let lastError = null;

    // Define the strict personality and topic boundary
    const systemInstruction = `
        You are "CivicSync AI," a specialized expert on the Indian Election System.
        RULES:
        1. TOPIC: Only answer questions related to Indian elections (Voter ID, ECI, polling, eligibility, etc.).
        2. OFF-TOPIC: If asked about other topics (cooking, global news, coding), politely say you only discuss Indian Elections.
        3. GREETING: If the user says hi or hello, greet them warmly as CivicSync AI.
        4. NO FORMATTING: Do not use asterisks (*) for bolding or lists. Provide plain text only.
    `;

    for (const modelName of modelList) {
        try {
            console.log(`Attempting with: ${modelName}...`);
            const model = genAI.getGenerativeModel({ 
                model: modelName,
                systemInstruction: systemInstruction 
            });

            const result = await model.generateContent(query);
            const response = await result.response;
            
            // Clean any remaining asterisks and return text[cite: 1, 5]
            return response.text().replace(/\*/g, ''); 
        } catch (error) {
            lastError = error;
            console.error(`Failed ${modelName}: ${error.message}`);
            if (error.message.includes('429')) break; 
            continue;
        }
    }
    throw lastError; 
}

app.get('/api/config', (req, res) => {
    res.json({ mapsKey: process.env.MAPS_API_KEY });
});

app.post('/api/ask', async (req, res) => {
    try {
        const text = await generateWithFallback(req.body.query);
        res.json({ text });
    } catch (error) {
        console.error("Critical AI Error:", error.message);
        if (error.message.includes('429')) {
            return res.status(429).json({ error: "Rate limit reached. Please wait." });
        }
        res.status(500).json({ error: "AI Service busy. Try again soon." });
    }
});

/**
 * --- UPDATED CALENDAR LOGIC ---
 * Filters for Election terms and includes Location data ("Where held")[cite: 5]
 */
app.get('/api/events', async (req, res) => {
    try {
        const response = await calendar.events.list({
            calendarId: 'en.indian#holiday@group.v.calendar.google.com',
            timeMin: new Date().toISOString(),
            maxResults: 25, 
            singleEvents: true,
            orderBy: 'startTime',
        });

        const allEvents = response.data.items || [];

        const electionEvents = allEvents
            .filter(event => {
                const summary = (event.summary || "").toLowerCase();
                return summary.includes('election') || summary.includes('poll') || summary.includes('voting');
            })
            .map(event => ({
                date: event.start.date || event.start.dateTime,
                title: event.summary,
                location: event.location || "Local Election Center" // Shows "where held"[cite: 5]
            }));

        res.json(electionEvents);
    } catch (error) {
        console.error("Calendar Error:", error.message);
        res.status(500).json({ error: "Calendar API error." });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ CivicSync Server active at http://localhost:${PORT}`);
});