const API_KEY = '2dbc21e5b45a0bc43b4a10b33e4a7d77';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export type WeatherData = {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  name: string;
};

export const fetchWeatherByCoordinates = async (
  lat: number,
  lon: number
): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la récupération des données météo');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur dans weatherService:', error);
    throw error;
  }
};

export const fetchWeatherByCity = async (city: string): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erreur lors de la récupération des données météo');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur dans weatherService:', error);
    throw error;
  }
};