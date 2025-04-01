import Constants from 'expo-constants';
import { Board } from '@/types/Board';

// Configuration Trello
const API_KEY = Constants.expoConfig?.extra?.apiKey;
const API_TOKEN = Constants.expoConfig?.extra?.token;

export const boardServices = {
  /**
   * Récupère tous les tableaux de l'utilisateur
   */
  getBoards: async (): Promise<Board[]> => {
    const response = await fetch(
      `https://api.trello.com/1/members/me/boards?key=${API_KEY}&token=${API_TOKEN}&fields=name,desc,url,prefs,closed`
    );

    if (!response.ok) throw new Error('Échec du chargement des tableaux');

    const boards = await response.json();

    return boards.filter((board: Board) => !board.closed);
  },

  /**
   * Crée un nouveau tableau
   */
  createBoard: async (name: string): Promise<Board> => {
    const response = await fetch(
      `https://api.trello.com/1/boards/?key=${API_KEY}&token=${API_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          defaultLists: false
        })
      }
    );

    if (!response.ok) throw new Error(await response.text());

    return await response.json();
  },

  /**
   * Récupère un tableau spécifique par son ID
   */
  getBoardById: async (boardId: string): Promise<Board> => {
    const response = await fetch(
      `https://api.trello.com/1/boards/${boardId}?key=${API_KEY}&token=${API_TOKEN}&fields=id,name,desc,url,prefs`
    );

    if (!response.ok) throw new Error('Board not found');

    return await response.json();
  },

  /**
   * Supprime un tableau
   */
  deleteBoard: async (boardId: string): Promise<void> => {
    const response = await fetch(
      `https://api.trello.com/1/boards/${boardId}?key=${API_KEY}&token=${API_TOKEN}`,
      { method: 'DELETE' }
    );

    if (!response.ok) throw new Error('Failed to delete board');
  },

  /**
   * Met à jour un tableau
   */
  /**
 * Met à jour un tableau
 */
  updateBoard: async (boardId: string, updates: Partial<Board>): Promise<Board> => {
    const response = await fetch(
      `https://api.trello.com/1/boards/${boardId}?key=${API_KEY}&token=${API_TOKEN}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update board');
    }

    return await response.json();
  }

};