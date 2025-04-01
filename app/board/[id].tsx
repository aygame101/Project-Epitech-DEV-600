import { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  View,
  Text,
  Alert,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { boardServices } from '@/services/boardService';
import { Board } from '@/types/Board';
import useLists from '@/hooks/useLists';

function ListCard({ list, onUpdate, onArchive, onAddCard }) {
  return (
    <View style={styles.listCardContainer}>
      <Text style={styles.listCardTitle}>{list.name}</Text>

      <View style={styles.listCardActions}>
        <Pressable onPress={() => onAddCard(list.id)} style={styles.listCardActionBtn}>
          <Text style={styles.listCardActionText}>+ Carte</Text>
        </Pressable>
        <Pressable onPress={() => onArchive(list.id)} style={styles.listCardActionBtn}>
          <Text style={styles.listCardArchiveText}>Archiver</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function BoardDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [board, setBoard] = useState<Board | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');

  // On importe nos fonctions depuis le hook
  const {
    lists,
    isLoading: listsLoading,
    createList,
    updateList,
    archiveList,
    fetchLists  // Utiliser fetchLists pour rafraîchir les listes
  } = useLists(id as string);

  // **Définition hors useEffect pour pouvoir le rappeler après l'archivage**
  const fetchBoardDetails = async () => {
    setIsLoading(true);
    try {
      const boardData = await boardServices.getBoardById(id as string);
      setBoard(boardData);
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  // Chargement initial du board
  useEffect(() => {
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

  // ICI on force la réactualisation (fetchBoardDetails) après l'archivage
  const handleArchiveList = async (listId: string) => {
    await archiveList(listId);
    await fetchLists();  // Rafraîchit les listes après l'archivage
    await fetchBoardDetails();
  };

  const handleAddCard = (listId: string) => {
    router.push(`/list/${listId}/card/new`);
  };

  if (isLoading || !board) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFA500" />
        <Text style={styles.loadingText}>Chargement du tableau...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={28} color="#FFA500" />
        </Pressable>
        <Text style={styles.boardTitle}>{board.name}</Text>
      </View>

      {/* Lists */}
      {listsLoading ? (
        <View style={styles.loadingLists}>
          <ActivityIndicator size="large" color="#FFA500" />
        </View>
      ) : (
        <ScrollView
          horizontal
          style={styles.listsContainer}
          contentContainerStyle={styles.listsContentContainer}
          showsHorizontalScrollIndicator={false}
        >
          {lists.map(list => (
            <ListCard
              key={list.id}
              list={list}
              onUpdate={handleUpdateList}
              onArchive={handleArchiveList}
              onAddCard={handleAddCard}
            />
          ))}

          {/* Bouton d'ajout de nouvelle liste */}
          <Pressable
            style={styles.addListButton}
            onPress={() => setShowCreateModal(true)}
          >
            <AntDesign name="plus" size={20} color="#000" />
            <Text style={styles.addListButtonText}>Ajouter une liste</Text>
          </Pressable>
        </ScrollView>
      )}

      {/* Modal pour créer une nouvelle liste */}
      <Modal
        transparent
        visible={showCreateModal}
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowCreateModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Créer une liste</Text>

                <TextInput
                  style={styles.modalInput}
                  placeholder="Nom de la liste"
                  placeholderTextColor="#888"
                  value={newListName}
                  onChangeText={setNewListName}
                  autoFocus
                />

                <View style={styles.modalButtonsContainer}>
                  <Pressable
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowCreateModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleCreateList}
                  >
                    <Text style={styles.confirmButtonText}>Créer</Text>
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  /* PAGE CONTAINER */
  container: {
    flex: 1,
    backgroundColor: '#000', // Fond noir
    paddingTop: 32,
  },

  /* LOADING VIEW */
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#FFF',
    fontSize: 16,
  },
  loadingLists: {
    marginTop: 50,
  },

  /* HEADER */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backButton: {
    marginRight: 16,
  },
  boardTitle: {
    fontSize: 24,
    color: '#FFA500', // Titre du tableau en orange
    fontWeight: 'bold',
  },

  /* LISTS WRAPPER */
  listsContainer: {
    flex: 1,
  },
  listsContentContainer: {
    paddingHorizontal: 8,
    alignItems: 'flex-start',
  },

  /* LIST CARD */
  listCardContainer: {
    backgroundColor: '#FFF', // Listes en blanc
    borderRadius: 8,
    width: 260,
    padding: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    // Optionnel: bordure ou ombre
    borderWidth: 1,
    borderColor: '#CCC',
  },
  listCardTitle: {
    color: '#FFA500', // Titre de la liste en orange
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  listCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  listCardActionBtn: {
    padding: 6,
  },
  listCardActionText: {
    color: '#000', // Bouton "ajouter carte" en noir
  },
  listCardArchiveText: {
    color: '#FF4A4A', // Couleur d'archive
  },

  /* AJOUTER UNE LISTE BUTTON */
  addListButton: {
    width: 260,
    height: 50,
    backgroundColor: '#FFF', // Même couleur que les listes
    borderRadius: 8,
    marginHorizontal: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  addListButtonText: {
    color: '#000',
    fontSize: 16,
    marginLeft: 6,
    fontWeight: '600',
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    width: '85%',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    color: '#FFA500',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#FFF',
    marginBottom: 20,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#CCC',
  },
  confirmButton: {
    backgroundColor: '#FFA500',
  },
  cancelButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  confirmButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
});
