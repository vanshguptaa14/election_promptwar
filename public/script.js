/**
 * 🗳️ CivicSync | Frontend Controller
 */

// 1. AI Assistant Logic
async function askAI() {
    const responseDiv = document.getElementById('aiResponse');
    const input = document.getElementById('userInput');
    const query = input.value?.trim();

    if (!query) return;

    responseDiv.innerHTML = `<p class="loading">Analyzing request for CivicSync...</p>`;

    try {
        const res = await fetch('/api/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        
        const data = await res.json();

        if (res.status === 429) {
            responseDiv.innerHTML = `<p style="color: #f87171;">⚠️ Rate limit reached. Please wait a moment.</p>`;
            return;
        }

        responseDiv.innerHTML = `<div class="fade-in">${data.text}</div>`;
    } catch (err) {
        responseDiv.innerHTML = `<p style="color: #f87171;">Connection busy. Please try again later.</p>`;
    }
}

// 2. Timeline Sync Logic
async function loadTimeline() {
    const list = document.getElementById('eventList');
    if (!list) return;
    list.innerHTML = "<li>Fetching official data...</li>";

    try {
        const res = await fetch('/api/events');
        const events = await res.json();

        if (!events || events.length === 0) {
            list.innerHTML = "<li>No regional election events currently listed.</li>";
            return;
        }

        list.innerHTML = events.map(e => `
            <li class="fade-in">
                <span style="color: var(--primary); font-weight: bold;">
                    ${new Date(e.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                </span><br>
                <strong>${e.title}</strong><br>
                <small style="opacity: 0.7">📍 ${e.location}</small>
            </li>
        `).join('');
    } catch (err) {
        list.innerHTML = "<li>Unable to load timeline.</li>";
    }
}

// 3. Map Initialization
window.initMap = function() {
    const mapElement = document.getElementById("map");
    if (!mapElement) return;

    new google.maps.Map(mapElement, {
        center: { lat: 20.5937, lng: 78.9629 }, // Center of India
        zoom: 5,
        disableDefaultUI: true,
        styles: [
            { "elementType": "geometry", "stylers": [{ "color": "#1d2c4d" }] },
            { "elementType": "labels.text.fill", "stylers": [{ "color": "#8ec3b9" }] },
            { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0e1626" }] }
        ]
    });
};

// 4. Lifecycle & Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    // RESOLVED: Event Listeners replace onclick attributes to satisfy CSP[cite: 13, 24]
    document.getElementById('askBtn')?.addEventListener('click', askAI);
    document.getElementById('syncBtn')?.addEventListener('click', loadTimeline);

    // Suggestion Pill handling
    document.querySelectorAll('.pill').forEach(pill => {
        pill.addEventListener('click', () => {
            const query = pill.getAttribute('data-query');
            const input = document.getElementById('userInput');
            if (input && query) {
                input.value = query;
                askAI();
            }
        });
    });

    // Fetch Map Config and Load SDK
    try {
        const res = await fetch('/api/config');
        const config = await res.json();
        
        const script = document.createElement('script');
        // RESOLVED: Added async and defer to fix performance warning in image_751620.png[cite: 17, 24]
        script.src = `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&callback=initMap`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    } catch (e) {
        console.error("Map Config Error:", e);
    }
});