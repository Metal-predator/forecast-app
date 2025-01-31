const API_KEY = '57b7bd23cc509a46d74a0e4027a320c9'; // API key from openweather.com
let isCelsius = true; // Default unit

// Fetch 5-day forecast and current weather
async function getWeatherByCity() {
    const city = document.getElementById('cityInput').value;
    if (!city) return alert('Please enter a city name.');

    try {
        // Fetch current weather
        const currentResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
        );
        const currentData = await currentResponse.json();

        // Fetch 5-day forecast
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
        );
        const forecastData = await forecastResponse.json();

        updateUI(currentData, forecastData);
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Get weather by geolocation
function getWeatherByLocation() {
    if (!navigator.geolocation) return alert('Geolocation not supported.');

    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        try {
            const currentResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
            );
            const currentData = await currentResponse.json();

            const forecastResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
            );
            const forecastData = await forecastResponse.json();

            updateUI(currentData, forecastData);
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
}

// Toggle between °C and °F
function toggleUnit() {
    isCelsius = !isCelsius;
    document.getElementById('unitToggle').textContent = isCelsius ? '°C / °F' : '°F / °C';
    // Re-render weather data with new unit
    const city = document.getElementById('cityInput').value;
    if (city) getWeatherByCity();
}

// Update UI with weather data
function updateUI(currentData, forecastData) {
    // Current Weather
    const currentWeatherDiv = document.getElementById('currentWeather');
    currentWeatherDiv.innerHTML = `
        <h2>${currentData.name}, ${currentData.sys.country}</h2>
        <i class="weather-icon wi wi-owm-${currentData.weather[0].id}"></i>
        <p class="temp">${formatTemp(currentData.main.temp)}</p>
        <p>${currentData.weather[0].description}</p>
        <p>Humidity: ${currentData.main.humidity}%</p>
        <p>Wind: ${currentData.wind.speed} m/s</p>
    `;

    // 5-Day Forecast
    const fiveDayForecastDiv = document.getElementById('fiveDayForecast');
    fiveDayForecastDiv.innerHTML = '';

    // Group forecast by day (OpenWeatherMap returns 3-hour intervals)
    const dailyForecast = {};
    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!dailyForecast[date]) {
            dailyForecast[date] = item;
        }
    });

    Object.values(dailyForecast).slice(0, 5).forEach(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
        fiveDayForecastDiv.innerHTML += `
            <div class="forecast-day">
                <h3>${date}</h3>
                <i class="weather-icon wi wi-owm-${day.weather[0].id}"></i>
                <p class="temp">${formatTemp(day.main.temp)}</p>
                <p>${day.weather[0].description}</p>
            </div>
        `;
    });
}

// Helper: Format temperature based on unit
function formatTemp(temp) {
    return isCelsius ? `${temp.toFixed(1)}°C` : `${(temp * 9/5 + 32).toFixed(1)}°F`;
}

// Initial load (optional)
 getWeatherByCity('London'); // Uncomment for default city

