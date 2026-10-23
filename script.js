// =========================================================================
// SECTION 1: UPLOADED COLOR SCHEMES MATRIX (Seasons & Weather Types)
// =========================================================================

const COLOR_PALETTES = {
    seasons: {
        summer: {
            name: 'Summer',
            gradient: 'linear-gradient(135deg, #FF7B39 0%, #FFD643 40%, #FF9E59 100%)',
            cardBg: 'rgba(50, 20, 10, 0.60)',
            border: '#FFD643',
            accentGlow: '#FFD643'
        },
        fall: {
            name: 'Fall',
            gradient: 'linear-gradient(135deg, #2D4D43 0%, #728D7A 35%, #DDA853 70%, #9C3810 100%)',
            cardBg: 'rgba(18, 30, 26, 0.65)',
            border: '#DDA853',
            accentGlow: '#DDA853'
        },
        winter: {
            name: 'Winter',
            gradient: 'linear-gradient(135deg, #1C4B62 0%, #3494B7 35%, #A5C4D6 75%, #C2B8D2 100%)',
            cardBg: 'rgba(15, 28, 42, 0.65)',
            border: '#A5C4D6',
            accentGlow: '#A5C4D6'
        },
        spring: {
            name: 'Spring',
            gradient: 'linear-gradient(135deg, #F5B8D4 0%, #F7D0D3 30%, #FCEED9 65%, #D6E8BE 100%)',
            cardBg: 'rgba(35, 25, 30, 0.60)',
            border: '#F5B8D4',
            accentGlow: '#F5B8D4'
        }
    },
    weather: {
        sunny: {
            accent: '#AEED9A',
            highlight: '#81D4F0',
            border: '#81D4F0',
            sky: 'linear-gradient(180deg, #81D4F0 0%, #ABE8E5 50%, #FCF4E0 100%)'
        },
        raining: {
            accent: '#92BAD2',
            highlight: '#C5E2F7',
            border: '#395871',
            sky: 'linear-gradient(180deg, #395871 0%, #53789E 50%, #92BAD2 100%)'
        },
        snowing: {
            accent: '#ACCCD8',
            highlight: '#FFFAF4',
            border: '#ACCCD8',
            sky: 'linear-gradient(180deg, #577590 0%, #A5C4D6 50%, #FFFAF4 100%)'
        },
        cloudy: {
            accent: '#A4A4AC',
            highlight: '#D2D1D6',
            border: '#948C92',
            sky: 'linear-gradient(180deg, #4A4A52 0%, #948C92 50%, #D2D1D6 100%)'
        }
    }
};

// App State
let isFahrenheit = true;
let currentWeatherData = null;
let selectedHourIndex = new Date().getHours(); // Default to current hour

// Accurate RIT Default Coordinates
const RIT_COORDS = { lat: 43.0848, lon: -77.6744, name: "Rochester Institute of Technology (RIT)" };

function getCurrentSeason() {
    const month = new Date().getMonth(); // 0-11
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
}

function getWeatherCategory(code) {
    if (code === 0 || code === 1) return 'sunny';
    if ([2, 3, 45, 48].includes(code)) return 'cloudy';
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code)) return 'raining';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snowing';
    return 'cloudy';
}

function getWmoDescription(code) {
    const map = {
        0: "Clear Sky", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
        45: "Foggy", 48: "Rime Fog", 51: "Light Drizzle", 53: "Moderate Drizzle",
        61: "Slight Rain", 63: "Moderate Rain", 65: "Heavy Rain", 71: "Slight Snow",
        75: "Heavy Snow", 80: "Rain Showers", 95: "Thunderstorm"
    };
    return map[code] || "Partly Cloudy";
}

function getWeatherIcon(code) {
    if (code === 0 || code === 1) return "fa-sun";
    if (code === 2) return "fa-cloud-sun";
    if (code === 3) return "fa-cloud";
    if ([45, 48].includes(code)) return "fa-smog";
    if ([51, 53, 61, 63, 80].includes(code)) return "fa-cloud-rain";
    if ([65, 81, 82, 95].includes(code)) return "fa-cloud-showers-heavy";
    if ([71, 73, 75, 85].includes(code)) return "fa-snowflake";
    return "fa-cloud-sun";
}

// =========================================================================
// SECTION 2: LIVE OPEN-METEO API & DATA PROCESSING
// =========================================================================

