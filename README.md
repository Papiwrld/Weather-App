# 🌤️ Weather App 

A complete, beginner-friendly weather application built with **HTML, CSS, and vanilla JavaScript**. This project teaches you how to build a modern web app from scratch, integrate with external APIs, and create a responsive, accessible user interface.

## ✅ Acceptance Criteria Checklist

- [x] I can search a city and see current weather + forecast
- [x] °C/°F toggle works and persists
- [x] "Use My Location" works or fails gracefully
- [x] Loading and error states are obvious and accessible
- [x] App remembers last successful city and shows it on reload
- [x] Code is thoroughly commented and easy to follow
- [x] README teaches me how everything fits together

## 🎯 Learning Objectives

By building this weather app, you'll learn:

- **API Integration**: How to fetch data from external APIs using `fetch()`
- **State Management**: How to manage application state and user preferences
- **DOM Manipulation**: How to dynamically update HTML content
- **Event Handling**: How to respond to user interactions
- **Error Handling**: How to gracefully handle errors and provide user feedback
- **localStorage**: How to persist data in the browser
- **Responsive Design**: How to create mobile-first, accessible interfaces
- **Modern CSS**: How to use CSS variables, flexbox, and grid

## 📁 Project Structure

```
Weather App/
├── index.html          # Main HTML structure
├── styles.css          # All styling and responsive design
├── script.js           # JavaScript functionality
├── config.example.js   # Configuration template
├── config.js           # Your API key (create this)
├── README.md           # This file
├── CONTRIBUTING.md     # Guidelines for contributors
├── CHANGELOG.md        # Version history and changes
├── LICENSE             # MIT License
└── .gitignore          # Git ignore rules
```

## 🚀 Quick Start Guide

### Step 1: Get Your API Key

