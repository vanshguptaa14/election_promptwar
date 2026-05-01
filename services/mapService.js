/**
 * Service to handle Google Maps Platform configuration and 
 * server-side Geocoding if needed in the future.
 */
export const getMapConfig = () => {
    const key = process.env.MAPS_API_KEY;
    
    if (!key) {
        console.error("❌ Maps API Key is missing in .env");
        throw new Error("Maps configuration failed.");
    }

    return {
        apiKey: key,
        libraries: ['places', 'marker'],
        defaultCenter: { lat: 20.5937, lng: 78.9629 }, // Center of India
        zoom: 5
    };
};