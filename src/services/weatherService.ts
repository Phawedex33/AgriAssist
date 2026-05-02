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
 * Fetches current weather data for a specific location.
 * Uses the Open-Meteo public API (no key required for demo).
 */
export async function getLocalWeather(lat?: number, lon?: number): Promise<WeatherData> {
  try {
    // Default to a central rural coordinate if none provided (e.g., near Nairobi, Kenya)
    const latitude = lat ?? -1.286389;
    const longitude = lon ?? 36.817223;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code&timezone=auto`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error("Weather API Response Failed");
    
    const data = await response.json();
    const current = data.current;

    // Map WMO Weather Codes to human readable conditions
    const interpretCode = (code: number) => {
      if (code === 0) return "Clear Sky";
      if (code <= 3) return "Partly Cloudy";
      if (code >= 51 && code <= 67) return "Rainy";
      if (code >= 71 && code <= 86) return "Snowy";
      if (code >= 95) return "Thunderstorm";
      return "Overcast";
    };

    return {
      temperature: Math.round(current.temperature_2m),
      rainProbability: current.precipitation_probability ?? (current.weather_code > 50 ? 80 : 10),
      humidity: current.relative_humidity_2m,
      condition: interpretCode(current.weather_code)
    };
  } catch (error) {
    console.error("Weather Service Error:", error);
    // Fallback to static realistic data on failure to keep demo functional
    return {
      temperature: 26,
      rainProbability: 20,
      humidity: 60,
      condition: "Partly Cloudy (Simulated)"
    };
  }
}
