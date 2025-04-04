import { Modal, TouchableWithoutFeedback, View, TextInput, Pressable, Text } from 'react-native';
import { styles } from '@/styles/idStyle';

interface EditCardModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  cardName: string;
  setCardName: (name: string) => void;
  cardDesc: string;
  setCardDesc: (desc: string) => void;
}

export function EditCardModal({
  visible,
  onClose,
  onSave,
  cardName,
  setCardName,
  cardDesc,
  setCardDesc
}: EditCardModalProps) {
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
              <Text style={styles.modalTitle}>Éditer la carte</Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Titre de la carte"
                placeholderTextColor="#888"
                value={cardName}
                onChangeText={setCardName}
                autoFocus
              />

              <TextInput
                style={[styles.modalInput, styles.textareaInput]}
                placeholder="Description (optionnelle)"
                placeholderTextColor="#888"
                value={cardDesc}
                onChangeText={setCardDesc}
                multiline
                numberOfLines={3}
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
