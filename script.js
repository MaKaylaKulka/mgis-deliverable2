/* script.js */

/* ==========================================================================
   SECTION 1: DATA MODEL & REPUTABLE SOURCES MOCK DATA
   ========================================================================== */

const WEATHER_DATA = {
    units: "F",
    currentLocationKey: "ROC", // Default to Rochester, NY
    
    locations: {
        "ROC": {
            name: "Rochester, NY",
            region: "Eastern Standard Time",
            source: "National Weather Service / NOAA",
            current: {
                tempF: 45,
                realFeelF: 38,
                highF: 52,
                lowF: 34,
                conditionTitle: "Breezy Autumn",
                conditionSub: "Crisp lake air from Lake Ontario",
                theme: "breezy",
                windSpeedMph: 16,
                windDirection: "WNW",
                humidityPct: 62,
                precipChancePct: 15,
                uvIndex: "3 (Mod)",
                artEmoji: "🍃"
            },
            hourly: [
                { time: "8:00 AM", tempF: 36, realFeelF: 30, windMph: 12, precipPct: 10, humidityPct: 75, dewF: 30, condition: "Chilly Morning", icon: "🧥" },
                { time: "10:00 AM", tempF: 40, realFeelF: 34, windMph: 14, precipPct: 15, humidityPct: 68, dewF: 31, condition: "Brisk Winds", icon: "💨" },
                { time: "12:00 PM", tempF: 46, realFeelF: 40, windMph: 16, precipPct: 15, humidityPct: 60, dewF: 33, condition: "Partly Cloudy", icon: "⛅" },
                { time: "2:00 PM", tempF: 51, realFeelF: 46, windMph: 17, precipPct: 15, humidityPct: 58, dewF: 35, condition: "Afternoon High", icon: "🌤️" },
                { time: "4:00 PM", tempF: 48, realFeelF: 42, windMph: 15, precipPct: 20, humidityPct: 64, dewF: 36, condition: "Cooling Down", icon: "⛅" },
                { time: "6:00 PM", tempF: 42, realFeelF: 36, windMph: 11, precipPct: 20, humidityPct: 70, dewF: 34, condition: "Sunset Chill", icon: "🌆" }
            ],
            weekly: [
                { day: "Today", condition: "Breezy Fall", icon: "🍃", highF: 52, lowF: 34 },
                { day: "Sat", condition: "Lake Showers", icon: "🌧️", highF: 46, lowF: 32 },
                { day: "Sun", condition: "Cold & Clear", icon: "🌤️", highF: 44, lowF: 28 },
                { day: "Mon", condition: "Partly Sunny", icon: "⛅", highF: 49, lowF: 35 },
                { day: "Tue", condition: "Milder Sun", icon: "☀️", highF: 56, lowF: 40 },
                { day: "Wed", condition: "Passing Rain", icon: "🌦️", highF: 52, lowF: 37 },
                { day: "Thu", condition: "Brisk Clear", icon: "🌤️", highF: 47, lowF: 30 }
            ]
        },

        "NYC": {
            name: "New York, NY",
            region: "Eastern Standard Time",
            source: "National Weather Service / AccuWeather",
            current: {
                tempF: 64,
                realFeelF: 62,
                highF: 68,
                lowF: 48,
                conditionTitle: "Mild & Sunny",
                conditionSub: "Clear skies across the city",
                theme: "sunny",
                windSpeedMph: 10,
                windDirection: "NW",
                humidityPct: 45,
                precipChancePct: 5,
                uvIndex: "4 (Mod)",
                artEmoji: "☀️"
            },
            hourly: [
                { time: "9:00 AM", tempF: 53, realFeelF: 51, windMph: 8, precipPct: 5, humidityPct: 55, dewF: 40, condition: "Sunny Morning", icon: "☀️" },
                { time: "12:00 PM", tempF: 63, realFeelF: 61, windMph: 10, precipPct: 5, humidityPct: 45, dewF: 41, condition: "Bright Sun", icon: "☀️" },
                { time: "3:00 PM", tempF: 68, realFeelF: 66, windMph: 11, precipPct: 5, humidityPct: 41, dewF: 42, condition: "Peak Warmth", icon: "☀️" },
                { time: "6:00 PM", tempF: 59, realFeelF: 56, windMph: 9, precipPct: 5, humidityPct: 50, dewF: 40, condition: "Clear Evening", icon: "🌆" }
            ],
            weekly: [
                { day: "Today", condition: "Sunny & Mild", icon: "☀️", highF: 68, lowF: 48 },
                { day: "Sat", condition: "Bright Sun", icon: "☀️", highF: 72, lowF: 52 },
                { day: "Sun", condition: "Rain Showers", icon: "🌧️", highF: 58, lowF: 44 },
                { day: "Mon", condition: "Crisp Air", icon: "🌤️", highF: 55, lowF: 40 },
                { day: "Tue", condition: "Overcast", icon: "☁️", highF: 59, lowF: 45 },
                { day: "Wed", condition: "Warm Sun", icon: "☀️", highF: 66, lowF: 50 },
                { day: "Thu", condition: "Light Rain", icon: "🌦️", highF: 60, lowF: 46 }
            ]
        },

        "ANCHORAGE": {
            name: "Anchorage, AK",
            region: "Alaska Standard Time",
            source: "National Weather Service Alaska",
            current: {
                tempF: 12,
                realFeelF: 2,
                highF: 18,
                lowF: 4,
                conditionTitle: "Freezing Snow",
                conditionSub: "Sub-zero wind chills & fresh snowfall",
                theme: "freezing",
                windSpeedMph: 14,
                windDirection: "NNE",
                humidityPct: 82,
                precipChancePct: 85,
                uvIndex: "1 (Low)",
                artEmoji: "❄️"
            },
            hourly: [
                { time: "8:00 AM", tempF: 6, realFeelF: -4, windMph: 12, precipPct: 90, humidityPct: 85, dewF: 2, condition: "Heavy Snow", icon: "🌨️" },
                { time: "12:00 PM", tempF: 12, realFeelF: 2, windMph: 14, precipPct: 85, humidityPct: 82, dewF: 8, condition: "Snow Flurries", icon: "❄️" },
                { time: "4:00 PM", tempF: 14, realFeelF: 5, windMph: 11, precipPct: 60, humidityPct: 80, dewF: 9, condition: "Sub-Zero Chill", icon: "❄️" },
                { time: "8:00 PM", tempF: 8, realFeelF: -2, windMph: 10, precipPct: 40, humidityPct: 84, dewF: 4, condition: "Freezing Night", icon: "🌙" }
            ],
            weekly: [
                { day: "Today", condition: "Heavy Snow", icon: "🌨️", highF: 18, lowF: 4 },
                { day: "Sat", condition: "Sub-Zero Cold", icon: "❄️", highF: 10, lowF: -2 },
                { day: "Sun", condition: "Clear Ice", icon: "🥶", highF: 14, lowF: -5 },
                { day: "Mon", condition: "Light Snow", icon: "🌨️", highF: 20, lowF: 8 },
                { day: "Tue", condition: "Blustery", icon: "❄️", highF: 16, lowF: 2 },
                { day: "Wed", condition: "Deep Freeze", icon: "🥶", highF: 8, lowF: -8 },
                { day: "Thu", condition: "Snow Squalls", icon: "🌨️", highF: 15, lowF: 5 }
            ]
        },

        "MIA": {
            name: "Miami, FL",
            region: "Eastern Standard Time",
            source: "The Weather Channel",
            current: {
                tempF: 84,
                realFeelF: 92,
                highF: 87,
                lowF: 76,
                conditionTitle: "Hot & Humid",
                conditionSub: "Tropical sunshine",
                theme: "sunny",
                windSpeedMph: 9,
                windDirection: "E",
                humidityPct: 75,
                precipChancePct: 10,
                uvIndex: "9 (Very High)",
                artEmoji: "☀️"
            },
            hourly: [
                { time: "9:00 AM", tempF: 79, realFeelF: 84, windMph: 7, precipPct: 5, humidityPct: 82, dewF: 72, condition: "Warm Sun", icon: "☀️" },
                { time: "12:00 PM", tempF: 84, realFeelF: 91, windMph: 9, precipPct: 10, humidityPct: 75, dewF: 73, condition: "Hot Sun", icon: "☀️" },
                { time: "3:00 PM", tempF: 87, realFeelF: 94, windMph: 10, precipPct: 20, humidityPct: 72, dewF: 74, condition: "Humid Heat", icon: "☀️" },
                { time: "6:00 PM", tempF: 82, realFeelF: 88, windMph: 8, precipPct: 15, humidityPct: 78, dewF: 73, condition: "Balmy Dusk", icon: "🌅" }
            ],
            weekly: [
                { day: "Today", condition: "Hot & Sunny", icon: "☀️", highF: 87, lowF: 76 },
                { day: "Sat", condition: "Tropical Sun", icon: "☀️", highF: 88, lowF: 77 },
                { day: "Sun", condition: "Afternoon Storms", icon: "⛈️", highF: 84, lowF: 75 },
                { day: "Mon", condition: "Humid Warm", icon: "🌤️", highF: 85, lowF: 76 },
                { day: "Tue", condition: "Partly Cloudy", icon: "⛅", highF: 86, lowF: 76 },
                { day: "Wed", condition: "Coastal Sun", icon: "☀️", highF: 88, lowF: 78 },
                { day: "Thu", condition: "Scattered Rain", icon: "🌦️", highF: 83, lowF: 74 }
            ]
        },

        "LDN": {
            name: "London, UK",
            region: "Greenwich Mean Time",
            source: "Meteostat / Met Office",
            current: {
                tempF: 54,
                realFeelF: 50,
                highF: 57,
                lowF: 44,
                conditionTitle: "Steady Drizzle",
                conditionSub: "Classic damp overcast afternoon",
                theme: "rainy",
                windSpeedMph: 14,
                windDirection: "SW",
                humidityPct: 88,
                precipChancePct: 80,
                uvIndex: "1 (Low)",
                artEmoji: "🌧️"
            },
            hourly: [
                { time: "9:00 AM", tempF: 48, realFeelF: 43, windMph: 11, precipPct: 70, humidityPct: 90, dewF: 45, condition: "Light Rain", icon: "🌧️" },
                { time: "12:00 PM", tempF: 52, realFeelF: 48, windMph: 13, precipPct: 85, humidityPct: 88, dewF: 47, condition: "Drizzle", icon: "🌧️" },
                { time: "3:00 PM", tempF: 57, realFeelF: 52, windMph: 15, precipPct: 60, humidityPct: 82, dewF: 48, condition: "Damp & Breeze", icon: "🌦️" },
                { time: "6:00 PM", tempF: 51, realFeelF: 46, windMph: 12, precipPct: 40, humidityPct: 86, dewF: 46, condition: "Mist", icon: "🌫️" }
            ],
            weekly: [
                { day: "Today", condition: "Drizzle & Damp", icon: "🌧️", highF: 57, lowF: 44 },
                { day: "Sat", condition: "Showers", icon: "🌦️", highF: 55, lowF: 42 },
                { day: "Sun", condition: "Cloudy Intervals", icon: "☁️", highF: 58, lowF: 45 },
                { day: "Mon", condition: "Windy Rain", icon: "🌧️", highF: 53, lowF: 40 },
                { day: "Tue", condition: "Overcast", icon: "☁️", highF: 56, lowF: 43 },
                { day: "Wed", condition: "Sun Spells", icon: "🌤️", highF: 60, lowF: 46 },
                { day: "Thu", condition: "Chilly Drizzle", icon: "🌧️", highF: 52, lowF: 41 }
            ]
        }
    }
};


