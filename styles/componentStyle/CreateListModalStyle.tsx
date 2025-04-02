import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: '#e0e0e0'
  },
  confirmButton: {
    backgroundColor: '#FFA500'
  },
  cancelButtonText: {
    color: '#333'
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});
