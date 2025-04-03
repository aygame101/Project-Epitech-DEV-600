import { useState, useEffect } from 'react';
import axios from 'axios';
import Constants from 'expo-constants';
import { User } from '@/types/User';
import { Card } from '@/types/Card';
import { List } from '@/types/List';
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
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { boardServices } from '@/services/boardService';
import { cardServices } from '@/services/cardService';
import { Board } from '@/types/Board';
import useLists from '@/hooks/useLists';
import { styles } from '../../styles/idStyle';

interface CardItemProps {
  card: Card;
  onEditCard: (cardId: string) => void;
  onViewCard: (cardId: string) => void;
}

interface ChecklistsData {
  [cardId: string]: Array<{
    id: string;
    name: string;
    checkItems: Array<{
      id: string;
      name: string;
      state: 'complete' | 'incomplete';
    }>;
    checkItemsChecked: number;
  }>;
}

// Mise à jour du composant CardItem pour afficher la date d'échéance et la progression de checklist
function CardItem({ card, onEditCard, onViewCard }: CardItemProps) {
  const checklistsData: ChecklistsData = {};
  const truncateDescription = (text: string, maxLength = 30) => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  // Récupérer les données de checklist pour cette carte
  const cardChecklists = checklistsData[card.id] || [];

  // Calculer la progression totale de toutes les checklists
  let totalItems = 0;
  let totalChecked = 0;

  cardChecklists.forEach(checklist => {
    totalItems += checklist.checkItems.length;
    totalChecked += checklist.checkItemsChecked;
  });

  // Calculer le pourcentage de progression
  const progressPercentage = totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0;

  // Formater la date d'échéance
  const formattedDueDate = card.dueDate && typeof card.dueDate === 'string' && card.dueDate.length > 0 ? 
    new Date(card.dueDate).toLocaleDateString('fr-FR') : 
    null;

  return (
    <Pressable style={styles.cardItem} onPress={() => onViewCard(card.id)}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{card.name}</Text>
        {formattedDueDate && (
          <Text style={[
            styles.dueDateBadge,
            new Date(card.dueDate) < new Date() ? styles.dueDateOverdue : null
          ]}>
            {formattedDueDate}
          </Text>
        )}
      </View>

      {card.desc && (
        <Text style={styles.cardDescription} numberOfLines={1} ellipsizeMode="tail">
          {truncateDescription(card.desc)}
        </Text>
      )}

      {totalItems > 0 && (
        <View style={styles.checklistProgressContainer}>
          <View style={styles.checklistProgressBar}>
            <View
              style={[
                styles.checklistProgressFill,
                { width: `${progressPercentage}%` }
              ]}
            />
          </View>
          <Text style={styles.checklistProgressText}>
            {progressPercentage}% ({totalChecked}/{totalItems})
          </Text>
        </View>
      )}

      <Pressable onPress={() => onViewCard(card.id)} style={styles.viewMoreButton}>
        <Text style={styles.viewMoreText}>View more</Text>
      </Pressable>
    </Pressable>
  );
}

interface ListCardProps {
  list: List;
  cards: Card[];
  onUpdate: (listId: string, newName: string) => void;
  onArchive: (listId: string) => void;
  onAddCard: (listId: string) => void;
  onEdit: (listId: string) => void;
  onEditCard: (cardId: string) => void;
  onViewCard: (cardId: string) => void;
}

