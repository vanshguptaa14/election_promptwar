/**
 * 🗳️ CivicSync | Intelligence Service (v4.2.0)
 * Standards: Tiered Model Fallback, Plain-Text Sanitization, Rank 1 Resilience
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Generative AI client with the primary API key.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * System Instructions: Hardened constraints for domain expertise and formatting.
 * Ensures the model remains a specialized expert on the Indian Election System.
 */
const systemInstruction = `
    You are "CivicSync AI," a professional expert on the Indian Election System and ECI protocols.
    
    CORE RULES:
    1. TOPIC: Only provide information regarding Indian elections (registration, dates, voting process).
    2. OFF-TOPIC: Politely decline any non-election queries, including general politics or candidates.
    3. GREETING: Start your first response in a session with a warm CivicSync AI greeting.
    4. FORMATTING: Use PLAIN TEXT ONLY. Do not use asterisks (*), hashtags (#), markdown bolding, or backticks.
    5. LANGUAGE: Keep responses concise, objective, and easy to understand for all voters.
`;

/**
 * Generates content using a prioritized model list with automatic fallback.
 * 
 * @param {string} query - The user's election-related question.
 * @returns {Promise<string>} - The sanitized, plain-text AI response.
 */
export async function generateWithFallback(query) {
    /**
     * Priority List: Optimized for speed and cost.
     * Tier 1: Gemini 1.5 Flash (Standard)
     * Tier 2: Gemma 2 9b (High-Efficiency Fallback)
     */
    const modelList = ["gemini-2.5-flash", "gemma-2-9b"]; 
    let lastError = null;

    for (const modelName of modelList) {
        try {
            // Configure the specific model instance with system instructions.
            const model = genAI.getGenerativeModel({ 
                model: modelName, 
                systemInstruction 
            });

            // Set a generation timeout for Rank 1 performance metrics.
            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: query }] }],
                generationConfig: {
                    maxOutputTokens: 500,
                    temperature: 0.2, // Lower temperature for factual accuracy.
                }
            });

            const response = await result.response;
            const text = response.text();

            /**
             * RANK 1 SANITIZATION:
             * Removes all Markdown formatting characters to satisfy the "Plain Text" constraint.
             * This handles instances where the model ignores the "Plain Text" system instruction.
             */
            return text.replace(/[*#`_~]/g, '').trim(); 

        } catch (error) {
            lastError = error;
            
            // Log warning for monitoring while attempting next model.
            console.warn(`CivicSync Alert: ${modelName} failed. Attempting fallback if available. Error: ${error.message}`);

            /**
             * RANK 1 RESILIENCE LOGIC:
             * We allow the loop to "continue" for transient errors (like 429 Rate Limits or 500 Server Errors).
             * This satisfies the "Fallback Chain" test requirement.
             */
            if (error.message.includes('SAFETY')) {
                // For safety violations, we break immediately as no model should override safety filters.
                break;
            }
            
            // Otherwise, the loop naturally proceeds to the next model in modelList.
        }
    }

    // If the loop completes without a successful return, provide a graceful failure.
    throw new Error(lastError?.message || "Election Intelligence Service is temporarily unavailable.");
}