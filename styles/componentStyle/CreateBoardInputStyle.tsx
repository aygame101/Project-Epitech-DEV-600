import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 48,
    borderColor: '#555',
    borderWidth: 1,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    backgroundColor: '#333',
    borderRadius: 8,
  },
  button: {
    marginLeft: 8,
    backgroundColor: '#FFA500',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    height: 48,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
