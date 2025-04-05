# Project-Epitech-T-DEV-600
Créer une app de gestion de projet à la Trello.  
  
Date de rendu : 6 avril 2025 à 23h42  
  
## Gestion Avancement du Projet
🔵 à vérifier quand meme  
| Avancement | Tâches |
| :--------- |:------ |
| 🟢 Done | Possibilité de créer, lire/afficher, modifier et supprimer un espace de travail |
| 🟢 Done | Possibilité de créer, lire/afficher, modifier et supprimer un tableau |
| 🟢 Done | Possibilité de créer, lire/afficher, modifier et supprimer une liste |
| 🟢 Done | Possibilité de créer, lire/afficher, modifier et supprimer une carte |
| 🟢 Done | Possibilité de créer des tableaux à partir d'un modèle, puis de les lire/afficher, modifier et supprimer | ?? template api trello
| 🟢 Done | Possibilité d'assigner un ou plusieurs utilisateurs à une carte | route user -> compte trello
| 🔵🟢 Done  | Les "guidelines" de la plateforme choisie sont respectées et correctement intégrées, les étudiants peuvent expliquer ces directives et comment ils les ont mises en œuvre |
| 🟢 Done | Une identité visuelle (choix des couleurs, icônes, taille de police, typographie, ...) est définie et utilisée pour maintenir la cohérence |
| 🔵🟢 Done | Le rendu offre une UX et une UI de haute qualité et soignées : les interfaces sont bien conçues pour offrir une bonne expérience à ses utilisateurs |
| 🟢 Done | Les étudiants peuvent justifier leurs choix d'UI/UX (style, couleurs, icônes, éléments, ...) |
| 🟢 Done | Le rendu est fonctionnel |
| 🟠 In progress | Le code est facilement maintenable (noms lisibles, atomicité des fonctions, structure de code claire, syntaxe propre) |
| 🟠 In progress | Au moins 3 tests unitaires sont livrés dans le dépôt | test UI
| 🟠 In progress | Une séquence de tests unitaires est fournie et facilement exécutable |
| 🟢 Done | Les étudiants intègrent un framework de test dans leur projet pour rendre leur stratégie de test plus complète | Jest
| 🟢 Done | Les étudiants utilisent un outil de versioning avec un workflow approprié, incluant une stratégie de branchement, des commits réguliers, des messages descriptifs et un fichier gitignore |
| 🟢 Done | Les étudiants fournissent un fichier README résumant le projet et son utilisation (prérequis, installation, déploiement, frameworks, ...) |
| 🔴 To do | Au moins un diagramme est fourni pour illustrer et expliquer les parties importantes de la solution (architecture (uml), diag classe, diag séquence, cycle de vie, ...) | peut etre UML : lucidchart
| 🟢 Done | Le projet est présenté de manière claire et professionnelle, en utilisant un support pertinent (diapositives et/ou démo) |
| 🟢 Done | Les étudiants étayent leur présentation ou leurs choix techniques avec des arguments bien structurés, fournissant des explications logiques et des preuves |
| 🟠 In progress | Toutes les tâches ont été effectuées |


### Installation du projet
```npm i```
si probleme ```npm install --legacy-peer-deps```
```npx expo install expo-router react-native-screens react-native-safe-area-context @react-navigation/native @react-navigation/native-stackD```  
  
si probleme windows : ```npx expo install expo-router react-native-screens react-native-safe-area-context @react-navigation/native @react-navigation/native-stack```  
```npx expo start```  


In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).