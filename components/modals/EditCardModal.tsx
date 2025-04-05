import { useState } from 'react';
import { Modal, TouchableWithoutFeedback, View, TextInput, Pressable, Text, ScrollView, ActivityIndicator } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { styles } from '@/styles/idStyle';

interface EditCardModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  cardName: string;
  setCardName: (name: string) => void;
  cardDesc: string;
  setCardDesc: (desc: string) => void;
  showDescription: boolean;
  setShowDescription: (show: boolean) => void;
  showChecklist: boolean;
  setShowChecklist: (show: boolean) => void;
  checklists: {
    id: string;
    name: string;
    items: string[];
  }[];
  currentChecklistIndex: number;
  setCurrentChecklistIndex: (index: number) => void;
  checklistName: string;
  setChecklistName: (name: string) => void;
  checklistItems: string[];
  setChecklistItems: (items: string[]) => void;
  addChecklistItem: () => void;
  updateChecklistItem: (index: number, value: string) => void;
  removeChecklistItem: (index: number) => void;
  onCreateChecklist?: () => void;
  saveChecklistChanges?: () => Promise<boolean>;
  deleteChecklist?: (checklistId: string) => Promise<boolean>;
  isUpdating?: boolean;
}

export function EditCardModal({
  visible,
  onClose,
  onSave,
  cardName,
  setCardName,
  cardDesc,
  setCardDesc,
  showDescription,
  setShowDescription,
  showChecklist,
  setShowChecklist,
  checklists,
  currentChecklistIndex,
  setCurrentChecklistIndex,
  checklistName,
  setChecklistName,
  checklistItems,
  setChecklistItems,
  addChecklistItem,
  updateChecklistItem,
  removeChecklistItem,
  onCreateChecklist,
  saveChecklistChanges,
  deleteChecklist,
  isUpdating = false
}: EditCardModalProps) {
  const [showChecklistSelector, setShowChecklistSelector] = useState(false);
  
  // Function to select an existing checklist
  const handleSelectChecklist = (index: number) => {
    setCurrentChecklistIndex(index);
    setChecklistName(checklists[index].name);
    setChecklistItems(checklists[index].items);
    setShowChecklistSelector(false);
  };
  
  // Function to create a new checklist
  const handleCreateNewChecklist = () => {
    if (onCreateChecklist) {
      setChecklistName('');
      setChecklistItems(['']);
      onCreateChecklist();
      setShowChecklistSelector(false);
    }
  };

  // Function to save changes to current checklist
  const handleSaveChecklistChanges = async () => {
    if (saveChecklistChanges) {
      await saveChecklistChanges();
    }
  };

  // Function to delete the current checklist
  const handleDeleteChecklist = async () => {
    if (deleteChecklist && currentChecklistIndex >= 0 && currentChecklistIndex < checklists.length) {
      const checklistId = checklists[currentChecklistIndex].id;
      if (!checklistId.startsWith('temp-')) { // Only delete if it's a real checklist, not a temp one
        await deleteChecklist(checklistId);
      }
    }
  };

  // Handle save and close for the entire card
  const handleSaveAll = async () => {
    if (showChecklist && saveChecklistChanges) {
      await saveChecklistChanges();
    }
    onSave();
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
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Éditer la carte</Text>

              <ScrollView style={styles.cardCreationForm}>
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
                      if (showChecklist && !showDescription) setShowChecklist(false);
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
                      if (showDescription && !showChecklist) setShowDescription(false);
                      // Show the checklist selector when activating the checklist option
                      if (!showChecklist) setShowChecklistSelector(true);
                    }}
                  >
                    <Text style={styles.cardOptionText}>Checklist</Text>
                  </Pressable>
                </View>

                {showDescription && (
                  <TextInput
                    style={[styles.modalInput, styles.textareaInput]}
                    placeholder="Description (optionnelle)"
                    placeholderTextColor="#888"
                    value={cardDesc}
                    onChangeText={setCardDesc}
                    multiline
                    numberOfLines={3}
                  />
                )}

                {showChecklist && (
                  <View style={styles.checklistInputContainer}>
                    {showChecklistSelector ? (
                      // Checklist selector display
                      <View style={styles.checklistSelectorContainer}>
                        <Text style={styles.sectionTitle}>Sélectionner une checklist</Text>
                        
                        {checklists.length > 0 ? (
                          checklists.map((checklist, index) => (
                            <Pressable
                              key={checklist.id}
                              style={styles.checklistSelectorButton}
                              onPress={() => handleSelectChecklist(index)}
                            >
                              <AntDesign name="checksquareo" size={16} color="#0079BF" />
                              <Text style={styles.checklistSelectorText}>{checklist.name}</Text>
                            </Pressable>
                          ))
                        ) : (
                          <Text style={styles.noChecklistText}>Aucune checklist disponible</Text>
                        )}
                        
                        <Pressable
                          style={styles.createNewChecklistButton}
                          onPress={handleCreateNewChecklist}
                        >
                          <AntDesign name="plus" size={16} color="#FFA500" />
                          <Text style={styles.createNewChecklistText}>Créer une nouvelle checklist</Text>
                        </Pressable>
                      </View>
                    ) : (
                      // Checklist editing
                      <View>
                        <View style={styles.checklistHeaderContainer}>
                          <Text style={styles.sectionTitle}>
                            {currentChecklistIndex >= 0 && currentChecklistIndex < checklists.length
                              ? `Modifier la checklist: ${checklists[currentChecklistIndex].name}`
                              : "Nouvelle checklist"}
                          </Text>
                          <View style={styles.checklistHeaderButtons}>
                            <Pressable
                              style={styles.changeChecklistButton}
                              onPress={() => setShowChecklistSelector(true)}
                            >
                              <Text style={styles.changeChecklistButtonText}>Changer</Text>
                            </Pressable>
                            
                            {checklists.length > 0 && currentChecklistIndex >= 0 && !checklists[currentChecklistIndex].id.startsWith('temp-') && (
                              <Pressable
                                style={[styles.changeChecklistButton, {backgroundColor: '#FF4A4A'}]}
                                onPress={handleDeleteChecklist}
                              >
                                <Text style={[styles.changeChecklistButtonText, {color: 'white'}]}>Supprimer</Text>
                              </Pressable>
                            )}
                          </View>
                        </View>
                        
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
                  </View>
                )}
              </ScrollView>

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