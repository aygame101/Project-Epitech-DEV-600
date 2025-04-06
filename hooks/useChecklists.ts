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

  const loadChecklistsForCard = async (cardId: string, preserveIndex: boolean = false) => {
    try {
      const checklists = await cardServices.getCardChecklists(cardId);

      const formattedChecklists = checklists.map(cl => ({
        id: cl.id,
        name: cl.name,
        items: cl.checkItems.map(item => item.name)
      }));

      setAllChecklists(formattedChecklists);

      if (formattedChecklists.length > 0) {
        if (!preserveIndex) {
          setCurrentChecklistIndex(0);
          setNewChecklistName(formattedChecklists[0].name);
          setNewChecklistItems(formattedChecklists[0].items);
        } else {

          if (currentChecklistIndex >= 0 && currentChecklistIndex < formattedChecklists.length) {
            setNewChecklistName(formattedChecklists[currentChecklistIndex].name);
            setNewChecklistItems([...formattedChecklists[currentChecklistIndex].items]);
          } else {
            setCurrentChecklistIndex(0);
            setNewChecklistName(formattedChecklists[0].name);
            setNewChecklistItems(formattedChecklists[0].items);
          }
        }
      } else {
        setNewChecklistName('');
        setNewChecklistItems(['']);
        setCurrentChecklistIndex(0);
      }

      return formattedChecklists;
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les checklists');
      return [];
    }
  };

  const addChecklistItem = () => {
    setNewChecklistItems([...newChecklistItems, '']);
  };

  const updateChecklistItem = (index: number, value: string) => {
    const updatedItems = [...newChecklistItems];
    updatedItems[index] = value;
    setNewChecklistItems(updatedItems);
  };

  const removeChecklistItem = (index: number) => {
    if (newChecklistItems.length > 1) {
      const updatedItems = [...newChecklistItems];
      updatedItems.splice(index, 1);
      setNewChecklistItems(updatedItems);
    }
  };

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
      return false;
    }
  };

  const addNewChecklist = () => {
    const newChecklist = {
      id: `temp-${Date.now()}`,
      name: 'Nouvelle checklist',
      items: ['']
    };
    setAllChecklists([...allChecklists, newChecklist]);
    setCurrentChecklistIndex(allChecklists.length);
    setNewChecklistName(newChecklist.name);
    setNewChecklistItems(newChecklist.items);
  };

  const saveChecklistChanges = async () => {
    if (!selectedCard) {
      Alert.alert('Erreur', 'Aucune carte sélectionnée');
      return false;
    }

    setIsUpdating(true);

    try {
      if (currentChecklistIndex < 0 || currentChecklistIndex >= allChecklists.length) {
        Alert.alert('Erreur', `Index de checklist invalide: ${currentChecklistIndex}, total: ${allChecklists.length}`);
        return false;
      }

      const checklistToUpdate = allChecklists[currentChecklistIndex];
      if (!checklistToUpdate) {
        Alert.alert('Erreur', 'Checklist introuvable');
        return false;
      }

      if (checklistToUpdate.id.startsWith('temp-')) {
        try {
          const checklist = await cardServices.addChecklistToCard(
            selectedCard,
            newChecklistName
          );

          const validItems = newChecklistItems.filter(i => i.trim());
          for (const item of validItems) {
            await cardServices.addChecklistItem(checklist.id, item);
          }

          const updatedChecklists = [...allChecklists];
          updatedChecklists[currentChecklistIndex] = {
            id: checklist.id,
            name: newChecklistName,
            items: validItems
          };
          setAllChecklists(updatedChecklists);
        } catch (error) {
          throw error;
        }
      }
      else {
        const selectedChecklist = allChecklists[currentChecklistIndex];
        if (!selectedChecklist) {
          throw new Error('No checklist selected');
        }

        if (selectedChecklist.name !== newChecklistName) {
          try {
            await cardServices.updateChecklist(selectedChecklist.id, newChecklistName);
          } catch (error) {
            throw error;
          }
        }

        const serverChecklists = await cardServices.getCardChecklists(selectedCard);
        const matchingChecklist = serverChecklists.find(cl => cl.id === selectedChecklist.id);

        if (matchingChecklist) {
          try {
            await syncChecklistItems(selectedChecklist.id, newChecklistItems, matchingChecklist.checkItems);
          } catch (error) {
            throw error;
          }

          const updatedChecklists = [...allChecklists];
          updatedChecklists[currentChecklistIndex] = {
            ...selectedChecklist,
            name: newChecklistName,
            items: newChecklistItems.filter(i => i.trim())
          };
          setAllChecklists(updatedChecklists);
        } else {
          throw new Error('Checklist not found on server');
        }
      }

      await loadChecklistsForCard(selectedCard, true);

      setIsUpdating(false);
      return true;
    } catch (error) {
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
        throw new Error('Missing checklist ID');
      }
  
      const validItems = newItems.filter(item => item.trim());
      const existingItemMap = new Map(existingItems.map(item => [item.id, item]));

      for (const [id, item] of existingItemMap.entries()) {
        if (!validItems.includes(item.name)) {
          await cardServices.deleteChecklistItem(checklistId, id);
          existingItemMap.delete(id);
        }
      }
  
      for (const itemName of validItems) {
        const existingItem = Array.from(existingItemMap.values()).find(item => item.name === itemName);
        if (existingItem) {
          continue;
        } else {
          await cardServices.addChecklistItem(checklistId, itemName);
        }
      }
  
      return true;
    } catch (error) {
      throw error;
    }
  };
  


  const deleteChecklist = async (checklistId: string) => {
    try {
      await cardServices.deleteChecklist(checklistId);

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
    if (index < 0 || index >= allChecklists.length) {
      return false;
    }

    const checklist = allChecklists[index];
    setCurrentChecklistIndex(index);
    setNewChecklistName(checklist.name);
    setNewChecklistItems([...checklist.items]);
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
