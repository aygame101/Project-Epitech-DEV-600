import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = 'https://api.trello.com/1/'
const API_KEY = Constants.expoConfig?.extra?.apiKey;
const TOKEN = Constants.expoConfig?.extra?.token;


// Récupère les cards
export const getCards = async (listId: string) => {
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
      throw error;
    }
  };
  
  // Ajoute une card
  export const addCard = async (listId: string, name: string, desc?: string) => {
    try {
      console.log('Adding card with parameters:', { listId, name, desc, API_KEY, TOKEN });
  
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
      throw error;
    }
  };
  
  
  // Supprime une card
  export const deleteCard = async (cardId: string) => {
    try {
      const response = await axios.delete(`${API_URL}cards/${cardId}`, {
        params: {
          key: API_KEY,
          token: TOKEN,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
  };
  
  // Met à jour une card
  export const updateCard = async (cardId: string, name?: string, desc?: string) => {
    try {
      const response = await axios.put(`${API_URL}cards/${cardId}`, null, {
        params: {
          name,
          desc,
          key: API_KEY,
          token: TOKEN,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  };