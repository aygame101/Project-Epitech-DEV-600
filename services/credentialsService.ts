import Constants from 'expo-constants';

export function getTrelloCredentials() {
  // Récupération directe depuis extra, sans imbrication trello
  const config = Constants.expoConfig?.extra;

  if (!config || !config.apiKey || !config.token) {
    throw new Error('Les credentials Trello ne sont pas configurés correctement dans app.json');
  }

  return {
    apiKey: config.apiKey,
    token: config.token
  };
}