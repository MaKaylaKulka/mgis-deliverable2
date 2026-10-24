// =========================================================================
// SECTION 1: COLOR PALETTES MATRIX (Seasons & Weather Types)
// =========================================================================

const COLOR_PALETTES = {
    seasons: {
        summer: {
            name: 'Summer',
            gradient: 'linear-gradient(135deg, #FFF3E0 0%, #FEF08A 40%, #FFEDD5 100%)',
            cardBg: 'rgba(255, 255, 255, 0.82)',
            border: '#FBBF24',
            accent: '#F59E0B'
        },
        fall: {
            name: 'Fall',
            gradient: 'linear-gradient(135deg, #E6F4F1 0%, #F5EBE0 40%, #FEF3C7 100%)',
            cardBg: 'rgba(255, 255, 255, 0.82)',
            border: '#D97706',
            accent: '#D97706'
        },
        winter: {
            name: 'Winter',
            gradient: 'linear-gradient(135deg, #EBF5FB 0%, #D4E6F1 40%, #F4F6F7 100%)',
            cardBg: 'rgba(255, 255, 255, 0.85)',
            border: '#92BAD2',
            accent: '#3494B7'
        },
        spring: {
            name: 'Spring',
            gradient: 'linear-gradient(135deg, #FDE2ED 0%, #FCEED9 40%, #D6E8BE 100%)',
            cardBg: 'rgba(255, 255, 255, 0.82)',
            border: '#F5B8D4',
            accent: '#EC4899'
        }
    },
    weather: {
        sunny: {
            gradient: 'linear-gradient(135deg, #FEF9C3 0%, #ABE8E5 50%, #FCF4E0 100%)',
            border: '#81D4F0',
            accent: '#EAB308'
        },
        raining: {
            gradient: 'linear-gradient(135deg, #E0F2FE 0%, #C5E2F7 50%, #92BAD2 100%)',
            border: '#53789E',
            accent: '#0284C7'
        },
        snowing: {
            gradient: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 50%, #ACCCD8 100%)',
            border: '#A5C4D6',
            accent: '#3494B7'
        },
        cloudy: {
            gradient: 'linear-gradient(135deg, #F3F4F6 0%, #D2D1D6 50%, #E5E7EB 100%)',
            border: '#948C92',
            accent: '#6B7280'
        }
    }
};

// App State
let isFahrenheit = true;
let currentWeatherData = null;
let selectedHourIndex = new Date().getHours(); // Default to current hour

// Feature 1: Brands & Catalog database
const BRAND_CATALOG = [
    { name: "Banana Republic", searchUrl: "https://bananarepublic.gap.com/browse/search.do?searchText=" },
    { name: "Ralph Lauren", searchUrl: "https://www.ralphlauren.com/search?q=" },
    { name: "Old Navy", searchUrl: "https://oldnavy.gap.com/browse/search.do?searchText=" },
    { name: "Gap", searchUrl: "https://www.gap.com/browse/search.do?searchText=" },
    { name: "American Eagle", searchUrl: "https://www.ae.com/us/en/s/" },
    { name: "Aerie", searchUrl: "https://www.ae.com/us/en/s/aerie%20" },
    { name: "L.L. Bean", searchUrl: "https://www.llbean.com/llb/search/?freeText=" },
    { name: "Levi's", searchUrl: "https://www.levis.com/US/en_US/search/" },
    { name: "Under Armour", searchUrl: "https://www.underarmour.com/en-us/c/search/?q=" }
];

let selectedBrands = ["Banana Republic", "Gap", "Levi's"]; // Default selected brands
let currentUploadedBase64 = null;

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
        console.warn("Live API fetch failed, using fallback data:", err);
        useFallbackData(locationLabel);
    }
}

