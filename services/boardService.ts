import Constants from 'expo-constants';
import { Board } from '@/types/Board';

const API_KEY = Constants.expoConfig?.extra?.apiKey;
const API_TOKEN = Constants.expoConfig?.extra?.token;

export const boardServices = {
  getBoards: async (): Promise<Board[]> => {
    const response = await fetch(
      `https://api.trello.com/1/members/me/boards?key=${API_KEY}&token=${API_TOKEN}&fields=name,desc,url,prefs,closed,idOrganization`
    );
    if (!response.ok) throw new Error('Échec du chargement des tableaux');
    return (await response.json()).filter((board: Board) => !board.closed);
  },

  createBoard: async (name: string, defaultLists: boolean, idOrganization?: string): Promise<Board> => {
    const body: any = {
      name,
      defaultLists
    };
    if (idOrganization) body.idOrganization = idOrganization;
    
    const response = await fetch(
      `https://api.trello.com/1/boards/?key=${API_KEY}&token=${API_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  },

  getBoardById: async (boardId: string): Promise<Board> => {
    const response = await fetch(
      `https://api.trello.com/1/boards/${boardId}?key=${API_KEY}&token=${API_TOKEN}&fields=id,name,desc,url,prefs`
    );
    if (!response.ok) throw new Error('Board not found');
    return await response.json();
  },

  deleteBoard: async (boardId: string): Promise<void> => {
    const response = await fetch(
      `https://api.trello.com/1/boards/${boardId}?key=${API_KEY}&token=${API_TOKEN}`,
      { method: 'DELETE' }
    );
    if (!response.ok) throw new Error('Failed to delete board');
  },

  updateBoard: async (boardId: string, updates: Partial<Board>): Promise<Board> => {
    const response = await fetch(
      `https://api.trello.com/1/boards/${boardId}?key=${API_KEY}&token=${API_TOKEN}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      }
    );
    if (!response.ok) throw new Error('Failed to update board');
    return await response.json();
  },
  
  getWorkspaces: async () => {
    const response = await fetch(
      `https://api.trello.com/1/members/me/organizations?key=${API_KEY}&token=${API_TOKEN}`
    );
    if (!response.ok) throw new Error('Échec du chargement des workspaces');
    return await response.json();
  },

  getBoardDetails: async (boardId: string): Promise<Board> => {
    const response = await fetch(
      `https://api.trello.com/1/boards/${boardId}?key=${API_KEY}&token=${API_TOKEN}&fields=id,name,desc,url,prefs,idOrganization`
    );
    if (!response.ok) throw new Error('Board details not found');
    return await response.json();
  },

  getWorkspaceIdByBoard: async (boardId: string): Promise<string> => {
    const board = await boardServices.getBoardDetails(boardId);
    if (!board.idOrganization) throw new Error('Ce tableau n\'appartient à aucun workspace');
    return board.idOrganization;
  }
};
