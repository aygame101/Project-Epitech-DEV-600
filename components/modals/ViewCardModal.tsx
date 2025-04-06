import { Modal, TouchableWithoutFeedback, View, Text, Pressable, FlatList } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { styles } from '@/styles/idStyle';
import { Card } from '@/types/Card';

interface ChecklistItem {
  id: string;
  name: string;
  state: 'complete' | 'incomplete';
}

interface Checklist {
  id: string;
  name: string;
  checkItems: ChecklistItem[];
  checkItemsChecked: number;
}

interface ViewCardModalProps {
  visible: boolean;
  onClose: () => void;
  card: Card | null;
  checklistsData: Record<string, Checklist[]>;
  onEditCard: (cardId: string) => void;
  onArchiveCard: (cardId: string) => void;
  onAssignCard: (cardId: string) => void;
  onOpenChecklistModal: (cardId: string) => void;
  onToggleChecklistItem: (cardId: string, checkItemId: string, currentState: string) => void;
  onDeleteChecklist: (checklistId: string) => Promise<boolean>; // Nouveau prop pour la suppression
}

export function ViewCardModal({
  visible,
  onClose,
  card,
  checklistsData,
  onEditCard,
  onArchiveCard,
  onAssignCard,
  onOpenChecklistModal,
  onToggleChecklistItem,
  onDeleteChecklist
}: ViewCardModalProps) {
  if (!card) return null;

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
              <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{card.name}</Text>

                <Pressable
                  style={[styles.modalButton]}
                  onPress={() => {
                    onClose();
                    onEditCard(card.id);
                  }}
                >
                  <AntDesign name="edit" size={18} color="#FFFFFF" />
                </Pressable>

                <Pressable
                  onPress={onClose}
                  style={styles.closeButton}
                >
                  <AntDesign name="close" size={24} color="#fff" />
                </Pressable>
              </View>

              {/* description */}
              <Text style={styles.sectionTitle}>Description</Text>
              {card.desc ? (
                <View style={styles.cardViewDescription}>
                  <Text style={styles.descriptionText}>{card.desc}</Text>
                </View>
              ) : (
                <Text style={styles.noDescriptionText}>Pas de description</Text>
              )}

              {/* checklists */}
              {checklistsData[card.id] && checklistsData[card.id].length > 0 && (
                <View style={styles.checklistsContainer}>
                  <Text style={styles.sectionTitle}>Checklists</Text>

                  {checklistsData[card.id].map(checklist => (
                    <View key={checklist.id} style={styles.checklistContainer}>
                      <View style={styles.checklistHeaderRow}>
                        <Text style={styles.checklistTitle}>{checklist.name}</Text>
                        
                        {/* Bouton de suppression des checklists */}
                        <Pressable
                          style={styles.deleteChecklistButton}
                          onPress={() => onDeleteChecklist(checklist.id)}
                        >
                          <AntDesign name="delete" size={16} color="#FF4A4A" />
                        </Pressable>
                      </View>

                      <View style={styles.checklistProgressContainer}>
                        <View style={styles.checklistProgressBar}>
                          <View
                            style={[
                              styles.checklistProgressFill,
                              {
                                width: `${checklist.checkItems.length > 0
                                  ? Math.round((checklist.checkItemsChecked / checklist.checkItems.length) * 100)
                                  : 0}%`
                              }
                            ]}
                          />
                        </View>
                        <Text style={styles.checklistProgressText}>
                          {checklist.checkItemsChecked}/{checklist.checkItems.length}
                        </Text>
                      </View>

                      {checklist.checkItems.map(item => (
                        <Pressable
                          key={item.id}
                          style={styles.checklistItem}
                          onPress={() => onToggleChecklistItem(card.id, item.id, item.state)}
                        >
                          <View style={styles.checklistItemCheckbox}>
                            {item.state === 'complete' ? (
                              <AntDesign name="checkcircle" size={18} color="#FFA500" />
                            ) : (
                              <AntDesign name="checkcircleo" size={18} color="#CCC" />
                            )}
                          </View>
                          <Text
                            style={[
                              styles.checklistItemText,
                              item.state === 'complete' ? styles.checklistItemCompleted : null
                            ]}
                          >
                            {item.name}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.modalButtonsContainer}>
                <Pressable
                  style={[styles.modalButton]}
                  onPress={() => onOpenChecklistModal(card.id)}
                >
                  <AntDesign name="bars" size={18} color="#FFFFFF" />
                </Pressable>

                <Pressable
                  style={[styles.modalButton, styles.assignButton]}
                  onPress={() => onAssignCard(card.id)}
                >
                  <AntDesign name="user" size={18} color="#FFFFFF" />
                </Pressable>

                <Pressable
                  style={[styles.modalButton, styles.archiveButton]}
                  onPress={() => onArchiveCard(card.id)}
                >
                  <AntDesign name="delete" size={18} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}