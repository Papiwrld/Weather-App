// ========================================
// WEATHER APP - MAIN JAVASCRIPT FILE
// ========================================
// 
// This file contains all the JavaScript functionality for the Weather App.
// It's organized into clear sections with detailed comments to help you learn.
//
// LEARNING OBJECTIVES:
// - How to fetch data from APIs
// - How to handle user interactions
// - How to manage application state
// - How to handle errors gracefully
// - How to work with localStorage
// - How to create dynamic HTML content
// ========================================

// ========================================
// GLOBAL VARIABLES & STATE MANAGEMENT
// ========================================

// Production mode - set to true to disable console logging
const IS_PRODUCTION = false;

// Store the current weather data and app state
let appState = {
    currentWeather: null,      // Current weather data
    forecast: null,           // Forecast data
    currentCity: null,        // Currently displayed city
    temperatureUnit: 'celsius', // Current temperature unit
    isLoading: false,         // Loading state
    lastSearch: null,         // Last successful search
    isInitializing: true,     // Flag to prevent auto-search during initialization
    userTyping: false,        // Flag to track if user is actively typing
    userHasInteracted: false, // Flag to track if user has ever interacted with input
    timeouts: []              // Array to track timeouts for cleanup
};

// DOM element references (we'll populate these in initApp)
let elements = {};

// ========================================
// INITIALIZATION FUNCTION
// ========================================

/**
 * Initialize the weather app when the page loads
 * This is the main entry point that sets up everything
 */
function initApp() {
    console.log('🌤️ Weather App initializing...');

    // Step 1: Add enhanced animation styles
    addAnimationStyles();

    // Step 2: Get references to all the DOM elements we need
    bindUI();

    // Step 3: Load saved preferences from localStorage
    loadStateFromLocalStorage();

    // Step 4: Set up event listeners for user interactions
    setupEventListeners();

    // Step 5: Show default city or last searched city
    const cityToShow = appState.lastSearch || CONFIG.APP.DEFAULT_CITY;
    loadInitialWeather(cityToShow);

    // Step 6: Mark initialization as complete
    setTimeout(() => {
        appState.isInitializing = false;
        console.log('🔧 App initialization complete. User interaction tracking enabled.');
    }, 2000); // Give enough time for initial search to complete

    console.log('✅ Weather App initialized successfully!');
}

/**
 * Get references to all the DOM elements we'll be working with
 * This makes our code cleaner and more maintainable
 */
function bindUI() {
    // Search elements
    elements.cityInput = document.getElementById('city-input');
    elements.searchBtn = document.getElementById('search-btn');
    elements.locationBtn = document.getElementById('location-btn');

    // Display elements
    elements.cityName = document.getElementById('city-name');
    elements.cityCountry = document.getElementById('city-country');
    elements.currentTime = document.getElementById('current-time');
    elements.temperature = document.getElementById('temperature');
    elements.weatherIcon = document.getElementById('weather-icon');
    elements.weatherDescription = document.getElementById('weather-description');

    // Weather stats
    elements.feelsLike = document.getElementById('feels-like');
    elements.humidity = document.getElementById('humidity');
    elements.windSpeed = document.getElementById('wind-speed');
    elements.pressure = document.getElementById('pressure');

    // Unit toggle buttons
    elements.celsiusBtn = document.getElementById('celsius-btn');
    elements.fahrenheitBtn = document.getElementById('fahrenheit-btn');

    // Forecast container
    elements.forecastContainer = document.getElementById('forecast-container');

    // State containers
    elements.loading = document.getElementById('loading');
    elements.error = document.getElementById('error');
    elements.weatherContent = document.getElementById('weather-content');
    elements.errorMessage = document.getElementById('error-message');
    elements.retryBtn = document.getElementById('retry-btn');

    // Status messages for screen readers
    elements.statusMessages = document.getElementById('status-messages');

    // Search suggestions
    elements.searchSuggestions = document.getElementById('search-suggestions');
}

/**
 * Set up all the event listeners for user interactions
 * This is where we connect user actions to our functions
 * PERFORMANCE: Includes debounced search for better UX
 */
