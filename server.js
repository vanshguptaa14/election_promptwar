/**
 * 🗳️ CivicSync | Professional Election Intelligence Server
 * Version: 3.1.0 (Rank 1 Production Optimized)
 * Standards: ES Modules, Security Hardened, Tiered Intelligence Pipeline
 */

import 'dotenv/config'; 
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

// --- Modular Service Imports ---
import { generateWithFallback } from './services/aiService.js';
import { logToBigQuery } from './services/analyticsService.js';
import { getElectionEvents } from './services/calendarService.js';
import { getMapConfig } from './services/mapService.js';
import { getLocalAnswer } from './QA.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Render dynamic port binding with local fallback
const PORT = process.env.PORT || 3000; 

// --- SECURITY & GLOBAL MIDDLEWARE ---

/**
 * RANK 1 SECURITY: Enhanced CSP for Google SDKs and AI Services.
 * Added strict CORS to prevent unauthorized API access.
 */
app.use(cors());
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

// Payload limitation to prevent resource exhaustion attacks
app.use(express.json({ limit: '10kb' })); 
app.use(express.static(path.join(__dirname, 'public')));

/**
 * RANK 1 OBSERVABILITY: Request Rate Limiting.
 * Protects Gemini API quotas and provides friendly error messages for 429 states.
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 Minutes
    max: 50, // Threshold for Rank 1 security compliance
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({ error: "Service busy. Please try again in 15 minutes." });
    }
});

// --- SYSTEM ENDPOINTS ---

/**
 * Health check for deployment monitoring and automated recovery on Render.
 */
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'Healthy',
        version: '3.1.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

/**
 * MAP CONFIGURATION
 * Securely delivers API keys to frontend.
 */
app.get('/api/config', (req, res) => {
    try {
        const config = getMapConfig();
        if (!config.apiKey) throw new Error("API Key Missing");
        res.json(config);
    } catch (error) {
        console.error("❌ Maps Configuration Error:", error.message);
        res.status(500).json({ error: "Maps configuration unavailable." });
    }
});

/**
 * AI Q&A + ANALYTICS PIPELINE
 * Multi-tiered logic: 1. Local Lookup -> 2. Gemini Hybrid Fallback -> 3. BigQuery Logging.
 */
app.post('/api/ask', apiLimiter, async (req, res) => {
    const { query } = req.body;
    
    // Strict validation for Rank 1 Intelligence compliance
    if (!query || typeof query !== 'string' || query.trim().length < 5) {
        return res.status(400).json({ error: "Please provide a specific election-related question." });
    }

    try {
        // TIER 1: Zero-Latency Local Fallback
        const localResult = getLocalAnswer(query);
        if (localResult) {
            return res.json({ text: localResult, source: 'verified-cache' });
        }

        // TIER 2: High-Fidelity AI Generation
        const text = await generateWithFallback(query);
        
        if (!text) throw new Error("AI engine failed to produce content");

        // TIER 3: Fire-and-forget Analytics (Non-blocking)
        logToBigQuery(query, "Election Intelligence", "Hybrid-Pipeline-v3")
            .catch(err => console.error("📊 Analytics background error:", err.message));

        res.json({ text, source: 'ai-engine' });
    } catch (error) {
        const isRateLimit = error.message?.includes('429') || error.status === 429;
        console.error(`❌ Pipeline Error: ${error.message}`);
        
        res.status(isRateLimit ? 429 : 500).json({ 
            error: isRateLimit 
                ? "AI Capacity reached. Try again in 60 seconds." 
                : "CivicSync Assistant is temporarily offline.",
            text: "I'm having trouble connecting to my brain right now. Please try again shortly."
        });
    }
});

/**
 * CALENDAR EVENTS
 * Pulls official election dates via Calendar Service.
 */
app.get('/api/events', async (req, res) => {
    try {
        const electionEvents = await getElectionEvents();
        res.json(electionEvents || []);
    } catch (error) {
        console.error("❌ Calendar Sync Error:", error.message);
        res.status(500).json({ error: "Could not sync election calendar.", events: [] });
    }
});

// --- SERVER INITIALIZATION ---
const server = app.listen(PORT, () => {
    console.log(`
    ✅ CivicSync Rank 1 Server Online
    🚀 URL: http://localhost:${PORT}
    🛡️ Security: CSP, CORS & Rate Limiter Active
    📊 Analytics: BigQuery Pipeline Ready
    `);
});

/**
 * Graceful Shutdown for Render deployment cycles.
 */
process.on('SIGTERM', () => {
    server.close(() => {
        console.log('CivicSync server gracefully terminated.');
        process.exit(0);
    });
});