1. Go to [OpenWeatherMap](https://openweathermap.org/)
2. Click "Sign Up" and create a free account
3. After signing in, go to "My API Keys" in your account
4. Copy your API key (it looks like: `abc123def456ghi789...`)

### Step 2: Set Up Your Configuration

1. Copy `config.example.js` and rename it to `config.js`
2. Replace `"YOUR_API_KEY_HERE"` with your actual API key
3. Save the file

**⚠️  Important**: The `config.js` file is ignored by Git to protect your API key. Only the `config.example.js` template is committed to the repository.

### Step 3: Run the App

1. Open `index.html` in your web browser
2. Try searching for a city like "London" or "New York"
3. If you see weather data, your setup is working! 🎉

## 📚 How Each File Works

### `index.html` - The Structure
- **Purpose**: Defines the HTML structure and semantic markup
- **Key Features**:
  - Semantic HTML5 elements (`<main>`, `<section>`, `<header>`)
  - Accessibility attributes (`aria-label`, `aria-live`, `aria-hidden`)
  - Proper form structure with labels
  - Loading and error state containers

### `styles.css` - The Design
- **Purpose**: Handles all visual styling and responsive design
- **Key Features**:
  - CSS variables for easy customization
  - Mobile-first responsive design
  - Smooth animations and transitions
  - Accessibility enhancements
  - Modern layout with flexbox and grid

### `script.js` - The Functionality
- **Purpose**: Contains all JavaScript logic and API integration
- **Key Features**:
  - API calls to OpenWeatherMap
  - State management with localStorage
  - Event handling for user interactions
  - Error handling and user feedback
  - Dynamic content rendering

### `config.js` - The Configuration
- **Purpose**: Stores your API key and app settings
- **Key Features**:
  - API key management
  - App configuration options
  - Error message definitions
  - Learning documentation

## 🔧 How the API Works

### OpenWeatherMap API Basics

The app uses OpenWeatherMap's free API to get weather data. Here's how it works:

```javascript
// Example API URL structure:
https://api.openweathermap.org/data/2.5/weather?q=London&units=metric&appid=YOUR_API_KEY

// Query Parameters Explained:
// q=London          (city name)
// units=metric      (temperature units: metric=Celsius, imperial=Fahrenheit)
// appid=YOUR_KEY    (your API key for authentication)
```

### API Endpoints Used

1. **Current Weather**: `/weather` - Gets current weather for a city
2. **Forecast**: `/forecast` - Gets 5-day weather forecast

### Sample API Response

```json
{
  "name": "London",
  "main": {
    "temp": 15.5,
    "feels_like": 14.2,
    "humidity": 75,
    "pressure": 1013
  },
  "weather": [{
    "main": "Clouds",
    "description": "scattered clouds",
    "icon": "03d"
  }],
  "wind": {
    "speed": 3.2
  }
}
```

## 🎨 How the UI Works

### Component Structure

1. **Header**: App title and subtitle
2. **Search Section**: City input and location button
3. **Loading State**: Spinner and loading message
4. **Error State**: Error message with retry button
5. **Weather Content**: Current weather and forecast cards

### State Management

The app manages several states:
- **Loading**: Shows spinner while fetching data
- **Error**: Shows error message if something goes wrong
- **Success**: Shows weather data when everything works
- **Temperature Unit**: Tracks Celsius/Fahrenheit preference

### Responsive Design

- **Mobile**: Single column layout, stacked elements
- **Tablet**: Two-column weather stats
- **Desktop**: Full layout with side-by-side elements

## 🔄 How Data Flows

1. **User Input**: User types a city name or clicks location button
2. **API Request**: JavaScript builds URL and fetches data
3. **Data Processing**: Raw API data is formatted for display
4. **UI Update**: DOM elements are updated with new data
5. **State Save**: User preferences are saved to localStorage

## 🛠️ Key JavaScript Concepts

### Fetch API
```javascript
// Making an API request
const response = await fetch(url);
const data = await response.json();
```

### Event Handling
```javascript
// Responding to user clicks
button.addEventListener('click', handleClick);

// Responding to keyboard input
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});
```

### DOM Manipulation
```javascript
// Updating content
element.textContent = newValue;
element.innerHTML = newHTML;

// Creating new elements
const newElement = document.createElement('div');
newElement.className = 'my-class';
```

### localStorage
```javascript
// Saving data
localStorage.setItem('key', JSON.stringify(data));

// Loading data
const data = JSON.parse(localStorage.getItem('key'));
```

## 🎯 Temperature Conversion

The app handles temperature conversion between Celsius and Fahrenheit:

```javascript
// Celsius to Fahrenheit
function toFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

// Fahrenheit to Celsius
function toCelsius(fahrenheit) {
    return (fahrenheit - 32) * 5/9;
}
```

## 🚨 Error Handling

The app handles various error scenarios:

1. **City Not Found (404)**: "Couldn't find that city. Try searching for a major city."
2. **Network Error**: "Network error. Please check your internet connection."
3. **API Limit (429)**: "API rate limit reached. Please wait a few minutes."
4. **Invalid API Key (401)**: "Invalid API key. Please check your configuration."
5. **Location Denied**: "Location access denied. You can still search manually."

## 🔧 Troubleshooting

### Common Issues

#### 1. "API key not valid" error
- **Solution**: Make sure you copied the entire API key
- **Solution**: Wait a few hours after creating your account (activation delay)
- **Solution**: Check that you're using the correct API key

#### 2. "City not found" error
- **Solution**: Try using the city's English name
- **Solution**: Add country code: "London,UK" or "Paris,FR"
- **Solution**: Check spelling and try alternative names

#### 3. "Network error"
- **Solution**: Check your internet connection
- **Solution**: Try refreshing the page
- **Solution**: Check if OpenWeatherMap is down (rare)

#### 4. "Rate limit exceeded"
- **Solution**: Free tier allows 60 calls per minute
- **Solution**: Wait a minute and try again
- **Solution**: Consider upgrading to a paid plan

### Debugging Tips

1. **Open Browser Developer Tools** (F12)
2. **Check Console** for error messages
3. **Check Network Tab** to see API requests
4. **Verify API Key** in config.js
5. **Test with Simple Cities** like "London" or "New York"

## 🎓 Learning Path

### Beginner Level
- [x] Understand HTML structure
- [x] Learn basic CSS styling
- [x] Understand JavaScript basics
- [x] Learn about APIs and fetch()

### Intermediate Level
- [ ] Add more weather data (UV index, air quality)
- [ ] Implement 7-day forecast
- [ ] Add weather alerts
- [ ] Create weather maps

### Advanced Level
- [ ] Add multiple city comparison
- [ ] Implement weather notifications
- [ ] Add historical weather data
- [ ] Create a weather widget

## 🔒 Security Notes

### API Key Security
- **Current Setup**: API key is visible in browser (fine for learning)
- **Production**: Use a backend server to hide API keys
- **Best Practice**: Never commit API keys to public repositories

### CORS and HTTPS
- **Development**: Works fine with local files
- **Production**: Requires HTTPS for geolocation features

## 🌟 Features Overview

### ✅ Implemented Features
- Current weather display
- 5-day forecast
- City search functionality
- Geolocation support
- Temperature unit toggle (°C/°F)
- Responsive design
- Loading and error states
- localStorage persistence
- Accessibility features
- Modern UI/UX

### 🚀 Potential Enhancements
- Weather maps integration
- Air quality data
- Weather alerts
- Multiple city comparison
- Weather notifications
- Historical data
- Weather widgets
- Dark/light theme toggle

## 📖 Code Comments

The code is heavily commented to help you learn:

```javascript
/**
 * This function does something important
 * @param {string} param1 - Description of parameter
 * @returns {string} Description of return value
 */
function exampleFunction(param1) {
    // This comment explains what this line does
    const result = param1.toUpperCase();
    
    // Another comment explaining the next step
    return result;
}
```

## 🤝 Contributing

We welcome contributions from everyone, especially beginners! This is a learning project designed to help developers understand web development concepts.

### How to Contribute

1. **Fork the repository** - Click the "Fork" button in the top-right corner
2. **Clone your fork** - `git clone https://github.com/YOUR_USERNAME/weather-app.git`
3. **Create a feature branch** - `git checkout -b feature/your-feature-name`
4. **Make your changes** - Edit files and add comments explaining your code
5. **Test thoroughly** - Make sure everything works as expected
6. **Commit your changes** - `git commit -m "Add: brief description"`
7. **Push to your fork** - `git push origin feature/your-feature-name`
8. **Create a pull request** - Go to your fork and click "Compare & pull request"

### What to Contribute

- 🐛 **Bug fixes** - Report and fix any issues you find
- ✨ **New features** - Add weather maps, air quality data, etc.
- 📚 **Documentation** - Improve README, add tutorials, etc.
- 🎨 **UI/UX improvements** - Better design, animations, accessibility
- 🔧 **Code quality** - Refactoring, performance optimizations
- 🧪 **Testing** - Add unit tests or integration tests

### For Beginners

- Start with issues labeled "good first issue"
- Don't be afraid to ask questions
- Every contribution, no matter how small, is valuable
- Check out [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines

For more detailed information, see our [Contributing Guidelines](CONTRIBUTING.md).

## 📄 License

This project is open source and available under the [MIT License](LICENSE). This means you can:

- ✅ Use the code for commercial purposes
- ✅ Modify and adapt the code
- ✅ Distribute the code
- ✅ Use it privately
- ✅ Sublicense the code

The only requirement is that you include the original license and copyright notice.

For more details, see the [LICENSE](LICENSE) file.

## 🙏 Acknowledgments

- **OpenWeatherMap** for providing the weather API
- **MDN Web Docs** for excellent JavaScript documentation
- **CSS-Tricks** for responsive design inspiration

## 📞 Support

If you get stuck or have questions:

1. **Check the troubleshooting section** above for common issues
2. **Look at the browser console** for error messages (F12 → Console tab)
3. **Verify your API key** is correct in config.js
4. **Try searching for a simple city name** first (like "London" or "New York")
5. **Check the [CHANGELOG.md](CHANGELOG.md)** for recent updates and fixes
6. **Create an issue** on GitHub if you need help

### Getting Help

- 🐛 **Found a bug?** Create an issue with the "bug" label
- 💡 **Have a feature request?** Create an issue with the "enhancement" label
- ❓ **Need help?** Create an issue with the "question" label
- 📚 **Want to contribute?** Check out [CONTRIBUTING.md](CONTRIBUTING.md)

### Community

- Join discussions in the GitHub Issues section
- Share your improvements and modifications
- Help other beginners learn from your experience

---

**Happy Coding! 🌤️**

*Remember: The best way to learn is to experiment. Try changing colors, adding new features, or modifying the layout. Don't be afraid to break things - that's how you learn!*
