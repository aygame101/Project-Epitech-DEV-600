import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function TableauxScreen() {
  const [listName, setListName] = useState('');

  const handleAddList = async () => {
    if (!listName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom de liste');
      return;
    }

    try {
      const apiUrl = `https://api.trello.com/1/lists?name=${encodeURIComponent(
        listName
      )}&idBoard=67c57c68fba2da997c1e5616&key=625a06c8525ea14e94d75b7f03cf6051&token=ATTA75822e9f3501426780c7190ff61203b040e0e98bf64106f13f27ad4950990137C0A0BA60`;

      const response = await fetch(apiUrl, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la liste');
      }

      const data = await response.json();
      Alert.alert('Succès', `Liste "${data.name}" créée avec succès !`);
      setListName(''); // Réinitialiser le champ de texte
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Tableaux Screen</ThemedText>
      <TextInput
        style={styles.input}
        placeholder="Nom de la liste"
        value={listName}
        onChangeText={setListName}
      />
      <Button title="Ajouter une liste" onPress={handleAddList} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
});