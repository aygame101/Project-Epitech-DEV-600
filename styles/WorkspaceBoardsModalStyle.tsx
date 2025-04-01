import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: '#121212',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFA500',
      marginBottom: 16,
      alignSelf: 'flex-start',
    },
    addBoardContainer: {
      flexDirection: 'row',
      marginBottom: 16,
      alignItems: 'center',
    },
    input: {
      flex: 1,
      backgroundColor: '#1f1f1f',
      color: '#FFFFFF',
      padding: 12,
      borderRadius: 5,
      marginRight: 8,
    },
    addButton: {
      backgroundColor: '#FFA500',
      padding: 12,
      borderRadius: 5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    addButtonText: {
      color: '#121212',
      fontWeight: 'bold',
    },
    boardItemContainer: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#555',
      marginVertical: 4,
      backgroundColor: '#1f1f1f',
      borderRadius: 5,
    },
    boardItem: {
      color: '#FFFFFF',
    },
  });