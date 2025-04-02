import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { boardServices } from '@/services/boardService';

interface Workspace {
  id: string;
  displayName: string;
}

interface WorkspaceSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectWorkspace: (workspaceId: string, workspaceName: string) => void;
}

const WorkspaceSelectionModal = ({ visible, onClose, onSelectWorkspace }: WorkspaceSelectionModalProps) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchWorkspaces();
    }
  }, [visible]);

  const fetchWorkspaces = async () => {
    setIsLoading(true);
    try {
      const data = await boardServices.getWorkspaces();
      setWorkspaces(data);
    } catch (error) {
      console.error('Failed to fetch workspaces:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.title}>Sélectionner un workspace</Text>
          
          {isLoading ? (
            <ActivityIndicator size="large" color="#FFA500" />
          ) : (
            <>
              <FlatList
                data={workspaces}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.workspaceItem}
                    onPress={() => onSelectWorkspace(item.id, item.displayName)}
                  >
                    <Text style={styles.workspaceName}>{item.displayName}</Text>
                  </TouchableOpacity>
                )}
                style={styles.list}
              />
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={onClose}>
                  <Text style={styles.buttonText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalView: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  list: {
    maxHeight: 300
  },
  workspaceItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  workspaceName: {
    fontSize: 16
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20
  },
  button: {
    backgroundColor: '#FFA500',
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});

export default WorkspaceSelectionModal;