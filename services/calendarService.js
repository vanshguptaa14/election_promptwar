import { google } from 'googleapis';

const calendar = google.calendar({
    version: 'v3',
    auth: process.env.GOOGLE_API_KEY 
});

/**
 * Fetches and filters Indian election-related events from Google Calendar
 * @returns {Promise<Array>} Array of formatted election events
 */
export async function getElectionEvents() {
    try {
        const response = await calendar.events.list({
            calendarId: 'en.indian#holiday@group.v.calendar.google.com',
            timeMin: new Date().toISOString(),
            maxResults: 25, 
            singleEvents: true,
            orderBy: 'startTime',
        });

        const allEvents = response.data.items || [];

        // Filters for Election terms and formats the output
        return allEvents
            .filter(event => {
                const summary = (event.summary || "").toLowerCase();
                return summary.includes('election') || 
                       summary.includes('poll') || 
                       summary.includes('voting');
            })
            .map(event => ({
                date: event.start.date || event.start.dateTime,
                title: event.summary,
                location: event.location || "Local Election Center" 
            }));
    } catch (error) {
        console.error("❌ Calendar Service Error:", error.message);
        throw new Error("Failed to fetch election dates.");
    }
}