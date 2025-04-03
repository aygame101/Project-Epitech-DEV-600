import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 8,
    margin: 8,
    width: '48%',
    minHeight: 100
  },
  name: {
    color: '#FFA500',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5
  },
  desc: {
    color: '#AAA',
    fontSize: 14
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 10
  },
  editButton: {
    padding: 5
  },
  deleteButton: {
    padding: 5
  }
});
