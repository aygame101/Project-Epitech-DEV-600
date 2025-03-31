import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, FlatList, SafeAreaView, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { boardServices } from '@/services/boardService';

export default function BoardsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [boards, setBoards] = useState([]);
  const [newBoardName, setNewBoardName] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [updatedBoardName, setUpdatedBoardName] = useState('');

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

  const handleEditButtonPress = (board) => {
    setEditingBoard(board);
    setUpdatedBoardName(board.name);
    setEditModalVisible(true);
  };

  const handleUpdateBoard = async () => {
    if (!updatedBoardName.trim()) {
      Alert.alert('Erreur', 'Le nom du tableau ne peut pas être vide');
      return;
    }
    
    setIsLoading(true);
    try {
      // Supposons que boardServices a une méthode updateBoard
      await boardServices.updateBoard(editingBoard.id, { name: updatedBoardName });
      
      // Mettre à jour l'état local des tableaux
      setBoards(boards.map(board => 
        board.id === editingBoard.id 
          ? { ...board, name: updatedBoardName }
          : board
      ));
      
      // Fermer le modal
      setEditModalVisible(false);
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
        
        <View style={styles.boardActions}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={(e) => {
              e.stopPropagation();
              handleEditButtonPress(item);
            }}
          >
            <Text>✏️</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteBoard(item.id);
            }}
          >
            <Text>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
  
  // Modal pour éditer le nom du tableau
  const renderEditModal = () => (
    <Modal
      transparent={true}
      visible={editModalVisible}
      animationType="fade"
      onRequestClose={() => setEditModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Modifier le nom du tableau</Text>
              
              <TextInput
                style={styles.modalInput}
                value={updatedBoardName}
                onChangeText={setUpdatedBoardName}
                placeholder="Nouveau nom du tableau"
                placeholderTextColor="#ccc"
                autoFocus={true}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]} 
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Annuler</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]} 
                  onPress={handleUpdateBoard}
                  disabled={!updatedBoardName.trim()}
                >
                  <Text style={styles.modalButtonText}>Enregistrer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>TrellUwU</Text>
        
        <View style={styles.createContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nom du tableau à créer"
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
        
        <Text style={styles.sectionTitle}>Mes tableaux récents</Text>
        
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
        
        {renderEditModal()}
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
  boardActions: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
  },
  editButton: {
    padding: 5,
    marginRight: 5,
  },
  deleteButton: {
    padding: 5,
  },
  // Styles pour le modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  modalTitle: {
    color: '#FFA500',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#333',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#444',
  },
  saveButton: {
    backgroundColor: '#FFA500',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});