async function fetchWeatherData(lat, lon, locationLabel) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure&hourly=temperature_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`;

        const res = await fetch(url);
        const data = await res.json();

        currentWeatherData = processApiData(data, locationLabel);
        applyDynamicTheme(currentWeatherData.weatherCode);
        renderDashboard();
    } catch (err) {
        console.error("Error fetching live weather, using fallback data:", err);
        useFallbackData(locationLabel);
    }
}

function processApiData(data, locationLabel) {
    const current = data.current;
    const hourly = data.hourly;
    const daily = data.daily;

    // Build 24 Hourly Items (00:00 to 23:00 / 12 AM to 12 PM & beyond)
    const hourlyArr = [];
    const nowHour = new Date().getHours();

    for (let i = 0; i < 24; i++) {
        const timeStr = i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`;
        hourlyArr.push({
            time: timeStr,
            hourNum: i,
            tempF: Math.round(hourly.temperature_2m[i] || 55),
            feelF: Math.round(hourly.apparent_temperature[i] || 53),
            rainPct: hourly.precipitation_probability[i] || 0,
            code: hourly.weather_code[i] || 2,
            wind: Math.round(hourly.wind_speed_10m[i] || 8) + " mph",
            uv: Math.round(hourly.uv_index[i] || 0)
        });
    }

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyArr = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(daily.time[i]);
        const dayName = i === 0 ? "Today" : daysOfWeek[date.getUTCDay()];
        weeklyArr.push({
            day: dayName,
            highF: Math.round(daily.temperature_2m_max[i]),
            lowF: Math.round(daily.temperature_2m_min[i]),
            code: daily.weather_code[i],
            precip: daily.precipitation_probability_max[i] || 0
        });
    }

    return {
        locationName: locationLabel,
        currentTempF: Math.round(current.temperature_2m),
        realFeelF: Math.round(current.apparent_temperature),
        highF: Math.round(daily.temperature_2m_max[0]),
        lowF: Math.round(daily.temperature_2m_min[0]),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m) + " mph NW",
        weatherCode: current.weather_code,
        weatherDesc: getWmoDescription(current.weather_code),
        uvIndex: Math.round(hourly.uv_index[nowHour] || 3),
        precipChance: hourly.precipitation_probability[nowHour] || 10,
        sunrise: daily.sunrise[0] ? daily.sunrise[0].split("T")[1] : "7:15 AM",
        sunset: daily.sunset[0] ? daily.sunset[0].split("T")[1] : "6:15 PM",
        hourly: hourlyArr,
        weekly: weeklyArr
    };
}

function applyDynamicTheme(weatherCode) {
    const seasonKey = getCurrentSeason();
    const weatherKey = getWeatherCategory(weatherCode);

    const seasonStyle = COLOR_PALETTES.seasons[seasonKey];
    const weatherStyle = COLOR_PALETTES.weather[weatherKey];

    // Apply body background gradient
    const appBody = document.getElementById('appBody');
    appBody.style.background = seasonStyle.gradient;

    // Set variables for sharp cards and borders
    document.documentElement.style.setProperty('--card-bg', seasonStyle.cardBg);
    document.documentElement.style.setProperty('--accent-border', weatherStyle.border);
    document.documentElement.style.setProperty('--accent-glow', weatherStyle.accent);

    const seasonTag = document.getElementById('seasonTag');
    seasonTag.textContent = `${seasonStyle.name} • ${weatherKey.toUpperCase()}`;
    seasonTag.style.borderColor = weatherStyle.accent;
    seasonTag.style.color = weatherStyle.accent;
}

function formatTemp(tempF) {
    if (isFahrenheit) return `${tempF}°`;
    const celsius = Math.round((tempF - 32) * (5 / 9));
    return `${celsius}°`;
}

// =========================================================================
// SECTION 3: DASHBOARD RENDERING
// =========================================================================

function renderDashboard() {
    if (!currentWeatherData) return;
    const d = currentWeatherData;

    document.getElementById('locationName').textContent = d.locationName;
    document.getElementById('cityName').textContent = d.locationName.split('(')[0];
    document.getElementById('weatherDesc').textContent = d.weatherDesc;
    document.getElementById('mainTemp').textContent = formatTemp(d.currentTempF);
    document.getElementById('unitLabel').textContent = isFahrenheit ? 'F' : 'C';

    document.getElementById('highTemp').textContent = formatTemp(d.highF);
    document.getElementById('lowTemp').textContent = formatTemp(d.lowF);
    document.getElementById('realFeel').textContent = formatTemp(d.realFeelF);

    document.getElementById('windVal').textContent = d.windSpeed;
    document.getElementById('humidityVal').textContent = d.humidity + '%';
    document.getElementById('uvVal').textContent = `${d.uvIndex} (Moderate)`;
    document.getElementById('rainChanceVal').textContent = d.precipChance + '%';

    document.getElementById('sunriseTime').textContent = d.sunrise;
    document.getElementById('sunsetTime').textContent = d.sunset;

    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', options);

    renderHourlyBar();
    renderHourInspector(selectedHourIndex);
    renderWeeklyForecast();
    renderOutfitGuide(d.currentTempF, d.weatherCode);
}

