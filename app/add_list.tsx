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
import { useColorScheme } from 'react-native';

export default function TableauxScreen() {
  const [listName, setListName] = useState('');
  const colorScheme = useColorScheme();

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
    <ThemedView style={{ flex: 1 }}>
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

            <ThemedView style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colorScheme === 'dark' ? '#fff' : '#000',
                    borderColor: colorScheme === 'dark' ? '#404040' : '#ddd'
                  }
                ]}
                placeholder="Nom de la liste"
                placeholderTextColor={colorScheme === 'dark' ? '#8e8e93' : '#888'}
                value={listName}
                onChangeText={setListName}
                onSubmitEditing={handleAddList}
                returnKeyType="done"
              />
            </ThemedView>

            <View style={styles.buttonContainer}>
              <Button
                title="Ajouter une liste"
                onPress={handleAddList}
                color={colorScheme === 'dark' ? '#0A84FF' : '#007AFF'}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  title: {
    marginBottom: 30,
    marginTop: Platform.OS === 'ios' ? 40 : 20,
    textAlign: 'center'
  },
  inputWrapper: {
    width: '100%',
    maxWidth: 300,
    borderRadius: 8,
    overflow: 'hidden'
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: 'transparent'
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden'
  }
});