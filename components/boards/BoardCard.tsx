import { Image, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { Board } from '@/types/Board';

type BoardCardProps = {
  board: Board;
  onPress: (boardId: string) => void;
  onDelete: (boardId: string) => void;
};

export default function BoardCard({ board, onPress, onDelete }: BoardCardProps) {
  return (
    <ThemedView style={styles.boardCard}>
      {board.prefs?.backgroundImage && (
        <Image
          source={{ uri: board.prefs.backgroundImage }}
          style={styles.boardBackground}
        />
      )}
      <Pressable
        onPress={() => onPress(board.id)}
        style={styles.cardContent}>
        <MaterialIcons name="dashboard" size={24} color="white" />
        <ThemedText style={styles.boardName}>{board.name}</ThemedText>
        {board.desc && (
          <ThemedText style={styles.boardDesc}>{board.desc}</ThemedText>
        )}
      </Pressable>
      <Pressable
        onPress={() => onDelete(board.id)}
        style={styles.deleteButton}>
        <AntDesign name="close" size={16} color="white" />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  boardCard: {
    width: '48%',
    height: 150,
    borderRadius: 8,
    marginVertical: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0079bf',
  },
  boardBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
  },
  cardContent: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boardName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  boardDesc: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    padding: 5,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});