import { useState } from 'react';
import { Modal, TouchableWithoutFeedback, View, TextInput, Pressable, Text } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { styles } from '@/styles/idStyle';

interface CreateCardModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: () => void;
  cardName: string;
  setCardName: (name: string) => void;
  cardDesc: string;
  setCardDesc: (desc: string) => void;
  showDescription: boolean;
  setShowDescription: (show: boolean) => void;
  showChecklist: boolean;
  setShowChecklist: (show: boolean) => void;
  checklistName: string;
  setChecklistName: (name: string) => void;
  checklistItems: string[];
  setChecklistItems: (items: string[]) => void;
  addChecklistItem: () => void;
  updateChecklistItem: (index: number, value: string) => void;
  removeChecklistItem: (index: number) => void;
}

export function CreateCardModal({
  visible,
  onClose,
  onCreate,
  cardName,
  setCardName,
  cardDesc,
  setCardDesc,
  showDescription,
  setShowDescription,
  showChecklist,
  setShowChecklist,
  checklistName,
  setChecklistName,
  checklistItems,
  setChecklistItems,
  addChecklistItem,
  updateChecklistItem,
  removeChecklistItem
}: CreateCardModalProps) {
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
              <Text style={styles.modalTitle}>Créer une carte</Text>

              <View style={styles.cardCreationForm}>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Titre de la carte"
                  placeholderTextColor="#888"
                  value={cardName}
                  onChangeText={setCardName}
                  autoFocus
                />

                <View style={styles.cardOptionsContainer}>
                  <Pressable
                    style={[
                      styles.cardOptionButton,
                      showDescription ? styles.cardOptionActive : null
                    ]}
                    onPress={() => {
                      setShowDescription(!showDescription);
                      if (showChecklist) setShowChecklist(false);
                    }}
                  >
                    <Text style={styles.cardOptionText}>Description</Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.cardOptionButton,
                      showChecklist ? styles.cardOptionActive : null
                    ]}
                    onPress={() => {
                      setShowChecklist(!showChecklist);
                      if (showDescription) setShowDescription(false);
                    }}
                  >
                    <Text style={styles.cardOptionText}>Checklist</Text>
                  </Pressable>
                </View>

                {showDescription && (
                  <TextInput
                    style={[styles.modalInput, styles.textareaInput]}
                    placeholder="Description"
                    placeholderTextColor="#888"
                    value={cardDesc}
                    onChangeText={setCardDesc}
                    multiline
                    numberOfLines={3}
                  />
                )}

                {showChecklist && (
                  <View style={styles.checklistInputContainer}>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="Nom de la checklist"
                      placeholderTextColor="#888"
                      value={checklistName}
                      onChangeText={setChecklistName}
                    />

                    {checklistItems.map((item, index) => (
                      <View key={index} style={styles.checklistItemInputRow}>
                        <TextInput
                          style={[styles.modalInput, styles.checklistItemInput]}
                          placeholder={`Élément ${index + 1}`}
                          placeholderTextColor="#888"
                          value={item}
                          onChangeText={(text) => updateChecklistItem(index, text)}
                        />

                        <Pressable
                          style={styles.checklistItemRemoveButton}
                          onPress={() => removeChecklistItem(index)}
                        >
                          <AntDesign name="close" size={16} color="#FF4A4A" />
                        </Pressable>
                      </View>
                    ))}

                    <Pressable
                      style={styles.addChecklistItemButton}
                      onPress={addChecklistItem}
                    >
                      <AntDesign name="plus" size={16} color="#FFA500" />
                      <Text style={styles.addChecklistItemText}>Ajouter un élément</Text>
                    </Pressable>
                  </View>
                )}

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
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