function setupEventListeners() {
    // Search functionality with debouncing
    elements.searchBtn.addEventListener('click', handleSearch);

    // Debounced search on input (prevents excessive API calls)
    const debouncedSearch = debounce((cityName) => {
        if (cityName && validateCityName(cityName)) {
            // Only auto-search if user is actively typing (not from initialization)
            if (!appState.isInitializing && document.activeElement === elements.cityInput && appState.userHasInteracted) {
                searchWeather(cityName);
            }
        }
    }, 1000); // 1 second delay

    elements.cityInput.addEventListener('input', (e) => {
        const cityName = e.target.value.trim();

        // Mark that user has interacted and is actively typing
        appState.userHasInteracted = true;
        appState.userTyping = true;

        console.log('👤 User typing detected:', cityName);

        // Show suggestions for shorter inputs
        if (cityName.length >= 2) {
            showSearchSuggestions(cityName);
        } else {
            hideSearchSuggestions();
        }

        // Auto-search for longer inputs (only if not initializing and user is actively typing)
        if (cityName.length > 2 && !appState.isInitializing && document.activeElement === elements.cityInput) {
            debouncedSearch(cityName);
        }

        // Reset typing flag after a delay
        setTimeout(() => {
            appState.userTyping = false;
        }, 1000);
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!elements.cityInput.contains(e.target) && !elements.searchSuggestions.contains(e.target)) {
            hideSearchSuggestions();
        }
    });

    elements.cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // Track when user focuses on input
    elements.cityInput.addEventListener('focus', () => {
        appState.userHasInteracted = true;
        appState.userTyping = true;
    });

    // Track when user stops interacting with input
    elements.cityInput.addEventListener('blur', () => {
        setTimeout(() => {
            appState.userTyping = false;
        }, 500);
    });

    // Location button
    elements.locationBtn.addEventListener('click', handleLocationSearch);

    // Unit toggle buttons
    elements.celsiusBtn.addEventListener('click', () => setTemperatureUnit('celsius'));
    elements.fahrenheitBtn.addEventListener('click', () => setTemperatureUnit('fahrenheit'));

    // Retry button for errors
    elements.retryBtn.addEventListener('click', () => {
        if (appState.lastSearch) {
            searchWeather(appState.lastSearch);
        }
    });

    // Add keyboard navigation support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Clear search input on Escape
            elements.cityInput.value = '';
            elements.cityInput.focus();
        }
    });

    // Track any keyboard interaction with the input
    elements.cityInput.addEventListener('keydown', () => {
        appState.userHasInteracted = true;
    });
}

// ========================================
// SEARCH & LOCATION FUNCTIONS
// ========================================

/**
 * Handle the search button click or Enter key press
 * Gets the city name from the input and searches for weather
 * SECURITY: Validates input before processing
 */
function handleSearch() {
    const cityName = elements.cityInput.value.trim();

    if (!cityName) {
        showError('Please enter a city name');
        return;
    }

    // Validate city name to prevent injection attacks
    if (!validateCityName(cityName)) {
        showError('Please enter a valid city name (letters, spaces, and common punctuation only)');
        return;
    }

    // Add button click animation
    elements.searchBtn.style.animation = 'buttonClick 0.3s ease-out';
    setTimeout(() => {
        elements.searchBtn.style.animation = '';
    }, 300);

    searchWeather(cityName);
}

/**
 * Handle the "Use My Location" button click
 * Uses the browser's geolocation API to get user's location
 */
function handleLocationSearch() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }

    showLoading('Getting your location...');

    navigator.geolocation.getCurrentPosition(
        // Success callback - we got the location
        (position) => {
            const { latitude, longitude } = position.coords;
            searchWeatherByCoords(latitude, longitude);
        },
        // Error callback - location access denied or failed
        (error) => {
            let errorMessage = CONFIG.MESSAGES.LOCATION_ERROR;

            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = CONFIG.MESSAGES.LOCATION_DENIED;
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Location information is unavailable';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Location request timed out';
                    break;
            }

            showError(errorMessage);
        },
        // Options for geolocation
        {
            timeout: 10000,    // 10 seconds timeout
            enableHighAccuracy: false  // Don't need high accuracy for weather
        }
    );
}

/**
 * Load initial weather data without interfering with user input
 * Used during app initialization
 */
function loadInitialWeather(cityName) {
    console.log(`🌤️ Loading initial weather for: ${cityName}`);

    // Set the input value safely
    safeSetInputValue(cityName);

    // Show loading state
    showLoading(`Loading weather for ${cityName}...`);

    // Fetch current weather and forecast
    Promise.all([
        fetchCurrentWeather(cityName),
        fetchForecast(cityName)
    ])
        .then(([currentData, forecastData]) => {
            // Update our app state
            appState.currentWeather = currentData;
            appState.forecast = forecastData;
            appState.currentCity = cityName;
            appState.lastSearch = cityName;

            // Save to localStorage for next time
            saveStateToLocalStorage();

            // Display the weather data
            renderCurrentWeather(currentData);
            renderForecast(forecastData);

            // Show the weather content
            showWeatherContent();

            // Update status for screen readers
            updateStatusMessage(`Weather loaded for ${cityName}`);

            console.log('✅ Initial weather data loaded successfully');
        })
        .catch((error) => {
            console.error('❌ Error loading initial weather:', error);
            handleWeatherError(error, cityName);
        });
}

