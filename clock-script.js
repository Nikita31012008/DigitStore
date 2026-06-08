// List of timezones with their display names
const TIMEZONES = {
    'America/New_York': { city: 'New York', emoji: '🗽' },
    'America/Chicago': { city: 'Chicago', emoji: '🏙️' },
    'America/Denver': { city: 'Denver', emoji: '🏔️' },
    'America/Los_Angeles': { city: 'Los Angeles', emoji: '🌴' },
    'Europe/London': { city: 'London', emoji: '🇬🇧' },
    'Europe/Paris': { city: 'Paris', emoji: '🇫🇷' },
    'Europe/Berlin': { city: 'Berlin', emoji: '🇩🇪' },
    'Europe/Moscow': { city: 'Moscow', emoji: '🇷🇺' },
    'Asia/Dubai': { city: 'Dubai', emoji: '🇦🇪' },
    'Asia/Kolkata': { city: 'India', emoji: '🇮🇳' },
    'Asia/Bangkok': { city: 'Bangkok', emoji: '🇹🇭' },
    'Asia/Hong_Kong': { city: 'Hong Kong', emoji: '🇭🇰' },
    'Asia/Shanghai': { city: 'Shanghai', emoji: '🇨🇳' },
    'Asia/Tokyo': { city: 'Tokyo', emoji: '🇯🇵' },
    'Asia/Seoul': { city: 'Seoul', emoji: '🇰🇷' },
    'Asia/Singapore': { city: 'Singapore', emoji: '🇸🇬' },
    'Australia/Sydney': { city: 'Sydney', emoji: '🦘' },
    'Australia/Melbourne': { city: 'Melbourne', emoji: '🇦🇺' },
    'Pacific/Auckland': { city: 'Auckland', emoji: '🇳🇿' },
    'Etc/UTC': { city: 'UTC', emoji: '⏰' },
    'America/Sao_Paulo': { city: 'São Paulo', emoji: '🇧🇷' },
    'Africa/Johannesburg': { city: 'Johannesburg', emoji: '🇿🇦' },
    'Africa/Cairo': { city: 'Cairo', emoji: '🇪🇬' }
};

// Store selected timezones in localStorage
let selectedTimezones = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadTimezones();
    setupEventListeners();
    updateAllClocks();
    // Update clocks every second
    setInterval(updateAllClocks, 1000);
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('addBtn').addEventListener('click', addTimezone);
    document.getElementById('timezoneSelect').addEventListener('change', (e) => {
        if (e.target.value) {
            addTimezone();
            e.target.value = '';
        }
    });
}

// Add a new timezone
function addTimezone() {
    const select = document.getElementById('timezoneSelect');
    const timezone = select.value;

    if (!timezone) {
        alert('Please select a timezone');
        return;
    }

    if (selectedTimezones.includes(timezone)) {
        alert('This timezone is already added');
        return;
    }

    selectedTimezones.push(timezone);
    saveTimezones();
    renderClocks();
    select.value = '';
}

// Remove a timezone
function removeTimezone(timezone) {
    selectedTimezones = selectedTimezones.filter(tz => tz !== timezone);
    saveTimezones();
    renderClocks();
}

// Render all clock cards
function renderClocks() {
    const grid = document.getElementById('clocksGrid');

    if (selectedTimezones.length === 0) {
        grid.innerHTML = '<div class="empty-state"><p>📍 No timezones selected yet</p><p style="font-size: 1rem; opacity: 0.8;">Add a timezone from the dropdown above to get started</p></div>';
        return;
    }

    grid.innerHTML = selectedTimezones.map(timezone => `
        <div class="clock-card" id="clock-${timezone}">
            <button class="remove-btn" onclick="removeTimezone('${timezone}')">✕</button>
            <div class="timezone-name">${timezone}</div>
            <div class="timezone-city">${TIMEZONES[timezone].emoji} ${TIMEZONES[timezone].city}</div>
            <div class="digital-clock" id="time-${timezone}">--:--:--</div>
            <div class="am-pm" id="ampm-${timezone}"></div>
            <div class="date-display" id="date-${timezone}"></div>
            <div class="time-info" id="info-${timezone}"></div>
            <div class="offset-info" id="offset-${timezone}"></div>
        </div>
    `).join('');
}

// Update all clocks
function updateAllClocks() {
    selectedTimezones.forEach(timezone => {
        updateClock(timezone);
    });
}

// Update individual clock
function updateClock(timezone) {
    // Get current time in specific timezone
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });

    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    }).formatToParts(now);

    // Get time components
    const timeString = formatter.format(now);
    const timeMatch = timeString.match(/(\d{2}):(\d{2}):(\d{2})/);
    const dateMatch = timeString.match(/(\w+),\s+(\w+)\s+(\d+),\s+(\d{4})/);

    const time = timeMatch ? timeMatch[0] : '--:--:--';
    const date = dateMatch ? `${dateMatch[1]}, ${dateMatch[2]} ${dateMatch[3]}` : '';

    // Get AM/PM
    const ampmPart = parts.find(p => p.type === 'dayPeriod');
    const ampm = ampmPart ? ampmPart.value : '';

    // Calculate UTC offset
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const offsetMs = tzDate - utcDate;
    const offsetHours = Math.floor(Math.abs(offsetMs) / 3600000);
    const offsetMins = Math.floor((Math.abs(offsetMs) % 3600000) / 60000);
    const offsetSign = offsetMs >= 0 ? '+' : '-';
    const offset = `UTC ${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMins).padStart(2, '0')}`;

    // Update DOM
    const timeEl = document.getElementById(`time-${timezone}`);
    const ampmEl = document.getElementById(`ampm-${timezone}`);
    const dateEl = document.getElementById(`date-${timezone}`);
    const offsetEl = document.getElementById(`offset-${timezone}`);

    if (timeEl) timeEl.textContent = time;
    if (ampmEl) ampmEl.textContent = ampm;
    if (dateEl) dateEl.textContent = date;
    if (offsetEl) offsetEl.textContent = offset;
}

// Save timezones to localStorage
function saveTimezones() {
    localStorage.setItem('worldclock_timezones', JSON.stringify(selectedTimezones));
}

// Load timezones from localStorage
function loadTimezones() {
    const saved = localStorage.getItem('worldclock_timezones');
    if (saved) {
        try {
            selectedTimezones = JSON.parse(saved);
            renderClocks();
        } catch (e) {
            console.error('Error loading timezones:', e);
        }
    }
}