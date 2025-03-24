const fs = require('fs');
const dotenv = require('dotenv');

// Charger les variables d'environnement à partir du fichier .env
dotenv.config();

// Lire le fichier app.json
let appJson = require('./app.json');

// Injecter les variables d'environnement dans app.json
appJson.expo.extra = {
  TRELLO_API_KEY: process.env.TRELLO_API_KEY,
  TRELLO_API_TOKEN: process.env.TRELLO_API_TOKEN,
};

// Écrire les modifications dans app.json
fs.writeFileSync('app.json', JSON.stringify(appJson, null, 2));

console.log('Variables d\'environnement injectées dans app.json');
