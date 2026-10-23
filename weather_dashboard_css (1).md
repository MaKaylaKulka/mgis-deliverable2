/* =========================================================================
   ATMOSPHERE WEATHER DASHBOARD - STYLESHEET (style.css)
   Includes all seasonal & weather color matrices, typography, and layout.
   ========================================================================= */

:root {
    --accent-border: rgba(255, 255, 255, 0.35);
    --card-bg: rgba(18, 24, 38, 0.60);
    --text-primary: #ffffff;
    --badge-bg: rgba(255, 255, 255, 0.15);
    --accent-glow: #81D4F0;
}

body {
    font-family: 'Space Grotesk', 'Inter', sans-serif;
    transition: background 0.8s ease, color 0.5s ease;
    overflow-x: hidden;
    background-color: #0f172a;
}

/* Sharp Glass Cards with custom outlines & semi-transparent panels */
.sharp-card {
    background: var(--card-bg);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1.5px solid var(--accent-border);
    border-radius: 12px; /* Sharper corners as requested */
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.30);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sharp-card:hover {
    box-shadow: 0 14px 30px -5px rgba(0, 0, 0, 0.40);
}

/* Custom Scrollbar for 24-Hour Slider */
.custom-scroll::-webkit-scrollbar {
    height: 6px;
}
.custom-scroll::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 4px;
}
.custom-scroll::-webkit-scrollbar-thumb {
    background: var(--accent-border);
    border-radius: 4px;
}

/* Hour pill styling for 24-hour horizontal view */
.hour-pill {
    border: 1.5px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    transition: all 0.2s ease;
    min-width: 58px;
}
.hour-pill.active {
    border-color: var(--accent-glow);
    background: var(--accent-glow);
    color: #0f172a;
    font-weight: 700;
    transform: translateY(-2px);
}

/* Weather float animation */
@keyframes floatSlow {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
}
.animate-float { animation: floatSlow 5s ease-in-out infinite; }