import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { styles } from '@/styles/componentStyle/EditBoardModalStyle';

interface EditBoardModalProps {
  visible: boolean;
  currentName: string;
  onClose: () => void;
  onSave: () => void;
  onChangeText: (text: string) => void;
  isValid: boolean;
}

const EditBoardModal: React.FC<EditBoardModalProps> = ({
  visible,
  currentName,
  onClose,
  onSave,
  onChangeText,
  isValid
}) => (
  <Modal
    transparent={true}
    visible={visible}
    animationType="fade"
    onRequestClose={onClose}
  >
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier le nom du tableau</Text>
            <TextInput
              style={styles.modalInput}
              value={currentName}
              onChangeText={onChangeText}
              placeholder="Nouveau nom du tableau"
              placeholderTextColor="#ccc"
              autoFocus={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.modalButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={onSave}
                disabled={!isValid}
              >
                <Text style={styles.modalButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
);

export default EditBoardModal;
