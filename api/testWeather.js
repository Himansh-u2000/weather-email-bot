require('dotenv').config(); // MUST be first line
const fetch = require('node-fetch');

const key = process.env.WEATHER_API_KEY;
const location = process.env.LOCATION || 'Deoghar';

console.log('Loaded WEATHER_API_KEY:', key); // This should print your actual key

const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${key}&units=metric`;

(async () => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('HTTP status:', response.status);
    console.log('Weather data:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
