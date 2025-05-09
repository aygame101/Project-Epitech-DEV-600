import { Modal, TouchableWithoutFeedback, View, TextInput, Pressable, Text } from 'react-native';
import { styles } from '@/styles/idStyle';

interface CreateListModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: () => void;
  listName: string;
  setListName: (name: string) => void;
}

export function CreateListModal({
  visible,
  onClose,
  onCreate,
  listName,
  setListName
}: CreateListModalProps) {
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
              <Text style={styles.modalTitle}>Créer une liste</Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Nom de la liste"
                placeholderTextColor="#fff"
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
}
