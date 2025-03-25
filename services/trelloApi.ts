import axios from 'axios';
import Constants from 'expo-constants';

class TrelloApiService {
  private apiKey: string;
  private token: string;
  public baseUrl = 'https://api.trello.com/1';

  constructor() {
    // Récupération directe depuis extra
    const config = Constants.expoConfig?.extra;

    if (!config || !config.apiKey || !config.token) {
      throw new Error('Les credentials Trello ne sont pas configurés correctement dans app.json');
    }

    this.apiKey = config.apiKey;
    this.token = config.token;
  }

  // Le reste du code reste identique
  async get(endpoint: string, params: Record<string, any> = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}/${endpoint}`, {
        params: {
          key: this.apiKey,
          token: this.token,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la requête GET sur ${endpoint}`, error);
      throw error;
    }
  }

  // Méthode pour les requêtes POST
  async post(endpoint: string, data: Record<string, any> = {}) {
    try {
      const response = await axios.post(`${this.baseUrl}/${endpoint}`, {
        key: this.apiKey,
        token: this.token,
        ...data
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la requête POST sur ${endpoint}`, error);
      throw error;
    }
  }
}

export default new TrelloApiService();