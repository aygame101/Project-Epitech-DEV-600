import { Modal, TouchableWithoutFeedback, View, Text, Pressable, FlatList } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { styles } from '@/styles/idStyle';
import { User } from '@/types/User';

interface AssignUserModalProps {
  visible: boolean;
  onClose: () => void;
  users: User[];
  assignedMembers: string[];
  onAssign: (userId: string) => Promise<void>;
}

export function AssignUserModal({
  visible,
  onClose,
  users,
  assignedMembers,
  onAssign
}: AssignUserModalProps) {
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
                <Text style={styles.modalTitle}>Assigner un utilisateur</Text>
                <Pressable
                  onPress={onClose}
                  style={styles.closeButton}
                >
                  <AntDesign name="close" size={24} color="#fff" />
                </Pressable>
              </View>

              {users.length > 0 ? (
                <FlatList
                  data={users}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <Pressable
                      style={styles.userItem}
                      onPress={() => onAssign(item.id)}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.userName}>{item.fullName}</Text>
                        {assignedMembers.includes(item.id) && (
                          <AntDesign
                            name="check"
                            size={20}
                            color="green"
                            style={{ marginLeft: 10 }}
                          />
                        )}
                      </View>
                      <Text style={styles.userEmail}>{item.username}</Text>
                    </Pressable>
                  )}
                  style={styles.userList}
                />
              ) : (
                <Text style={styles.noUsersText}>Aucun utilisateur trouvé dans ce workspace</Text>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
