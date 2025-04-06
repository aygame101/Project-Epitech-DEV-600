import React, { useState } from 'react';
import {
  Modal,
  TouchableWithoutFeedback,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { styles } from '@/styles/idStyle';

interface ChecklistModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  name: string;
  setName: (name: string) => void;
  items: string[];
  setItems: (items: string[]) => void;
  onAddItem: () => void;
  onUpdateItem: (index: number, value: string) => void;
  onRemoveItem: (index: number) => void;
}

export function ChecklistModal({
  visible,
  onClose,
  onSubmit,
  name,
  setName,
  items,
  setItems,
  onAddItem,
  onUpdateItem,
  onRemoveItem
}: ChecklistModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const screenHeight = Dimensions.get('window').height;
  const maxModalHeight = screenHeight * 0.85;

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSubmit();
    } finally {
      setIsLoading(false);
    }
  };

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
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={[styles.modalContent, { maxHeight: maxModalHeight }]}
            >
              <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <Text style={styles.modalTitle}>Ajouter une checklist</Text>

                <TextInput
                  style={styles.modalInput}
                  placeholder="Nom de la checklist"
                  placeholderTextColor="#888"
                  value={name}
                  onChangeText={setName}
                  autoFocus
                />

                {items.map((item, index) => (
                  <View key={index} style={styles.checklistItemInputRow}>
                    <TextInput
                      style={[styles.modalInput, styles.checklistItemInput]}
                      placeholder={`Élément ${index + 1}`}
                      placeholderTextColor="#888"
                      value={item}
                      onChangeText={(text) => onUpdateItem(index, text)}
                    />
                    <Pressable
                      style={styles.checklistItemRemoveButton}
                      onPress={() => onRemoveItem(index)}
                    >
                      <AntDesign name="close" size={16} color="#FF4A4A" />
                    </Pressable>
                  </View>
                ))}

                <Pressable
                  style={styles.addChecklistItemButton}
                  onPress={onAddItem}
                >
                  <AntDesign name="plus" size={16} color="#FFA500" />
                  <Text style={styles.addChecklistItemText}>Ajouter un élément</Text>
                </Pressable>

                <View style={styles.modalButtonsContainer}>
                  <Pressable
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={onClose}
                  >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.confirmButtonText}>Ajouter</Text>
                    )}
                  </Pressable>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