/**
 * Search for weather by city name
 * This is the main function that fetches weather data
 */
function searchWeather(cityName) {
    console.log(`🔍 Searching for weather in: ${cityName}`);

    // Only update input field if user hasn't interacted yet AND is not actively typing
    // This prevents overwriting user input while typing
    if (!appState.userHasInteracted && !appState.userTyping) {
        const currentInput = elements.cityInput.value.trim();
        if (currentInput !== cityName) {
            safeSetInputValue(cityName);
        }
    }

    // Show loading state
    showLoading(`Loading weather for ${cityName}...`);

    // Fetch current weather and forecast
    Promise.all([
        fetchCurrentWeather(cityName),
        fetchForecast(cityName)
    ])
        .then(([currentData, forecastData]) => {
            // Update our app state
            appState.currentWeather = currentData;
            appState.forecast = forecastData;
            appState.currentCity = cityName;
            appState.lastSearch = cityName;

            // Save to localStorage for next time
            saveStateToLocalStorage();

            // Display the weather data
            renderCurrentWeather(currentData);
            renderForecast(forecastData);

            // Show the weather content
            showWeatherContent();

            // Update status for screen readers
            updateStatusMessage(`Weather loaded for ${cityName}`);

            console.log('✅ Weather data loaded successfully');
        })
        .catch((error) => {
            console.error('❌ Error fetching weather:', error);
            handleWeatherError(error, cityName);
        });
}

/**
 * Search for weather by coordinates (latitude/longitude)
 * Used when user clicks "Use My Location"
 * SECURITY: Validates coordinates before processing
 */
function searchWeatherByCoords(lat, lon) {
    console.log(`📍 Searching for weather at coordinates: ${lat}, ${lon}`);

    // Validate coordinates to prevent injection attacks
    if (!validateCoordinates(lat, lon)) {
        showError('Invalid coordinates received. Please try again.');
        return;
    }

    Promise.all([
        fetchCurrentWeatherByCoords(lat, lon),
        fetchForecastByCoords(lat, lon)
    ])
        .then(([currentData, forecastData]) => {
            appState.currentWeather = currentData;
            appState.forecast = forecastData;
            appState.currentCity = currentData.name;
            appState.lastSearch = currentData.name;

            saveStateToLocalStorage();

            renderCurrentWeather(currentData);
            renderForecast(forecastData);
            showWeatherContent();

            updateStatusMessage(`Weather loaded for your location: ${currentData.name}`);
        })
        .catch((error) => {
            console.error('❌ Error fetching weather by coordinates:', error);
            handleWeatherError(error, 'your location');
        });
}

// ========================================
// API FETCHING FUNCTIONS
// ========================================

/**
 * Fetch current weather data for a city
 * This function makes the API call to OpenWeatherMap
 */
