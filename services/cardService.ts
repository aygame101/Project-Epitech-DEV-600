import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = 'https://api.trello.com/1/';
const API_KEY = Constants.expoConfig?.extra?.apiKey;
const TOKEN = Constants.expoConfig?.extra?.token;

interface Card {
  id: string;
  name: string;
  desc?: string;
  idList: string;
}

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
};
