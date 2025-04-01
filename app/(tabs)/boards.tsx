import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, FlatList, SafeAreaView, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { boardServices } from '@/services/boardService';
import { Board } from '@/types/Board';
import { styles } from '../styles/boardsStyle';

export default function BoardsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [newBoardName, setNewBoardName] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
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
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      Alert.alert('Erreur', message);
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
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      Alert.alert('Erreur', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditButtonPress = (board: Board) => {
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
      if (editingBoard) {
        await boardServices.updateBoard(editingBoard.id, { name: updatedBoardName });
        
        setBoards(boards.map(board => 
          board.id === editingBoard.id 
            ? { ...board, name: updatedBoardName }
            : board
        ));
      }
      
      setEditModalVisible(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      Alert.alert('Erreur', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
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
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      Alert.alert('Erreur', message);
            } finally {
              setIsLoading(false);
            }
          }, 
          style: 'destructive' 
        }
      ]
    );
  };

  const handleBoardPress = (board: Board) => {
    router.push(`/board/${board.id}`);
  };

  const renderBoardItem = ({ item }: { item: Board }) => (
    <TouchableWithoutFeedback onPress={() => handleBoardPress(item)}>
      <View style={styles.boardCard}>
        <Text style={styles.boardName}>{item.name}</Text>
        {item.desc && <Text style={styles.boardDesc}>{item.desc}</Text>}
        
        <View style={styles.boardActions}>
          <TouchableOpacity 
            testID={`edit-button-${item.id}`}
            style={styles.editButton}
            onPress={(e) => {
              e.stopPropagation();
              handleEditButtonPress(item);
            }}
          >
            <Text>✏️</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            testID={`delete-button-${item.id}`}
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
            testID="board-name-input"
            style={styles.input}
            placeholder="Nom du tableau à créer"
            placeholderTextColor="#ccc"
            value={newBoardName}
            onChangeText={setNewBoardName}
          />
          <TouchableOpacity 
            testID="create-board-button"
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
            <ActivityIndicator testID="loading-indicator" size="large" color="#FFA500" />
          </View>
        ) : (
          <>
            {boards.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Aucun tableau pour le moment</Text>
              </View>
            ) : (
              <FlatList
                testID="boards-list"
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