async function fetchCurrentWeather(cityName) {
    const url = buildWeatherURL(CONFIG.WEATHER_API.ENDPOINTS.CURRENT_WEATHER, {
        q: cityName,
        units: appState.temperatureUnit === 'celsius' ? 'metric' : 'imperial'
    });

    console.log(`🌐 Fetching current weather from: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📊 Current weather data received:', data);

    return data;
}

/**
 * Fetch current weather data by coordinates
 */
async function fetchCurrentWeatherByCoords(lat, lon) {
    const url = buildWeatherURL(CONFIG.WEATHER_API.ENDPOINTS.CURRENT_WEATHER, {
        lat: lat,
        lon: lon,
        units: appState.temperatureUnit === 'celsius' ? 'metric' : 'imperial'
    });

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
}

/**
 * Fetch 5-day forecast data for a city
 */
async function fetchForecast(cityName) {
    const url = buildWeatherURL(CONFIG.WEATHER_API.ENDPOINTS.FORECAST, {
        q: cityName,
        units: appState.temperatureUnit === 'celsius' ? 'metric' : 'imperial',
        cnt: CONFIG.WEATHER_API.FORECAST_COUNT
    });

    console.log(`🌐 Fetching forecast from: ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📊 Forecast data received:', data);

    return data;
}

/**
 * Fetch forecast data by coordinates
 */
async function fetchForecastByCoords(lat, lon) {
    const url = buildWeatherURL(CONFIG.WEATHER_API.ENDPOINTS.FORECAST, {
        lat: lat,
        lon: lon,
        units: appState.temperatureUnit === 'celsius' ? 'metric' : 'imperial',
        cnt: CONFIG.WEATHER_API.FORECAST_COUNT
    });

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
}

/**
 * Build the complete URL for API requests
 * This function constructs the URL with all necessary parameters
 */
function buildWeatherURL(endpoint, params = {}) {
    // Start with the base URL
    let url = `${CONFIG.WEATHER_API.BASE_URL}${endpoint}`;

    // Add the API key to parameters
    const queryParams = {
        ...params,
        appid: CONFIG.WEATHER_API.API_KEY
    };

    // Convert parameters to URL query string
    const queryString = Object.keys(queryParams)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
        .join('&');

    // Combine URL with query string
    return `${url}?${queryString}`;
}

// ========================================
// RENDERING FUNCTIONS
// ========================================

/**
 * Render the current weather data in the UI
 * This function updates all the weather display elements
 * SECURITY: Sanitizes all text content to prevent XSS
 */
function renderCurrentWeather(data) {
    console.log('🎨 Rendering current weather:', data);

    // Validate data structure
    if (!data || typeof data !== 'object') {
        console.error('Invalid weather data received');
        showError('Invalid weather data received. Please try again.');
        return;
    }

    // Update location information (sanitized)
    elements.cityName.textContent = sanitizeText(data.name || 'Unknown City');
    elements.cityCountry.textContent = sanitizeText(data.sys?.country || '');

    // Update current time
    updateCurrentTime(data.dt, data.timezone);

    // Update temperature with enhanced animation
    const temp = data.main?.temp;
    if (temp !== undefined && !isNaN(temp)) {
        elements.temperature.textContent = formatTemperature(temp);
        elements.temperature.classList.add('temperature-glow');

        // Remove glow effect after animation
        setTimeout(() => {
            elements.temperature.classList.remove('temperature-glow');
        }, 2000);
    } else {
        elements.temperature.textContent = '--';
    }

    // Update weather icon and description (sanitized)
    const weather = data.weather?.[0];
    if (weather && weather.icon) {
        const description = sanitizeText(weather.description || 'Unknown');
        elements.weatherDescription.textContent = description;
        elements.weatherIcon.src = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
        elements.weatherIcon.alt = description;
        elements.weatherIcon.loading = 'lazy'; // Performance improvement

        // Update background and animations
        updateWeatherBackground(weather.id, weather.icon);
    }

    // Update weather stats
    updateWeatherStats(data);
}

/**
 * Update the weather statistics (feels like, humidity, wind, pressure)
 */
function updateWeatherStats(data) {
    const main = data.main || {};
    const wind = data.wind || {};

    // Feels like temperature
    if (main.feels_like !== undefined) {
        elements.feelsLike.textContent = formatTemperature(main.feels_like);
    }

    // Humidity
    if (main.humidity !== undefined) {
        elements.humidity.textContent = `${main.humidity}%`;
    }

    // Wind speed
    if (wind.speed !== undefined) {
        elements.windSpeed.textContent = formatWindSpeed(wind.speed);
    }

    // Pressure
    if (main.pressure !== undefined) {
        elements.pressure.textContent = `${main.pressure} hPa`;
    }
}

/**
 * Render the forecast data in the UI
 * This creates the 5-day forecast cards
 */
function renderForecast(data) {
    console.log('🎨 Rendering forecast:', data);

    // Clear existing forecast
    elements.forecastContainer.innerHTML = '';

    // Get the forecast list (array of weather data points)
    const forecastList = data.list || [];

    // Group forecast by day (we want one forecast per day)
    const dailyForecast = groupForecastByDay(forecastList);

    // Create forecast cards for each day
    dailyForecast.forEach((dayData, index) => {
        const forecastCard = createForecastCard(dayData, index);
        elements.forecastContainer.appendChild(forecastCard);
    });
}

/**
 * Group forecast data by day to show daily forecasts
 * The API returns 3-hour intervals, we group them by day
 */
function groupForecastByDay(forecastList) {
    const dailyForecast = [];
    const seenDays = new Set();

    forecastList.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toDateString();

        // Only add one forecast per day
        if (!seenDays.has(dayKey)) {
            seenDays.add(dayKey);
            dailyForecast.push(item);
        }

        // Stop after 5 days
        if (dailyForecast.length >= 5) {
            return;
        }
    });

    return dailyForecast;
}

/**
 * Create a single forecast card element
 * This function creates the HTML for one day's forecast
 * SECURITY: Uses textContent and createElement to prevent XSS
 */
