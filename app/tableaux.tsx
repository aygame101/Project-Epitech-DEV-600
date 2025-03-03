import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  Button,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  View
} from 'react-native';
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
      setListName('');
      Keyboard.dismiss();
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            { paddingBottom: Platform.OS === 'android' ? 40 : 20 }
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedText type="title" style={styles.title}>
            Tableaux Screen
          </ThemedText>

          <TextInput
            style={styles.input}
            placeholder="Nom de la liste"
            placeholderTextColor="#888"
            value={listName}
            onChangeText={setListName}
            // onSubmitEditing={handleAddList}
            returnKeyType="done"
          />

          <View style={styles.buttonContainer}>
            <Button
              title="Ajouter une liste"
              onPress={handleAddList}
              color={Platform.OS === 'ios' ? '#007AFF' : '#2196F3'}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  title: {
    marginBottom: 30,
    marginTop: Platform.OS === 'ios' ? 40 : 20
  },
  input: {
    width: '100%',
    maxWidth: 300,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#fff'
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden'
  }
});