import 'dotenv/config'; 
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import Modular Services
import { generateWithFallback } from './services/aiService.js';
import { logToBigQuery } from './services/analyticsService.js';
import { getElectionEvents } from './services/calendarService.js';
import { getMapConfig } from './services/mapService.js';
import { getLocalAnswer } from './QA.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- SECURITY MIDDLEWARE ---
/**
 * RESOLVED: Fixed CSP blocks for Google Maps images and connections[cite: 13].
 * Added 'https://maps.googleapis.com' to img-src to stop the red console errors[cite: 13].
 * Added 'connect-src' to allow the frontend to reach Google APIs[cite: 13, 23].
 */
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "https://maps.googleapis.com", "'unsafe-inline'"],
            "connect-src": ["'self'", "https://maps.googleapis.com", "https://*.googleapis.com"],
            "img-src": ["'self'", "https://maps.gstatic.com", "https://maps.googleapis.com", "data:"],
            "frame-src": ["https://www.google.com"],
        },
    },
}));

app.use(express.json({ limit: '10kb' })); 
app.use(express.static(path.join(__dirname, 'public')));

// Rate Limiting: Prevents excessive API credit consumption[cite: 2, 13, 23].
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 50, 
    message: { error: "Too many requests. Please try again later." }
});
app.use('/api/', apiLimiter);

// --- SYSTEM ENDPOINTS ---

app.get('/health', (req, res) => res.status(200).send('Healthy'));

/**
 * MAP CONFIGURATION
 * Delivers apiKey and coordinates. Matches the property 'apiKey' expected by script.js[cite: 7, 21, 23].
 */
app.get('/api/config', (req, res) => {
    try {
        const config = getMapConfig();
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: "Maps configuration unavailable." });
    }
});

/**
 * AI Q&A + ANALYTICS
 * Uses Local QA fallback first to save costs, then hits the Gemini pipeline[cite: 1, 4, 23].
 */
app.post('/api/ask', async (req, res) => {
    const { query } = req.body;
    
    if (!query || query.length < 3) {
        return res.status(400).json({ error: "Query too short." });
    }

    try {
        // 1. Check Local QA Fallback[cite: 1, 23].
        const localResult = getLocalAnswer(query);
        if (localResult) {
            return res.json({ text: localResult });
        }

        // 2. AI Logic with Gemini-Gemma Fallback[cite: 4, 23].
        const text = await generateWithFallback(query);
        
        // 3. Background Analytics[cite: 5, 23].
        // RESOLVED: Backgrounded to prevent 500 errors if BigQuery table is missing[cite: 18].
        logToBigQuery(query, "Election Q&A", "Gemini-Gemma-Pipeline")
            .catch(err => console.error("📊 Analytics Log Suppressed:", err.message));

        res.json({ text });
    } catch (error) {
        const isRateLimit = error.message?.includes('429');
        res.status(isRateLimit ? 429 : 500).json({ 
            error: isRateLimit ? "AI Rate limit reached." : "Service busy." 
        });
    }
});

/**
 * CALENDAR EVENTS[cite: 6, 23].
 */
app.get('/api/events', async (req, res) => {
    try {
        const electionEvents = await getElectionEvents();
        res.json(electionEvents);
    } catch (error) {
        res.status(500).json({ error: "Could not sync election calendar." });
    }
});

// --- SERVER INITIALIZATION ---
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`
    ✅ CivicSync Server v2 Ready
    🚀 URL: http://localhost:${PORT}
    🛡️ Security: Custom CSP (Google Maps Fixed)
    📊 Analytics: BigQuery Service Initialized
    `);
});

// Graceful Shutdown[cite: 2, 23].
process.on('SIGTERM', () => {
    server.close(() => console.log('Process terminated.'));
});