function renderHourlyBar() {
    const bar = document.getElementById('hourlyBar');
    bar.innerHTML = '';

    currentWeatherData.hourly.forEach((item, idx) => {
        const btn = document.createElement('button');
        const isActive = idx === selectedHourIndex;

        btn.className = `hour-pill flex-shrink-0 px-3 py-2 flex flex-col items-center gap-1 text-xs transition-all ${
            isActive ? 'active' : 'hover:bg-white/10 text-white/90'
        }`;

        btn.onclick = () => {
            selectedHourIndex = idx;
            renderHourlyBar();
            renderHourInspector(idx);
        };

        btn.innerHTML = `
            <span class="text-[10px] font-semibold text-white/70">${item.time}</span>
            <i class="fa-solid ${getWeatherIcon(item.code)} text-amber-300 text-sm my-0.5"></i>
            <span class="font-bold">${formatTemp(item.tempF)}</span>
        `;
        bar.appendChild(btn);
    });
}

function renderHourInspector(hourIdx) {
    const item = currentWeatherData.hourly[hourIdx] || currentWeatherData.hourly[12];

    document.getElementById('hourTimeStr').textContent = item.time;
    document.getElementById('hourCondStr').textContent = getWmoDescription(item.code);
    document.getElementById('hourTemp').textContent = formatTemp(item.tempF);
    document.getElementById('hourFeel').textContent = formatTemp(item.feelF);

    document.getElementById('hourWind').textContent = item.wind;
    document.getElementById('hourRain').textContent = item.rainPct + '%';
    document.getElementById('hourUV').textContent = item.uv;

    document.getElementById('hourIcon').innerHTML = `<i class="fa-solid ${getWeatherIcon(item.code)}"></i>`;
}

function renderWeeklyForecast() {
    const container = document.getElementById('weeklyContainer');
    container.innerHTML = '';

    currentWeatherData.weekly.forEach(item => {
        const row = document.createElement('div');
        row.className = "flex items-center justify-between p-2.5 rounded-lg bg-black/15 border border-white/5 text-xs hover:bg-white/5 transition-colors";

        row.innerHTML = `
            <span class="w-16 font-bold text-white/90">${item.day}</span>
            <div class="flex items-center gap-2 w-32">
                <i class="fa-solid ${getWeatherIcon(item.code)} text-amber-300 text-sm"></i>
                <span class="text-[11px] text-white/70 truncate">${getWmoDescription(item.code)}</span>
            </div>
            <div class="flex items-center gap-1.5 font-bold">
                <span class="text-white">${formatTemp(item.highF)}</span>
                <span class="text-white/40">/</span>
                <span class="text-white/60">${formatTemp(item.lowF)}</span>
            </div>
        `;
        container.appendChild(row);
    });
}

function renderOutfitGuide(tempF, weatherCode) {
    const narrativeEl = document.getElementById('outfitNarrative');
    const itemsGrid = document.getElementById('outfitItemsGrid');

    let narrative = "";
    let gear = [];

    if (tempF < 35) {
        narrative = `Freezing weather conditions detected (${tempF}°F). Heavy insulation and layered outerwear are critical today.`;
        gear = [
            { icon: 'fa-snowflake', label: 'Heavy Winter Coat' },
            { icon: 'fa-hat-cowboy', label: 'Thermal Beanie' },
            { icon: 'fa-mitten', label: 'Insulated Gloves' },
            { icon: 'fa-socks', label: 'Thermal Base Layer' }
        ];
    } else if (tempF < 55) {
        narrative = `Crisp, cool temperature (${tempF}°F). A warm sweater or mid-weight jacket provides ideal comfort.`;
        gear = [
            { icon: 'fa-vest', label: 'Fleece Jacket / Sweater' },
            { icon: 'fa-shirt', label: 'Long Sleeve Shirt' },
            { icon: 'fa-user-ninja', label: 'Light Scarf' },
            { icon: 'fa-socks', label: 'Warm Socks & Boots' }
        ];
    } else if (tempF < 72) {
        narrative = `Mild and pleasant conditions (${tempF}°F). Light layers are recommended; a simple jacket or cardigan is plenty.`;
        gear = [
            { icon: 'fa-shirt', label: 'Cotton T-Shirt' },
            { icon: 'fa-vest-patches', label: 'Light Cardigan/Jacket' },
            { icon: 'fa-shoe-prints', label: 'Comfortable Sneakers' }
        ];
    } else {
        narrative = `Warm weather ahead (${tempF}°F). Wear breathable, lightweight clothing and stay hydrated.`;
        gear = [
            { icon: 'fa-shirt', label: 'Breathable Tee' },
            { icon: 'fa-glasses', label: 'UV Sunglasses' },
            { icon: 'fa-hat-wizard', label: 'Sun Cap' }
        ];
    }

    const weatherCategory = getWeatherCategory(weatherCode);
    if (weatherCategory === 'raining') {
        narrative += " Rain expected; make sure to bring an umbrella!";
        gear.unshift({ icon: 'fa-umbrella', label: 'Waterproof Umbrella' });
    }

    narrativeEl.textContent = narrative;
    itemsGrid.innerHTML = '';
    gear.forEach(item => {
        const pill = document.createElement('div');
        pill.className = 'p-2 rounded-lg bg-black/25 border border-white/10 flex items-center gap-2 text-xs font-semibold text-white/90';
        pill.innerHTML = `<i class="fa-solid ${item.icon} text-amber-300"></i> <span>${item.label}</span>`;
        itemsGrid.appendChild(pill);
    });
}

