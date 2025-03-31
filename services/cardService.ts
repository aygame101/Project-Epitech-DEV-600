import axios from 'axios';

const API_URL = 'https://api.trello.com/1/';
const API_KEY = 'your_api_key';
const TOKEN = 'your_token';

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


