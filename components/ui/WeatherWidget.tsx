import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { fetchWeatherByCity, WeatherData } from '@/services/weatherService';

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWeather = async () => {
      try {
        // Ville par défaut : Paris
        const weatherData = await fetchWeatherByCity('Paris');
        setWeather(weatherData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur météo');
      } finally {
        setLoading(false);
      }
    };
    loadWeather();
  }, []);
  if (loading) {
    return (
      <View style={styles.widget}>
        <ActivityIndicator size="small" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.widget}>
        <Text style={styles.errorText}>⚠️</Text>
      </View>
    );
  }

  if (weather) {
    let weatherIcon = '☀️';
    if (weather.weather?.[0]?.id) {
      const weatherId = weather.weather[0].id;
      if (weatherId >= 200 && weatherId < 300) weatherIcon = '⚡';
      else if (weatherId >= 300 && weatherId < 500) weatherIcon = '🌦️';
      else if (weatherId >= 500 && weatherId < 600) weatherIcon = '🌧️';
      else if (weatherId >= 600 && weatherId < 700) weatherIcon = '❄️';
      else if (weatherId >= 700 && weatherId < 800) weatherIcon = '🌫️';
      else if (weatherId > 800) weatherIcon = '☁️';
    }

    return (
      <View style={styles.widget}>
        <Text style={styles.temp}>{weatherIcon} {Math.round(weather.main?.temp)}°C</Text>
        <Text style={styles.city}>{weather.name}</Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  widget: {
    backgroundColor: '#0000',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  temp: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  city: {
    fontSize: 12,
    color: '#eee',
  },
  errorText: {
    fontSize: 18,
    color: '#ffcc00',
  }
});

export default WeatherWidget;
