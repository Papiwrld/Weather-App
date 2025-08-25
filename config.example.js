// ========================================
// WEATHER APP CONFIGURATION TEMPLATE
// ========================================
// 
// This is a template file for the Weather App configuration.
// 
// TO SET UP YOUR WEATHER APP:
// 1. Copy this file and rename it to "config.js"
// 2. Replace "YOUR_API_KEY_HERE" with your actual OpenWeatherMap API key
// 3. Save the file
// 
// ⚠️  SECURITY WARNING: 
// - Never commit your actual config.js file to version control
// - Keep your API key private
// - This template file is safe to commit
// ========================================

const CONFIG = {
    // ========================================
    // WEATHER API CONFIGURATION
    // ========================================
    
    WEATHER_API: {
        // Your OpenWeatherMap API key - REPLACE WITH YOUR ACTUAL KEY
        // ⚠️  SECURITY WARNING: This key is visible to users in production!
        // For production apps, move API calls to a backend server
        API_KEY: 'YOUR_API_KEY_HERE',
        
        // Base URL for all API requests
        BASE_URL: 'https://api.openweathermap.org/data/2.5',
        
        // API endpoints
        ENDPOINTS: {
            CURRENT_WEATHER: '/weather',
            FORECAST: '/forecast'
        },
        
        // Number of forecast days to fetch (max 5 for free tier)
        FORECAST_COUNT: 5
    },
    
    // ========================================
    // APP CONFIGURATION
    // ========================================
    
    APP: {
        // Default city to show when app loads
        DEFAULT_CITY: 'Accra',
        
        // How long to cache data in localStorage (in milliseconds)
        // 30 minutes = 30 * 60 * 1000 = 1,800,000 ms
        CACHE_DURATION: 30 * 60 * 1000,
        
        // App name and version
        NAME: 'Weather App',
        VERSION: '1.0.0'
    },
    
    // ========================================
    // USER-FRIENDLY ERROR MESSAGES
    // ========================================
    
    MESSAGES: {
        // General errors
        UNKNOWN_ERROR: 'Something went wrong. Please try again.',
        NETWORK_ERROR: 'Network error. Please check your internet connection.',
        
        // API errors
        CITY_NOT_FOUND: 'City not found. Please check the spelling and try again.',
        API_LIMIT: 'API rate limit exceeded. Please wait a moment and try again.',
        
        // Location errors
        LOCATION_ERROR: 'Unable to get your location.',
        LOCATION_DENIED: 'Location access denied. Please allow location access or search for a city manually.',
        
        // Search errors
        EMPTY_SEARCH: 'Please enter a city name to search.',
        INVALID_INPUT: 'Please enter a valid city name.'
    }
};

// ========================================
// API KEY SETUP INSTRUCTIONS
// ========================================
//
// TO GET YOUR API KEY:
// 1. Go to https://openweathermap.org/
// 2. Sign up for a free account
// 3. Go to your profile → "My API Keys"
// 4. Copy your API key
// 5. Replace 'YOUR_API_KEY_HERE' above with your actual key
//
// EXAMPLE:
// API_KEY: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
//
// ========================================
// API USAGE LIMITS (FREE TIER)
// ========================================
//
// - 60 calls per minute
// - 1,000 calls per day
// - Current weather data
// - 5-day forecast data
// - Basic weather icons
//
// ========================================
// TESTING YOUR API KEY
// ========================================
//
// You can test your API key by visiting this URL in your browser:
// https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_API_KEY_HERE
//
// If it works, you'll see JSON data. If not, you'll get an error.
//
// ========================================
