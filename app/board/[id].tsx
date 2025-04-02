import { useState, useEffect } from 'react';
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

function CardItem({ card, onEditCard, onViewCard }: CardItemProps) {
  const truncateDescription = (text: string, maxLength = 30) => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <Pressable style={styles.cardItem} onPress={() => onViewCard(card.id)}>
      <Text style={styles.cardTitle}>{card.name}</Text>
      {card.desc && (
        <Text style={styles.cardDescription} numberOfLines={1} ellipsizeMode="tail">
          {card.desc}
        </Text>
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

  const fetchBoardIdByCard = async (cardId: string) => {
    try {
      const response = await fetch(`https://api.trello.com/1/cards/${cardId}?fields=idBoard&key=625a06c8525ea14e94d75b7f03cf6051&token=ATTA75822e9f3501426780c7190ff61203b040e0e98bf64106f13f27ad4950990137C0A0BA60`);
      const data = await response.json();
      return data.idBoard;
    } catch (error) {
      console.error('Erreur lors du chargement de l\'ID du tableau:', error);
      throw error;
    }
  };

  const fetchWorkspaceIdByBoard = async (boardId: string) => {
    try {
      const response = await fetch(`https://api.trello.com/1/boards/${boardId}?fields=idOrganization&key=625a06c8525ea14e94d75b7f03cf6051&token=ATTA75822e9f3501426780c7190ff61203b040e0e98bf64106f13f27ad4950990137C0A0BA60`);
      const data = await response.json();
      return data.idOrganization;
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

      const response = await fetch(`https://api.trello.com/1/organizations/${workspaceId}/members?key=625a06c8525ea14e94d75b7f03cf6051&token=ATTA75822e9f3501426780c7190ff61203b040e0e98bf64106f13f27ad4950990137C0A0BA60`);
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
      const response = await fetch(`https://api.trello.com/1/cards/${cardId}/members?key=625a06c8525ea14e94d75b7f03cf6051&token=ATTA75822e9f3501426780c7190ff61203b040e0e98bf64106f13f27ad4950990137C0A0BA60`);
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

      {/* Card view modal */}
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

                {viewingCard?.desc ? (
                  <ScrollView style={styles.cardViewDescription}>
                    <Text>{viewingCard.desc}</Text>
                  </ScrollView>
                ) : (
                  <Text style={styles.noDescriptionText}>Pas de description</Text>
                )}

                <View style={styles.modalButtonsContainer}>
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
