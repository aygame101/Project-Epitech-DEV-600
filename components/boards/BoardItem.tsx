import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { styles } from '@/styles/componentStyle/BoardItemStyle';

import { AntDesign } from '@expo/vector-icons';

interface BoardItemProps {
  board: {
    id: string;
    name: string;
  };
  isDeleting: boolean;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const BoardItem: React.FC<BoardItemProps> = ({
  board,
  isDeleting,
  onPress,
  onEdit,
  onDelete
}) => (
  <TouchableOpacity
    style={styles.container}
    onPress={onPress}
    disabled={isDeleting}
  >
    <Text style={styles.name}>{board.name}</Text>

    <View style={styles.actions}>
      {isDeleting ? (
        <ActivityIndicator size="small" color="#FFA500" />
      ) : (
        <>
          <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
          <AntDesign name="edit" size={18} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
          <AntDesign name="delete" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </>
      )}
    </View>
  </TouchableOpacity>
);

export default BoardItem;
