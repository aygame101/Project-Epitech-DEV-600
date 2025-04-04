import React from 'react';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { styles } from '@/styles/componentStyle/BoardCardStyle';
import { Board } from '@/types/Board';
import { User } from '@/types/User';
import { UserAvatar } from '@/components/cards/UserAvatar';

import { AntDesign } from '@expo/vector-icons';

interface BoardCardProps {
  board: Board;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  members?: User[];
}

const BoardCard: React.FC<BoardCardProps> = ({
  board,
  onPress,
  onEdit,
  onDelete,
  members
}) => (
  <TouchableWithoutFeedback onPress={onPress}>
    <View style={styles.card}>
      <Text style={styles.name}>{board.name}</Text>
      {board.desc && <Text style={styles.desc}>{board.desc}</Text>}

      {members && members.length > 0 && (
        <View style={styles.membersContainer}>
          {members.slice(0, 3).map(member => (
            <UserAvatar key={member.id} user={member} size={20} />
          ))}
          {members.length > 3 && (
            <Text style={styles.moreMembers}>+{members.length - 3}</Text>
          )}
        </View>
      )}
        
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={onEdit}
        >
          <AntDesign name="edit" size={18} color="#FFFFFF" />
        </TouchableOpacity>
          
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={onDelete}
        >
          <AntDesign name="delete" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  </TouchableWithoutFeedback>
);

export default BoardCard;