function ListCard({
  list,
  cards,
  onUpdate,
  onArchive,
  onAddCard,
  onEdit,
  onEditCard,
  onViewCard
}: ListCardProps) {
  const listCards = cards.filter(card => card.idList === list.id);

  return (
    <View style={[styles.listCardContainer, { height: Math.min(600, 120 + listCards.length * 80) }]}>
      <View style={styles.listCardHeader}>
        <Text style={styles.listCardTitle}>{list.name}</Text>
        <Pressable onPress={() => onEdit(list.id)} style={styles.editButton}>
          <AntDesign name="edit" size={18} color="#000" />
        </Pressable>
      </View>

      <ScrollView style={styles.cardsContainer}>
        {listCards.map(card => (
          <CardItem
            key={card.id}
            card={card}
            onEditCard={onEditCard}
            onViewCard={onViewCard}
          />
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
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListName, setEditingListName] = useState('');

  const [showCardModal, setShowCardModal] = useState(false);
  const [newCardName, setNewCardName] = useState('');
  const [newCardDesc, setNewCardDesc] = useState('');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  const [showEditCardModal, setShowEditCardModal] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editingCardName, setEditingCardName] = useState('');
  const [editingCardDesc, setEditingCardDesc] = useState('');

  const [showCardViewModal, setShowCardViewModal] = useState(false);
  const [viewingCard, setViewingCard] = useState<Card | null>(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  //checklist
  const [showDescriptionInput, setShowDescriptionInput] = useState(false);
  const [showChecklistInput, setShowChecklistInput] = useState(false);
  const [newChecklistName, setNewChecklistName] = useState('');
  const [newChecklistItems, setNewChecklistItems] = useState<string[]>(['']);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  const handleArchiveCard = async (cardId: string) => {
    try {
      await cardServices.archiveCard(cardId);
      setShowCardViewModal(false);
      fetchCards();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible d\'archiver la carte');
    }
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
      if (!selectedListId) return;
      await cardServices.addCard(selectedListId, newCardName, newCardDesc);
      setNewCardName('');
      setNewCardDesc('');
      setShowCardModal(false);
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

    if (!editingListId) return;
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

  const handleViewCard = (cardId: string) => {
    const cardToView = cards.find(card => card.id === cardId);
    if (cardToView) {
      setViewingCard(cardToView);
      setShowCardViewModal(true);
    }
  };

  const handleSaveEditCard = async () => {
    if (!editingCardName.trim()) {
      Alert.alert('Erreur', 'Le nom de la carte est requis');
      return;
    }

    try {
      if (!editingCardId) return;
      await cardServices.updateCard(editingCardId, {
        name: editingCardName,
        desc: editingCardDesc
      });

      setEditingCardId(null);
      setEditingCardName('');
      setEditingCardDesc('');
      setShowEditCardModal(false);
      fetchCards();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de mettre à jour la carte');
    }
  };

  // Fonction pour gérer la soumission d'une nouvelle carte avec checklist
  const handleCreateCardWithChecklist = async () => {
    if (!newCardName.trim()) {
      Alert.alert('Erreur', 'Le nom de la carte est requis');
      return;
    }

    try {
      if (!selectedListId) return;

      // Créer la carte d'abord
      const newCard = await cardServices.addCard(selectedListId, newCardName, newCardDesc);

      // Ajouter la date d'échéance si spécifiée
      if (dueDate) {
        await cardServices.updateCard(newCard.id, { dueDate: dueDate.toISOString() });
      }

      // Ajouter la checklist si le nom est spécifié
      if (newChecklistName.trim() && newChecklistItems.some(item => item.trim())) {
        const checklist = await cardServices.addChecklistToCard(newCard.id, newChecklistName);

        // Ajouter les éléments de la checklist
        for (const item of newChecklistItems.filter(item => item.trim())) {
          await cardServices.addChecklistItem(checklist.id, item);
        }
      }

      // Réinitialiser les champs et fermer le modal
      setNewCardName('');
      setNewCardDesc('');
      setShowChecklistInput(false);
      setNewChecklistName('');
      setNewChecklistItems(['']);
      setDueDate(null);
      setShowDescriptionInput(false);
      setShowCardModal(false);

      // Rafraîchir les cartes
      fetchCards();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de créer la carte');
    }
  };

  // Fonction pour gérer l'ajout d'une checklist à une carte existante
  const handleAddChecklistToExistingCard = async (cardId: string) => {
    if (!newChecklistName.trim()) {
      Alert.alert('Erreur', 'Le nom de la checklist est requis');
      return;
    }

    try {
      const checklist = await cardServices.addChecklistToCard(cardId, newChecklistName);

      // Ajouter les éléments de la checklist
      for (const item of newChecklistItems.filter(item => item.trim())) {
        await axios.post(`https://api.trello.com/1/checklists/${checklist.id}/checkItems`, null, {
          params: {
            name: item,
            pos: 'bottom',
            key: Constants.expoConfig?.extra?.apiKey,
            token: Constants.expoConfig?.extra?.token,
          }
        });
      }

      // Réinitialiser et fermer
      setNewChecklistName('');
      setNewChecklistItems(['']);
      setShowChecklistModal(false);
      fetchCards();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de créer la checklist');
    }
  };

  // Fonction pour ajouter un champ de checklist
  const addChecklistItemField = () => {
    setNewChecklistItems([...newChecklistItems, '']);
  };

  // Fonction pour mettre à jour un élément de checklist
  const updateChecklistItem = (index: number, value: string) => {
    const updatedItems = [...newChecklistItems];
    updatedItems[index] = value;
    setNewChecklistItems(updatedItems);
  };

  // Fonction pour supprimer un élément de checklist
  const removeChecklistItem = (index: number) => {
    if (newChecklistItems.length > 1) {
      const updatedItems = [...newChecklistItems];
      updatedItems.splice(index, 1);
      setNewChecklistItems(updatedItems);
    }
  };

  // États supplémentaires
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [selectedCardForChecklist, setSelectedCardForChecklist] = useState<string | null>(null);
  const [checklistsData, setChecklistsData] = useState<Record<string, Array<{
    id: string;
    name: string;
    checkItems: Array<{
      id: string;
      name: string;
      state: 'complete' | 'incomplete';
    }>;
    checkItemsChecked: number;
  }>>>({});

  // Fonction pour ouvrir le modal d'ajout de checklist
  const handleOpenChecklistModal = (cardId: string) => {
    setSelectedCardForChecklist(cardId);
    setShowCardViewModal(false);
    setNewChecklistName('');
    setNewChecklistItems(['']);
    setShowChecklistModal(true);
  };

  // Fonction pour récupérer les checklists pour toutes les cartes
  const fetchChecklistsForCards = async () => {
    try {
      const allChecklistsData: { [cardId: string]: { id: string, name: string, checkItems: any[], checkItemsChecked: number }[] } = {};

      for (const card of cards) {
        const response = await axios.get(`https://api.trello.com/1/cards/${card.id}/checklists`, {
          params: {
            key: Constants.expoConfig?.extra?.apiKey,
            token: Constants.expoConfig?.extra?.token,
          }
        });

        // Pour chaque checklist, compter les éléments cochés
        const checklists = response.data.map((checklist: any) => {
          const checkItemsChecked = checklist.checkItems.filter((item: any) => item.state === 'complete').length;
          return {
            id: checklist.id,
            name: checklist.name,
            checkItems: checklist.checkItems,
            checkItemsChecked
          };
        });

        if (checklists.length > 0) {
          allChecklistsData[card.id] = checklists;
        }
      }

      setChecklistsData(allChecklistsData);
    } catch (error) {
      console.error('Erreur lors du chargement des checklists:', error);
    }
  };

  // Mise à jour de useEffect pour charger les checklists
  useEffect(() => {
    if (cards.length > 0) {
      fetchChecklistsForCards();
    }
  }, [cards]);

  // Fonction pour mettre à jour l'état d'un élément de checklist
  const toggleChecklistItem = async (checklistId: string, checkItemId: string, currentState: string) => {
    try {
      const newState = currentState === 'complete' ? 'incomplete' : 'complete';

      await axios.put(`https://api.trello.com/1/checklists/${checklistId}/checkItems/${checkItemId}`, null, {
        params: {
          state: newState,
          key: Constants.expoConfig?.extra?.apiKey,
          token: Constants.expoConfig?.extra?.token,
        }
      });

      // Rafraîchir les checklists
      fetchChecklistsForCards();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'élément de checklist:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour l\'élément de checklist');
    }
  };

  const fetchBoardIdByCard = async (cardId: string) => {
    try {
      const card = await cardServices.getCardDetails(cardId);
      return card.idBoard;
    } catch (error) {
      console.error('Erreur lors du chargement de l\'ID du tableau:', error);
      throw error;
    }
  };

  const fetchWorkspaceIdByBoard = async (boardId: string) => {
    try {
      const board = await boardServices.getBoardDetails(boardId);
      return board.idOrganization;
    } catch (error) {
      console.error('Erreur lors du chargement de l\'ID du workspace:', error);
      throw error;
    }
  };

  const fetchWorkspaceUsers = async (cardId: string) => {
    try {
      const boardId = await fetchBoardIdByCard(cardId);
      const workspaceId = await fetchWorkspaceIdByBoard(boardId);

      console.log("Workspace ID:", workspaceId);

      const response = await cardServices.getWorkspaceMembers(workspaceId);
      const data = await response.json();
      setUsers(data);
      setShowAssignModal(true);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    }
  };

  const [assignedMembers, setAssignedMembers] = useState<string[]>([]);
  const [currentCardId, setCurrentCardId] = useState<string | null>(null);

  const fetchAssignedMembers = async (cardId: string) => {
    try {
      const response = await cardServices.getCardMembers(cardId);
      const data = await response.json();
      setAssignedMembers(data.map((member: User) => member.id));
    } catch (error) {
      console.error('Erreur lors du chargement des membres assignés:', error);
    }
  };

  const handleAssignCard = (cardId: string) => {
    setCurrentCardId(cardId);
    setShowCardViewModal(false);
    fetchWorkspaceUsers(cardId);
    fetchAssignedMembers(cardId);
  };

  const handleAssignUserToCard = async (userId: string) => {
    try {
      if (!currentCardId) {
        Alert.alert('Erreur', 'Aucune carte sélectionnée');
        return;
      }

      const isAssigned = assignedMembers.includes(userId);

      if (isAssigned) {
        // Désassigner l'utilisateur
        await cardServices.removeMemberFromCard(currentCardId, userId);
        setAssignedMembers(assignedMembers.filter(id => id !== userId));
      } else {
        // Assigner l'utilisateur
        await cardServices.addMemberToCard(currentCardId, userId);
        setAssignedMembers([...assignedMembers, userId]);
      }
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
      Alert.alert('Erreur', 'Impossible de modifier l\'assignation');
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
              onViewCard={handleViewCard}
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
                  placeholderTextColor="#fff"
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

      {/* Modal modifié pour la création de carte avec checklist et date d'échéance */}
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

                <View style={styles.cardCreationForm}>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Titre de la carte"
                    placeholderTextColor="#888"
                    value={newCardName}
                    onChangeText={setNewCardName}
                    autoFocus
                  />

                  <View style={styles.datePickerContainer}>
                    <Text style={styles.datePickerLabel}>Date d'échéance:</Text>
                    <Pressable
                      style={styles.datePicker}
                      onPress={() => {
                        setShowDatePicker(true);
                      }}
                    >
                      <Text style={styles.datePickerText}>
                        {dueDate ? dueDate.toLocaleDateString('fr-FR') : 'Aucune date'}
                      </Text>
                    </Pressable>
                    {dueDate && (
                      <Pressable
                        style={styles.clearDateButton}
                        onPress={() => setDueDate(null)}
                      >
                        <AntDesign name="close" size={16} color="#FF4A4A" />
                      </Pressable>
                    )}
    </View>

    {showDatePicker && (
      <DateTimePicker
        value={dueDate || new Date()}
        mode="date"
        display="default"
        onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
          setShowDatePicker(false);
          if (selectedDate) {
            setDueDate(selectedDate);
          }
        }}
      />
    )}

                  <View style={styles.cardOptionsContainer}>
                    <Pressable
                      style={[
                        styles.cardOptionButton,
                        showDescriptionInput ? styles.cardOptionActive : null
                      ]}
                      onPress={() => {
                        setShowDescriptionInput(!showDescriptionInput);
                        if (showChecklistInput) setShowChecklistInput(false);
                      }}
                    >
                      <Text style={styles.cardOptionText}>Description</Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.cardOptionButton,
                        showChecklistInput ? styles.cardOptionActive : null
                      ]}
                      onPress={() => {
                        setShowChecklistInput(!showChecklistInput);
                        if (showDescriptionInput) setShowDescriptionInput(false);
                      }}
                    >
                      <Text style={styles.cardOptionText}>Checklist</Text>
                    </Pressable>
                  </View>

                  {showDescriptionInput && (
                    <TextInput
                      style={[styles.modalInput, styles.textareaInput]}
                      placeholder="Description"
                      placeholderTextColor="#888"
                      value={newCardDesc}
                      onChangeText={setNewCardDesc}
                      multiline
                      numberOfLines={3}
                    />
                  )}

                  {showChecklistInput && (
                    <View style={styles.checklistInputContainer}>
                      <TextInput
                        style={styles.modalInput}
                        placeholder="Nom de la checklist"
                        placeholderTextColor="#888"
                        value={newChecklistName}
                        onChangeText={setNewChecklistName}
                      />

                      {newChecklistItems.map((item, index) => (
                        <View key={index} style={styles.checklistItemInputRow}>
                          <TextInput
                            style={[styles.modalInput, styles.checklistItemInput]}
                            placeholder={`Élément ${index + 1}`}
                            placeholderTextColor="#888"
                            value={item}
                            onChangeText={(text) => updateChecklistItem(index, text)}
                          />

                          <Pressable
                            style={styles.checklistItemRemoveButton}
                            onPress={() => removeChecklistItem(index)}
                          >
                            <AntDesign name="close" size={16} color="#FF4A4A" />
                          </Pressable>
                        </View>
                      ))}

                      <Pressable
                        style={styles.addChecklistItemButton}
                        onPress={addChecklistItemField}
                      >
                        <AntDesign name="plus" size={16} color="#FFA500" />
                        <Text style={styles.addChecklistItemText}>Ajouter un élément</Text>
                      </Pressable>
                    </View>
                  )}

                  <View style={styles.modalButtonsContainer}>
                    <Pressable
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => {
                        setShowCardModal(false);
                        setShowDescriptionInput(false);
                        setShowChecklistInput(false);
                        setNewChecklistName('');
                        setNewChecklistItems(['']);
                        setDueDate(null);
                      }}
                    >
                      <Text style={styles.cancelButtonText}>Annuler</Text>
                    </Pressable>

                    <Pressable
                      style={[styles.modalButton, styles.confirmButton]}
                      onPress={handleCreateCardWithChecklist}
                    >
                      <Text style={styles.confirmButtonText}>Créer</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal pour ajouter une checklist à une carte existante */}
      <Modal
        transparent
        visible={showChecklistModal}
        animationType="fade"
        onRequestClose={() => setShowChecklistModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowChecklistModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Ajouter une checklist</Text>

                <TextInput
                  style={styles.modalInput}
                  placeholder="Nom de la checklist"
                  placeholderTextColor="#888"
                  value={newChecklistName}
                  onChangeText={setNewChecklistName}
                  autoFocus
                />

                {newChecklistItems.map((item, index) => (
                  <View key={index} style={styles.checklistItemInputRow}>
                    <TextInput
                      style={[styles.modalInput, styles.checklistItemInput]}
                      placeholder={`Élément ${index + 1}`}
                      placeholderTextColor="#888"
                      value={item}
                      onChangeText={(text) => updateChecklistItem(index, text)}
                    />

                    <Pressable
                      style={styles.checklistItemRemoveButton}
                      onPress={() => removeChecklistItem(index)}
                    >
                      <AntDesign name="close" size={16} color="#FF4A4A" />
                    </Pressable>
                  </View>
                ))}

                <Pressable
                  style={styles.addChecklistItemButton}
                  onPress={addChecklistItemField}
                >
                  <AntDesign name="plus" size={16} color="#FFA500" />
                  <Text style={styles.addChecklistItemText}>Ajouter un élément</Text>
                </Pressable>

                <View style={styles.modalButtonsContainer}>
                  <Pressable
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowChecklistModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={() => selectedCardForChecklist && handleAddChecklistToExistingCard(selectedCardForChecklist)}
                  >
                    <Text style={styles.confirmButtonText}>Ajouter</Text>
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

      {/* Modal de visualisation de carte mis à jour avec checklists et date d'échéance */}
      <Modal
        transparent
        visible={showCardViewModal}
        animationType="fade"
        onRequestClose={() => setShowCardViewModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowCardViewModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{viewingCard?.name}</Text>
                  <Pressable
                    onPress={() => setShowCardViewModal(false)}
                    style={styles.closeButton}
                  >
                    <AntDesign name="close" size={24} color="#fff" />
                  </Pressable>
                </View>

                {/* Affichage de la date d'échéance */}
        {viewingCard?.dueDate && (
          <View style={styles.dueDateContainer}>
            <Text style={styles.dueDateLabel}>Date d'échéance:</Text>
            <Text style={[
              styles.dueDateValue,
              new Date(viewingCard.dueDate) < new Date() ? styles.dueDateOverdue : null
            ]}>
              {new Date(viewingCard.dueDate).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                )}

                {/* Affichage de la description */}
                <Text style={styles.sectionTitle}>Description</Text>
                {viewingCard?.desc ? (
                  <ScrollView style={styles.cardViewDescription}>
                    <Text style={styles.descriptionText}>{viewingCard.desc}</Text>
                  </ScrollView>
                ) : (
                  <Text style={styles.noDescriptionText}>Pas de description</Text>
                )}

                {/* Affichage des checklists */}
                {viewingCard && checklistsData[viewingCard.id] && checklistsData[viewingCard.id].length > 0 && (
                  <View style={styles.checklistsContainer}>
                    <Text style={styles.sectionTitle}>Checklists</Text>

                    {checklistsData[viewingCard.id].map(checklist => (
                      <View key={checklist.id} style={styles.checklistContainer}>
                        <Text style={styles.checklistTitle}>{checklist.name}</Text>

                        <View style={styles.checklistProgressContainer}>
                          <View style={styles.checklistProgressBar}>
                            <View
                              style={[
                                styles.checklistProgressFill,
                                {
                                  width: `${checklist.checkItems.length > 0
                                    ? Math.round((checklist.checkItemsChecked / checklist.checkItems.length) * 100)
                                    : 0}%`
                                }
                              ]}
                            />
                          </View>
                          <Text style={styles.checklistProgressText}>
                            {checklist.checkItemsChecked}/{checklist.checkItems.length}
                          </Text>
                        </View>

                        {checklist.checkItems.map(item => (
                          <Pressable
                            key={item.id}
                            style={styles.checklistItem}
                            onPress={() => toggleChecklistItem(checklist.id, item.id, item.state)}
                          >
                            <View style={styles.checklistItemCheckbox}>
                              {item.state === 'complete' ? (
                                <AntDesign name="checkcircle" size={18} color="#4CAF50" />
                              ) : (
                                <AntDesign name="checkcircleo" size={18} color="#CCC" />
                              )}
                            </View>
                            <Text
                              style={[
                                styles.checklistItemText,
                                item.state === 'complete' ? styles.checklistItemCompleted : null
                              ]}
                            >
                              {item.name}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.modalButtonsContainer}>
                  {/* Nouveau bouton pour ajouter une checklist */}
                  <Pressable
                    style={[styles.modalButton, styles.checklistButton]}
                    onPress={() => viewingCard && handleOpenChecklistModal(viewingCard.id)}
                  >
                    <Text style={styles.confirmButtonText}>📋</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.modalButton, styles.assignButton]}
                    onPress={() => viewingCard && handleAssignCard(viewingCard.id)}
                  >
                    <Text style={styles.confirmButtonText}>👥</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.modalButton, styles.styloButton]}
                    onPress={() => {
                      setShowCardViewModal(false);
                      viewingCard && handleEditCard(viewingCard.id);
                    }}
                  >
                    <Text style={styles.confirmButtonText}>✏️</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.modalButton, styles.archiveButton]}
                    onPress={() => viewingCard && handleArchiveCard(viewingCard.id)}
                  >
                    <Text style={styles.archiveButtonText}>🗑️</Text>
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Assign user modal */}
      <Modal
        transparent
        visible={showAssignModal}
        animationType="fade"
        onRequestClose={() => setShowAssignModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowAssignModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Assigner un utilisateur</Text>
                  <Pressable
                    onPress={() => setShowAssignModal(false)}
                    style={styles.closeButton}
                  >
                    <AntDesign name="close" size={24} color="#fff" />
                  </Pressable>
                </View>

                {users.length > 0 ? (
                  <FlatList
                    data={users}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <Pressable
                        style={styles.userItem}
                        onPress={() => handleAssignUserToCard(item.id)}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={styles.userName}>{item.fullName}</Text>
                          {assignedMembers.includes(item.id) && (
                            <AntDesign
                              name="check"
                              size={20}
                              color="green"
                              style={{ marginLeft: 10 }}
                            />
                          )}
                        </View>
                        <Text style={styles.userEmail}>{item.username}</Text>
                      </Pressable>
                    )}
                    style={styles.userList}
                  />
                ) : (
                  <Text style={styles.noUsersText}>Aucun utilisateur trouvé dans ce workspace</Text>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </View>
  );
}
