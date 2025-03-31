import Constants from 'expo-constants';

// Configuration Trello
const API_KEY = Constants.expoConfig?.extra?.apiKey;
const API_TOKEN = Constants.expoConfig?.extra?.token;

export const fetchWorkspaces = async () => {
  try {
    const response = await fetch(
      `https://api.trello.com/1/members/me/organizations?key=${API_KEY}&token=${API_TOKEN}`
    );

    if (!response.ok) throw new Error('Échec de la récupération des workspaces');

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const createWorkspace = async (workspaceName: string) => {
  try {
    const response = await fetch(
      `https://api.trello.com/1/organizations/?displayName=${workspaceName}&key=${API_KEY}&token=${API_TOKEN}`,
      {
        method: 'POST',
      }
    );

    if (!response.ok) throw new Error('Échec de la création du workspace');

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const deleteWorkspace = async (id: string) => {
  try {
    const response = await fetch(
      `https://api.trello.com/1/organizations/${id}?key=${API_KEY}&token=${API_TOKEN}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) throw new Error('Échec de la suppression du workspace');
  } catch (error) {
    throw error;
  }
};


export const updateWorkspace = async (id: string, newName: string) => {
    try {
      const response = await fetch(
        `https://api.trello.com/1/organizations/${id}?key=${API_KEY}&token=${API_TOKEN}`,
        {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ displayName: newName }),
        }
      );
  
      if (!response.ok) throw new Error('Échec de la mise à jour du workspace');
  
      return await response.json();
    } catch (error) {
      throw error;
    }
  };
  
  