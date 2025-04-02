import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { WeatherData } from '@/services/weatherService';

interface WeatherWidgetProps {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather, loading, error }) => {
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
