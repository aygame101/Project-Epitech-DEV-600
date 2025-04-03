import React from 'react';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { styles } from '@/styles/componentStyle/WorkspaceItemStyle';

import { AntDesign } from '@expo/vector-icons';

interface WorkspaceItemProps {
  workspace: {id: string, displayName: string};
  isDeleting: boolean;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const WorkspaceItem: React.FC<WorkspaceItemProps> = ({
  workspace,
  isDeleting,
  onPress,
  onEdit,
  onDelete
}) => (
  <TouchableWithoutFeedback onPress={onPress}>
    <View style={styles.workspaceItemContainer}>
      <Text style={styles.workspaceItem}>{workspace.displayName}</Text>
      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={onEdit} style={styles.editButton}>
          <AntDesign name="edit" size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={onDelete} 
          style={styles.deleteButton}
          disabled={isDeleting}
        >
          <AntDesign name="delete" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  </TouchableWithoutFeedback>
);

export default WorkspaceItem;
