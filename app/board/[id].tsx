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
  TouchableWithoutFeedback,
  FlatList
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { boardServices } from '@/services/boardService';
import { cardServices } from '@/services/cardService';
import { Board } from '@/types/Board';
import useLists from '@/hooks/useLists';
import { styles } from '../../styles/idStyle';

// Card component to display within a list
function CardItem({ card, onEditCard }) {
  return (
    <View style={styles.cardItem}>
      <Text style={styles.cardTitle}>{card.name}</Text>
      {card.desc && <Text style={styles.cardDescription}>{card.desc}</Text>}
      <Pressable onPress={() => onEditCard(card.id)} style={styles.editButton}>
        <AntDesign name="edit" size={18} color="#000" />
      </Pressable>
    </View>
  );
}

function ListCard({ list, cards, onUpdate, onArchive, onAddCard, onEdit, onEditCard }) {
  // Filter cards that belong to this list
  const listCards = cards.filter(card => card.idList === list.id);

  return (
    <View style={styles.listCardContainer}>
      <View style={styles.listCardHeader}>
        <Text style={styles.listCardTitle}>{list.name}</Text>
        <Pressable onPress={() => onEdit(list.id)} style={styles.editButton}>
          <AntDesign name="edit" size={18} color="#000" />
        </Pressable>
      </View>

      {/* Cards container */}
      <ScrollView style={styles.cardsContainer}>
        {listCards.map(card => (
          <CardItem key={card.id} card={card} onEditCard={onEditCard} />
        ))}
      </ScrollView>

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
  const [cards, setCards] = useState([]);
  const [isLoadingCards, setIsLoadingCards] = useState(false);

  // List modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingListId, setEditingListId] = useState(null);
  const [editingListName, setEditingListName] = useState('');

  // Card creation modal
  const [showCardModal, setShowCardModal] = useState(false);
  const [newCardName, setNewCardName] = useState('');
  const [newCardDesc, setNewCardDesc] = useState('');
  const [selectedListId, setSelectedListId] = useState(null);

  // Card edit modal
  const [showEditCardModal, setShowEditCardModal] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [editingCardName, setEditingCardName] = useState('');
  const [editingCardDesc, setEditingCardDesc] = useState('');

  const {
    lists,
    isLoading: listsLoading,
    createList,
    updateList,
    archiveList,
    fetchLists
  } = useLists(id as string);

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

  const fetchCards = async () => {
    setIsLoadingCards(true);
    try {
      // Assuming you have a method to fetch all cards for a board
      const boardCards = await cardServices.getCardsByBoard(id as string);
      setCards(boardCards);
    } catch (error: any) {
      console.error('Erreur lors du chargement des cartes:', error);
    } finally {
      setIsLoadingCards(false);
    }
  };

  useEffect(() => {
    fetchBoardDetails();
    fetchCards();
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
    await fetchLists();
    await fetchBoardDetails();
  };

  const handleAddCard = (listId: string) => {
    setSelectedListId(listId);
    setShowCardModal(true);
  };

  const handleCreateCard = async () => {
    if (!newCardName.trim()) {
      Alert.alert('Erreur', 'Le nom de la carte est requis');
      return;
    }

    try {
      await cardServices.addCard(selectedListId, newCardName, newCardDesc);

      // Reset form and close modal
      setNewCardName('');
      setNewCardDesc('');
      setShowCardModal(false);

      // Refresh cards to show the new one
      fetchCards();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de créer la carte');
    }
  };

  const handleEditList = (listId: string) => {
    const listToEdit = lists.find(list => list.id === listId);
    if (listToEdit) {
      setEditingListId(listId);
      setEditingListName(listToEdit.name);
      setShowEditModal(true);
    }
  };

  const handleSaveEditList = async () => {
    if (!editingListName.trim()) {
      Alert.alert('Erreur', 'Le nom de la liste est requis');
      return;
    }

    await handleUpdateList(editingListId, editingListName);
    setShowEditModal(false);
    setEditingListId(null);
    setEditingListName('');
  };

  const handleEditCard = (cardId: string) => {
    const cardToEdit = cards.find(card => card.id === cardId);
    if (cardToEdit) {
      setEditingCardId(cardId);
      setEditingCardName(cardToEdit.name);
      setEditingCardDesc(cardToEdit.desc || '');
      setShowEditCardModal(true);
    }
  };

  const handleSaveEditCard = async () => {
    if (!editingCardName.trim()) {
      Alert.alert('Erreur', 'Le nom de la carte est requis');
      return;
    }
  
    try {
      // Correction ici - passer un objet conforme à Partial<Card>
      await cardServices.updateCard(editingCardId, {
        name: editingCardName,
        desc: editingCardDesc
      });
  
      // Reset form and close modal
      setEditingCardId(null);
      setEditingCardName('');
      setEditingCardDesc('');
      setShowEditCardModal(false);
  
      // Refresh cards to show the updated one
      fetchCards();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de mettre à jour la carte');
    }
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
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <AntDesign name="arrowleft" size={28} color="#FFA500" />
        </Pressable>
        <Text style={styles.boardTitle}>{board.name}</Text>
      </View>

      {listsLoading || isLoadingCards ? (
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
              cards={cards}
              onUpdate={handleUpdateList}
              onArchive={handleArchiveList}
              onAddCard={handleAddCard}
              onEdit={handleEditList}
              onEditCard={handleEditCard}
            />
          ))}

          <Pressable
            style={styles.addListButton}
            onPress={() => setShowCreateModal(true)}
          >
            <AntDesign name="plus" size={20} color="#000" />
            <Text style={styles.addListButtonText}>Ajouter une liste</Text>
          </Pressable>
        </ScrollView>
      )}

      {/* List creation modal */}
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

      {/* List edit modal */}
      <Modal
        transparent
        visible={showEditModal}
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowEditModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Éditer la liste</Text>

                <TextInput
                  style={styles.modalInput}
                  placeholder="Nom de la liste"
                  placeholderTextColor="#888"
                  value={editingListName}
                  onChangeText={setEditingListName}
                  autoFocus
                />

                <View style={styles.modalButtonsContainer}>
                  <Pressable
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowEditModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleSaveEditList}
                  >
                    <Text style={styles.confirmButtonText}>Enregistrer</Text>
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Card creation modal */}
      <Modal
        transparent
        visible={showCardModal}
        animationType="fade"
        onRequestClose={() => setShowCardModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowCardModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Créer une carte</Text>

                <TextInput
                  style={styles.modalInput}
                  placeholder="Titre de la carte"
                  placeholderTextColor="#888"
                  value={newCardName}
                  onChangeText={setNewCardName}
                  autoFocus
                />

                <TextInput
                  style={[styles.modalInput, styles.textareaInput]}
                  placeholder="Description (optionnelle)"
                  placeholderTextColor="#888"
                  value={newCardDesc}
                  onChangeText={setNewCardDesc}
                  multiline
                  numberOfLines={3}
                />

                <View style={styles.modalButtonsContainer}>
                  <Pressable
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowCardModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleCreateCard}
                  >
                    <Text style={styles.confirmButtonText}>Créer</Text>
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Card edit modal */}
      <Modal
        transparent
        visible={showEditCardModal}
        animationType="fade"
        onRequestClose={() => setShowEditCardModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowEditCardModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Éditer la carte</Text>

                <TextInput
                  style={styles.modalInput}
                  placeholder="Titre de la carte"
                  placeholderTextColor="#888"
                  value={editingCardName}
                  onChangeText={setEditingCardName}
                  autoFocus
                />

                <TextInput
                  style={[styles.modalInput, styles.textareaInput]}
                  placeholder="Description (optionnelle)"
                  placeholderTextColor="#888"
                  value={editingCardDesc}
                  onChangeText={setEditingCardDesc}
                  multiline
                  numberOfLines={3}
                />

                <View style={styles.modalButtonsContainer}>
                  <Pressable
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowEditCardModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleSaveEditCard}
                  >
                    <Text style={styles.confirmButtonText}>Enregistrer</Text>
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