import { StyleSheet } from 'react-native';

// Styles
export const styles = StyleSheet.create({
  archiveButton: {
    marginLeft: 8, // Espacement entre les boutons
  },
  archiveButtonText: {
    color: '#FFF', // Texte blanc pour le bouton d'archivage
    fontWeight: 'bold',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20, // Ajoutez un peu plus d'espace en bas
  },
  closeButton: {
    padding: 10,
  },
  modalTitle: {
    flex: 1, // Permet au titre de prendre l'espace restant
    color: '#FFA500',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left', // Centrer le texte
  },

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
    backgroundColor: '#1F1F1F',
    borderRadius: 8,
    width: 260,
    height: 400,
    padding: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#888',
  },
  listCardTitle: {
    color: '#FFA500',
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
    color: '#faba46',
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
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#888',
  },
  cardTitle: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#FFF'
  },
  cardDescription: {
    fontSize: 12,
    color: '#FFF',
  },

  /* AJOUTER UNE LISTE BUTTON */
  addListButton: {
    width: 260,
    height: 50,
    backgroundColor: '#1F1F1F',
    borderRadius: 8,
    marginHorizontal: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#888',
  },
  addListButtonText: {
    color: '#FFA500',
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
    backgroundColor: '#1F1F1F',
    width: '85%',
    padding: 20,
    borderRadius: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFF',
    backgroundColor: '#2A2A2A',
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
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#888',
  },
  cancelButtonText: {
    color: '#FFA500',
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#FFA500'
  },
  styloButton: {
    backgroundColor: ''
  },
  confirmButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  cardViewDescription: {
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
    padding: 6,
    marginBottom: 10,

    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3A',
  },
  descriptionText: {
    fontSize: 14,
    color: '#FFF',
    flex: 1,
  },
  noDescriptionText: {
    fontStyle: 'italic',
    color: '#888',
    marginVertical: 10,
  },
  viewMoreButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    padding: 3,
  },
  viewMoreText: {
    fontSize: 12,
    color: '#faba46',
  },
  assignButton: {
    marginLeft: 8,
  },
  userItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#FFF'
  },
  userEmail: {
    color: '#CCC',
    fontSize: 14,
  },
  userList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  noUsersText: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 20,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDateBadge: {
    backgroundColor: '#FFA50022',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    color: '#FFA500',
  },
  dueDateOverdue: {
    backgroundColor: '#FF000022',
    color: '#FF0000',
  },
  checklistProgressContainer: {
    marginTop: 6,
    marginBottom: 4,
  },
  checklistProgressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  checklistProgressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  checklistProgressText: {
    fontSize: 10,
    color: '#777',
    marginTop: 2,
    textAlign: 'right',
  },
  
  // Styles pour la création de carte
  cardCreationForm: {
    width: '100%',
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  datePickerLabel: {
    color: '#FFF',
    marginRight: 10,
  },
  datePicker: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 4,
  },
  datePickerText: {
    color: '#555',
  },
  clearDateButton: {
    padding: 8,
    marginLeft: 6,
  },
  cardOptionsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  cardOptionButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#333',
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#444',
  },
  cardOptionActive: {
    backgroundColor: '#FFA500',
    borderColor: '#FFA500',
  },
  cardOptionText: {
    color: '#FFF',
    fontWeight: '500',
  },
  
  // Styles pour les checklists
  checklistInputContainer: {
    marginBottom: 16,
  },
  checklistItemInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checklistItemInput: {
    flex: 1,
    marginBottom: 8,
  },
  checklistItemRemoveButton: {
    padding: 8,
    marginLeft: 4,
  },
  addChecklistItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#FFA500',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  addChecklistItemText: {
    color: '#FFA500',
    marginLeft: 6,
  },
  
  // Styles pour l'affichage des checklists dans la vue de carte
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#faba46',
    marginTop: 16,
    marginBottom: 8,
  },
  checklistsContainer: {
    marginTop: 10,
  },
  checklistContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
    padding: 8,
    marginBottom: 10,
  },
  checklistTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3A',
  },
  checklistItemCheckbox: {
    marginRight: 10,
  },
  checklistItemText: {
    fontSize: 14,
    color: '#FFF',
    flex: 1,
  },
  checklistItemCompleted: {
  },
  
  // New styles for avatars and due date
  avatarsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 4,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dueDateLabel: {
    color: '#888',
    fontSize: 12,
    marginRight: 4,
  },
  dueDateValue: {
    color: '#FFA500',
    fontSize: 12,
  },
  checklistButton: {
    backgroundColor: '#4CAF50',
  },

});