function createForecastCard(dayData, index = 0) {
    const date = new Date(dayData.dt * 1000);
    const weather = dayData.weather?.[0];
    const main = dayData.main || {};

    // Create the card container
    const card = document.createElement('div');
    card.className = 'forecast-item';

    // Add staggered animation delay
    card.style.animationDelay = `${index * 0.1}s`;

    // Format the day name
    const dayName = formatDayName(date);

    // Get temperature
    const temp = main.temp !== undefined ? formatTemperature(main.temp) : '--';

    // Get weather description (sanitized)
    const description = sanitizeText(weather?.description || 'Unknown');

    // Create elements safely (prevents XSS)
    const dayElement = document.createElement('div');
    dayElement.className = 'forecast-day';
    dayElement.textContent = dayName;

    const iconElement = document.createElement('img');
    iconElement.className = 'forecast-icon';
    iconElement.src = `https://openweathermap.org/img/wn/${weather?.icon || '01d'}@2x.png`;
    iconElement.alt = description;
    iconElement.loading = 'lazy'; // Performance improvement

    const tempElement = document.createElement('div');
    tempElement.className = 'forecast-temp';
    tempElement.textContent = temp;

    const descElement = document.createElement('div');
    descElement.className = 'forecast-description';
    descElement.textContent = description;

    // Append elements safely
    card.appendChild(dayElement);
    card.appendChild(iconElement);
    card.appendChild(tempElement);
    card.appendChild(descElement);

    return card;
}

// ========================================
// DYNAMIC BACKGROUND & ANIMATION FUNCTIONS
// ========================================

/**
 * Update the app background based on weather conditions
 */
function updateWeatherBackground(weatherId, iconCode) {
    const body = document.body;
    const isNight = iconCode.includes('n');

    // Reset classes
    body.className = '';

    // Clear existing effects
    clearWeatherEffects();

    if (isNight) {
        body.classList.add('weather-night');
        createStarryNight();
        return;
    }

    // Map weather ID to background class
    // See: https://openweathermap.org/weather-conditions
    if (weatherId >= 200 && weatherId < 300) {
        body.classList.add('weather-thunderstorm');
        createRain(true); // Heavy rain
    } else if (weatherId >= 300 && weatherId < 600) {
        body.classList.add('weather-rain');
        createRain(false); // Normal rain
    } else if (weatherId >= 600 && weatherId < 700) {
        body.classList.add('weather-snow');
        createSnow();
    } else if (weatherId >= 700 && weatherId < 800) {
        body.classList.add('weather-clouds'); // Atmosphere (fog, mist, etc.)
    } else if (weatherId === 800) {
        body.classList.add('weather-clear');
    } else if (weatherId > 800) {
        body.classList.add('weather-clouds');
    }
}

/**
 * Clear any active weather particle effects
 */
function clearWeatherEffects() {
    const container = document.getElementById('weather-effects');
    if (container) {
        container.innerHTML = '';
    }
}

/**
 * Create rain particle effects
 */
function createRain(isHeavy) {
    const container = document.getElementById('weather-effects');
    if (!container) return;

    const dropCount = isHeavy ? 100 : 50;

    for (let i = 0; i < dropCount; i++) {
        const drop = document.createElement('div');
        drop.className = 'particle rain-drop';
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.animationDuration = `${Math.random() * 0.5 + 0.5}s`;
        drop.style.animationDelay = `${Math.random() * 2}s`;
        drop.style.opacity = Math.random() * 0.5 + 0.2;
        container.appendChild(drop);
    }
}

/**
 * Create snow particle effects
 */
function createSnow() {
    const container = document.getElementById('weather-effects');
    if (!container) return;

    const flakeCount = 50;

    for (let i = 0; i < flakeCount; i++) {
        const flake = document.createElement('div');
        flake.className = 'particle snow-flake';
        flake.style.left = `${Math.random() * 100}%`;
        flake.style.animationDuration = `${Math.random() * 3 + 2}s`;
        flake.style.animationDelay = `${Math.random() * 5}s`;
        flake.style.opacity = Math.random() * 0.8 + 0.2;
        flake.style.width = `${Math.random() * 5 + 2}px`;
        flake.style.height = flake.style.width;
        container.appendChild(flake);
    }
}

/**
 * Create starry night effect (simple static stars for now)
 */
function createStarryNight() {
    const container = document.getElementById('weather-effects');
    if (!container) return;

    const starCount = 100;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'particle';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.width = `${Math.random() * 2 + 1}px`;
        star.style.height = star.style.width;
        star.style.opacity = Math.random() * 0.8 + 0.2;
        // Twinkle effect could be added here
        container.appendChild(star);
    }
}

