import { Modal, TouchableWithoutFeedback, View, TextInput, Pressable, Text } from 'react-native';
import { styles } from '@/styles/idStyle';

interface EditListModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  listName: string;
  setListName: (name: string) => void;
}

export function EditListModal({
  visible,
  onClose,
  onSave,
  listName,
  setListName
}: EditListModalProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Éditer la liste</Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Nom de la liste"
                placeholderTextColor="#888"
                value={listName}
                onChangeText={setListName}
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
                  onPress={onSave}
                >
                  <Text style={styles.confirmButtonText}>Enregistrer</Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
