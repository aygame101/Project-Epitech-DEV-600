import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Constants from 'expo-constants';

// Configuration Trello
const API_KEY = Constants.expoConfig?.extra?.apiKey;
const API_TOKEN = Constants.expoConfig?.extra?.token;

const WorkspaceBoardsModal = () => {
  const route = useRoute();
  const { workspaceId, workspaceName } = route.params;
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBoards = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.trello.com/1/organizations/${workspaceId}/boards?key=${API_KEY}&token=${API_TOKEN}`
        );

        if (!response.ok) throw new Error('Échec de la récupération des tableaux');

        const data = await response.json();
        setBoards(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoards();
  }, [workspaceId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workspace : {workspaceName}</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#FFA500" />
      ) : (
        <FlatList
          data={boards}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.boardItemContainer}>
              <Text style={styles.boardItem}>{item.name}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFA500',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  boardItemContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
    marginVertical: 4,
    backgroundColor: '#1f1f1f',
    borderRadius: 5,
  },
  boardItem: {
    color: '#FFFFFF',
  },
});

export default WorkspaceBoardsModal;
