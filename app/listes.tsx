import { StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useLocalSearchParams } from 'expo-router';

export default function ListesScreen() {
  const { listsData } = useLocalSearchParams();
  const lists = listsData ? JSON.parse(listsData as string) : [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Listes Trello
      </ThemedText>
      
      {lists.map((list: any) => (
        <ThemedView key={list.id} style={styles.listItem}>
          <ThemedText type="defaultSemiBold">{list.name}</ThemedText>
          <ThemedText type="default">ID: {list.id}</ThemedText>
          <ThemedText type="default">
            Statut: {list.closed ? "Fermée" : "Ouverte"}
          </ThemedText>
        </ThemedView>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  listItem: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});