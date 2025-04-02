import React from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';
import { styles } from '../styles/componentStyle/DeleteConfirmationModalStyle';

interface DeleteConfirmationModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

const DeleteConfirmationModal = ({
  visible,
  title = 'Confirmation',
  message = 'Êtes-vous sûr de vouloir supprimer cet élément ?',
  isDeleting,
  onCancel,
  onConfirm
}: DeleteConfirmationModalProps) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{title}</Text>
              <Text style={styles.modalMessage}>{message}</Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={onCancel}
                  disabled={isDeleting}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={onConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.deleteButtonText}>Supprimer</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default DeleteConfirmationModal;