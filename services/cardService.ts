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
    } catch (error) {
      console.error('Error fetching cards:', error);
      throw new Error('Failed to fetch cards');
    }
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
    } catch (error) {
      console.error('Error adding card:', error.response ? error.response.data : error.message);
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
    } catch (error) {
      console.error('Error deleting card:', error);
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
    } catch (error) {
      console.error('Error updating card:', error);
      throw new Error('Failed to update card');
    }
  },
};
