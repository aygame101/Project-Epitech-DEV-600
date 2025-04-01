import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Pressable, ActivityIndicator, View, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AntDesign } from '@expo/vector-icons';
import { boardServices } from '@/services/boardService';
import { cardServices } from '@/services/cardService';
import { Board } from '@/types/Board';
import useLists from '@/hooks/useLists';
import ListCard from '@/components/lists/ListCard';
import AddCardModal from '@/app/AddCardModal'; 

export default function BoardDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [board, setBoard] = useState<Board | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  const {
    lists,
    isLoading: listsLoading,
    createList,
    updateList,
    archiveList
  } = useLists(id as string);

  useEffect(() => {
    const fetchBoardDetails = async () => {
      setIsLoading(true);
      try {
        const boardData = await boardServices.getBoardById(id as string);
        setBoard(boardData);
      } catch (error) {
        Alert.alert('Erreur', error.message);
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoardDetails();
  }, [id]);

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      Alert.alert('Erreur', 'Le nom de la liste est requis');
      return;
    }

    await createList(newListName);
    setShowCreateModal(false);
    setNewListName('');
  };

  const handleUpdateList = async (listId: string, newName: string) => {
    await updateList(listId, { name: newName });
  };

  const handleArchiveList = async (listId: string) => {
    await archiveList(listId);
  };

  const openAddCardModal = (listId: string) => {
    setSelectedListId(listId);
    setShowAddCardModal(true);
  };

  const handleAddCard = async (listId: string, cardName: string, cardDesc?: string) => {
    if (!cardName.trim()) {
      Alert.alert('Erreur', 'Le nom de la carte est requis');
      return;
    }
  
    try {
      if (board?.closed) {
        
        await boardServices.openBoard(board.id);
      }
  
      const newCard = await cardServices.addCard(listId, cardName, cardDesc);
      Alert.alert('Succès', `Carte ajoutée: ${newCard.name}`);
  
      if (board?.closed) {
       
        await boardServices.closeBoard(board.id);
      }
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
  };
  if (isLoading || !board) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0079bf" />
        <ThemedText type="subtitle">Chargement du tableau...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="#0079bf" />
        </Pressable>
        <ThemedText type="title">{board.name}</ThemedText>
      </View>

      {listsLoading ? (
        <ActivityIndicator size="large" color="#0079bf" />
      ) : (
        <ScrollView
          horizontal
          style={styles.listsContainer}
          contentContainerStyle={styles.listsContentContainer}
        >
          {lists.map(list => (
            <ListCard
              key={list.id}
              list={list}
              onUpdate={handleUpdateList}
              onArchive={handleArchiveList}
              onAddCard={() => openAddCardModal(list.id)}
            />
          ))}

          <Pressable
            style={styles.addListButton}
            onPress={() => setShowCreateModal(true)}
          >
            <AntDesign name="plus" size={20} color="#6B778C" />
            <ThemedText style={styles.addListText}>Ajouter une liste</ThemedText>
          </Pressable>
        </ScrollView>
      )}

      {showCreateModal && (
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ThemedText type="title">Créer une liste</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Nom de la liste"
              value={newListName}
              onChangeText={setNewListName}
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
                onPress={handleCreateList}>
                <ThemedText style={{ color: 'white' }}>Créer</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      )}

      {showAddCardModal && selectedListId && (
        <View style={styles.modalOverlay}>
          <AddCardModal
            listId={selectedListId}
            onClose={() => setShowAddCardModal(false)}
            onAddCard={handleAddCard}
          />
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E5E9',
  },
  backButton: {
    marginRight: 16,
  },
  listsContainer: {
    flex: 1,
  },
  listsContentContainer: {
    padding: 8,
    alignItems: 'flex-start',
  },
  addListButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 3,
    width: 272,
    padding: 10,
    marginHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addListText: {
    color: '#6B778C',
    fontSize: 14,
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
});
