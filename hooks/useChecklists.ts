import { useState, Dispatch, SetStateAction } from 'react';
import { cardServices } from '@/services/cardService';
import { Alert } from 'react-native';

interface ChecklistType {
  id: string;
  name: string;
  items: string[];
}

interface ChecklistItem {
  id: string;
  name: string;
  state: 'complete' | 'incomplete';
}

export interface UseChecklistsReturn {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  newChecklistName: string;
  setNewChecklistName: Dispatch<SetStateAction<string>>;
  newChecklistItems: string[];
  setNewChecklistItems: Dispatch<SetStateAction<string[]>>;
  allChecklists: ChecklistType[];
  setAllChecklists: Dispatch<SetStateAction<ChecklistType[]>>;
  currentChecklistIndex: number;
  setCurrentChecklistIndex: Dispatch<SetStateAction<number>>;
  addChecklistItem: () => void;
  updateChecklistItem: (index: number, value: string) => void;
  removeChecklistItem: (index: number) => void;
  selectedCard: string | null;
  setSelectedCard: Dispatch<SetStateAction<string | null>>;
  addNewChecklist: () => void;
  handleSubmit: () => Promise<boolean>;
  saveChecklistChanges: () => Promise<boolean>;
  loadChecklistsForCard: (cardId: string, preserveIndex?: boolean) => Promise<ChecklistType[]>;
  loadSelectedChecklist: (index: number) => boolean;
  deleteChecklist: (checklistId: string) => Promise<boolean>;
  isUpdating: boolean;
  reset: () => void;
}

