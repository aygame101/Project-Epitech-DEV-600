import { useState } from 'react';
import { cardServices } from '@/services/cardService';

export const useChecklists = () => {
  const [showModal, setShowModal] = useState(false);
  const [newChecklistName, setNewChecklistName] = useState('');
  const [newChecklistItems, setNewChecklistItems] = useState<string[]>(['']);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const addChecklistItem = () => {
    setNewChecklistItems([...newChecklistItems, '']);
  };

  const updateChecklistItem = (index: number, value: string) => {
    const updated = [...newChecklistItems];
    updated[index] = value;
    setNewChecklistItems(updated);
  };

  const removeChecklistItem = (index: number) => {
    if (newChecklistItems.length > 1) {
      const updated = [...newChecklistItems];
      updated.splice(index, 1);
      setNewChecklistItems(updated);
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
      console.error('Create checklist failed:', error);
      return false;
    }
  };

  const reset = () => {
    setNewChecklistName('');
    setNewChecklistItems(['']);
    setShowModal(false);
    setSelectedCard(null);
  };

  return {
    showModal,
    setShowModal,
    newChecklistName, 
    setNewChecklistName,
    newChecklistItems,
    setNewChecklistItems,
    addChecklistItem,
    updateChecklistItem,
    removeChecklistItem, 
    selectedCard,
    setSelectedCard,
    handleSubmit,
    reset
  };
};
