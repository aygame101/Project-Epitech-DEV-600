import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = 'https://api.trello.com/1/'
const API_KEY = Constants.expoConfig?.extra?.apiKey;
const TOKEN = Constants.expoConfig?.extra?.token;


export const getCards = async (boardId: string, listId: string) => {
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

// ajouter une nouvelle carte à une liste
export const addCard = async (listId: string, name: string, desc?: string) => {
    try {
      const response = await axios.post(`${API_URL}cards/`, {
        name,
        desc,
        idList: listId,
        key: API_KEY,
        token: TOKEN,
      });
      return response.data;
    } catch (error) {
      console.error('Error adding card:', error);
      throw error;
    }
  };
  
  // supprimer une carte
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
  
  //  mettre à jour une carte
  export const updateCard = async (cardId: string, name?: string, desc?: string) => {
    try {
      const response = await axios.put(`${API_URL}cards/${cardId}`, {
        name,
        desc,
        key: API_KEY,
        token: TOKEN,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  };


