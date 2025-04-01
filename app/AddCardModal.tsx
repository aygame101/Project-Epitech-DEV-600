import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { cardServices } from '@/services/cardService';

type AddCardModalProps = {
  listId: string;
  onClose: () => void;
  onAddCard: (cardName: string, cardDesc?: string) => void;
};

const AddCardModal: React.FC<AddCardModalProps> = ({ listId, onClose, onAddCard }) => {
  const [newCardName, setNewCardName] = useState('');
  const [newCardDesc, setNewCardDesc] = useState('');

  const handleAddCard = async () => {
    if (!newCardName.trim()) {
      Alert.alert('Erreur', 'Le nom de la carte est requis');
      return;
    }

    try {
      const newCard = await cardServices.addCard(listId, newCardName, newCardDesc);
      Alert.alert('Succès', `Carte ajoutée: ${newCard.name}`);
      onAddCard(newCardName, newCardDesc);
      onClose();
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  return (
    <ThemedView style={styles.modalContent}>
      <ThemedText type="title">Ajouter une carte</ThemedText>
      <TextInput
        placeholder="Nom de la carte"
        value={newCardName}
        onChangeText={setNewCardName}
        style={styles.input}
      />
      <TextInput
        placeholder="Description de la carte"
        value={newCardDesc}
        onChangeText={setNewCardDesc}
        style={styles.input}
      />
      <View style={styles.buttonRow}>
        <Button title="Annuler" onPress={onClose} />
        <Button title="Ajouter" onPress={handleAddCard} />
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: 'white',
    width: '90%',
    padding: 20,
    borderRadius: 10,
    gap: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
});

export default AddCardModal;
