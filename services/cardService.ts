import axios from 'axios';
import Constants from 'expo-constants';
import { Card, Checklist } from '../types/Card';

const API_URL = 'https://api.trello.com/1/';
const API_KEY = Constants.expoConfig?.extra?.apiKey;
const TOKEN = Constants.expoConfig?.extra?.token;

export const cardServices = {
  /**
   * Récupère toutes les cartes d'une liste
   */
  getCards: async (listId: string): Promise<Card[]> => {
    try {
      const response = await axios.get(`${API_URL}lists/${listId}/cards`, {
        params: {
          key: API_KEY,
          token: TOKEN,
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching cards:', error.message);
      } else {
        console.error('Unknown error fetching cards');
      }
      throw new Error('Failed to fetch cards');
    }
  },

  

  /**
   * Récupère toutes les cartes d'un tableau
   */
  getCardsByBoard: async (boardId: string): Promise<Card[]> => {
    try {
      const response = await axios.get(`${API_URL}boards/${boardId}/cards`, {
        params: {
          key: API_KEY,
          token: TOKEN,
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching cards for board:', error.message);
      } else {
        console.error('Unknown error fetching cards for board');
      }
      throw new Error('Failed to fetch cards for board');
    }
  },

  /**
   * Récupère toutes les cartes d'une liste (méthode alternative)
   * Utilise getCardsByBoard et filtre les résultats
   */
  getCardsByList: async (listId: string): Promise<Card[]> => {
    try {
      // Vous pouvez implémenter cette méthode de deux façons:
      
      // Option 1: Utiliser votre méthode getCards existante
      return await cardServices.getCards(listId);
      
      // Option 2: Récupérer toutes les cartes du tableau et filtrer
      // Note: Cette option nécessiterait de connaître le boardId
      // const boardId = '...'; // Il faudrait stocker ou récupérer l'ID du tableau
      // const allCards = await cardServices.getCardsByBoard(boardId);
      // return allCards.filter(card => card.idList === listId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching cards for list:', error.message);
      } else {
        console.error('Unknown error fetching cards for list');
      }
      throw new Error('Failed to fetch cards for list');
    }
  },

  archiveCard: async (cardId: string): Promise<void> => {
    const response = await fetch(
      `https://api.trello.com/1/cards/${cardId}/closed?key=${API_KEY}&token=${TOKEN}&value=true`,
      {
        method: 'PUT',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to archive card');
    }

    return response.json();
  },

  /**
   * Ajoute une nouvelle carte à une liste
   */
  addCard: async (listId: string, name: string, desc?: string): Promise<Card> => {
    try {
      if (!listId) {
        throw new Error('listId is not defined or invalid');
      }

      const response = await axios.post(
        `${API_URL}cards/`,
        null,
        {
          params: {
            name,
            desc,
            idList: listId,
            key: API_KEY,
            token: TOKEN,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Error adding card:', error.response?.data || error.message);
      } else if (error instanceof Error) {
        console.error('Error adding card:', error.message);
      } else {
        console.error('Unknown error adding card');
      }
      throw new Error('Failed to add card');
    }
  },

  /**
   * Supprime une carte
   */
  deleteCard: async (cardId: string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}cards/${cardId}`, {
        params: {
          key: API_KEY,
          token: TOKEN,
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error deleting card:', error.message);
      } else {
        console.error('Unknown error deleting card');
      }
      throw new Error('Failed to delete card');
    }
  },

  /**
   * Met à jour une carte
   */
  updateCard: async (cardId: string, updates: Partial<Card>): Promise<Card> => {
    try {
      const response = await axios.put(`${API_URL}cards/${cardId}`, null, {
        params: {
          ...updates,
          key: API_KEY,
          token: TOKEN,
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error updating card:', error.message);
      } else {
        console.error('Unknown error updating card');
      }
      throw new Error('Failed to update card');
    }
  },

  /**
   * Ajoute un membre à une carte
   */
  addMemberToCard: async (cardId: string, memberId: string): Promise<void> => {
    try {
      await axios.post(`${API_URL}cards/${cardId}/idMembers`, null, {
        params: {
          value: memberId,
          key: API_KEY,
          token: TOKEN,
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error adding member to card:', error.message);
      } else {
        console.error('Unknown error adding member to card');
      }
      throw new Error('Failed to add member to card');
    }
  },

  /**
   * Supprime un membre d'une carte
   */
  removeMemberFromCard: async (cardId: string, memberId: string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}cards/${cardId}/idMembers/${memberId}`, {
        params: {
          key: API_KEY,
          token: TOKEN,
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error removing member from card:', error.message);
      } else {
        console.error('Unknown error removing member from card');
      }
      throw new Error('Failed to remove member from card');
    }
  },

  /**
   * Ajoute un élément à une checklist
   */
  addChecklistItem: async (checklistId: string, name: string): Promise<any> => {
    try {
      const response = await axios.post(`${API_URL}checklists/${checklistId}/checkItems`, null, {
        params: {
          name,
          key: API_KEY,
          token: TOKEN,
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error adding checklist item:', error.message);
      } else {
        console.error('Unknown error adding checklist item');
      }
      throw new Error('Failed to add checklist item');
    }
  },

  /**
   * Récupère les détails d'une carte
   */
  getCardDetails: async (cardId: string): Promise<Card> => {
    try {
      const response = await axios.get(`${API_URL}cards/${cardId}`, {
        params: {
          key: API_KEY,
          token: TOKEN,
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching card details:', error.message);
      } else {
        console.error('Unknown error fetching card details');
      }
      throw new Error('Failed to fetch card details');
    }
  },

  /**
   * Récupère les membres d'un workspace
   */
  getWorkspaceMembers: async (workspaceId: string): Promise<any> => {
    try {
      const response = await axios.get(`${API_URL}organizations/${workspaceId}/members`, {
        params: {
          key: API_KEY,
          token: TOKEN,
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching workspace members:', error.message);
      } else {
        console.error('Unknown error fetching workspace members');
      }
      throw new Error('Failed to fetch workspace members');
    }
  },

  /**
   * Récupère les membres assignés à une carte
   */
  getCardMembers: async (cardId: string): Promise<any> => {
    try {
      const response = await axios.get(`${API_URL}cards/${cardId}/members`, {
        params: {
          key: API_KEY,
          token: TOKEN,
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching card members:', error.message);
      } else {
        console.error('Unknown error fetching card members');
      }
      throw new Error('Failed to fetch card members');
    }
  },

  /**
   * Ajoute une checklist à une carte
   */
  addChecklistToCard: async (cardId: string, title: string): Promise<Checklist> => {
    try {
      const response = await axios.post(`${API_URL}cards/${cardId}/checklists`, null, {
        params: {
          name: title,
          key: API_KEY,
          token: TOKEN,
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error adding checklist to card:', error.message);
      } else {
        console.error('Unknown error adding checklist to card');
      }
      throw new Error('Failed to add checklist to card');
    }
  },

  /**
   * Met à jour une checklist
   */
  updateChecklist: async (checklistId: string, updates: Partial<Checklist>): Promise<Checklist> => {
    try {
      const response = await axios.put(`${API_URL}checklists/${checklistId}`, null, {
        params: {
          ...updates,
          key: API_KEY,
          token: TOKEN,
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error updating checklist:', error.message);
      } else {
        console.error('Unknown error updating checklist');
      }
      throw new Error('Failed to update checklist');
    }
  },

  /**
   * Supprime une checklist
   */
  deleteChecklist: async (checklistId: string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}checklists/${checklistId}`, {
        params: {
          key: API_KEY,
          token: TOKEN,
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error deleting checklist:', error.message);
      } else {
        console.error('Unknown error deleting checklist');
      }
      throw new Error('Failed to delete checklist');
    }
  },

  /**
   * Définit la date d'échéance d'une carte
   */
  setCardDueDate: async (cardId: string, dueDate: string): Promise<Card> => {
    try {
      const response = await axios.put(`${API_URL}cards/${cardId}`, null, {
        params: {
          due: dueDate,
          key: API_KEY,
          token: TOKEN,
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error setting card due date:', error.message);
      } else {
        console.error('Unknown error setting card due date');
      }
      throw new Error('Failed to set card due date');
    }
  },

  /**
   * Ajoute un rappel pour une carte
   */
  addReminder: async (cardId: string, reminderDate: string): Promise<void> => {
    try {
      await axios.post(`${API_URL}cards/${cardId}/reminders`, null, {
        params: {
          date: reminderDate,
          key: API_KEY,
          token: TOKEN,
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error adding reminder:', error.message);
      } else {
        console.error('Unknown error adding reminder');
      }
      throw new Error('Failed to add reminder');
    }
  },
};
