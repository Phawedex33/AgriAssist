/**
 * @file weatherService.ts
 * @description Service to fetch local weather data for agricultural advice.
 */

export interface WeatherData {
  temperature: number;
  rainProbability: number;
  humidity: number;
  condition: string;
}

/**
 * Fetches current weather data. 
 * In a real app, you would use coordinates and a key like OpenWeatherMap.
 * For this demo, we'll simulate a fetch with realistic values if the API fails or is missing.
 */
export async function getLocalWeather(): Promise<WeatherData> {
  try {
    // pattern for fetching real weather (OpenWeatherMap example)
    // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.VITE_WEATHER_API_KEY}&units=metric`);
    // const data = await response.json();
    
    // Simulate real network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Return realistic sample data common in tropical regions
    return {
      temperature: 28,
      rainProbability: 15,
      humidity: 65,
      condition: "Partly Cloudy"
    };
  } catch (error) {
    console.error("Weather Service Error:", error);
    throw new Error("Unable to fetch local weather data.");
  }
}
