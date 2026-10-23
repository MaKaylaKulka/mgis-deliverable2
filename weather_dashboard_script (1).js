// =========================================================================
// SECTION 1: BLENDED LIGHT COLOR SCHEMES MATRIX (Seasons & Weather Types)
// =========================================================================

const COLOR_PALETTES = {
    seasons: {
        summer: {
            name: 'Summer',
            gradient: 'linear-gradient(135deg, #FFEDD5 0%, #FEF08A 40%, #FFCC80 100%)',
            cardBg: 'rgba(255, 255, 255, 0.78)',
            border: '#FBBF24',
            accentGlow: '#F59E0B'
        },
        fall: {
            name: 'Fall',
            gradient: 'linear-gradient(135deg, #E0F2FE 0%, #D1FAE5 35%, #FEF3C7 70%, #FFEDD5 100%)',
            cardBg: 'rgba(255, 255, 255, 0.78)',
            border: '#D97706',
            accentGlow: '#D97706'
        },
        winter: {
            name: 'Winter',
            gradient: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 35%, #E2E8F0 75%, #F8FAFC 100%)',
            cardBg: 'rgba(255, 255, 255, 0.82)',
            border: '#38BDF8',
            accentGlow: '#0284C7'
        },
        spring: {
            name: 'Spring',
            gradient: 'linear-gradient(135deg, #FCE7F3 0%, #FEE2E2 30%, #FEF9C3 65%, #DCFCE7 100%)',
            cardBg: 'rgba(255, 255, 255, 0.80)',
            border: '#F472B6',
            accentGlow: '#EC4899'
        }
    },
    weather: {
        sunny: {
            accent: '#84CC16',
            highlight: '#38BDF8',
            border: '#38BDF8',
            sky: 'linear-gradient(180deg, #E0F2FE 0%, #BAE6FD 50%, #FEF3C7 100%)'
        },
        raining: {
            accent: '#38BDF8',
            highlight: '#0284C7',
            border: '#7DD3FC',
            sky: 'linear-gradient(180deg, #E2E8F0 0%, #CBD5E1 50%, #BAE6FD 100%)'
        },
        snowing: {
            accent: '#94A3B8',
            highlight: '#38BDF8',
            border: '#CBD5E1',
            sky: 'linear-gradient(180deg, #F1F5F9 0%, #E2E8F0 50%, #F8FAFC 100%)'
        },
        cloudy: {
            accent: '#64748B',
            highlight: '#94A3B8',
            border: '#CBD5E1',
            sky: 'linear-gradient(180deg, #E2E8F0 0%, #CBD5E1 50%, #F1F5F9 100%)'
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
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();

        currentWeatherData = processApiData(data, locationLabel);
        applyDynamicTheme(currentWeatherData.weatherCode);
        renderDashboard();
    } catch (err) {
        console.warn("Live API fetch failed, falling back to simulated data:", err);
        useFallbackData(locationLabel);
    }
}

function processApiData(data, locationLabel) {
    const current = data.current;
    const hourly = data.hourly;
    const daily = data.daily;

    // Build Full 24 Hourly Items (00:00 to 23:00 / 12 AM to 11 PM)
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

    const appBody = document.getElementById('appBody');
    if (appBody && seasonStyle) {
        appBody.style.background = seasonStyle.gradient;
    }

    document.documentElement.style.setProperty('--card-bg', seasonStyle ? seasonStyle.cardBg : 'rgba(255, 255, 255, 0.78)');
    document.documentElement.style.setProperty('--accent-border', seasonStyle ? seasonStyle.border : '#38BDF8');
    document.documentElement.style.setProperty('--accent-glow', seasonStyle ? seasonStyle.accentGlow : '#0284C7');

    const seasonTag = document.getElementById('seasonTag');
    if (seasonTag && seasonStyle) {
        seasonTag.textContent = `${seasonStyle.name} • ${weatherKey.toUpperCase()}`;
        seasonTag.style.borderColor = seasonStyle.border;
        seasonTag.style.color = seasonStyle.accentGlow;
    }

    const realFeelBadge = document.getElementById('realFeelBadge');
    if (realFeelBadge && seasonStyle) {
        realFeelBadge.style.borderColor = seasonStyle.border;
    }
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
            isActive ? 'active' : 'text-slate-700'
        }`;

        btn.onclick = () => {
            selectedHourIndex = idx;
            renderHourlyBar();
            renderHourInspector(idx);
        };

        btn.innerHTML = `
            <span class="text-[10px] font-semibold text-slate-500">${item.time}</span>
            <i class="fa-solid ${getWeatherIcon(item.code)} text-amber-500 text-sm my-0.5"></i>
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
        row.className = "flex items-center justify-between p-2.5 rounded-xl bg-white/60 border border-slate-200/50 text-xs shadow-sm hover:bg-white transition-colors";

        row.innerHTML = `
            <span class="w-16 font-bold text-slate-800">${item.day}</span>
            <div class="flex items-center gap-2 w-32">
                <i class="fa-solid ${getWeatherIcon(item.code)} text-amber-500 text-sm"></i>
                <span class="text-[11px] text-slate-600 truncate">${getWmoDescription(item.code)}</span>
            </div>
            <div class="flex items-center gap-1.5 font-bold">
                <span class="text-slate-900">${formatTemp(item.highF)}</span>
                <span class="text-slate-300">/</span>
                <span class="text-slate-500">${formatTemp(item.lowF)}</span>
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
        pill.className = 'p-2 rounded-xl bg-white/70 border border-slate-200/50 shadow-sm flex items-center gap-2 text-xs font-semibold text-slate-800';
        pill.innerHTML = `<i class="fa-solid ${item.icon} text-amber-500"></i> <span>${item.label}</span>`;
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