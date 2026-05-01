import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemInstruction = `
    You are "CivicSync AI," a specialized expert on the Indian Election System.
    RULES:
    1. TOPIC: Only answer questions related to Indian elections.
    2. OFF-TOPIC: Politely decline non-election questions.
    3. GREETING: Greet users warmly as CivicSync AI.
    4. NO FORMATTING: Do not use asterisks (*). Plain text only.
`;

export async function generateWithFallback(query) {
    const modelList = ["gemini-2.5-flash", "gemma-2-9b"]; // Use available models
    let lastError = null;

    for (const modelName of modelList) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName, systemInstruction });
            const result = await model.generateContent(query);
            const response = await result.response;
            return response.text().replace(/\*/g, ''); 
        } catch (error) {
            lastError = error;
            console.warn(`Retry: ${modelName} failed.`);
            if (error.message.includes('429')) break;
        }
    }
    throw lastError;
}