// ========================================
// SECURITY & VALIDATION FUNCTIONS
// ========================================

/**
 * Sanitize text to prevent XSS attacks
 * Removes potentially dangerous HTML/script content
 */
function sanitizeText(text) {
    if (typeof text !== 'string') {
        return '';
    }

    // Remove HTML tags and script content
    return text
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
}

/**
 * Validate city name input
 * Prevents injection attacks and ensures valid input
 */
function validateCityName(cityName) {
    if (!cityName || typeof cityName !== 'string') {
        return false;
    }

    const sanitized = sanitizeText(cityName);

    // Check length and allowed characters
    if (sanitized.length < 1 || sanitized.length > 100) {
        return false;
    }

    // Only allow letters, spaces, hyphens, and common punctuation
    const validPattern = /^[a-zA-Z\s\-',.()]+$/;
    return validPattern.test(sanitized);
}

/**
 * Validate coordinates
 * Ensures coordinates are within valid ranges
 */
function validateCoordinates(lat, lon) {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    return !isNaN(latNum) && !isNaN(lonNum) &&
        latNum >= -90 && latNum <= 90 &&
        lonNum >= -180 && lonNum <= 180;
}

/**
 * Debounce function to limit API calls
 * Improves performance and reduces API usage
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Popular cities for search suggestions
 * Provides quick access to common cities
 */
const POPULAR_CITIES = [
    { name: 'London', country: 'UK' },
    { name: 'New York', country: 'US' },
    { name: 'Tokyo', country: 'JP' },
    { name: 'Paris', country: 'FR' },
    { name: 'Sydney', country: 'AU' },
    { name: 'Berlin', country: 'DE' },
    { name: 'Moscow', country: 'RU' },
    { name: 'Dubai', country: 'AE' },
    { name: 'Singapore', country: 'SG' },
    { name: 'Toronto', country: 'CA' }
];

/**
 * Show search suggestions based on input
 * Provides autocomplete functionality
 */
function showSearchSuggestions(input) {
    const suggestions = POPULAR_CITIES.filter(city =>
        city.name.toLowerCase().includes(input.toLowerCase())
    );

    if (suggestions.length === 0 || input.length < 2) {
        hideSearchSuggestions();
        return;
    }

    elements.searchSuggestions.innerHTML = '';
    elements.searchSuggestions.setAttribute('aria-hidden', 'false');
    elements.searchSuggestions.style.display = 'block';

    suggestions.slice(0, 5).forEach(city => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.innerHTML = `
            <span class="suggestion-city">${sanitizeText(city.name)}</span>
            <span class="suggestion-country">${sanitizeText(city.country)}</span>
        `;

        item.addEventListener('click', () => {
            elements.cityInput.value = city.name;
            hideSearchSuggestions();
            // Set focus back to input and trigger search
            elements.cityInput.focus();
            searchWeather(city.name);
        });

        elements.searchSuggestions.appendChild(item);
    });
}

/**
 * Hide search suggestions
 */
function hideSearchSuggestions() {
    elements.searchSuggestions.setAttribute('aria-hidden', 'true');
    elements.searchSuggestions.style.display = 'none';
}

/**
 * Safely set input value without interfering with user interaction
 * This function respects user input and only updates when appropriate
 */
function safeSetInputValue(value) {
    // Only set the value if user hasn't interacted yet
    if (!appState.userHasInteracted) {
        elements.cityInput.value = value;
        console.log(`🔧 Input value set to: "${value}" (user hasn't interacted yet)`);
    } else {
        console.log(`👤 Input value not set to "${value}" (user has interacted)`);
    }
}

/**
 * Utility function to manage timeouts and prevent memory leaks
 * Stores timeout IDs for cleanup
 */
function safeSetTimeout(callback, delay) {
    const timeoutId = setTimeout(callback, delay);
    appState.timeouts.push(timeoutId);
    return timeoutId;
}

/**
 * Clean up all active timeouts to prevent memory leaks
 */
function cleanupTimeouts() {
    appState.timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    appState.timeouts = [];
}

/**
 * Safe logging function that respects production mode
 * Only logs in development mode
 */
