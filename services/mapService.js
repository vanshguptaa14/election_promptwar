/**
 * 🗳️ CivicSync | Map Configuration Service (v4.2.0)
 * Standards: Google Maps Platform SDK, India-Centric Geolocation, Rank 1 Validation
 */

/**
 * Standardizes Google Maps Platform settings across the application.
 * This configuration is consumed by the frontend to initialize the interactive 
 * election center locator.
 * 
 * @returns {Object} - Secure map configuration and regional defaults.
 */
export const getMapConfig = () => {
    // RANK 1 SECURITY: Ensure keys are pulled from environment variables, never hardcoded[cite: 22].
    const key = process.env.MAPS_API_KEY;
    
    // RANK 1 VALIDATION: Immediate error reporting if the API key is missing[cite: 22].
    if (!key) {
        console.error("❌ MAPS_API_KEY is missing in the .env configuration[cite: 22].");
        // Throwing here prevents the frontend from attempting to load a broken map[cite: 22].
        throw new Error("Maps service unavailable due to missing credentials.");
    }

    return {
        /**
         * The API key used for client-side Google Maps SDK initialization[cite: 22].
         * Matches the property name expected by the frontend script.js.
         */
        apiKey: key, 

        /**
         * Required libraries for CivicSync's location search and custom markers[cite: 22].
         * 'places' enables searching for polling booths[cite: 22].
         * 'marker' enables the Advanced Marker API[cite: 22].
         */
        libraries: ['places', 'marker'],

        /**
         * RANK 1 GEOLOCATION:
         * Standardized center coordinates for the Republic of India[cite: 22].
         * Default zoom level is set to 5 for a comprehensive national view[cite: 22].
         */
        defaultCenter: { 
            lat: 20.5937, 
            lng: 78.9629 
        }, 
        zoom: 5,
        
        /**
         * Map ID is required for Advanced Markers and custom styling[cite: 23].
         * Ensure this ID is generated in your Google Cloud Console.
         */
        mapId: process.env.MAPS_ID || 'DEMO_MAP_ID'
    };
};