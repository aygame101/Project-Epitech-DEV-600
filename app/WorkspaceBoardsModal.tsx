import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TextInput, TouchableOpacity, Alert, Modal, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { styles } from '../styles/WorkspaceBoardsModalStyle';
import { boardServices } from '@/services/boardService';

import { Board } from '@/types/Board';

interface WorkspaceParams {
  workspaceId: string;
  workspaceName: string;
}

// Configuration Trello
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

  const handleCreateBoard = async (useTemplate: boolean = false) => {
    if (!newBoardName.trim()) return;

    setIsCreating(true);
    try {
      const newBoard = await boardServices.createBoard(newBoardName, useTemplate);
      setBoards([...boards, newBoard]);
      setNewBoardName('');
    } catch (error) {
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Échec de la création du tableau');
    } finally {
      setIsCreating(false);
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

  const handleDeleteBoard = async (boardId: string) => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer ce tableau ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          onPress: async () => {
            setDeletingBoardId(boardId);
            try {
              await boardServices.deleteBoard(boardId);

              setBoards(boards.filter(board => board.id !== boardId));
            } catch (error) {
              console.error(error);
              Alert.alert('Erreur', 'Échec de la suppression du tableau');
            } finally {
              setDeletingBoardId(null);
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const handleTemplateChoice = (useTemplate: boolean) => {
    setShowTemplateModal(false);
    handleCreateBoard(useTemplate);
  };


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

  const renderTemplateModal = () => (
    <Modal
      transparent
      visible={showTemplateModal}
      animationType="fade"
      onRequestClose={() => setShowTemplateModal(false)}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={() => setShowTemplateModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Choisir le type de tableau</Text>
                
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    handleCreateBoard(false);
                    setShowTemplateModal(false);
                  }}
                >
                  <Text style={styles.modalButtonText}>Tableau vide</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    handleCreateBoard(true);
                    setShowTemplateModal(false);
                  }}
                >
                  <Text style={styles.modalButtonText}>Template Kanban (To Do, Doing, Done)</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowTemplateModal(false)}
                >
                  <Text style={styles.modalButtonText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );

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
          onPress={() => {
            if (newBoardName.trim()) {
              setShowTemplateModal(true);
            } else {
              Alert.alert('Info', 'Veuillez entrer un nom de tableau');
            }
          }}
          disabled={isCreating || !newBoardName.trim()}
        >
          {isCreating ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.addButtonText}>Ajouter</Text>
          )}
        </TouchableOpacity>
      </View>

      {isLoading && boards.length === 0 ? (
        <ActivityIndicator size="large" color="#FFA500" />
      ) : (
        <FlatList
          data={boards}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.boardItemContainer}
              onPress={() => handleBoardPress(item.id, item.name)}
              disabled={deletingBoardId === item.id}
            >
              <Text style={styles.boardItem}>{item.name}</Text>

              <View style={styles.boardActions}>
                {deletingBoardId === item.id ? (
                  <ActivityIndicator size="small" color="#FFA500" />
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleEditButtonPress(item);
                      }}
                      disabled={deletingBoardId !== null}
                    >
                      <Text>✏️</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteBoard(item.id);
                      }}
                      disabled={deletingBoardId !== null}
                    >
                      <Text>🗑️</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {renderEditModal()}
      {renderTemplateModal()}
    </View>
  );
};

export default WorkspaceBoardsModal;
