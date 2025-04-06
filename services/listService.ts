import Constants from 'expo-constants';
import { List } from '@/types/List';

// Config Trello
const API_KEY = Constants.expoConfig?.extra?.apiKey;
const API_TOKEN = Constants.expoConfig?.extra?.token;

export const listServices = {

  getListsByBoardId: async (boardId: string): Promise<List[]> => {
    const response = await fetch(
      `https://api.trello.com/1/boards/${boardId}/lists?key=${API_KEY}&token=${API_TOKEN}`
    );
    
    if (!response.ok) throw new Error('Échec du chargement des listes');
    
    return await response.json();
  },


  createList: async (boardId: string, name: string): Promise<List> => {
    const response = await fetch(
      `https://api.trello.com/1/lists?key=${API_KEY}&token=${API_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          idBoard: boardId,
          pos: 'bottom'
        })
      }
    );
    
    if (!response.ok) throw new Error(await response.text());
    
    return await response.json();
  },

  updateList: async (listId: string, updates: Partial<List>): Promise<List> => {
    const response = await fetch(
      `https://api.trello.com/1/lists/${listId}?key=${API_KEY}&token=${API_TOKEN}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      }
    );
    
    if (!response.ok) throw new Error('Failed to update list');
    
    return await response.json();
  },


  archiveList: async (listId: string): Promise<List> => {
    return await listServices.updateList(listId, { closed: true });
  },

  unarchiveList: async (listId: string): Promise<List> => {
    return await listServices.updateList(listId, { closed: false });
  },

  moveList: async (listId: string, position: number): Promise<List> => {
    return await listServices.updateList(listId, { pos: position });
  }
};