export const useChecklists = (): UseChecklistsReturn => {
  const [showModal, setShowModal] = useState(false);
  const [newChecklistName, setNewChecklistName] = useState('');
  const [newChecklistItems, setNewChecklistItems] = useState<string[]>(['']);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [allChecklists, setAllChecklists] = useState<ChecklistType[]>([]);
  const [currentChecklistIndex, setCurrentChecklistIndex] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load checklists for a specific card
  const loadChecklistsForCard = async (cardId: string, preserveIndex: boolean = false) => {
    try {
      console.log(`Loading checklists for card: ${cardId}, preserveIndex: ${preserveIndex}`);
      const checklists = await cardServices.getCardChecklists(cardId);

      // Format the checklists to match our expected format
      const formattedChecklists = checklists.map(cl => ({
        id: cl.id,
        name: cl.name,
        items: cl.checkItems.map(item => item.name)
      }));

      console.log(`Loaded ${formattedChecklists.length} checklists`);
      setAllChecklists(formattedChecklists);

      if (formattedChecklists.length > 0) {
        if (!preserveIndex) {
          console.log('Setting to first checklist (index 0)');
          setCurrentChecklistIndex(0);
          setNewChecklistName(formattedChecklists[0].name);
          setNewChecklistItems(formattedChecklists[0].items);
        } else {
          // Conserve les valeurs actuelles si preserveIndex est true
          console.log(`Preserving current index: ${currentChecklistIndex}`);
          if (currentChecklistIndex >= 0 && currentChecklistIndex < formattedChecklists.length) {
            console.log(`Using checklist at index ${currentChecklistIndex}: ${formattedChecklists[currentChecklistIndex].name}`);
            setNewChecklistName(formattedChecklists[currentChecklistIndex].name);
            setNewChecklistItems([...formattedChecklists[currentChecklistIndex].items]);
          } else {
            console.log(`Current index ${currentChecklistIndex} is out of bounds, falling back to first checklist`);
            setCurrentChecklistIndex(0);
            setNewChecklistName(formattedChecklists[0].name);
            setNewChecklistItems(formattedChecklists[0].items);
          }
        }
      } else {
        console.log('No checklists found, resetting values');
        setNewChecklistName('');
        setNewChecklistItems(['']);
        setCurrentChecklistIndex(0);
      }

      return formattedChecklists;
    } catch (error) {
      console.error('Error loading checklists:', error);
      Alert.alert('Erreur', 'Impossible de charger les checklists');
      return [];
    }
  };

  // Add a new checklist item
  const addChecklistItem = () => {
    setNewChecklistItems([...newChecklistItems, '']);
  };

  // Update a checklist item
  const updateChecklistItem = (index: number, value: string) => {
    const updatedItems = [...newChecklistItems];
    updatedItems[index] = value;
    setNewChecklistItems(updatedItems);
  };

  // Remove a checklist item
  const removeChecklistItem = (index: number) => {
    if (newChecklistItems.length > 1) {
      const updatedItems = [...newChecklistItems];
      updatedItems.splice(index, 1);
      setNewChecklistItems(updatedItems);
    }
  };

  // Add a new checklist to a card
  const handleSubmit = async () => {
    if (!selectedCard) return false;
    try {
      if (!newChecklistName.trim()) throw new Error('Le nom est requis');

      const checklist = await cardServices.addChecklistToCard(
        selectedCard,
        newChecklistName
      );

      for (const item of newChecklistItems.filter(i => i.trim())) {
        await cardServices.addChecklistItem(checklist.id, item);
      }

      setNewChecklistName('');
      setNewChecklistItems(['']);
      setShowModal(false);
      return true;
    } catch (error) {
      console.error('Create checklist failed:', error);
      return false;
    }
  };

  // Create a new checklist UI element
  const addNewChecklist = () => {
    const newChecklist = {
      id: `temp-${Date.now()}`, // Temporary ID
      name: 'Nouvelle checklist',
      items: ['']
    };
    setAllChecklists([...allChecklists, newChecklist]);
    setCurrentChecklistIndex(allChecklists.length);
    setNewChecklistName(newChecklist.name);
    setNewChecklistItems(newChecklist.items);
  };

  // Save changes to an existing checklist
  const saveChecklistChanges = async () => {
    if (!selectedCard) {
      console.error('No card selected');
      Alert.alert('Erreur', 'Aucune carte sélectionnée');
      return false;
    }

    setIsUpdating(true);

    try {
      console.log(`Saving checklist changes with currentChecklistIndex: ${currentChecklistIndex}`);
      console.log(`Total checklists available: ${allChecklists.length}`);

      // Vérifier que l'index courant est valide
      if (currentChecklistIndex < 0 || currentChecklistIndex >= allChecklists.length) {
        console.error('Invalid current checklist index:', currentChecklistIndex);
        Alert.alert('Erreur', `Index de checklist invalide: ${currentChecklistIndex}, total: ${allChecklists.length}`);
        return false;
      }

      // Récupérer la checklist courante
      const checklistToUpdate = allChecklists[currentChecklistIndex];
      if (!checklistToUpdate) {
        console.error('No checklist found at index:', currentChecklistIndex);
        Alert.alert('Erreur', 'Checklist introuvable');
        return false;
      }

      console.log('Saving checklist - Current index:', currentChecklistIndex);
      console.log('Checklist ID:', checklistToUpdate.id);
      console.log('Original Name:', checklistToUpdate.name);
      console.log('New Name:', newChecklistName);
      console.log('Checklist Items:', JSON.stringify(newChecklistItems));

      // Cas 1: Nouvelle checklist (ID temporaire)
      if (checklistToUpdate.id.startsWith('temp-')) {
        console.log('Creating new checklist...');
        try {
          const checklist = await cardServices.addChecklistToCard(
            selectedCard,
            newChecklistName
          );
          console.log(`New checklist created with ID: ${checklist.id}`);

          // Ajouter tous les éléments non vides
          const validItems = newChecklistItems.filter(i => i.trim());
          console.log(`Adding ${validItems.length} items to new checklist`);

          for (const item of validItems) {
            await cardServices.addChecklistItem(checklist.id, item);
          }

          // Mise à jour de l'état local
          const updatedChecklists = [...allChecklists];
          updatedChecklists[currentChecklistIndex] = {
            id: checklist.id,
            name: newChecklistName,
            items: validItems
          };
          setAllChecklists(updatedChecklists);
        } catch (error) {
          console.error('Failed to create new checklist:', error);
          throw error;
        }
      }
      // Cas 2: Checklist existante
      else {
        // Vérifier qu'on a bien la checklist sélectionnée
        const selectedChecklist = allChecklists[currentChecklistIndex];
        if (!selectedChecklist) {
          throw new Error('No checklist selected');
        }

        console.log(`Updating existing checklist with ID: ${selectedChecklist.id} at index ${currentChecklistIndex}`);

        // Mise à jour du nom si nécessaire
        if (selectedChecklist.name !== newChecklistName) {
          console.log(`Updating checklist name from "${selectedChecklist.name}" to "${newChecklistName}"`);
          try {
            await cardServices.updateChecklist(selectedChecklist.id, newChecklistName);
            console.log('Checklist name updated successfully');
          } catch (error) {
            console.error('Failed to update checklist name:', error);
            throw error;
          }
        }

        // Récupération des éléments existants pour comparaison
        console.log('Fetching current checklist items from server');
        const serverChecklists = await cardServices.getCardChecklists(selectedCard);
        const matchingChecklist = serverChecklists.find(cl => cl.id === selectedChecklist.id);

        if (matchingChecklist) {
          console.log(`Found matching checklist on server with ${matchingChecklist.checkItems.length} items`);

          // Synchronisation des éléments
          try {
            await syncChecklistItems(selectedChecklist.id, newChecklistItems, matchingChecklist.checkItems);
            console.log('Checklist items synchronized successfully');
          } catch (error) {
            console.error('Failed to sync checklist items:', error);
            throw error;
          }

          // Mise à jour de l'état local
          const updatedChecklists = [...allChecklists];
          updatedChecklists[currentChecklistIndex] = {
            ...selectedChecklist,
            name: newChecklistName,
            items: newChecklistItems.filter(i => i.trim())
          };
          setAllChecklists(updatedChecklists);
        } else {
          console.error(`Could not find checklist with ID ${selectedChecklist.id} on server`);
          throw new Error('Checklist not found on server');
        }
      }

      // Force reload from server to ensure everything is synced
      console.log('Reloading checklists from server to confirm changes');
      await loadChecklistsForCard(selectedCard, true); // Préserver l'index actuel

      setIsUpdating(false);
      return true;
    } catch (error) {
      console.error('Save checklist changes failed:', error);
      setIsUpdating(false);
      Alert.alert('Erreur', `Impossible de sauvegarder les modifications: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      return false;
    }
  };

  const syncChecklistItems = async (
    checklistId: string,
    newItems: string[],
    existingItems: ChecklistItem[]
  ) => {
    try {
      if (!checklistId) {
        console.error('Missing checklist ID');
        throw new Error('Missing checklist ID');
      }

      console.log(`Syncing items for checklist ID: ${checklistId}`);
      console.log(`New items (${newItems.length}):`, JSON.stringify(newItems));
      console.log(`Existing items (${existingItems.length}):`, JSON.stringify(existingItems));

      const validItems = newItems.filter(item => item.trim());
      console.log(`Valid items after filtering (${validItems.length}):`, JSON.stringify(validItems));

      // Alternative : supprimer tous les items existants et ajouter les nouveaux
      // 1. Supprimer tous les items existants
      for (const item of existingItems) {
        console.log(`Deleting item: ${item.id} - ${item.name}`);
        await cardServices.deleteChecklistItem(checklistId, item.id);
      }

      // 2. Ajouter tous les nouveaux items
      for (const item of validItems) {
        console.log(`Adding new item: ${item}`);
        await cardServices.addChecklistItem(checklistId, item);
      }

      console.log('All checklist items successfully synchronized');
      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  };

  // New function to delete a checklist item
  const deleteChecklistItem = async (checklistId: string, itemId: string) => {
    try {
      await cardServices.deleteChecklistItem(checklistId, itemId);
      return true;
    } catch (error) {
      console.error('Delete checklist item failed:', error);
      throw error;
    }
  };

  // New function to delete an entire checklist
  const deleteChecklist = async (checklistId: string) => {
    try {
      await cardServices.deleteChecklist(checklistId);

      // Update our local state
      const updatedChecklists = allChecklists.filter(cl => cl.id !== checklistId);
      setAllChecklists(updatedChecklists);

      if (updatedChecklists.length > 0) {
        setCurrentChecklistIndex(0);
        setNewChecklistName(updatedChecklists[0].name);
        setNewChecklistItems(updatedChecklists[0].items);
      } else {
        setNewChecklistName('');
        setNewChecklistItems(['']);
      }

      return true;
    } catch (error) {
      console.error('Delete checklist failed:', error);
      Alert.alert('Erreur', 'Impossible de supprimer la checklist');
      return false;
    }
  };

  const reset = () => {
    setNewChecklistName('');
    setNewChecklistItems(['']);
    setShowModal(false);
    setSelectedCard(null);
    setAllChecklists([]);
    setCurrentChecklistIndex(0);
  };

  const loadSelectedChecklist = (index: number) => {
    console.log(`Loading selected checklist at index: ${index}`);
    if (index < 0 || index >= allChecklists.length) {
      console.error('Invalid checklist index:', index);
      return false;
    }

    const checklist = allChecklists[index];
    setCurrentChecklistIndex(index);
    setNewChecklistName(checklist.name);
    setNewChecklistItems([...checklist.items]);
    console.log(`Loaded checklist: ${checklist.name} with ${checklist.items.length} items`);
    return true;
  };

  return {
    showModal,
    setShowModal,
    newChecklistName,
    setNewChecklistName,
    newChecklistItems,
    setNewChecklistItems,
    allChecklists,
    setAllChecklists,
    currentChecklistIndex,
    setCurrentChecklistIndex,
    addChecklistItem,
    updateChecklistItem,
    removeChecklistItem,
    selectedCard,
    setSelectedCard,
    addNewChecklist,
    handleSubmit,
    saveChecklistChanges,
    loadChecklistsForCard,
    loadSelectedChecklist,
    deleteChecklist,
    isUpdating,
    reset
  };
};