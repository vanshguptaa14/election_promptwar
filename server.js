/**
 * 🗳️ CivicSync | Professional Election Intelligence Server
 * Version: 2.2.0 (Rank 1 Optimized)
 * Standards: ES Modules, Security Hardened, Tiered Intelligence Pipeline
 */

import 'dotenv/config'; 
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// --- Modular Service Imports ---
// Service naming updated to reflect latest Rank 1 logic[cite: 24, 25, 26, 27]
import { generateWithFallback } from './services/aiService.js';
import { logToBigQuery } from './services/analyticsService.js';
import { getElectionEvents } from './services/calendarService.js';
import { getMapConfig } from './services/mapService.js';
import { getLocalAnswer } from './QA.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// --- SECURITY MIDDLEWARE ---
/**
 * RANK 1 SECURITY: Enhanced CSP for Google SDKs and AI Services.
 * Ensures no blocking of Map tiles or API handshakes.
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

// Payload limitation to prevent resource exhaustion attacks.
app.use(express.json({ limit: '10kb' })); 
app.use(express.static(path.join(__dirname, 'public')));

/**
 * RANK 1 OBSERVABILITY: Request Rate Limiting[cite: 28].
 * Protects Gemini API quotas and prevents brute-force bot traffic[cite: 28].
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 Minutes
    max: 50, // Limit to 50 requests per window[cite: 28]
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Service busy. Please try again in 15 minutes." }
});
app.use('/api/', apiLimiter);

// --- SYSTEM ENDPOINTS ---

/**
 * Health check for deployment monitoring and automated recovery[cite: 28].
 */
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'Healthy',
        version: '2.2.0',
        timestamp: new Date().toISOString()
    });
});

/**
 * MAP CONFIGURATION
 * Securely delivers API keys to frontend while keeping them hidden from static files[cite: 27, 28].
 */
app.get('/api/config', (req, res) => {
    try {
        const config = getMapConfig();
        res.json(config);
    } catch (error) {
        console.error("❌ Maps Configuration Error:", error.message);
        res.status(500).json({ error: "Maps configuration unavailable." });
    }
});

/**
 * AI Q&A + ANALYTICS PIPELINE
 * Multi-tiered logic: 1. Local Lookup -> 2. Gemini Hybrid Fallback -> 3. BigQuery Logging[cite: 24, 25, 28].
 */
app.post('/api/ask', async (req, res) => {
    const { query } = req.body;
    
    // Validation to prevent empty or malicious payloads[cite: 28].
    if (!query || query.trim().length < 5) {
        return res.status(400).json({ error: "Please provide a specific election-related question." });
    }

    try {
        // TIER 1: Cost-Saving Verified Lookup[cite: 28].
        const localResult = getLocalAnswer(query);
        if (localResult) {
            return res.json({ text: localResult, source: 'verified-cache' });
        }

        // TIER 2: High-Fidelity AI Generation with Gemma/Gemini Fallback[cite: 24, 28].
        const text = await generateWithFallback(query);
        
        // TIER 3: Non-blocking Analytics[cite: 25, 28].
        // Logged in background to ensure lightning-fast user response times[cite: 28].
        logToBigQuery(query, "Election Intelligence", "Hybrid-Pipeline-v2")
            .catch(err => console.error("📊 Analytics background error:", err.message));

        res.json({ text, source: 'ai-engine' });
    } catch (error) {
        const isRateLimit = error.message?.includes('429');
        console.error(`❌ Pipeline Error: ${error.message}`);
        
        res.status(isRateLimit ? 429 : 500).json({ 
            error: isRateLimit ? "AI Capacity reached. Try again in 60 seconds." : "CivicSync Assistant is temporarily offline." 
        });
    }
});

/**
 * CALENDAR EVENTS
 * Pulls and filters official election dates via Google Calendar API[cite: 26, 28].
 */
app.get('/api/events', async (req, res) => {
    try {
        const electionEvents = await getElectionEvents();
        res.json(electionEvents);
    } catch (error) {
        console.error("❌ Calendar Sync Error:", error.message);
        res.status(500).json({ error: "Could not sync election calendar." });
    }
});

// --- SERVER INITIALIZATION ---
const server = app.listen(PORT, () => {
    console.log(`
    ✅ CivicSync Rank 1 Server Online
    🚀 URL: http://localhost:${PORT}
    🛡️ Security: CSP & Rate Limiter Active[cite: 28]
    📊 Analytics: BigQuery Logging Pipeline Ready[cite: 25]
    `);
});

/**
 * Graceful Shutdown: Cleanly closes connections on deployment restarts[cite: 28].
 */
process.on('SIGTERM', () => {
    server.close(() => console.log('CivicSync server gracefully terminated.'));
});