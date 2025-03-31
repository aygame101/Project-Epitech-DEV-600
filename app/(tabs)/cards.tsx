import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { cardServices } from '@/services/cardService';

type CardProps = {
  id: string;
  name: string;
  desc?: string;
  listId: string;
};

const Card: React.FC<CardProps> = ({ id, name, desc, listId }) => {
  const [newCardName, setNewCardName] = useState('');
  const [newCardDesc, setNewCardDesc] = useState('');

  const handleAddCard = async () => {
    try {
      const card = await cardServices.addCard(listId, newCardName, newCardDesc);
      Alert.alert('Success', `Card added successfully! ${JSON.stringify(card)}`);
    } catch (error) {
      console.error('Error adding card:', error);
      Alert.alert('Error', 'Failed to add card.');
    }
  };

  return (
    <ThemedView style={styles.card}>
      <ThemedText style={styles.cardName}>{name}</ThemedText>
      {desc && <ThemedText style={styles.cardDesc}>{desc}</ThemedText>}
      <TextInput
        placeholder="New Card Name"
        value={newCardName}
        onChangeText={setNewCardName}
        style={styles.input}
      />
      <TextInput
        placeholder="New Card Description"
        value={newCardDesc}
        onChangeText={setNewCardDesc}
        style={styles.input}
      />
      <Button title="Add Card" onPress={handleAddCard} />
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
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default Card;