/* ==========================================================================
   SECTION 2: RULES ENGINE & CLOTHING RECOMMENDATION LOGIC
   ========================================================================== */

const RulesEngine = {
    fToC: (f) => Math.round((f - 32) * (5 / 9)),

    formatTemp: (tempF, unit) => {
        if (unit === 'C') return `${RulesEngine.fToC(tempF)}°C`;
        return `${tempF}°F`;
    },

    generateClothingRecommendation: function(locationData, unit) {
        const cur = locationData.current;
        const temp = cur.tempF;
        const high = cur.highF;
        const low = cur.lowF;
        const wind = cur.windSpeedMph;
        const precip = cur.precipChancePct;

        let narrative = "";
        let tags = [];

        if (temp < 25) {
            narrative = `It is freezing cold outside at ${RulesEngine.formatTemp(temp, unit)}, dropping to a low of ${RulesEngine.formatTemp(low, unit)}. You must wear a heavy Winter Coat over a thick Sweater, along with Earmuffs, Gloves, and a Warm Scarf to protect against the sub-zero chill.`;
            tags.push({ label: "Winter Coat", icon: "🧥" }, { label: "Sweater", icon: "🧶" }, { label: "Earmuffs", icon: "🎧" }, { label: "Gloves", icon: "🧤" }, { label: "Scarf", icon: "🧣" }, { label: "Jeans", icon: "👖" });
        } else if (temp < 40) {
            narrative = `It's a chilly crisp day with a feel temp of ${RulesEngine.formatTemp(cur.realFeelF, unit)}. Bundle up in a heavy Coat or Sweater, paired with Jeans and a Scarf.`;
            tags.push({ label: "Coat", icon: "🧥" }, { label: "Sweater", icon: "🧶" }, { label: "Scarf", icon: "🧣" }, { label: "Jeans", icon: "👖" });
        } else if (temp < 58) {
            narrative = `Today will be a cool fall day with a high of ${RulesEngine.formatTemp(high, unit)} and brisk winds. You should layer with a Light Jacket over either a T-shirt or light sweater. I suggest jeans or leggings.`;
            tags.push({ label: "Light Jacket", icon: "🧥" }, { label: "Sweater", icon: "🧶" }, { label: "T-Shirt", icon: "👕" }, { label: "Jeans", icon: "👖" }, { label: "Leggings", icon: "👖" });
        } else if (temp < 75) {
            narrative = `It's a pleasant and mild day with a high of ${RulesEngine.formatTemp(high, unit)}. You'll be comfortable in a T-Shirt and Jeans or casual pants.`;
            tags.push({ label: "T-Shirt", icon: "👕" }, { label: "Jeans", icon: "👖" }, { label: "Sneakers", icon: "👟" });
        } else {
            narrative = `It's a hot and sunny day reaching ${RulesEngine.formatTemp(high, unit)}. Wear light, breathable clothing like a T-Shirt, Shorts or a Skirt, and sunglasses!`;
            tags.push({ label: "T-Shirt", icon: "👕" }, { label: "Shorts", icon: "🩳" }, { label: "Skirt", icon: "👗" }, { label: "Sunglasses", icon: "🕶️" });
        }

        if (precip >= 50) {
            narrative += ` Heavy precipitation is expected, so make sure to carry an Umbrella and wear a Raincoat.`;
            tags.push({ label: "Umbrella", icon: "☂️" }, { label: "Raincoat", icon: "🧥" });
        } else if (precip >= 20) {
            narrative += ` There is a small chance of showers, so having an umbrella handy is wise.`;
            tags.push({ label: "Umbrella", icon: "☂️" });
        } else {
            narrative += ` No rain today so there shouldn't be a need for a raincoat or umbrella.`;
        }

        return { narrative, tags };
    }
};


