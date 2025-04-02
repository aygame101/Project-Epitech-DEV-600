import { useState, useEffect } from 'react';
import { View, FlatList, SafeAreaView, ActivityIndicator, Alert, Text } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { boardServices } from '@/services/boardService';
import { Board } from '@/types/Board';
import { styles } from '../../styles/boardsStyle';

import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import BoardCard from '@/components/boards/BoardCard';
import CreateBoardSection from '@/components/boards/CreateBoardSection';
import TemplateSelectionModal from '@/components/modals/TemplateSelectionModal';
import EditBoardModal from '@/components/modals/EditBoardModal';
import WorkspaceSelectionModal from '@/components/modals/WorkspaceSelectionModal';

export default function BoardsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [newBoardName, setNewBoardName] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [updatedBoardName, setUpdatedBoardName] = useState('');
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);
  
  // New states for workspace selection
  const [workspaceModalVisible, setWorkspaceModalVisible] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [selectedWorkspaceName, setSelectedWorkspaceName] = useState<string | null>(null);

  // Effet classique qui charge les tableaux au montage initial
  useEffect(() => {
    fetchBoards();
  }, []);

  // Nouvel effet qui recharge les tableaux chaque fois que l'écran est focalisé
  useFocusEffect(
    useCallback(() => {
      fetchBoards();
      return () => {
        // Cleanup si nécessaire
      };
    }, [])
  );

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

  const openWorkspaceModal = () => {
    if (!newBoardName.trim()) {
      Alert.alert('Info', 'Veuillez saisir un nom de tableau');
      return;
    }
    setWorkspaceModalVisible(true);
  };

  const handleSelectWorkspace = (workspaceId: string, workspaceName: string) => {
    setSelectedWorkspaceId(workspaceId);
    setSelectedWorkspaceName(workspaceName);
    setWorkspaceModalVisible(false);
    setTemplateModalVisible(true);
  };

  const handleCreateBoard = async (isKanban: boolean) => {
    if (!newBoardName.trim()) {
      Alert.alert('Erreur', 'Le nom du tableau ne peut pas être vide');
      return;
    }
    
    setIsLoading(true);
    try {
      const newBoard = await boardServices.createBoard(newBoardName, isKanban, selectedWorkspaceId || undefined);
      setBoards([...boards, newBoard]);
      setNewBoardName('');
      setTemplateModalVisible(false);
      setSelectedWorkspaceId(null);
      setSelectedWorkspaceName(null);
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

  const showDeleteConfirmation = (boardId: string) => {
    setBoardToDelete(boardId);
    setDeleteModalVisible(true);
  };

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <CreateBoardSection
          value={newBoardName}
          onChangeText={setNewBoardName}
          onCreatePress={openWorkspaceModal}
          isLoading={isLoading}
        />
        
        <Text style={styles.sectionTitle as any}>Mes tableaux récents</Text>
        
        {isLoading && boards.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator testID="loading-indicator" size="large" color="#FFA500" />
          </View>
        ) : (
          <>
            {boards.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText as any}>Aucun tableau pour le moment</Text>
              </View>
            ) : (
              <FlatList
                testID="boards-list"
                data={boards}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <BoardCard
                    board={item}
                    onPress={() => handleBoardPress(item)}
                    onEdit={() => handleEditButtonPress(item)}
                    onDelete={() => showDeleteConfirmation(item.id)}
                  />
                )}
                numColumns={2}
                columnWrapperStyle={styles.boardRow}
                refreshing={isLoading}
                onRefresh={fetchBoards}
              />
            )}
          </>
        )}
        
        <DeleteConfirmationModal
          visible={deleteModalVisible}
          title="Supprimer le tableau"
          message="Êtes-vous sûr de vouloir supprimer ce tableau ?"
          isDeleting={isDeleting}
          onCancel={() => setDeleteModalVisible(false)}
          onConfirm={confirmDeleteBoard}
        />
        
        <EditBoardModal
          visible={editModalVisible}
          currentName={updatedBoardName}
          onClose={() => setEditModalVisible(false)}
          onSave={handleUpdateBoard}
          onChangeText={setUpdatedBoardName}
          isValid={!!updatedBoardName.trim()}
        />
        
        <WorkspaceSelectionModal
          visible={workspaceModalVisible}
          onClose={() => setWorkspaceModalVisible(false)}
          onSelectWorkspace={handleSelectWorkspace}
        />
        
        <TemplateSelectionModal
          visible={templateModalVisible}
          onClose={() => {
            setTemplateModalVisible(false);
            setSelectedWorkspaceId(null);
            setSelectedWorkspaceName(null);
          }}
          onCreateEmpty={() => handleCreateBoard(false)}
          onCreateKanban={() => handleCreateBoard(true)}
        />
      </View>
    </SafeAreaView>
  );
}