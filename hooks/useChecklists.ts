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

export const useChecklists = () => {
  const [showModal, setShowModal] = useState(false);
  const [newChecklistName, setNewChecklistName] = useState('');
  const [newChecklistItems, setNewChecklistItems] = useState<string[]>(['']);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [allChecklists, setAllChecklists] = useState<ChecklistType[]>([]);
  const [currentChecklistIndex, setCurrentChecklistIndex] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load checklists for a specific card
  const loadChecklistsForCard = async (cardId: string) => {
    try {
      const checklists = await cardServices.getCardChecklists(cardId);
      
      // Format the checklists to match our expected format
      const formattedChecklists = checklists.map(cl => ({
        id: cl.id,
        name: cl.name,
        items: cl.checkItems.map(item => item.name)
      }));
      
      setAllChecklists(formattedChecklists);
      
      if (formattedChecklists.length > 0) {
        setCurrentChecklistIndex(0);
        setNewChecklistName(formattedChecklists[0].name);
        setNewChecklistItems(formattedChecklists[0].items);
      } else {
        setNewChecklistName('');
        setNewChecklistItems(['']);
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
    if (!selectedCard) return false;
    setIsUpdating(true);
    
    try {
      const currentChecklist = allChecklists[currentChecklistIndex];
      
      // If this is a new checklist (with temporary ID)
      if (currentChecklist.id.startsWith('temp-')) {
        // Create new checklist
        const checklist = await cardServices.addChecklistToCard(
          selectedCard,
          newChecklistName
        );
        
        // Add all items
        for (const item of newChecklistItems.filter(i => i.trim())) {
          await cardServices.addChecklistItem(checklist.id, item);
        }
        
        // Update the checklist in our state with real ID
        const updatedChecklists = [...allChecklists];
        updatedChecklists[currentChecklistIndex] = {
          id: checklist.id,
          name: newChecklistName,
          items: newChecklistItems.filter(i => i.trim())
        };
        setAllChecklists(updatedChecklists);
      } 
      // Existing checklist
      else {
        // Update checklist name if changed
        if (currentChecklist.name !== newChecklistName) {
          await updateChecklistName(currentChecklist.id, newChecklistName);
        }
        
        // Get current items on the server
        const serverChecklist = await cardServices.getCardChecklists(selectedCard);
        const matchingChecklist = serverChecklist.find(cl => cl.id === currentChecklist.id);
        
        if (matchingChecklist) {
          const existingItems = matchingChecklist.checkItems;
          
          // Handle item changes (this is more complex as we need to track which items were added/removed/modified)
          await syncChecklistItems(currentChecklist.id, newChecklistItems, existingItems);
        }
        
        // Update our local state
        const updatedChecklists = [...allChecklists];
        updatedChecklists[currentChecklistIndex] = {
          ...currentChecklist,
          name: newChecklistName,
          items: newChecklistItems.filter(i => i.trim())
        };
        setAllChecklists(updatedChecklists);
      }
      
      setIsUpdating(false);
      return true;
    } catch (error) {
      console.error('Save checklist changes failed:', error);
      setIsUpdating(false);
      Alert.alert('Erreur', 'Impossible de sauvegarder les modifications');
      return false;
    }
  };

  // New function to update a checklist name
  const updateChecklistName = async (checklistId: string, newName: string) => {
    try {
      // API call to update checklist name
      const response = await fetch(
        `https://api.trello.com/1/checklists/${checklistId}?name=${encodeURIComponent(newName)}&key=${cardServices.API_KEY}&token=${cardServices.API_TOKEN}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      if (!response.ok) throw new Error('Failed to update checklist name');
      return await response.json();
    } catch (error) {
      console.error('Update checklist name failed:', error);
      throw error;
    }
  };

  // New function to sync checklist items (handles additions, updates, and removals)
  const syncChecklistItems = async (
    checklistId: string, 
    newItems: string[], 
    existingItems: ChecklistItem[]
  ) => {
    try {
      const filteredNewItems = newItems.filter(item => item.trim());
      
      // Add new items
      for (const item of filteredNewItems) {
        // Check if this item is new or already exists
        const existingItem = existingItems.find(ei => ei.name === item);
        
        if (!existingItem) {
          // This is a new item, add it
          await cardServices.addChecklistItem(checklistId, item);
        }
      }
      
      // Remove items that no longer exist
      for (const existingItem of existingItems) {
        if (!filteredNewItems.includes(existingItem.name)) {
          // This item was removed, delete it
          await deleteChecklistItem(checklistId, existingItem.id);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Sync checklist items failed:', error);
      throw error;
    }
  };

  // New function to delete a checklist item
  const deleteChecklistItem = async (checklistId: string, itemId: string) => {
    try {
      const response = await fetch(
        `https://api.trello.com/1/checklists/${checklistId}/checkItems/${itemId}?key=${cardServices.API_KEY}&token=${cardServices.API_TOKEN}`,
        {
          method: 'DELETE'
        }
      );
      
      if (!response.ok) throw new Error('Failed to delete checklist item');
      return true;
    } catch (error) {
      console.error('Delete checklist item failed:', error);
      throw error;
    }
  };

  // New function to delete an entire checklist
  const deleteChecklist = async (checklistId: string) => {
    try {
      const response = await fetch(
        `https://api.trello.com/1/checklists/${checklistId}?key=${cardServices.API_KEY}&token=${cardServices.API_TOKEN}`,
        {
          method: 'DELETE'
        }
      );
      
      if (!response.ok) throw new Error('Failed to delete checklist');
      
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
    deleteChecklist,
    isUpdating,
    reset
  };
};