// =========================================================================
// SECTION 4: EVENT LISTENERS & INITIALIZATION
// =========================================================================

function setupEventListeners() {
    document.getElementById('presetSelect').addEventListener('change', (e) => {
        const val = e.target.value;
        if (val.includes('Rochester')) {
            fetchWeatherData(RIT_COORDS.lat, RIT_COORDS.lon, RIT_COORDS.name);
        } else if (val.includes('New York')) {
            fetchWeatherData(40.7128, -74.0060, 'New York City, NY');
        } else if (val.includes('Seattle')) {
            fetchWeatherData(47.6062, -122.3321, 'Seattle, WA');
        } else if (val.includes('Miami')) {
            fetchWeatherData(25.7617, -80.1918, 'Miami, FL');
        } else if (val.includes('London')) {
            fetchWeatherData(51.5074, -0.1278, 'London, UK');
        } else if (val.includes('Tokyo')) {
            fetchWeatherData(35.6762, 139.6503, 'Tokyo, Japan');
        }
    });

    const toggleF = () => {
        isFahrenheit = !isFahrenheit;
        renderDashboard();
    };
    document.getElementById('unitToggle').onclick = toggleF;
    document.getElementById('unitToggleMob').onclick = toggleF;

    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter' && searchInput.value.trim() !== '') {
            const query = searchInput.value.trim();
            try {
                const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
                const res = await fetch(geoUrl);
                const data = await res.json();
                if (data.results && data.results.length > 0) {
                    const result = data.results[0];
                    fetchWeatherData(result.latitude, result.longitude, `${result.name}, ${result.admin1 || result.country}`);
                }
            } catch (err) {
                console.error("Geocoding failed:", err);
            }
        }
    });

    document.getElementById('geoBtn').onclick = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => fetchWeatherData(pos.coords.latitude, pos.coords.longitude, "Your Current Location"),
                () => fetchWeatherData(RIT_COORDS.lat, RIT_COORDS.lon, RIT_COORDS.name)
            );
        }
    };
}

function useFallbackData(locationLabel) {
    currentWeatherData = {
        locationName: locationLabel || RIT_COORDS.name,
        currentTempF: 54, realFeelF: 51, highF: 61, lowF: 42,
        humidity: 62, windSpeed: "9 mph NW", weatherCode: 2,
        weatherDesc: "Partly Cloudy", uvIndex: 3, precipChance: 15,
        sunrise: "7:22 AM", sunset: "6:12 PM",
        hourly: Array.from({ length: 24 }, (_, i) => ({
            time: i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`,
            hourNum: i, tempF: 45 + Math.round(Math.sin(i / 3) * 10),
            feelF: 43 + Math.round(Math.sin(i / 3) * 10), rainPct: 10, code: 2, wind: "8 mph", uv: 3
        })),
        weekly: [
            { day: "Today", highF: 61, lowF: 42, code: 2, precip: 15 },
            { day: "Sat", highF: 65, lowF: 45, code: 1, precip: 5 },
            { day: "Sun", highF: 52, lowF: 38, code: 61, precip: 70 }
        ]
    };
    applyDynamicTheme(2);
    renderDashboard();
}

window.onload = () => {
    setupEventListeners();
    fetchWeatherData(RIT_COORDS.lat, RIT_COORDS.lon, RIT_COORDS.name);
};
