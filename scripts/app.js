// App Logic

const grid = document.querySelector('.alternatives-grid');
const searchInput = document.getElementById('search-input');
const categoryList = document.getElementById('category-list');
const countryList = document.getElementById('country-list');
const resultsTitle = document.getElementById('results-title');
const resultsCount = document.getElementById('results-count');

// --- Helper Functions ---

function getCountryFlag(countryName) {
    const isoCodes = {
        'France': 'fr',
        'Germany': 'de',
        'Switzerland': 'ch',
        'Sweden': 'se',
        'Netherlands': 'nl',
        'Lithuania': 'lt',
        'Estonia': 'ee',
        'Germany/UAE': 'de',
        'UAE': 'ae',
        'Belgium': 'be',
        'Finland': 'fi',
        'Italy': 'it',
        'UK': 'gb',
        'Spain': 'es',
        'Portugal': 'pt',
        'Ireland': 'ie',
        'Latvia': 'lv',
        'Denmark': 'dk'
    };
    // Helper to find key efficiently
    const normalized = Object.keys(isoCodes).find(k => k.toLowerCase() === countryName.toLowerCase());
    const code = isoCodes[normalized || countryName] || 'eu';
    return `<img src="https://flagcdn.com/24x18/${code}.png" class="country-flag" alt="${countryName}">`;
}

function updateResultsHeader(count, title) {
    resultsCount.textContent = `${count} result${count !== 1 ? 's' : ''}`;
    if (title) resultsTitle.textContent = title;
}

// --- Render Logic ---

function renderAlternatives(items) {
    grid.innerHTML = '';

    if (items.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #64748b; font-size: 1.1rem;">No results found matching your criteria.</div>';
        updateResultsHeader(0);
        return;
    }

    items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.animationDelay = `${index * 0.05}s`;

        const initial = item.name.charAt(0);
        let hostname = '';
        try {
            hostname = new URL(item.link).hostname.replace('www.', '');
        } catch (e) {
            hostname = item.link;
        }

        const logoUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;

        // Handle multiple countries (e.g. "France/Germany")
        const itemCountries = item.country.split('/').map(c => c.trim());
        const flagsHtml = itemCountries.map(c => {
            const flag = getCountryFlag(c);
            return `<span style="white-space: nowrap;">${flag} ${c}</span>`;
        }).join('<span style="margin: 0 4px;">/</span>');

        // Eco badge is NOT shown here (requested by user), only on product page.

        card.innerHTML = `
            <a href="product.html?id=${item.id}" style="text-decoration: none; color: inherit; display: block; flex-grow: 1;">
                <div class="card-header-row">
                    <div class="card-logo">
                        <img src="${logoUrl}" alt="${item.name}" onerror="this.style.display='none'; this.parentElement.innerText='${initial}'">
                    </div>
                    <div>
                        <div class="card-category">${item.category}</div>
                        <h2>${item.name}</h2>
                    </div>
                </div>
                
                <div class="alternative-to">
                    <span>🚫</span>
                    <span>Replaces <strong>${item.alternativeTo}</strong></span>
                </div>
                
                <p class="description">${item.description}</p>
            </a>
            
            <div class="card-footer">
                <span class="country-tag">
                    ${flagsHtml}
                </span>
                <a href="${item.link}" target="_blank" class="btn">Visit</a>
            </div>
        `;
        grid.appendChild(card);
    });
}

// --- Sidebar Logic ---

function renderCategories() {
    const categories = ['All', ...new Set(alternatives.map(item => item.category))].sort();
    categoryList.innerHTML = '';

    categories.forEach(category => {
        const li = document.createElement('li');
        li.textContent = category;
        if (category === 'All') li.classList.add('active');

        li.addEventListener('click', () => {
            // Visual Update
            document.querySelectorAll('.category-list li').forEach(el => el.classList.remove('active'));
            li.classList.add('active');

            // Logic
            if (category === 'All') {
                renderAlternatives(alternatives);
                updateResultsHeader(alternatives.length, "All Alternatives");
            } else {
                const filtered = alternatives.filter(item => item.category === category);
                renderAlternatives(filtered);
                updateResultsHeader(filtered.length, category);
            }
            searchInput.value = '';
        });

        categoryList.appendChild(li);
    });
}

function renderCountries() {
    if (!countryList) return;

    // Split country strings like "France/Germany" into individual countries
    const countries = [...new Set(alternatives.flatMap(item =>
        item.country.split('/').map(c => c.trim())
    ))].sort();

    countryList.innerHTML = '';

    countries.forEach(country => {
        const li = document.createElement('li');
        const flag = getCountryFlag(country);
        li.innerHTML = `${flag} ${country}`;

        li.addEventListener('click', () => {
            // Visual Update
            document.querySelectorAll('.category-list li').forEach(el => el.classList.remove('active'));
            li.classList.add('active');

            // Logic: Check if item's country string includes the selected country
            const filtered = alternatives.filter(item => {
                const itemCountries = item.country.split('/').map(c => c.trim());
                return itemCountries.includes(country);
            });

            renderAlternatives(filtered);
            updateResultsHeader(filtered.length, `Made in ${country}`);

            searchInput.value = '';
        });

        countryList.appendChild(li);
    });
}

// --- Search Logic ---

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();

        // Deselect lists
        document.querySelectorAll('.category-list li').forEach(el => el.classList.remove('active'));

        const filtered = alternatives.filter(item =>
            item.name.toLowerCase().includes(term) ||
            item.description.toLowerCase().includes(term) ||
            item.alternativeTo.toLowerCase().includes(term)
        );

        renderAlternatives(filtered);
        updateResultsHeader(filtered.length, `Search: "${e.target.value}"`);
    });
}

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
    renderCountries();
    renderAlternatives(alternatives);
    updateResultsHeader(alternatives.length, "All Alternatives");
    initMobileMenu();
});

// --- Mobile Menu Logic ---

function initMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');

    // Create overlay if it doesn't exist
    let overlay = document.querySelector('.overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'overlay';
        document.body.appendChild(overlay);
    }

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        });

        // Close when clicking overlay
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });

        // Close when clicking any clickable item in sidebar (mobile UX)
        // We defer this slightly to ensure dynamic list items are handled if this runs before they are created?
        // Actually, renderCategories() runs before this, so list items should be there.
        // However, we should use delegation or re-attach updates. 
        // Simplest is generic click on sidebar that targets LI or A.
        sidebar.addEventListener('click', (e) => {
            if (e.target.tagName === 'LI' || e.target.tagName === 'A' || e.target.closest('li')) {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            }
        });
    }
}