function processApiData(data, locationLabel) {
    const current = data.current;
    const hourly = data.hourly;
    const daily = data.daily;

    const hourlyArr = [];
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
        uvIndex: Math.round(hourly.uv_index[new Date().getHours()] || 3),
        precipChance: hourly.precipitation_probability[new Date().getHours()] || 10,
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
    if (appBody && weatherStyle) {
        appBody.style.background = weatherStyle.gradient || seasonStyle.gradient;
    }

    const activeBorder = weatherStyle ? weatherStyle.border : seasonStyle.border;
    const activeAccent = weatherStyle ? weatherStyle.accent : seasonStyle.accent;

    document.documentElement.style.setProperty('--card-bg', seasonStyle ? seasonStyle.cardBg : 'rgba(255, 255, 255, 0.8)');
    document.documentElement.style.setProperty('--card-border', activeBorder);
    document.documentElement.style.setProperty('--accent-glow', activeAccent);

    const seasonTag = document.getElementById('seasonTag');
    if (seasonTag && seasonStyle) {
        seasonTag.textContent = `${seasonStyle.name} • ${weatherKey.toUpperCase()}`;
        seasonTag.style.borderColor = activeBorder;
        seasonTag.style.color = activeAccent;
    }

    const realFeelBadge = document.getElementById('realFeelBadge');
    if (realFeelBadge) {
        realFeelBadge.style.borderColor = activeBorder;
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
    renderShoppingRecommendations();
}

// =========================================================================
// SHOPPING & BRAND RECOMMENDATIONS FEATURE
// =========================================================================

function renderBrandSelector() {
    const grid = document.getElementById('brandOptionsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    BRAND_CATALOG.forEach(brand => {
        const isChecked = selectedBrands.includes(brand.name);
        const label = document.createElement('label');
        label.className = `flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-semibold transition-colors ${
            isChecked ? 'bg-amber-50 border-amber-400 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-700'
        }`;
        label.innerHTML = `
            <input type="checkbox" value="${brand.name}" ${isChecked ? 'checked' : ''} class="brand-checkbox rounded text-amber-500 focus:ring-amber-400">
            <span>${brand.name}</span>
        `;
        grid.appendChild(label);
    });
}

function renderShoppingRecommendations() {
    if (!currentWeatherData) return;
    const tempF = currentWeatherData.currentTempF;
    const weatherCat = getWeatherCategory(currentWeatherData.weatherCode);

    // Update selected brand badges
    const brandTagsBar = document.getElementById('brandTagsBar');
    if (brandTagsBar) {
        brandTagsBar.innerHTML = selectedBrands.map(b => 
            `<span class="text-[10px] font-bold bg-white/80 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-lg">${b}</span>`
        ).join('');
    }

    // Determine target search categories based on weather
    let queryItems = [];
    if (tempF < 35) {
        queryItems = ["heavy winter jacket coat", "thermal sweater fleece", "insulated winter boots"];
    } else if (tempF < 55) {
        queryItems = ["fleece jacket sweater", "long sleeve shirt denim", "boots sneakers"];
    } else if (tempF < 72) {
        queryItems = ["cotton t-shirt", "light cardigan jacket", "casual sneakers"];
    } else {
        queryItems = ["breathable t-shirt polo", "shorts linen pants", "sun sunglasses hat"];
    }

    if (weatherCat === 'raining') {
        queryItems.unshift("waterproof rain jacket raincoat");
    }

    const grid = document.getElementById('shoppingGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (selectedBrands.length === 0) {
        grid.innerHTML = `<p class="col-span-2 text-xs text-slate-500 italic p-2 text-center">Select at least one brand above to view tailored products.</p>`;
        return;
    }

    // Generate product cards matching selected brands
    queryItems.slice(0, 4).forEach((query, i) => {
        const chosenBrandName = selectedBrands[i % selectedBrands.length];
        const brandObj = BRAND_CATALOG.find(b => b.name === chosenBrandName) || BRAND_CATALOG[0];
        const searchLink = `${brandObj.searchUrl}${encodeURIComponent(query)}`;
        const cleanTitle = query.split(' ')[0].toUpperCase() + ' ' + query.split(' ').slice(1, 3).join(' ');

        const card = document.createElement('a');
        card.href = searchLink;
        card.target = "_blank";
        card.rel = "noopener noreferrer";
        card.className = "bg-white/80 hover:bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-sm flex flex-col justify-between transition-all hover:-translate-y-0.5 hover:shadow-md group";

        card.innerHTML = `
            <div>
                <span class="text-[9px] font-bold tracking-wider text-amber-600 uppercase block mb-0.5">${brandObj.name}</span>
                <h5 class="font-bold text-xs text-slate-800 group-hover:text-amber-600 line-clamp-1">${cleanTitle}</h5>
                <p class="text-[10px] text-slate-500 capitalize mt-0.5">${query}</p>
            </div>
            <div class="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px] font-semibold text-slate-700">
                <span>Shop Match</span>
                <i class="fa-solid fa-arrow-up-right-from-square text-amber-500 group-hover:translate-x-0.5 transition-transform"></i>
            </div>
        `;
        grid.appendChild(card);
    });
}

// =========================================================================
// AI STYLING CHATBOT FEATURE (Gemini API Integration)
// =========================================================================

