import { useState, useEffect } from 'react';
import { useChecklists } from '@/hooks/useChecklists';
import { fetchCardAssignments, handleUserAssignment } from '@/utils/assignmentUtils';
import axios from 'axios';
import Constants from 'expo-constants';
import { User } from '@/types/User';
import { Card } from '@/types/Card';
import { List } from '@/types/List';
import { Board } from '@/types/Board';
import { 
  ScrollView, 
  Pressable, 
  ActivityIndicator, 
  View, 
  Text, 
  Alert,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
  FlatList 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { boardServices } from '@/services/boardService';
import { cardServices } from '@/services/cardService';
import useLists from '@/hooks/useLists';
import { styles } from '@/styles/idStyle';
import { CardItem } from '@/components/cards/CardItem';
import { ListCard } from '@/components/lists/ListCard';
import { CreateListModal } from '@/components/modals/CreateListModal';
import { ChecklistModal } from '@/components/modals/ChecklistModal';
import { EditListModal } from '@/components/modals/EditListModal';
import { CreateCardModal } from '@/components/modals/CreateCardModal';
import { EditCardModal } from '@/components/modals/EditCardModal';
import { ViewCardModal } from '@/components/modals/ViewCardModal';
import { AssignUserModal } from '@/components/modals/AssignUserModal';

export default function BoardDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [board, setBoard] = useState<Board | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [cardAssignments, setCardAssignments] = useState<Record<string, User[]>>({});

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
  const [currentChecklistIndex, setCurrentChecklistIndex] = useState(0);
  const [showDescription, setShowDescription] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);

  const [showCardViewModal, setShowCardViewModal] = useState(false);
  const [viewingCard, setViewingCard] = useState<Card | null>(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const checklist = useChecklists();
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
      
      const workspaceId = await fetchWorkspaceIdByBoard(boardData.id);
      if (workspaceId) {
        const workspaceMembers = await cardServices.getWorkspaceMembers(workspaceId);
        setUsers(workspaceMembers);
      }
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
      
      const assignments: Record<string, string[]> = {};
      for (const card of boardCards) {
        const members = await cardServices.getCardMembers(card.id);
        if (Array.isArray(members)) {
          assignments[card.id] = members
            .filter((member: any): member is User => 
              typeof member === 'object' && 
              member !== null && 
              typeof member.id === 'string'
            )
            .map(member => member.id);
        }
      }
      setAssignedMembers(assignments);
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

  const handleEditCard = async (cardId: string) => {
    const cardToEdit = cards.find(card => card.id === cardId);
    if (cardToEdit) {
      setEditingCardId(cardId);
      setEditingCardName(cardToEdit.name);
      setEditingCardDesc(cardToEdit.desc || '');
      
      try {
        // Charger explicitement les checklists de la carte
        const existingChecklists = await cardServices.getCardChecklists(cardId);
        
        // Formatage des checklists pour correspondre à la structure attendue par le composant
        const formattedChecklists = existingChecklists.map(cl => ({
          id: cl.id,
          name: cl.name,
          items: cl.checkItems.map(item => item.name)
        }));
        
        // Mettre à jour l'état des checklists
        checklist.setAllChecklists(formattedChecklists);
        
        // Si des checklists existent, utiliser la première comme checklist active
        if (formattedChecklists.length > 0) {
          checklist.setNewChecklistName(formattedChecklists[0].name);
          checklist.setNewChecklistItems(formattedChecklists[0].items);
          setCurrentChecklistIndex(0);
        } else {
          checklist.reset();
        }
        
        // Ouvrir la modale d'édition
        setShowEditCardModal(true);
      } catch (error) {
        console.error('Erreur lors du chargement des checklists:', error);
        Alert.alert('Erreur', 'Impossible de charger les checklists');
      }
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

  const handleCreateCardWithChecklist = async () => {
    if (!newCardName.trim()) {
      Alert.alert('Erreur', 'Le nom de la carte est requis');
      return;
    }

    try {
      if (!selectedListId) return;
      const newCard = await cardServices.addCard(selectedListId, newCardName, newCardDesc);

      if (checklist.newChecklistName.trim() && checklist.newChecklistItems.some((item: string) => item.trim())) {
        const checklistData = await cardServices.addChecklistToCard(newCard.id, checklist.newChecklistName);
        for (const item of checklist.newChecklistItems.filter((item: string) => item.trim())) {
          await cardServices.addChecklistItem(checklistData.id, item);
        }
      }

      setNewCardName('');
      setNewCardDesc('');
      checklist.setNewChecklistName('');
      checklist.setNewChecklistItems(['']);
      setShowCardModal(false);
      fetchCards();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de créer la carte');
    }
  };

  const handleAddChecklistToExistingCard = async (cardId: string) => {
    if (!checklist.newChecklistName.trim()) {
      Alert.alert('Erreur', 'Le nom de la checklist est requis');
      return;
    }

    try {
      const checklistData = await cardServices.addChecklistToCard(cardId, checklist.newChecklistName);
      for (const item of checklist.newChecklistItems.filter((item: string) => item.trim())) {
        await cardServices.addChecklistItem(checklistData.id, item);
      }

      checklist.setNewChecklistName('');
      checklist.setNewChecklistItems(['']);
      checklist.setShowModal(false);
      fetchCards();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de créer la checklist');
    }
  };

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

  const handleOpenChecklistModal = (cardId: string) => {
    setShowCardViewModal(false);
    checklist.setSelectedCard(cardId);
    checklist.setNewChecklistName('');
    checklist.setNewChecklistItems(['']);
    checklist.setShowModal(true);
  };

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

        const checklists = response.data.map((checklist: any) => {
          const updatedCheckItems = checklist.checkItems.map((item: any) => ({
            ...item,
            cardId: card.id
          }));

          const checkItemsChecked = updatedCheckItems.filter((item: any) => item.state === 'complete').length;
          return {
            id: checklist.id,
            name: checklist.name,
            checkItems: updatedCheckItems,
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

  useEffect(() => {
    if (cards.length > 0) {
      fetchChecklistsForCards();
    }
  }, [cards]);

  const toggleChecklistItem = async (cardId: string, checkItemId: string, currentState: string) => {
    try {
      const newState = currentState === 'complete' ? 'incomplete' : 'complete';
      await axios.put(`https://api.trello.com/1/cards/${cardId}/checkItem/${checkItemId}`, null, {
        params: {
          state: newState,
          key: Constants.expoConfig?.extra?.apiKey,
          token: Constants.expoConfig?.extra?.token,
        }
      });
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
      const boardId = cardId ? await fetchBoardIdByCard(cardId) : '';
      if (!boardId) {
        throw new Error('Impossible de récupérer l\'ID du tableau');
      }
      const workspaceId = boardId ? await fetchWorkspaceIdByBoard(boardId) : '';
      if (!workspaceId) {
        throw new Error('Impossible de récupérer l\'ID du workspace');
      }

      const data = await cardServices.getWorkspaceMembers(workspaceId);
      setUsers(data);
      setShowAssignModal(true);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    }
  };

  const [assignedMembers, setAssignedMembers] = useState<Record<string, string[]>>({});
  const [currentCardId, setCurrentCardId] = useState<string | null>(null);

  const fetchAssignedMembers = async (cardId: string) => {
    try {
      const data = await cardServices.getCardMembers(cardId);
      const members: User[] = Array.isArray(data) ? data : [];
      setAssignedMembers(prev => ({
        ...prev,
        [cardId]: members.map((member: User) => member.id)
      }));
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

      const currentAssignments = assignedMembers[currentCardId] || [];
      const isAssigned = currentAssignments.includes(userId);

      if (isAssigned) {
        await cardServices.removeMemberFromCard(currentCardId, userId);
        setAssignedMembers(prev => ({
          ...prev,
          [currentCardId]: prev[currentCardId].filter(id => id !== userId)
        }));
      } else {
        await cardServices.addMemberToCard(currentCardId, userId);
        setAssignedMembers(prev => ({
          ...prev,
          [currentCardId]: [...(prev[currentCardId] || []), userId]
        }));
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
              users={users}
              assignedMembers={(cardId) => assignedMembers[cardId] || []}
            />
          ))}
          <Pressable
            style={styles.addListButton}
            onPress={() => setShowCreateModal(true)}
          >
            <AntDesign name="plus" size={20} color="#fff" />
            <Text style={styles.addListButtonText}>Ajouter une liste</Text>
          </Pressable>
        </ScrollView>
      )}

      {/* List creation modal */}
      <CreateListModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateList}
        listName={newListName}
        setListName={setNewListName}
      />

      {/* List edit modal */}
      <EditListModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveEditList}
        listName={editingListName}
        setListName={setEditingListName}
      />

      {/* Card creation modal */}
      <CreateCardModal
        visible={showCardModal}
        onClose={() => {
          setShowCardModal(false);
          checklist.reset();
        }}
        onCreate={handleCreateCardWithChecklist}
        cardName={newCardName}
        setCardName={setNewCardName}
        cardDesc={newCardDesc}
        setCardDesc={setNewCardDesc}
        showDescription={showDescription}
        setShowDescription={setShowDescription}
        showChecklist={showChecklist}
        setShowChecklist={setShowChecklist}
        checklistName={checklist.newChecklistName}
        setChecklistName={checklist.setNewChecklistName}
        checklistItems={checklist.newChecklistItems}
        setChecklistItems={checklist.setNewChecklistItems}
        addChecklistItem={checklist.addChecklistItem}
        updateChecklistItem={checklist.updateChecklistItem}
        removeChecklistItem={checklist.removeChecklistItem}
      />

      {/* Checklist modal */}
      {checklist.selectedCard && (
        <ChecklistModal
          visible={checklist.showModal}
          onClose={() => checklist.setShowModal(false)}
          onSubmit={() => handleAddChecklistToExistingCard(checklist.selectedCard!)}
          name={checklist.newChecklistName}
          setName={checklist.setNewChecklistName}
          items={checklist.newChecklistItems}
          setItems={checklist.setNewChecklistItems}
          onAddItem={checklist.addChecklistItem}
          onUpdateItem={checklist.updateChecklistItem}
          onRemoveItem={checklist.removeChecklistItem}
        />
      )}

      {/* Card edit modal */}
      <EditCardModal
        visible={showEditCardModal}
        onClose={() => {
          setShowEditCardModal(false);
          setEditingCardId(null);
          setEditingCardName('');
          setEditingCardDesc('');
          checklist.reset();
          setShowDescription(false);
          setShowChecklist(false);
          setCurrentChecklistIndex(0);
        }}
        onSave={handleSaveEditCard}
        cardName={editingCardName}
        setCardName={setEditingCardName}
        cardDesc={editingCardDesc}
        setCardDesc={setEditingCardDesc}
        showDescription={showDescription}
        setShowDescription={setShowDescription}
        showChecklist={showChecklist}
        setShowChecklist={setShowChecklist}
        checklists={checklist.allChecklists}
        currentChecklistIndex={currentChecklistIndex}
        setCurrentChecklistIndex={setCurrentChecklistIndex}
        checklistName={checklist.newChecklistName}
        setChecklistName={checklist.setNewChecklistName}
        checklistItems={checklist.newChecklistItems}
        setChecklistItems={checklist.setNewChecklistItems}
        addChecklistItem={checklist.addChecklistItem}
        updateChecklistItem={checklist.updateChecklistItem}
        removeChecklistItem={checklist.removeChecklistItem}
        onCreateChecklist={checklist.addNewChecklist}
      />

      {/* Card View modal */}
      <ViewCardModal
        visible={showCardViewModal} 
        onClose={() => setShowCardViewModal(false)}
        card={viewingCard}
        checklistsData={checklistsData}
        onEditCard={handleEditCard}
        onArchiveCard={handleArchiveCard}
        onAssignCard={handleAssignCard}
        onOpenChecklistModal={handleOpenChecklistModal}
        onToggleChecklistItem={toggleChecklistItem}
      />

      {/* Assignment modal */}
      {(currentCardId && showAssignModal) && 
        <AssignUserModal
          visible={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          users={users}
          assignedMembers={assignedMembers[currentCardId] || []}
          onAssign={handleAssignUserToCard}
        />
      }
    </View>
  );
}
