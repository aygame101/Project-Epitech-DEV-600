import { StyleSheet } from 'react-native';

// Styles
export const styles = StyleSheet.create({
    listCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    editButton: {
      padding: 5,
    },
    /* PAGE CONTAINER */
    container: {
      flex: 1,
      backgroundColor: '#000', // Fond noir
      paddingTop: 32,
    },
  
    /* LOADING VIEW */
    loadingContainer: {
      flex: 1,
      backgroundColor: '#000',
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 12,
      color: '#FFF',
      fontSize: 16,
    },
    loadingLists: {
      marginTop: 50,
    },
  
    /* HEADER */
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    backButton: {
      marginRight: 16,
    },
    boardTitle: {
      fontSize: 24,
      color: '#FFA500', // Titre du tableau en orange
      fontWeight: 'bold',
    },
  
    /* LISTS WRAPPER */
    listsContainer: {
      flex: 1,
    },
    listsContentContainer: {
      paddingHorizontal: 8,
      alignItems: 'flex-start',
    },
  
    /* LIST CARD */
    listCardContainer: {
      backgroundColor: '#FFF', // Listes en blanc
      borderRadius: 8,
      width: 260,
      height: 400, // Fixed height for scrollable lists
      padding: 12,
      marginHorizontal: 8,
      marginVertical: 4,
      // Optionnel: bordure ou ombre
      borderWidth: 1,
      borderColor: '#CCC',
    },
    listCardTitle: {
      color: '#FFA500', // Titre de la liste en orange
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    listCardActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 6,
    },
    listCardActionBtn: {
      padding: 6,
    },
    listCardActionText: {
      color: '#000', // Bouton "ajouter carte" en noir
    },
    listCardArchiveText: {
      color: '#FF4A4A', // Couleur d'archive
    },
  
    /* CARDS */
    cardsContainer: {
      flex: 1,
      marginVertical: 8,
    },
    cardItem: {
      backgroundColor: '#F8F8F8',
      borderRadius: 4,
      padding: 8,
      marginBottom: 8,
      borderLeftWidth: 3,
      borderLeftColor: '#FFA500',
    },
    cardTitle: {
      fontWeight: '600',
      marginBottom: 4,
    },
    cardDescription: {
      fontSize: 12,
      color: '#666',
    },
  
    /* AJOUTER UNE LISTE BUTTON */
    addListButton: {
      width: 260,
      height: 50,
      backgroundColor: '#FFF', // Même couleur que les listes
      borderRadius: 8,
      marginHorizontal: 8,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#FFA500',
    },
    addListButtonText: {
      color: '#000',
      fontSize: 16,
      marginLeft: 6,
      fontWeight: '600',
    },
  
    /* MODAL */
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: '#FFF',
      width: '85%',
      padding: 20,
      borderRadius: 12,
    },
    modalTitle: {
      color: '#FFA500',
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
      textAlign: 'center',
    },
    modalInput: {
      borderWidth: 1,
      borderColor: '#CCC',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: '#000',
      backgroundColor: '#FFF',
      marginBottom: 20,
    },
    textareaInput: {
      height: 80,
      textAlignVertical: 'top',
    },
    modalButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    modalButton: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginLeft: 8,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: '#CCC',
    },
    confirmButton: {
      backgroundColor: '#FFA500',
    },
    cancelButtonText: {
      color: '#000',
      fontWeight: 'bold',
    },
    confirmButtonText: {
      color: '#000',
      fontWeight: 'bold',
    },
  });