import React from 'react';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { styles } from '@/styles/componentStyle/BoardCardStyle';
import { Board } from '@/types/Board';

interface BoardCardProps {
  board: Board;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const BoardCard: React.FC<BoardCardProps> = ({
  board,
  onPress,
  onEdit,
  onDelete
}) => (
  <TouchableWithoutFeedback onPress={onPress}>
    <View style={styles.card}>
      <Text style={styles.name}>{board.name}</Text>
      {board.desc && <Text style={styles.desc}>{board.desc}</Text>}
        
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={onEdit}
        >
          <Text>✏️</Text>
        </TouchableOpacity>
          
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={onDelete}
        >
          <Text>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  </TouchableWithoutFeedback>
);

export default BoardCard;
