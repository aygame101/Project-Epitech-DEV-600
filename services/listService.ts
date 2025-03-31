import Constants from 'expo-constants';
import { List } from '@/types/List';

// Configuration Trello
const API_KEY = Constants.expoConfig?.extra?.apiKey;
const API_TOKEN = Constants.expoConfig?.extra?.token;

export const listServices = {
  /**
   * Récupère toutes les listes d'un tableau
   */
  getListsByBoardId: async (boardId: string): Promise<List[]> => {
    const response = await fetch(
      `https://api.trello.com/1/boards/${boardId}/lists?key=${API_KEY}&token=${API_TOKEN}`
    );
    
    if (!response.ok) throw new Error('Échec du chargement des listes');
    
    return await response.json();
  },

  /**
   * Crée une nouvelle liste
   */
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

  /**
   * Met à jour une liste
   */
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

  /**
   * Archive une liste
   */
  archiveList: async (listId: string): Promise<List> => {
    return await listServices.updateList(listId, { closed: true });
  },

  /**
   * Désarchive une liste
   */
  unarchiveList: async (listId: string): Promise<List> => {
    return await listServices.updateList(listId, { closed: false });
  },

  /**
   * Déplace une liste à une nouvelle position
   */
  moveList: async (listId: string, position: number): Promise<List> => {
    return await listServices.updateList(listId, { pos: position });
  }
};