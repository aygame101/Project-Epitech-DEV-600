import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  workspaceItemContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  workspaceItem: {
    color: '#fff',
    fontSize: 16,
    flex: 1
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 10
  },
  editButton: {
    padding: 5
  },
  editButtonText: {
    fontSize: 18
  },
  deleteButton: {
    padding: 5
  },
  deleteButtonText: {
    fontSize: 18
  }
});
