import React from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { styles } from '@/styles/componentStyle/BoardTemplateModalStyle';

interface BoardTemplateModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateEmpty: () => void;
  onCreateKanban: () => void;
}

const BoardTemplateModal: React.FC<BoardTemplateModalProps> = ({
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
    <View style={styles.modalOverlay}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Type de tableau</Text>

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
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </View>
  </Modal>
);

export default BoardTemplateModal;
