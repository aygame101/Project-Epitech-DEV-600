import Constants from 'expo-constants';
import { Card } from '@/types/Card';
import { User } from '@/types/User';

const API_KEY = Constants.expoConfig?.extra?.apiKey;
const API_TOKEN = Constants.expoConfig?.extra?.token;

export const cardServices = {
  // Expose these for other components
  API_KEY,
  API_TOKEN,
  
  getCards: async (listId: string): Promise<Card[]> => {
    const response = await fetch(
      `https://api.trello.com/1/lists/${listId}/cards?key=${API_KEY}&token=${API_TOKEN}`
    );
    if (!response.ok) throw new Error('Échec du chargement des cartes');
    return await response.json();
  },

  getCardsByBoard: async (boardId: string): Promise<Card[]> => {
    const response = await fetch(
      `https://api.trello.com/1/boards/${boardId}/cards?key=${API_KEY}&token=${API_TOKEN}`
    );
    if (!response.ok) throw new Error('Échec du chargement des cartes');
    return await response.json();
  },

  addCard: async (listId: string, name: string, desc?: string): Promise<Card> => {
    const response = await fetch(
      `https://api.trello.com/1/cards?key=${API_KEY}&token=${API_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          desc: desc || '',
          idList: listId
        })
      }
    );
    if (!response.ok) throw new Error('Failed to create card');
    return await response.json();
  },

  updateCard: async (cardId: string, updates: Partial<Card>): Promise<Card> => {
    const response = await fetch(
      `https://api.trello.com/1/cards/${cardId}?key=${API_KEY}&token=${API_TOKEN}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      }
    );
    if (!response.ok) throw new Error('Failed to update card');
    return await response.json();
  },

  archiveCard: async (cardId: string): Promise<void> => {
    const response = await fetch(
      `https://api.trello.com/1/cards/${cardId}?closed=true&key=${API_KEY}&token=${API_TOKEN}`,
      { method: 'PUT' }
    );
    if (!response.ok) throw new Error('Failed to archive card');
  },

  getCardDetails: async (cardId: string): Promise<Card> => {
    const response = await fetch(
      `https://api.trello.com/1/cards/${cardId}?key=${API_KEY}&token=${API_TOKEN}`
    );
    if (!response.ok) throw new Error('Failed to get card details');
    return await response.json();
  },

  getCardMembers: async (cardId: string): Promise<User[]> => {
    const response = await fetch(
      `https://api.trello.com/1/cards/${cardId}/members?key=${API_KEY}&token=${API_TOKEN}`
    );
    if (!response.ok) throw new Error('Failed to get card members');
    return await response.json();
  },

  addMemberToCard: async (cardId: string, userId: string): Promise<void> => {
    const response = await fetch(
      `https://api.trello.com/1/cards/${cardId}/idMembers?key=${API_KEY}&token=${API_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: userId })
      }
    );
    if (!response.ok) throw new Error('Failed to add member to card');
  },

  removeMemberFromCard: async (cardId: string, userId: string): Promise<void> => {
    const response = await fetch(
      `https://api.trello.com/1/cards/${cardId}/idMembers/${userId}?key=${API_KEY}&token=${API_TOKEN}`,
      { method: 'DELETE' }
    );
    if (!response.ok) throw new Error('Failed to remove member from card');
  },

  getBoardIdByCard: async (cardId: string): Promise<string> => {
    const response = await fetch(
      `https://api.trello.com/1/cards/${cardId}/board?key=${API_KEY}&token=${API_TOKEN}&fields=id`
    );
    if (!response.ok) throw new Error('Failed to get board ID');
    const data = await response.json();
    return data.id;
  },

  toggleCardMemberAssignment: async (cardId: string, userId: string): Promise<void> => {
    const isMember = await cardServices.isCardMember(cardId, userId);
    const url = `https://api.trello.com/1/cards/${cardId}/members/${userId}?key=${API_KEY}&token=${API_TOKEN}`;
    const method = isMember ? 'DELETE' : 'PUT';
    
    const response = await fetch(url, { method });
    if (!response.ok) throw new Error('Failed to toggle member assignment');
  },

  isCardMember: async (cardId: string, userId: string): Promise<boolean> => {
    const members = await cardServices.getCardMembers(cardId);
    return members.some((member: User) => member.id === userId);
  },

  getWorkspaceMembers: async (workspaceId: string): Promise<User[]> => {
    const response = await fetch(
      `https://api.trello.com/1/organizations/${workspaceId}/members?key=${API_KEY}&token=${API_TOKEN}`
    );
    if (!response.ok) throw new Error('Failed to get workspace members');
    return await response.json();
  },

  addChecklistToCard: async (cardId: string, name: string): Promise<{id: string}> => {
    const response = await fetch(
      `https://api.trello.com/1/cards/${cardId}/checklists?key=${API_KEY}&token=${API_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      }
    );
    if (!response.ok) throw new Error('Failed to add checklist');
    return await response.json();
  },

  addChecklistItem: async (checklistId: string, name: string): Promise<void> => {
    const response = await fetch(
      `https://api.trello.com/1/checklists/${checklistId}/checkItems?key=${API_KEY}&token=${API_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      }
    );
    if (!response.ok) throw new Error('Failed to add checklist item');
  },

  updateChecklistItem: async (checklistId: string, itemId: string, name: string): Promise<void> => {
    const response = await fetch(
      `https://api.trello.com/1/checklists/${checklistId}/checkItems/${itemId}?name=${encodeURIComponent(name)}&key=${API_KEY}&token=${API_TOKEN}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      }
    );
    if (!response.ok) throw new Error('Failed to update checklist item');
  },

  deleteChecklistItem: async (checklistId: string, itemId: string): Promise<void> => {
    const response = await fetch(
      `https://api.trello.com/1/checklists/${checklistId}/checkItems/${itemId}?key=${API_KEY}&token=${API_TOKEN}`,
      { method: 'DELETE' }
    );
    if (!response.ok) throw new Error('Failed to delete checklist item');
  },

  updateChecklist: async (checklistId: string, name: string): Promise<void> => {
    const response = await fetch(
      `https://api.trello.com/1/checklists/${checklistId}?name=${encodeURIComponent(name)}&key=${API_KEY}&token=${API_TOKEN}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      }
    );
    if (!response.ok) throw new Error('Failed to update checklist');
  },

  deleteChecklist: async (checklistId: string): Promise<void> => {
    const response = await fetch(
      `https://api.trello.com/1/checklists/${checklistId}?key=${API_KEY}&token=${API_TOKEN}`,
      { method: 'DELETE' }
    );
    if (!response.ok) throw new Error('Failed to delete checklist');
  },

  getCardChecklists: async (cardId: string): Promise<Array<{
    id: string;
    name: string;
    checkItems: Array<{
      id: string;
      name: string;
      state: 'complete' | 'incomplete';
    }>;
  }>> => {
    const response = await fetch(
      `https://api.trello.com/1/cards/${cardId}/checklists?key=${API_KEY}&token=${API_TOKEN}`
    );
    if (!response.ok) throw new Error('Failed to get card checklists');
    return await response.json();
  }
};