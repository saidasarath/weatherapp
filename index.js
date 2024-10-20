const weatherForm = document.querySelector(".weatherform");
const cityInput = document.querySelector(".cityInput");
const card = document.querySelector(".card");
const summaryCard = document.querySelector(".summary-card");
const tempUnitSelect = document.querySelector("#tempUnit");
const apiKey = "c65bc76d4a10b8ae6aecca012d475ee4";

// Default to Celsius
let tempUnit = "C";

// Event listener for the temperature unit selection
tempUnitSelect.addEventListener("change", () => {
  tempUnit = tempUnitSelect.value;
});

// Variables for storing weather and forecast data
let forecastData = [];
const temperatureThreshold = 35; // Define the threshold in °C

weatherForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    try {
      const currentWeatherData = await getWeatherData(city);
      const forecastWeatherData = await getForecastData(city);
      
      displayWeatherInfo(currentWeatherData);
      displayForecastInfo(forecastWeatherData);
      displayForecastSummary(forecastWeatherData);
      checkAlertConditions(currentWeatherData); // Check alert condition after displaying the weather
    } catch (error) {
      console.error(error);
      displayError("Could not retrieve weather data. Please try again.");
    }
  } else {
    displayError("Please enter a valid city name.");
  }
});

// Function to get current weather data
async function getWeatherData(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error("Could not fetch weather data");
  }
  return await response.json();
}

// Function to get 5-day forecast data
async function getForecastData(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;
  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error("Could not fetch forecast data");
  }
  return await response.json();
}

// Function to convert temperature
function convertTemperature(kelvin) {
  if (tempUnit === "C") {
    return `${(kelvin - 273.15).toFixed(1)}°C`; // Celsius
  } else if (tempUnit === "F") {
    return `${((kelvin - 273.15) * 9/5 + 32).toFixed(1)}°F`; // Fahrenheit
  }
}

// Display current weather information
function displayWeatherInfo(data) {
  const { name: city, main: { temp, humidity, pressure }, wind: { speed: windSpeed }, weather: [{ description, id }] } = data;
  card.textContent = "";
  card.style.display = "flex";

  const cityDisplay = document.createElement("h1");
  const tempDisplay = document.createElement("p");
  const humidityDisplay = document.createElement("p");
  const windDisplay = document.createElement("p");
  const pressureDisplay = document.createElement("p");
  const descDisplay = document.createElement("p");
  const weatherEmoji = document.createElement("p");

  cityDisplay.textContent = city;
  tempDisplay.textContent = `Temperature: ${convertTemperature(temp)}`;
  humidityDisplay.textContent = `Humidity: ${humidity}%`;
  windDisplay.textContent = `Wind Speed: ${windSpeed} m/s`;
  pressureDisplay.textContent = `Pressure: ${pressure} hPa`;
  descDisplay.textContent = description;
  weatherEmoji.textContent = getWeatherEmoji(id);

  card.appendChild(cityDisplay);
  card.appendChild(tempDisplay);
  card.appendChild(humidityDisplay);
  card.appendChild(windDisplay);
  card.appendChild(pressureDisplay);
  card.appendChild(descDisplay);
  card.appendChild(weatherEmoji);
}

// Display forecast information for the next 5 days
function displayForecastInfo(forecastData) {
  const forecastContainer = document.createElement("div");
  forecastContainer.classList.add("forecastContainer");

  forecastData.list.forEach((forecast, index) => {
    if (index % 8 === 0) { // Display one forecast for each day (API returns data every 3 hours)
      const forecastCard = document.createElement("div");
      const date = new Date(forecast.dt * 1000);
      const temp = convertTemperature(forecast.main.temp);
      const windSpeed = forecast.wind.speed;
      const humidity = forecast.main.humidity;
      const description = forecast.weather[0].description;

      forecastCard.innerHTML = `
        <h3>${date.toDateString()}</h3>
        <p>Temp: ${temp}</p>
        <p>Wind: ${windSpeed} m/s</p>
        <p>Humidity: ${humidity}%</p>
        <p>${description}</p>
      `;

      forecastContainer.appendChild(forecastCard);
    }
  });

  summaryCard.appendChild(forecastContainer);
}

// Function to display summarized aggregates based on forecast data
function displayForecastSummary(data) {
  const tempValues = data.list.map((item) => item.main.temp);
  const windValues = data.list.map((item) => item.wind.speed);
  const humidityValues = data.list.map((item) => item.main.humidity);

  const avgTemp = (tempValues.reduce((sum, value) => sum + (value - 273.15), 0) / tempValues.length).toFixed(1);
  const maxTemp = Math.max(...tempValues.map((t) => t - 273.15)).toFixed(1);
  const minTemp = Math.min(...tempValues.map((t) => t - 273.15)).toFixed(1);

  const avgWind = (windValues.reduce((sum, value) => sum + value, 0) / windValues.length).toFixed(1);
  const avgHumidity = (humidityValues.reduce((sum, value) => sum + value, 0) / humidityValues.length).toFixed(1);

  summaryCard.innerHTML = `
    <h2>Forecast Summary (Next 5 Days)</h2>
    <p>Average Temp: ${avgTemp}°C</p>
    <p>Max Temp: ${maxTemp}°C</p>
    <p>Min Temp: ${minTemp}°C</p>
    <p>Average Wind Speed: ${avgWind} m/s</p>
    <p>Average Humidity: ${avgHumidity}%</p>
  `;
}

// Function to check for alert conditions (temperature threshold)
function checkAlertConditions(data) {
  const currentTempCelsius = data.main.temp - 273.15; // Convert from Kelvin to Celsius
  if (currentTempCelsius > temperatureThreshold) {
    triggerAlert(`Temperature in ${data.name} exceeded ${temperatureThreshold}°C!`);
  }
}

// Function to trigger the alert message
function triggerAlert(message) {
  const alertDisplay = document.createElement("p");
  alertDisplay.textContent = message;
  alertDisplay.classList.add("alertDisplay");
  alertDisplay.style.color = "red";
  card.appendChild(alertDisplay);
}

// Function to map weather codes to emojis
function getWeatherEmoji(weatherId) {
  switch (true) {
    case weatherId >= 200 && weatherId < 300:
      return "🌧️";
    case weatherId >= 300 && weatherId < 400:
      return "🌧️";
    case weatherId >= 500 && weatherId < 600:
      return "🌧️";
    case weatherId >= 600 && weatherId < 700:
      return "❄️";
    case weatherId >= 700 && weatherId < 800:
      return "🍃";
    case weatherId == 800:
      return "☀️";
    case weatherId >= 801 && weatherId < 810:
      return "☁️";
    default:
      return "❓";
  }
}

// Function to display error messages
function displayError(message) {
  const errorDisplay = document.createElement("p");
  errorDisplay.textContent = message;
  errorDisplay.classList.add("errorDisplay");
  errorDisplay.style.color = "red";
  card.textContent = "";
  card.style.display = "flex";
  card.appendChild(errorDisplay);
}
