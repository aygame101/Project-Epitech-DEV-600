import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

export default function ListesScreen() {
  const [lists, setLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLists = async () => {
    try {
      const response = await fetch(
        'https://api.trello.com/1/boards/67c57c68fba2da997c1e5616/lists?key=625a06c8525ea14e94d75b7f03cf6051&token=ATTA75822e9f3501426780c7190ff61203b040e0e98bf64106f13f27ad4950990137C0A0BA60&fields=name,id,closed'
      );
      
      if (!response.ok) throw new Error('Échec du chargement');
      setLists(await response.json());
    } catch (error) {
      Alert.alert('Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(() => {
    fetchLists();
  });

  const archiveList = async (listId: string) => {
    try {
      const response = await fetch(
        `https://api.trello.com/1/lists/${listId}/closed?value=true&key=625a06c8525ea14e94d75b7f03cf6051&token=ATTA75822e9f3501426780c7190ff61203b040e0e98bf64106f13f27ad4950990137C0A0BA60`,
        { method: 'PUT' }
      );

      if (!response.ok) throw new Error('Échec de l\'archivage');
      await fetchLists(); // Rafraîchit la liste
      Alert.alert('Succès', 'Liste archivée !');
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Listes Trello {loading && '(Chargement...)'}
      </ThemedText>

      {lists.map((list) => (
        <ThemedView key={list.id} style={styles.listItem}>
          <ThemedView style={styles.listHeader}>
            <ThemedText type="defaultSemiBold" style={styles.listName}>
              {list.name}
            </ThemedText>
            
            <TouchableOpacity 
              onPress={() => 
                Alert.alert('Confirmer', `Archiver "${list.name}" ?`, [
                  { text: 'Non' },
                  { text: 'Oui', onPress: () => archiveList(list.id) }
                ])
              }
            >
              <Feather name="trash-2" size={20} color="#ff4444" />
            </TouchableOpacity>
          </ThemedView>

          <ThemedText type="default">ID: {list.id}</ThemedText>
        </ThemedView>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  title: {
    marginBottom: 25,
    textAlign: 'center',
  },
  listItem: {
    padding: 15,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listName: {
    flex: 1,
    marginRight: 10,
  },
});