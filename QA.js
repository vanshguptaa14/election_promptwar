// QA.js - Local fallback data for CivicSync
export const localQA = [
   
];

/**
 * Searches the local database for keywords matching the user query.
 * Useful for bypassing API rate limits or 503 errors.
 */
export function getLocalAnswer(query) {
    const lowerQuery = query.toLowerCase();
    const match = localQA.find(item => 
        item.keywords.some(keyword => lowerQuery.includes(keyword))
    );
    return match ? match.answer : null;
}