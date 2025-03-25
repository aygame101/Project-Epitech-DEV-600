import { useState, useEffect } from 'react';
import { Image, StyleSheet, Platform, Alert, TextInput, Pressable, ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';

// Configuration Trello
const API_KEY = Constants.expoConfig?.extra?.apiKey;
const API_TOKEN = Constants.expoConfig?.extra?.token;

type TrelloBoard = {
  id: string;
  name: string;
  desc?: string;
  url: string;
  prefs?: {
    backgroundImage?: string;
  };
};

export default function HomeScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [boards, setBoards] = useState<TrelloBoard[]>([]);
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    const fetchBoards = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.trello.com/1/members/me/boards?key=${API_KEY}&token=${API_TOKEN}&fields=name,desc,url,prefs`
        );
        
        if (!response.ok) throw new Error('Échec du chargement des tableaux');
        
        const data = await response.json();
        setBoards(data);
      } catch (error) {
        Alert.alert('Erreur', error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBoards();
  }, []);

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      Alert.alert('Erreur', 'Le nom du tableau est requis');
      return;
    }
    
    try {
      const response = await fetch(
        `https://api.trello.com/1/boards/?key=${API_KEY}&token=${API_TOKEN}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newWorkspaceName,
            defaultLists: false
          })
        }
      );
      
      if (!response.ok) throw new Error(await response.text());
      
      const newBoard = await response.json();
      setBoards([...boards, newBoard]);
      setShowCreateModal(false);
      setNewWorkspaceName('');
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleJoinWorkspace = async () => {
    if (!joinCode.trim()) {
      Alert.alert('Error', 'Please enter a valid board ID');
      return;
    }
    
    try {
      const response = await fetch(
        `https://api.trello.com/1/boards/${joinCode}?key=${API_KEY}&token=${API_TOKEN}&fields=id,name`
      );
      
      if (!response.ok) throw new Error('Board not found');
      
      const board = await response.json();
      router.push(`/workspaces/${board.id}`);
      setJoinCode('');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDeleteWorkspace = async (boardId: string) => {
    try {
      const response = await fetch(
        `https://api.trello.com/1/boards/${boardId}?key=${API_KEY}&token=${API_TOKEN}`,
        { method: 'DELETE' }
      );
      
      if (!response.ok) throw new Error('Failed to delete board');
      
      setBoards(boards.filter(board => board.id !== boardId));
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0079bf" />
        <ThemedText type="subtitle">Loading workspaces...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ParallaxScrollView
      contentContainerStyle={styles.container}
      headerBackgroundColor={{ light: '#0079bf', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      
      <ThemedView style={styles.header}>
        <ThemedText type="title">Tableaux Trello</ThemedText>
      </ThemedView>

      {boards.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <MaterialIcons name="workspaces" size={60} color="#0079bf" />
          <ThemedText type="subtitle">Aucun tableau trouvé</ThemedText>
        </ThemedView>
      ) : (
        <ThemedView style={styles.workspaceList}>
        {boards.map((board) => (
          <ThemedView key={board.id} style={styles.workspaceCard}>
            {board.prefs?.backgroundImage && (
              <Image
                source={{ uri: board.prefs.backgroundImage }}
                style={styles.boardBackground}
              />
            )}
            <Pressable
              onPress={() => router.push(`/workspaces/${board.id}`)}
              style={styles.cardContent}>
              <MaterialIcons name="dashboard" size={24} color="white" />
              <ThemedText style={styles.workspaceName}>{board.name}</ThemedText>
              {board.desc && (
                <ThemedText style={styles.workspaceDesc}>{board.desc}</ThemedText>
              )}
            </Pressable>
            <Pressable
              onPress={() => handleDeleteWorkspace(board.id)}
              style={styles.deleteButton}>
              <AntDesign name="close" size={16} color="white" />
            </Pressable>
          </ThemedView>
        ))}
      </ThemedView>
      )}

      <View style={styles.fixedFooter}>
        <Pressable
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}>
          <AntDesign name="plus" size={24} color="white" />
          <ThemedText style={styles.buttonText}>Nouveau tableau</ThemedText>
        </Pressable>
      </View>

      {showCreateModal && (
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ThemedText type="title">Créer un tableau</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Nom du tableau"
              value={newWorkspaceName}
              onChangeText={setNewWorkspaceName}
              autoFocus
            />
            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}>
                <ThemedText>Annuler</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreateWorkspace}>
                <ThemedText style={{ color: 'white' }}>Créer</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      )}
    </ParallaxScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  workspaceList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
    padding: 20,
  },
  fixedFooter: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#5aac44',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
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
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: '#ebecf0',
  },
  confirmButton: {
    backgroundColor: '#5aac44',
  },
  workspaceCard: {
    width: '48%',
    height: 150,
    borderRadius: 8,
    marginVertical: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0079bf',
  },
  boardBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
  },
  cardContent: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workspaceName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  workspaceDesc: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    padding: 5,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  actionsContainer: {
    paddingHorizontal: 15,
    gap: 15,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#5aac44',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  joinContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  joinInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  joinButton: {
    backgroundColor: '#61bd4f',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    backgroundColor: '#fff',
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});