
// Map Logic for EuroAlternative

// 1. Coordinates Dictionary (Approx Center)
const countryCoords = {
    'France': [46.2276, 2.2137],
    'Germany': [51.1657, 10.4515],
    'UK': [55.3781, -3.4360],
    'Italy': [41.8719, 12.5674],
    'Spain': [40.4637, -3.7492],
    'Sweden': [60.1282, 18.6435],
    'Netherlands': [52.1326, 5.2913],
    'Switzerland': [46.8182, 8.2275],
    'Belgium': [50.5039, 4.4699],
    'Austria': [47.5162, 14.5501],
    'Denmark': [56.2639, 9.5018],
    'Norway': [60.4720, 8.4689],
    'Finland': [61.9241, 25.7482],
    'Ireland': [53.1424, -7.6921],
    'Portugal': [39.3999, -8.2245],
    'Poland': [51.9194, 19.1451],
    'Czech Republic': [49.8175, 15.4730],
    'Estonia': [58.5953, 25.0136],
    'Lithuania': [55.1694, 23.8813],
    'Latvia': [56.8796, 24.6032],
    'Slovakia': [48.6690, 19.6990],
    'Slovenia': [46.1512, 14.9955],
    'Hungary': [47.1625, 19.5033],
    'Romania': [45.9432, 24.9668],
    'Bulgaria': [42.7339, 25.4858],
    'Greece': [39.0742, 21.8243],
    'Luxembourg': [49.8153, 6.1296],
    'Liechtenstein': [47.1660, 9.5554],
    'Malta': [35.9375, 14.3754],
    'Cyprus': [35.1264, 33.4299],
    'Iceland': [64.9631, -19.0208]
};

document.addEventListener('DOMContentLoaded', () => {
    // 2. Initialize Map
    // Default to Europe center
    const map = L.map('map-container').setView([50.0, 10.0], 4);

    // 3. Tile Layer (Dynamic based on theme would be cool, but let's start with a neutral premium one)
    // CartoDB Positron (clean, gray) matches the "Modern" vibe well.
    const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Dark Mode Check (Simple version)
    if (document.body.classList.contains('dark-mode') || localStorage.getItem('theme') === 'dark') {
        tileLayer.setUrl('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png');
        document.body.classList.add('dark-mode');
        const btn = document.getElementById('theme-toggle');
        if (btn) btn.textContent = '☀️';
    }

    // Theme Toggle Logic replication
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            themeBtn.textContent = isDark ? '☀️' : '🌙';
            localStorage.setItem('theme', isDark ? 'dark' : 'light');

            // Swap Tiles
            tileLayer.setUrl(isDark
                ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png');
        });
    }

    // 4. Data Aggregation
    const grouped = {};
    alternatives.forEach(item => {
        // Handle "France/Germany" by splitting? 
        // For simplicity, map to the first one or primary one. 
        // data.js has "France/Germany" for Airbus.

        let country = item.country.split('/')[0].trim(); // Take first country if multiple

        // Fix naming diffs if any
        if (country === 'UK') { /* maps ok */ }

        if (!grouped[country]) grouped[country] = [];
        grouped[country].push(item);
    });

    // 5. Add Markers
    Object.keys(grouped).forEach(country => {
        const coords = countryCoords[country];
        if (coords) {
            const items = grouped[country];
            const count = items.length;

            // Create Custom Icon with Count
            // Using L.divIcon
            const icon = L.divIcon({
                className: 'custom-marker-container', // We'll style inner
                html: `<div class="custom-marker" style="width: ${30 + (count * 2)}px; height: ${30 + (count * 2)}px;">${count}</div>`,
                iconSize: [30 + (count * 2), 30 + (count * 2)],
                iconAnchor: [(30 + (count * 2)) / 2, (30 + (count * 2)) / 2]
            });

            const marker = L.marker(coords, { icon: icon }).addTo(map);

            // Popup Content
            let popupHtml = `<div class="map-popup-header">${getFlag(country)} ${country} <span style="font-size:0.8em; color:gray; font-weight:normal; margin-left:auto;">(${count})</span></div>`;
            popupHtml += `<div class="map-popup-body">`;

            items.forEach(item => {
                // Logo logic
                let hostname = '';
                try { hostname = new URL(item.link).hostname.replace('www.', ''); } catch (e) { hostname = item.link; }
                const logoUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
                const initial = item.name.charAt(0);

                popupHtml += `
                    <a href="product.html?id=${item.id}" class="map-popup-item">
                        <div class="map-popup-logo">
                            <img src="${logoUrl}" alt="" onerror="this.style.display='none';">
                        </div>
                        <div>
                            <div style="font-weight:700; font-size:0.9rem;">${item.name}</div>
                            <div style="font-size:0.75rem; color:gray;">${item.category}</div>
                        </div>
                    </a>
                `;
            });
            popupHtml += `</div>`;

            marker.bindPopup(popupHtml);
        }
    });
});

// Helper for flags (reused logic roughly)
function getFlag(countryName) {
    const isoCodes = {
        'France': 'fr', 'Germany': 'de', 'UK': 'gb', 'Italy': 'it', 'Spain': 'es',
        'Sweden': 'se', 'Netherlands': 'nl', 'Switzerland': 'ch', 'Belgium': 'be',
        'Austria': 'at', 'Denmark': 'dk', 'Norway': 'no', 'Finland': 'fi',
        'Ireland': 'ie', 'Portugal': 'pt', 'Poland': 'pl', 'Czech Republic': 'cz',
        'Estonia': 'ee', 'Lithuania': 'lt', 'Latvia': 'lv', 'Slovakia': 'sk',
        'Slovenia': 'si', 'Hungary': 'hu', 'Romania': 'ro', 'Bulgaria': 'bg',
        'Greece': 'gr', 'Luxembourg': 'lu', 'Liechtenstein': 'li', 'Malta': 'mt',
        'Cyprus': 'cy', 'Iceland': 'is'
    };
    const code = isoCodes[countryName] || 'eu';
    return `<img src="https://flagcdn.com/16x12/${code}.png" style="vertical-align:middle;">`;
}
