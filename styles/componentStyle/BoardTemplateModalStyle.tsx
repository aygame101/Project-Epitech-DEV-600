import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '50%'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
    textAlign: 'center'
  },
  templatesContainer: {
    gap: 16,
    marginTop: 20
  },
  templateItem: {
    backgroundColor: '#2D2D2D',
    padding: 15,
    borderRadius: 8
  },
  templateTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  templateDescription: {
    color: '#AAA',
    fontSize: 14,
    marginTop: 5
  },
  cancelButton: {
    backgroundColor: '#3A3A3A',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center'
  },
  cancelButtonText: {
    color: '#FFF',
    fontWeight: 'bold'
  }
});
