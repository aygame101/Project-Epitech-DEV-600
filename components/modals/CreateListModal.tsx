import React from 'react';
import { Modal, Pressable, Text, TextInput, View, TouchableWithoutFeedback } from 'react-native';
import { styles } from '../../styles/componentStyle/CreateListModalStyle';

interface CreateListModalProps {
  visible: boolean;
  listName: string;
  onClose: () => void;
  onChangeText: (text: string) => void;
  onCreate: () => void;
}

const CreateListModal: React.FC<CreateListModalProps> = ({
  visible,
  listName,
  onClose,
  onChangeText,
  onCreate
}) => (
  <Modal
    transparent
    visible={visible}
    animationType="fade"
    onRequestClose={onClose}
  >
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Créer une liste</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nom de la liste"
              placeholderTextColor="#888"
              value={listName}
              onChangeText={onChangeText}
              autoFocus
            />
            <View style={styles.modalButtonsContainer}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={onCreate}
              >
                <Text style={styles.confirmButtonText}>Créer</Text>
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
);

export default CreateListModal;
