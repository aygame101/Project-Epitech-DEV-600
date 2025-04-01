import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router'; // Import useRouter from expo-router instead
import Constants from 'expo-constants';

// Configuration Trello
const API_KEY = Constants.expoConfig?.extra?.apiKey;
const API_TOKEN = Constants.expoConfig?.extra?.token;

const WorkspaceBoardsModal = () => {
  const route = useRoute();
  const router = useRouter(); // Use Expo Router instead of navigation
  const { workspaceId, workspaceName } = route.params;
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newBoardName, setNewBoardName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
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

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return;
    
    setIsCreating(true);
    try {
      const response = await fetch(
        `https://api.trello.com/1/boards/?name=${encodeURIComponent(newBoardName)}&idOrganization=${workspaceId}&key=${API_KEY}&token=${API_TOKEN}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Échec de la création du tableau');

      const newBoard = await response.json();
      setBoards([...boards, newBoard]);
      setNewBoardName(''); // Réinitialiser le champ
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle board selection - using Expo Router
  const handleBoardPress = (boardId, boardName) => {
    // Navigate to the board detail screen using the appropriate path
    router.push({
      pathname: '/board/[id]',
      params: { id: boardId }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Workspace : {workspaceName}</Text>
      
      {/* Champ d'ajout de tableau */}
      <View style={styles.addBoardContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nom du tableau à créer"
          placeholderTextColor="#999"
          value={newBoardName}
          onChangeText={setNewBoardName}
        />
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={handleCreateBoard}
          disabled={isCreating || !newBoardName.trim()}
        >
          {isCreating ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.addButtonText}>Ajouter</Text>
          )}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#FFA500" />
      ) : (
        <FlatList
          data={boards}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.boardItemContainer}
              onPress={() => handleBoardPress(item.id, item.name)}
            >
              <Text style={styles.boardItem}>{item.name}</Text>
            </TouchableOpacity>
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
  addBoardContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#1f1f1f',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 5,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#FFA500',
    padding: 12,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#121212',
    fontWeight: 'bold',
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