async function handleSendChatMessage() {
    const inputEl = document.getElementById('chatInput');
    const userText = inputEl.value.trim();
    if (!userText && !currentUploadedBase64) return;

    const messagesContainer = document.getElementById('chatMessages');

    // Display user message
    const userMsgDiv = document.createElement('div');
    userMsgDiv.className = "bg-amber-500 text-white p-2.5 rounded-lg text-xs ml-auto max-w-[85%] font-medium shadow-sm";
    
    let contentHtml = userText ? `<div>${userText}</div>` : '';
    if (currentUploadedBase64) {
        contentHtml += `<img src="data:image/jpeg;base64,${currentUploadedBase64}" class="h-16 rounded mt-1 border border-white/40 object-cover">`;
    }
    userMsgDiv.innerHTML = contentHtml;
    messagesContainer.appendChild(userMsgDiv);

    // Reset input states
    inputEl.value = '';
    const imageDataToSend = currentUploadedBase64;
    currentUploadedBase64 = null;
    document.getElementById('imagePreviewContainer').classList.add('hidden');

    // Display bot loading indicator
    const botLoadingDiv = document.createElement('div');
    botLoadingDiv.className = "bg-white/90 border border-slate-200 p-2.5 rounded-lg text-xs text-slate-600 max-w-[85%] italic shadow-sm";
    botLoadingDiv.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin text-amber-500"></i> Evaluating forecast and clothing choice...`;
    messagesContainer.appendChild(botLoadingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Call Gemini API
    try {
        const responseText = await callGeminiStylistApi(userText, imageDataToSend);
        botLoadingDiv.className = "bg-white/90 border border-slate-200 p-2.5 rounded-lg text-xs text-slate-800 max-w-[90%] shadow-sm leading-relaxed";
        botLoadingDiv.innerHTML = responseText;
    } catch (err) {
        console.error("Gemini API Error:", err);
        botLoadingDiv.className = "bg-rose-50 border border-rose-200 p-2.5 rounded-lg text-xs text-rose-700 max-w-[85%]";
        botLoadingDiv.textContent = "Sorry, I couldn't evaluate your clothing choice right now. Please try again!";
    }
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function callGeminiStylistApi(userPrompt, base64Image) {
    const weather = currentWeatherData;
    const systemPrompt = `You are an expert personal weather stylist. The current weather location is ${weather?.locationName || 'Rochester, NY'}, temperature is ${weather?.currentTempF || 55}°F, weather condition is ${weather?.weatherDesc || 'Partly Cloudy'}, high is ${weather?.highF || 60}°F, low is ${weather?.lowF || 40}°F, wind is ${weather?.windSpeed || '9 mph'}, rain chance is ${weather?.precipChance || 10}%. Evaluate if the user's input/clothing item image is appropriate for this exact weather. Keep your answer brief, helpful, friendly, and practical (2-3 concise sentences).`;

    const parts = [];
    if (userPrompt) parts.push({ text: userPrompt });
    if (base64Image) {
        parts.push({
            inlineData: {
                mimeType: "image/jpeg",
                data: base64Image
            }
        });
    }

    const payload = {
        contents: [{ role: "user", parts: parts.length > 0 ? parts : [{ text: "Is my clothing choice appropriate for today's weather?" }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] }
    };

    const apiKey = ""; // Canvas runtime injection
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("Gemini fetch failed");
    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || "Looks good for today's weather!";
}

// Handle Image Upload Preview
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        const result = evt.target.result;
        currentUploadedBase64 = result.split(',')[1];
        
        const previewImg = document.getElementById('imagePreview');
        previewImg.src = result;
        document.getElementById('imagePreviewContainer').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
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
        narrative = `Freezing weather conditions (${tempF}°F). Heavy insulation and warm outerwear are critical today.`;
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
        narrative = `Mild and pleasant conditions (${tempF}°F). Light layers are recommended; a simple cardigan is plenty.`;
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
    // Brand Modal listeners
    document.getElementById('toggleBrandModal').onclick = () => {
        renderBrandSelector();
        document.getElementById('brandModal').classList.remove('hidden');
    };

    document.getElementById('closeBrandModal').onclick = () => {
        document.getElementById('brandModal').classList.add('hidden');
    };

    document.getElementById('saveBrandsBtn').onclick = () => {
        const checkboxes = document.querySelectorAll('.brand-checkbox:checked');
        selectedBrands = Array.from(checkboxes).map(cb => cb.value);
        renderShoppingRecommendations();
        document.getElementById('brandModal').classList.add('hidden');
    };

    // Chatbot listeners
    document.getElementById('sendChatBtn').onclick = handleSendChatMessage;
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendChatMessage();
    });

    document.getElementById('imageUploadInput').addEventListener('change', handleImageUpload);
    document.getElementById('removeImageBtn').onclick = () => {
        currentUploadedBase64 = null;
        document.getElementById('imagePreviewContainer').classList.add('hidden');
        document.getElementById('imageUploadInput').value = '';
    };

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