function safeLog(message, type = 'log') {
    if (!IS_PRODUCTION) {
        switch (type) {
            case 'error':
                console.error(message);
                break;
            case 'warn':
                console.warn(message);
                break;
            default:
                console.log(message);
        }
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Format temperature with proper unit
 * Converts between Celsius and Fahrenheit as needed
 */
function formatTemperature(temp) {
    if (temp === undefined || temp === null) {
        return '--';
    }

    const rounded = Math.round(temp);
    const unit = appState.temperatureUnit === 'celsius' ? '°C' : '°F';

    return `${rounded}${unit}`;
}

/**
 * Convert Celsius to Fahrenheit
 * Formula: °F = (°C × 9/5) + 32
 */
function toFahrenheit(celsius) {
    return (celsius * 9 / 5) + 32;
}

/**
 * Convert Fahrenheit to Celsius
 * Formula: °C = (°F - 32) × 5/9
 */
function toCelsius(fahrenheit) {
    return (fahrenheit - 32) * 5 / 9;
}

/**
 * Format wind speed with proper units
 */
function formatWindSpeed(speed) {
    if (speed === undefined || speed === null) {
        return '--';
    }

    const unit = appState.temperatureUnit === 'celsius' ? 'm/s' : 'mph';
    return `${Math.round(speed)} ${unit}`;
}

/**
 * Format day name for forecast (e.g., "Mon", "Tue")
 */
function formatDayName(date) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Update the current time display
 * Shows the local time for the searched city
 */
function updateCurrentTime(timestamp, timezone) {
    if (!timestamp) {
        elements.currentTime.textContent = 'Time unavailable';
        return;
    }

    try {
        const date = new Date(timestamp * 1000);
        const timeString = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        elements.currentTime.textContent = timeString;
    } catch (error) {
        console.error('Error formatting time:', error);
        elements.currentTime.textContent = 'Time unavailable';
    }
}

/**
 * Set the temperature unit (Celsius or Fahrenheit)
 * Updates all temperature displays and saves preference
 */
function setTemperatureUnit(unit) {
    if (unit === appState.temperatureUnit) {
        return; // No change needed
    }

    console.log(`🌡️ Switching temperature unit to: ${unit}`);

    // Update the active button
    elements.celsiusBtn.classList.toggle('active', unit === 'celsius');
    elements.fahrenheitBtn.classList.toggle('active', unit === 'fahrenheit');

    // Update app state
    appState.temperatureUnit = unit;

    // Save preference
    saveStateToLocalStorage();

    // Re-render weather data with new units
    if (appState.currentWeather) {
        renderCurrentWeather(appState.currentWeather);
    }
    if (appState.forecast) {
        renderForecast(appState.forecast);
    }
}

// ========================================
// STATE MANAGEMENT (localStorage)
// ========================================

/**
 * Save the current app state to localStorage
 * This allows the app to remember user preferences
 */
function saveStateToLocalStorage() {
    try {
        const stateToSave = {
            temperatureUnit: appState.temperatureUnit,
            lastSearch: appState.lastSearch,
            timestamp: Date.now()
        };

        localStorage.setItem('weatherAppState', JSON.stringify(stateToSave));
        console.log('💾 App state saved to localStorage');
    } catch (error) {
        console.error('❌ Error saving to localStorage:', error);
    }
}

/**
 * Load saved app state from localStorage
 * Restores user preferences when the app loads
 */
function loadStateFromLocalStorage() {
    try {
        const savedState = localStorage.getItem('weatherAppState');

        if (savedState) {
            const parsedState = JSON.parse(savedState);

            // Check if the saved state is still valid (not too old)
            const isExpired = Date.now() - parsedState.timestamp > CONFIG.APP.CACHE_DURATION;

            if (!isExpired) {
                appState.temperatureUnit = parsedState.temperatureUnit || 'celsius';
                appState.lastSearch = parsedState.lastSearch;

                // Update the UI to reflect saved preferences
                elements.celsiusBtn.classList.toggle('active', appState.temperatureUnit === 'celsius');
                elements.fahrenheitBtn.classList.toggle('active', appState.temperatureUnit === 'fahrenheit');

                console.log('📂 App state loaded from localStorage');
            } else {
                console.log('⏰ Saved state expired, using defaults');
            }
        }
    } catch (error) {
        console.error('❌ Error loading from localStorage:', error);
    }
}

// ========================================
// UI STATE MANAGEMENT
// ========================================

/**
 * Show the loading state
 * Hides other content and shows a spinner
 */
function showLoading(message = 'Loading...') {
    appState.isLoading = true;

    elements.loading.querySelector('p').textContent = message;
    elements.loading.setAttribute('aria-hidden', 'false');
    elements.error.setAttribute('aria-hidden', 'true');
    elements.weatherContent.setAttribute('aria-hidden', 'true');

    // Hide other elements
    elements.loading.style.display = 'block';
    elements.error.style.display = 'none';
    elements.weatherContent.style.display = 'none';
}

/**
 * Show the weather content
 * Hides loading and error states
 */
function showWeatherContent() {
    appState.isLoading = false;

    elements.loading.setAttribute('aria-hidden', 'true');
    elements.error.setAttribute('aria-hidden', 'true');
    elements.weatherContent.setAttribute('aria-hidden', 'false');

    // Show weather content, hide others
    elements.loading.style.display = 'none';
    elements.error.style.display = 'none';
    elements.weatherContent.style.display = 'block';

    // Add subtle success animation
    elements.weatherContent.classList.add('success-animation');

    setTimeout(() => {
        elements.weatherContent.classList.remove('success-animation');
    }, 600);
}

/**
 * Show an error message
 * Displays user-friendly error messages
 */
function showError(message) {
    appState.isLoading = false;

    elements.errorMessage.textContent = message;
    elements.loading.setAttribute('aria-hidden', 'true');
    elements.error.setAttribute('aria-hidden', 'false');
    elements.weatherContent.setAttribute('aria-hidden', 'true');

    // Show error, hide others
    elements.loading.style.display = 'none';
    elements.error.style.display = 'block';
    elements.weatherContent.style.display = 'none';

    console.error('❌ Error displayed:', message);
}

/**
 * Handle weather API errors
 * Converts technical errors to user-friendly messages
 * SECURITY: Sanitizes error messages to prevent XSS
 */
function handleWeatherError(error, cityName) {
    console.error('Weather API error:', error);

    let userMessage = CONFIG.MESSAGES.UNKNOWN_ERROR;

    // Check for specific error types
    if (error.message.includes('404')) {
        userMessage = CONFIG.MESSAGES.CITY_NOT_FOUND;
    } else if (error.message.includes('429')) {
        userMessage = CONFIG.MESSAGES.API_LIMIT;
    } else if (error.message.includes('401')) {
        userMessage = 'Invalid API key. Please check your configuration.';
    } else if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
        userMessage = CONFIG.MESSAGES.NETWORK_ERROR;
    } else if (error.message.includes('Failed to fetch')) {
        userMessage = 'Network connection failed. Please check your internet connection.';
    } else if (error.message.includes('timeout')) {
        userMessage = 'Request timed out. Please try again.';
    }

    // Sanitize the error message to prevent XSS
    showError(sanitizeText(userMessage));
}

/**
 * Add CSS animations for particles and confetti
 */
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes successPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
        }
        
        .success-animation {
            animation: successPulse 0.6s ease-out;
        }
        
        @keyframes temperatureGlow {
            0%, 100% { 
                text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
                filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.2));
            }
            50% { 
                text-shadow: 0 0 30px rgba(255, 255, 255, 0.6);
                filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.4));
            }
        }
        
        .temperature-glow {
            animation: temperatureGlow 2s ease-in-out infinite;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Update status messages for screen readers
 * Provides accessibility feedback
 */
function updateStatusMessage(message) {
    if (elements.statusMessages) {
        elements.statusMessages.textContent = message;

        // Clear the message after a few seconds
        setTimeout(() => {
            elements.statusMessages.textContent = '';
        }, 3000);
    }
}

// ========================================
// APP INITIALIZATION
// ========================================

// Wait for the DOM to be fully loaded before initializing
// This ensures all HTML elements are available
document.addEventListener('DOMContentLoaded', initApp);

// ========================================
// LEARNING NOTES
// ========================================
//
// KEY CONCEPTS LEARNED:
//
// 1. API Integration:
//    - How to make HTTP requests with fetch()
//    - How to handle API responses and errors
//    - How to build URLs with query parameters
//
// 2. State Management:
//    - How to store and update application state
//    - How to persist data in localStorage
//    - How to manage loading and error states
//
// 3. DOM Manipulation:
//    - How to get references to HTML elements
//    - How to update content dynamically
//    - How to create new HTML elements
//
// 4. Event Handling:
//    - How to respond to user interactions
//    - How to handle keyboard events
//    - How to work with browser APIs (geolocation)
//
// 5. Error Handling:
//    - How to catch and handle errors gracefully
//    - How to provide user-friendly error messages
//    - How to implement retry functionality
//
// 6. Accessibility:
//    - How to provide screen reader feedback
//    - How to manage focus states
//    - How to use ARIA attributes
//
// NEXT STEPS TO EXPLORE:
// - Add more weather data (UV index, air quality)
// - Implement weather maps
// - Add weather alerts
// - Create a weather widget
// - Add multiple city comparison
// - Implement weather notifications
//
// ========================================
