// QA.js - Local fallback data for CivicSync
export const localQA = [
    {
        keywords: ["age", "17", "18", "eligible", "old enough", "vote"],
        answer: "In India, you must be 18 years old by the qualifying date to vote. You can apply for registration at 17 so you are ready when you turn 18."
    },
    {
        keywords: ["register", "enroll", "voter id", "apply"],
        answer: "Register online via the National Voter's Service Portal (NVSP) or the Voter Helpline App using age and address proof."
    },
    {
        keywords: ["id", "documents", "aadhaar", "pan", "card"],
        answer: "You can vote using a Voter ID, Aadhaar Card, PAN Card, or Driving License if your name is on the electoral roll."
    },
    {
        keywords: ["polling station", "booth", "location", "where"],
        answer: "You can find your polling station on the NVSP portal under 'Know Your Polling Station' or by sending an SMS with your EPIC number to 1950."
    },
    {
        keywords: ["deadline", "last date", "close"],
        answer: "Voter registration typically remains open until approximately three weeks before the official election date in your constituency."
    },
    {
        keywords: ["electoral roll", "voter list", "check name"],
        answer: "Visit electoralsearch.in to verify if your name is in the official list. Being in the roll is mandatory to cast a vote."
    },
    {
        keywords: ["timings", "hours", "time", "open"],
        answer: "Polling stations are generally open from 7:00 AM to 6:00 PM, though these hours may vary slightly depending on the specific location."
    },
    {
        keywords: ["duplicate", "lost", "replace", "form 1"],
        answer: "If you lost your Voter ID, you can apply for a replacement by submitting Form 1 on the Voter Helpline App or NVSP portal."
    },
    {
        keywords: ["nri", "citizen", "abroad", "overseas"],
        answer: "NRI citizens can register as 'Overseas Voters' using Form 6A. However, they must be physically present at their registered polling booth in India to vote."
    },
    {
        keywords: ["candidate", "who is", "contesting"],
        answer: "You can view the list of contesting candidates and their affidavits on the 'Voter Helpline' app or the Election Commission of India (ECI) website."
    }
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