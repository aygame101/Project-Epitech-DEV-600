import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { styles } from '@/styles/componentStyle/TemplateSelectionModalStyle';

interface TemplateSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateEmpty: () => void;
  onCreateKanban: () => void;
}

const TemplateSelectionModal: React.FC<TemplateSelectionModalProps> = ({
  visible,
  onClose,
  onCreateEmpty,
  onCreateKanban
}) => (
  <Modal
    transparent
    visible={visible}
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={styles.overlay}>
      <View style={styles.content}>
        <Text style={styles.title}>Type de tableau</Text>
        
        <View style={styles.templatesContainer}>
          <TouchableOpacity
            style={styles.templateItem}
            onPress={onCreateEmpty}
          >
            <Text style={styles.templateTitle}>Tableau vide</Text>
            <Text style={styles.templateDescription}>Pas de listes prédéfinies</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.templateItem}
            onPress={onCreateKanban}
          >
            <Text style={styles.templateTitle}>Kanban</Text>
            <Text style={styles.templateDescription}>Listes "To Do", "Doing", "Done"</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={onClose}
        >
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export default TemplateSelectionModal;
