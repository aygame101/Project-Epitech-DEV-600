import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  name: {
    color: '#FFF',
    fontSize: 16,
    flex: 1
  },
  actions: {
    flexDirection: 'row',
    gap: 15
  },
  actionButton: {
    padding: 5
  }
});
