window.fillInput = function(text) {
    const input = document.getElementById('userInput');
    input.value = text;
    askAI();
};

async function askAI() {
    const responseDiv = document.getElementById('aiResponse');
    const input = document.getElementById('userInput');
    const query = input.value.trim();

    if (!query) return;

    responseDiv.innerHTML = `<p class="loading">Analyzing request for CivicSync...</p>`;

    try {
        const res = await fetch('/api/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        const data = await res.json();
        // The server-side logic already removes asterisks
        responseDiv.innerHTML = `<div class="fade-in">${data.text}</div>`;
    } catch (err) {
        responseDiv.innerHTML = `<p style="color: #f87171;">Connection busy. Please try a simpler question.</p>`;
    }
}

async function loadTimeline() {
    const list = document.getElementById('eventList');
    list.innerHTML = "<li>Fetching official data...</li>";

    try {
        const res = await fetch('/api/events');
        const events = await res.json();

        if (events.length === 0) {
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

window.initMap = function() {
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 20.5937, lng: 78.9629 },
        zoom: 5,
        disableDefaultUI: true,
        styles: [
            { "elementType": "geometry", "stylers": [{ "color": "#1d2c4d" }] },
            { "elementType": "labels.text.fill", "stylers": [{ "color": "#8ec3b9" }] },
            { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0e1626" }] }
        ]
    });
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/api/config');
        const config = await res.json();
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${config.mapsKey}&callback=initMap`;
        document.head.appendChild(script);
    } catch (e) {
        console.error("Map Config Error");
    }
});