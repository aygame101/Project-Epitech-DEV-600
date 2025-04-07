import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, Pressable,  } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { styles } from '../styles/WorkspaceBoardsModalStyle';
import { boardServices } from '@/services/boardService';
import { Board } from '@/types/Board';

import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import BoardItem from '@/components/boards/BoardItem';
import CreateBoardInput from '@/components/boards/CreateBoardInput';
import EditBoardModal from '@/components/modals/EditBoardModal';
import BoardTemplateModal from '@/components/modals/BoardTemplateModal';

interface WorkspaceParams {
  workspaceId: string;
  workspaceName: string;
}

const API_KEY = Constants.expoConfig?.extra?.apiKey;
const API_TOKEN = Constants.expoConfig?.extra?.token;

if (!API_KEY || !API_TOKEN) {
  console.error('Missing Trello API credentials');
  Alert.alert('Error', 'Missing API configuration');
}

const WorkspaceBoardsModal = () => {
  const route = useRoute();
  const router = useRouter();
  const { workspaceId, workspaceName } = route.params as WorkspaceParams;
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newBoardName, setNewBoardName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [updatedBoardName, setUpdatedBoardName] = useState('');
  const [deletingBoardId, setDeletingBoardId] = useState<string | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  
  // suppression
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!API_KEY || !API_TOKEN) return;

    const fetchData = async () => {
      try {
        await fetchBoards();
      } catch (error) {
        if (isMounted) {
          console.error(error);
          Alert.alert('Error', 'Failed to fetch boards');
        }
      }
    };

    if (isMounted) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [workspaceId]);

  const fetchBoards = async () => {
    setIsLoading(true);
    try {
      const boards = await boardServices.getBoards() as Board[];
      setBoards(boards.filter(board =>
        (board.idOrganization && board.idOrganization === workspaceId) ||
        board.id === workspaceId
      ));
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Échec de la récupération des tableaux');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBoard = async (isKanban: boolean) => {
    if (!newBoardName.trim()) {
      Alert.alert('Erreur', 'Le nom du tableau ne peut pas être vide');
      return;
    }

    setIsCreating(true);
    try {
      const newBoard = await boardServices.createBoard(newBoardName, isKanban, workspaceId);
      setBoards([...boards, newBoard]);
      setNewBoardName('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue';
      Alert.alert('Erreur', message);
    } finally {
      setIsCreating(false);
      setShowTemplateModal(false);
    }
  };

  const handleBoardPress = (boardId: string, boardName: string) => {
    router.push({
      pathname: '/board/[id]',
      params: { id: boardId }
    });
  };

  const handleEditButtonPress = (board: Board) => {
    setEditingBoard(board);
    setUpdatedBoardName(board.name);
    setEditModalVisible(true);
  };

  const handleUpdateBoard = async () => {
    if (!updatedBoardName.trim() || !API_KEY || !API_TOKEN) {
      Alert.alert('Error', 'Board name cannot be empty or missing API credentials');
      return;
    }

    setIsLoading(true);
    try {
      if (editingBoard) {
        await boardServices.updateBoard(editingBoard.id, { name: updatedBoardName });

        setBoards(boards.map(board =>
          editingBoard && board.id === editingBoard.id
            ? { ...board, name: updatedBoardName }
            : board
        ));
      }

      setEditModalVisible(false);
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Échec de la mise à jour du tableau');
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
    
    setDeletingBoardId(boardToDelete);
    try {
      await boardServices.deleteBoard(boardToDelete);
      setBoards(boards.filter(board => board.id !== boardToDelete));
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Échec de la suppression du tableau');
    } finally {
      setDeletingBoardId(null);
      setBoardToDelete(null);
      setDeleteModalVisible(false);
    }
  };


  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <AntDesign name="arrowleft" size={28} color="#FFA500" />
      </Pressable>
      <Text style={styles.title}>Workspace : {workspaceName}</Text>
      </View>

      <CreateBoardInput
        value={newBoardName}
        onChangeText={setNewBoardName}
        onPress={() => {
          if (newBoardName.trim()) {
            setShowTemplateModal(true);
          } else {
            Alert.alert('Info', 'Veuillez entrer un nom de tableau');
          }
        }}
        isLoading={isCreating}
        placeholder="Nom du tableau à créer"
      />

      {isLoading && boards.length === 0 ? (
        <ActivityIndicator size="large" color="#FFA500" />
      ) : (
        <FlatList
          data={boards}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <BoardItem
              board={item}
              isDeleting={deletingBoardId === item.id}
              onPress={() => handleBoardPress(item.id, item.name)}
              onEdit={() => handleEditButtonPress(item)}
              onDelete={() => showDeleteConfirmation(item.id)}
            />
          )}
        />
      )}

      <DeleteConfirmationModal
        visible={deleteModalVisible}
        message="Êtes-vous sûr de vouloir supprimer ce tableau ?"
        isDeleting={deletingBoardId !== null}
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

      <BoardTemplateModal
        visible={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onCreateEmpty={() => {
          handleCreateBoard(false);
          setShowTemplateModal(false);
        }}
        onCreateKanban={() => {
          handleCreateBoard(true);
          setShowTemplateModal(false);
        }}
      />
    </View>
  );
};

export default WorkspaceBoardsModal;
export const options = {
  headerShown: false,
};
