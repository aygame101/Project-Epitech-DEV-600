import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, FlatList, SafeAreaView, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { boardServices } from '@/services/boardService';

export default function BoardsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [boards, setBoards] = useState([]);
  const [newBoardName, setNewBoardName] = useState('');

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    setIsLoading(true);
    try {
      const data = await boardServices.getBoards();
      setBoards(data);
    } catch (error) {
      Alert.alert('Erreur', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) {
      Alert.alert('Erreur', 'Le nom du tableau ne peut pas être vide');
      return;
    }
    
    setIsLoading(true);
    try {
      const newBoard = await boardServices.createBoard(newBoardName);
      setBoards([...boards, newBoard]);
      setNewBoardName('');
    } catch (error) {
      Alert.alert('Erreur', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBoard = async (boardId) => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer ce tableau ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          onPress: async () => {
            setIsLoading(true);
            try {
              await boardServices.deleteBoard(boardId);
              setBoards(boards.filter(board => board.id !== boardId));
            } catch (error) {
              Alert.alert('Erreur', error.message);
            } finally {
              setIsLoading(false);
            }
          }, 
          style: 'destructive' 
        }
      ]
    );
  };

  const handleBoardPress = (board) => {
    router.push(`/board/${board.id}`);
  };

  const renderBoardItem = ({ item }) => (
    <TouchableWithoutFeedback onPress={() => handleBoardPress(item)}>
      <View style={styles.boardCard}>
        <Text style={styles.boardName}>{item.name}</Text>
        {item.desc && <Text style={styles.boardDesc}>{item.desc}</Text>}
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteBoard(item.id)}
        >
          <Text>🗑️</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>TrellUwU</Text>
        
        <View style={styles.createContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nom du tableau"
            placeholderTextColor="#ccc"
            value={newBoardName}
            onChangeText={setNewBoardName}
          />
          <TouchableOpacity 
            style={styles.createButton} 
            onPress={handleCreateBoard} 
            disabled={isLoading || !newBoardName.trim()}
          >
            <Text style={styles.createButtonText}>Créer</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionTitle}>Mes tableaux</Text>
        
        {isLoading && boards.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFA500" />
          </View>
        ) : (
          <>
            {boards.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aucun tableau pour le moment</Text>
              </View>
            ) : (
              <FlatList
                data={boards}
                keyExtractor={(item) => item.id}
                renderItem={renderBoardItem}
                numColumns={2}
                columnWrapperStyle={styles.boardRow}
                refreshing={isLoading}
                onRefresh={fetchBoards}
              />
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFA500',
    marginBottom: 24,
    alignSelf: 'flex-start',
    fontFamily: 'Pacifico',
  },
  createContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 48,
    borderColor: '#555',
    borderWidth: 1,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    backgroundColor: '#333',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  createButton: {
    marginLeft: 8,
    backgroundColor: '#FFA500',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  createButtonText: {
    color: '#121212',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
  boardRow: {
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  boardCard: {
    width: '48%',
    height: 150,
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 8,
  },
  boardName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  boardDesc: {
    color: '#BBBBBB',
    fontSize: 14,
    textAlign: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 5,
  },
});