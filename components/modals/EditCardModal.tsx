import { useState } from 'react';
import { Modal, TouchableWithoutFeedback, View, TextInput, Pressable, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
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
  // Nouveaux props pour les setters du hook
  hookSetCurrentChecklistIndex?: (index: number) => void;
  hookSetNewChecklistName?: (name: string) => void;
  hookSetNewChecklistItems?: (items: string[]) => void;
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
  isUpdating = false,
  // Nouveaux props pour les setters du hook
  hookSetCurrentChecklistIndex,
  hookSetNewChecklistName,
  hookSetNewChecklistItems
}: EditCardModalProps) {
  const [showChecklistSelector, setShowChecklistSelector] = useState(false);

  // Function to select an existing checklist
  // In EditCardModal.tsx, modify handleSelectChecklist:

  const handleSelectChecklist = (index: number) => {
    if (index >= 0 && index < checklists.length) {
      const selectedChecklist = checklists[index];

      // Update BOTH the local state AND the hook state
      setCurrentChecklistIndex(index);

      // This is critical - always update the hook's state whenever the index changes
      if (hookSetCurrentChecklistIndex) {
        hookSetCurrentChecklistIndex(index);
      }

      setChecklistName(selectedChecklist.name);
      setChecklistItems([...selectedChecklist.items]);

      if (hookSetNewChecklistName) {
        hookSetNewChecklistName(selectedChecklist.name);
      }
      if (hookSetNewChecklistItems) {
        hookSetNewChecklistItems([...selectedChecklist.items]);
      }

      setShowChecklistSelector(false);
    } else {
      console.error('Invalid checklist index:', index);
    }
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

  // Function to delete the current checklist
  const handleDeleteChecklist = async () => {
    if (deleteChecklist && currentChecklistIndex >= 0 && currentChecklistIndex < checklists.length) {
      const checklistId = checklists[currentChecklistIndex].id;
      if (!checklistId.startsWith('temp-')) {
        await deleteChecklist(checklistId);
      }
    }
  };

  // Handle save and close for the entire card
  const handleSaveAll = async () => {
    try {
      // First save checklist changes if needed
      if (showChecklist && saveChecklistChanges) {

        // Make sure all data is synchronized with the hook before saving
        if (hookSetCurrentChecklistIndex) {
          hookSetCurrentChecklistIndex(currentChecklistIndex);
        }

        if (hookSetNewChecklistName) {
          hookSetNewChecklistName(checklistName);
        }

        if (hookSetNewChecklistItems) {
          hookSetNewChecklistItems([...checklistItems]);
        }

        // Add a short delay to ensure state updates are processed
        await new Promise(resolve => setTimeout(resolve, 100));

        const checklistSaved = await saveChecklistChanges();
        if (!checklistSaved) {
          Alert.alert('Erreur', 'Échec de sauvegarde de la checklist');
          return;
        }
      }

      // Then save card changes
      onSave();

    } catch (error) {
      Alert.alert(
        'Erreur', 
        'Échec de sauvegarde des modifications: ' + (error instanceof Error ? error.message : 'Erreur inconnue')
      );
      return;
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
                          <AntDesign name="plus" size={16} color="#0079BF" />
                          <Text style={styles.createNewChecklistText}>Créer une nouvelle checklist</Text>
                        </Pressable>
                      </View>
                    ) : (
                      // Checklist editing
                      <View>
                        <View style={styles.checklistHeaderContainer}>
                          <Text style={styles.sectionTitle}>
                            {currentChecklistIndex >= 0 && currentChecklistIndex < checklists.length
                              ? `Modifier la checklist: ${checklistName}`
                              : "Nouvelle checklist"}
                          </Text>
                          <View style={styles.checklistActions}>
                            <Pressable
                              style={styles.changeChecklistButton}
                              onPress={() => setShowChecklistSelector(true)}
                            >
                              <Text style={styles.changeChecklistButtonText}>Changer</Text>
                            </Pressable>
                          </View>
                        </View>

                        <TextInput
                          style={styles.modalInput}
                          placeholder="Nom de la checklist"
                          placeholderTextColor="#888"
                          value={checklistName}
                          onChangeText={(text) => {
                            setChecklistName(text);
                            if (hookSetNewChecklistName) hookSetNewChecklistName(text);
                          }}
                        />

                        {checklistItems.map((item, index) => (
                          <View key={index} style={styles.checklistItemInputRow}>

                            <TextInput
                              style={[styles.modalInput, styles.checklistItemInput]}
                              placeholder={`Élément ${index + 1}`}
                              placeholderTextColor="#888"
                              value={item}
                              onChangeText={(text) => {
                                updateChecklistItem(index, text);

                                // Ensure immediate synchronization with the hook
                                if (hookSetNewChecklistItems) {
                                  const updatedItems = [...checklistItems];
                                  updatedItems[index] = text;
                                  hookSetNewChecklistItems(updatedItems);
                                }
                              }}
                            />

                            <Pressable
                              style={styles.checklistItemRemoveButton}
                              onPress={() => {
                                removeChecklistItem(index);
                                // Synchroniser la suppression avec le hook
                                if (hookSetNewChecklistItems && checklistItems.length > 1) {
                                  const updatedItems = [...checklistItems];
                                  updatedItems.splice(index, 1);
                                  hookSetNewChecklistItems(updatedItems);
                                }
                              }}
                            >
                              <AntDesign name="close" size={16} color="#FF4A4A" />
                            </Pressable>
                          </View>
                        ))}

                        <Pressable
                          style={styles.addChecklistItemButton}
                          onPress={() => {
                            addChecklistItem();
                            // Synchroniser l'ajout avec le hook
                            if (hookSetNewChecklistItems) {
                              hookSetNewChecklistItems([...checklistItems, '']);
                            }
                          }}
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
                  onPress={handleSaveAll}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.confirmButtonText}>Enregistrer</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