/* ==========================================================================
   SECTION 3: DISPLAY & DOM UI CONTROLLER
   ========================================================================== */

const DisplayController = {
    selectedHourIndex: 0,

    init: function() {
        this.bindEvents();
        this.detectUserLocation();
    },

    detectUserLocation: function() {
        // Automatically attempt Geolocation, fallback to Rochester, NY
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Coordinates acquired - default or simulated closest city mapping (Rochester default context)
                    WEATHER_DATA.currentLocationKey = "ROC";
                    this.renderAll();
                },
                (error) => {
                    // Fallback to Rochester, NY
                    WEATHER_DATA.currentLocationKey = "ROC";
                    this.renderAll();
                },
                { timeout: 5000 }
            );
        } else {
            WEATHER_DATA.currentLocationKey = "ROC";
            this.renderAll();
        }
    },

    bindEvents: function() {
        document.getElementById('location-select').addEventListener('change', (e) => {
            const val = e.target.value;
            if (val !== 'GPS') {
                WEATHER_DATA.currentLocationKey = val;
                this.selectedHourIndex = 0;
                this.renderAll();
            }
        });

        const unitBtns = document.querySelectorAll('.unit-btn');
        unitBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                unitBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                WEATHER_DATA.units = e.target.getAttribute('data-unit');
                this.renderAll();
            });
        });
    },

    renderAll: function() {
        const location = WEATHER_DATA.locations[WEATHER_DATA.currentLocationKey] || WEATHER_DATA.locations["ROC"];
        const unit = WEATHER_DATA.units;

        document.getElementById('location-select').value = WEATHER_DATA.currentLocationKey;

        this.applyTheme(location.current.theme);
        this.renderPrimaryCard(location, unit);
        this.renderOutfitRecommendation(location, unit);
        this.renderHourlySection(location, unit);
        this.renderWeeklySection(location, unit);
    },

    applyTheme: function(themeName) {
        const appContainer = document.getElementById('app-container');
        appContainer.className = `app-container theme-${themeName}`;

        const skyBg = document.getElementById('sky-elements');
        skyBg.innerHTML = '';
        if (themeName === 'sunny' || themeName === 'breezy') {
            const sun = document.createElement('div');
            sun.className = 'cartoon-sun';
            skyBg.appendChild(sun);
        }
    },

    renderPrimaryCard: function(loc, unit) {
        document.getElementById('current-location-name').textContent = loc.name;
        
        const now = new Date();
        const options = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
        document.getElementById('current-date-time').textContent = now.toLocaleDateString('en-US', options);

        const cur = loc.current;
        document.getElementById('hero-temp').textContent = unit === 'C' ? RulesEngine.fToC(cur.tempF) : cur.tempF;
        document.getElementById('hero-realfeel').textContent = RulesEngine.formatTemp(cur.realFeelF, unit);
        document.getElementById('hero-high').textContent = RulesEngine.formatTemp(cur.highF, unit);
        document.getElementById('hero-low').textContent = RulesEngine.formatTemp(cur.lowF, unit);

        document.getElementById('hero-condition-title').textContent = cur.conditionTitle;
        document.getElementById('hero-condition-sub').textContent = cur.conditionSub;
        document.getElementById('hero-condition-art').textContent = cur.artEmoji;

        document.getElementById('metric-wind').textContent = `${cur.windSpeedMph} mph ${cur.windDirection}`;
        document.getElementById('metric-humidity').textContent = `${cur.humidityPct}%`;
        document.getElementById('metric-precip').textContent = `${cur.precipChancePct}%`;
        document.getElementById('metric-uv').textContent = cur.uvIndex;
    },

    renderOutfitRecommendation: function(loc, unit) {
        const rec = RulesEngine.generateClothingRecommendation(loc, unit);
        document.getElementById('outfit-narrative-text').textContent = rec.narrative;

        const grid = document.getElementById('clothing-tags-grid');
        grid.innerHTML = '';

        rec.tags.forEach(item => {
            const tag = document.createElement('div');
            tag.className = 'clothing-tag';
            tag.innerHTML = `<span class="tag-icon">${item.icon}</span><span>${item.label}</span>`;
            grid.appendChild(tag);
        });
    },

    renderHourlySection: function(loc, unit) {
        const timeline = document.getElementById('hourly-timeline');
        timeline.innerHTML = '';

        // Render sparkline graph SVG
        const sparkline = document.getElementById('hourly-sparkline');
        const temps = loc.hourly.map(h => h.tempF);
        const minT = Math.min(...temps);
        const maxT = Math.max(...temps);
        const rangeT = maxT - minT || 1;

        let svgHtml = `<svg width="100%" height="100%" viewBox="0 0 400 60" preserveAspectRatio="none" style="overflow:visible;">`;
        let points = [];
        loc.hourly.forEach((hour, i) => {
            const x = (i / (loc.hourly.length - 1)) * 380 + 10;
            const y = 50 - ((hour.tempF - minT) / rangeT) * 40;
            points.push(`${x},${y}`);
        });
        svgHtml += `<polyline fill="none" stroke="var(--accent-color)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${points.join(' ')}" />`;
        
        loc.hourly.forEach((hour, i) => {
            const x = (i / (loc.hourly.length - 1)) * 380 + 10;
            const y = 50 - ((hour.tempF - minT) / rangeT) * 40;
            svgHtml += `<circle cx="${x}" cy="${y}" r="${i === this.selectedHourIndex ? 6 : 4}" fill="${i === this.selectedHourIndex ? '#ffffff' : 'var(--accent-color)'}" stroke="var(--accent-color)" stroke-width="2"/>`;
        });
        svgHtml += `</svg>`;
        sparkline.innerHTML = svgHtml;

        // Render hour pills
        loc.hourly.forEach((hour, index) => {
            const pill = document.createElement('div');
            pill.className = `hour-pill ${index === this.selectedHourIndex ? 'active' : ''}`;
            
            const tempDisplay = unit === 'C' ? RulesEngine.fToC(hour.tempF) : hour.tempF;

            pill.innerHTML = `
                <span class="pill-time">${hour.time}</span>
                <span class="pill-icon">${hour.icon}</span>
                <span class="pill-temp">${tempDisplay}°</span>
                <span class="pill-pop">${hour.precipPct}% rain</span>
            `;

            pill.addEventListener('click', () => {
                this.selectedHourIndex = index;
                this.renderHourlySection(loc, unit);
            });

            timeline.appendChild(pill);
        });

        // Update inspector details
        const hourData = loc.hourly[this.selectedHourIndex] || loc.hourly[0];
        document.getElementById('inspector-time').textContent = `Hour Details: ${hourData.time}`;
        document.getElementById('inspector-condition').textContent = hourData.condition;

        document.getElementById('inspect-temp').textContent = RulesEngine.formatTemp(hourData.tempF, unit);
        document.getElementById('inspect-realfeel').textContent = RulesEngine.formatTemp(hourData.realFeelF, unit);
        document.getElementById('inspect-wind').textContent = `${hourData.windMph} mph`;
        document.getElementById('inspect-pop').textContent = `${hourData.precipPct}%`;
        document.getElementById('inspect-humidity').textContent = `${hourData.humidityPct}%`;
        document.getElementById('inspect-dew').textContent = RulesEngine.formatTemp(hourData.dewF, unit);
    },

    renderWeeklySection: function(loc, unit) {
        const weeklyList = document.getElementById('weekly-list');
        weeklyList.innerHTML = '';

        loc.weekly.forEach(day => {
            const row = document.createElement('div');
            row.className = 'weekly-row';

            const highStr = RulesEngine.formatTemp(day.highF, unit);
            const lowStr = RulesEngine.formatTemp(day.lowF, unit);

            row.innerHTML = `
                <div class="weekly-day-group">
                    <span class="weekly-icon">${day.icon}</span>
                    <span class="weekly-day-name">${day.day}</span>
                </div>
                <div class="weekly-condition-text">${day.condition}</div>
                <div class="weekly-temp-bar-container">
                    <span class="temp-low">${lowStr}</span>
                    <div class="temp-bar-bg">
                        <div class="temp-bar-fill" style="left: 15%; width: 70%;"></div>
                    </div>
                    <span class="temp-high">${highStr}</span>
                </div>
            `;

            weeklyList.appendChild(row);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    DisplayController.init();
});