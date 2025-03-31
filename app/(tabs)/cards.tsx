import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

type CardProps = {
  id: string;
  name: string;
  desc?: string;
};

const Card: React.FC<CardProps> = ({ id, name, desc }) => {
  return (
    <ThemedView style={styles.card}>
      <ThemedText style={styles.cardName}>{name}</ThemedText>
      {desc && <ThemedText style={styles.cardDesc}>{desc}</ThemedText>}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#e2e4e6',
    borderRadius: 8,
    padding: 15,
    marginVertical: 5,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardDesc: {
    fontSize: 14,
    marginTop: 4,
  },
});

export default Card;
