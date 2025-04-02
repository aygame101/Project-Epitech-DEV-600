import React from 'react';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { styles } from '@/styles/componentStyle/WorkspaceItemStyle';

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
          <Text style={styles.editButtonText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={onDelete} 
          style={styles.deleteButton}
          disabled={isDeleting}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  </TouchableWithoutFeedback>
);

export default WorkspaceItem;
