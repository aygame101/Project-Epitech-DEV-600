import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, FlatList, SafeAreaView, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { boardServices } from '@/services/boardService';
import { Board } from '@/types/Board';
import { styles } from '../../styles/boardsStyle';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal'; // Importez le modal de suppression

export default function BoardsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [newBoardName, setNewBoardName] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [updatedBoardName, setUpdatedBoardName] = useState('');
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  
  // États pour le modal de confirmation de suppression
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);

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

  const openTemplateModal = () => {
    if (!newBoardName.trim()) {
      Alert.alert('Info', 'Veuillez saisir un nom de tableau');
      return;
    }
    setTemplateModalVisible(true);
  };

  const handleCreateBoard = async (isKanban: boolean) => {
    if (!newBoardName.trim()) {
      Alert.alert('Erreur', 'Le nom du tableau ne peut pas être vide');
      return;
    }
    
    setIsLoading(true);
    try {
      const newBoard = await boardServices.createBoard(newBoardName, isKanban);
      setBoards([...boards, newBoard]);
      setNewBoardName('');
      setTemplateModalVisible(false);
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

  // Nouvelle fonction pour montrer le modal de suppression
  const showDeleteConfirmation = (boardId: string) => {
    setBoardToDelete(boardId);
    setDeleteModalVisible(true);
  };

  // Fonction pour confirmer la suppression
  const confirmDeleteBoard = async () => {
    if (!boardToDelete) return;
    
    setIsDeleting(true);
    try {
      await boardServices.deleteBoard(boardToDelete);
      setBoards(boards.filter(board => board.id !== boardToDelete));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      Alert.alert('Erreur', message);
    } finally {
      setIsDeleting(false);
      setDeleteModalVisible(false);
      setBoardToDelete(null);
    }
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
              showDeleteConfirmation(item.id); // Utiliser la nouvelle fonction
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
            onPress={openTemplateModal} 
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
        
        {/* Modal de confirmation de suppression */}
        <DeleteConfirmationModal
          visible={deleteModalVisible}
          title="Supprimer le tableau"
          message="Êtes-vous sûr de vouloir supprimer ce tableau ?"
          isDeleting={isDeleting}
          onCancel={() => setDeleteModalVisible(false)}
          onConfirm={confirmDeleteBoard}
        />
        
        {renderEditModal()}
        
        {/* Simple Creation Modal */}
        <Modal
          transparent={true}
          visible={templateModalVisible}
          animationType="fade"
          onRequestClose={() => setTemplateModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: '50%', width: '80%' }]}>
              <Text style={styles.modalTitle}>Type de tableau</Text>
              
              <View style={{ gap: 16, marginTop: 20 }}>
                <TouchableOpacity
                  style={styles.templateItem}
                  onPress={() => {
                    handleCreateBoard(false);
                    setTemplateModalVisible(false);
                  }}
                >
                  <Text style={styles.templateTitle}>Tableau vide</Text>
                  <Text style={styles.templateDescription}>Pas de listes prédéfinies</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.templateItem}
                  onPress={() => {
                    handleCreateBoard(true);
                    setTemplateModalVisible(false);
                  }}
                >
                  <Text style={styles.templateTitle}>Kanban</Text>
                  <Text style={styles.templateDescription}>Listes "To Do", "Doing", "Done"</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton, { marginTop: 16 }]}
                onPress={() => setTemplateModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}