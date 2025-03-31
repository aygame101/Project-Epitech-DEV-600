import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, FlatList, SafeAreaView, TouchableOpacity, TouchableWithoutFeedback, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchWorkspaces, createWorkspace, deleteWorkspace, updateWorkspace } from '@/services/indexService';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    setIsLoading(true);
    try {
      const data = await fetchWorkspaces();
      setWorkspaces(data);
    } catch (error) {
      Alert.alert('Erreur', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorkspace = async () => {
    const trimmedName = workspaceName.trimEnd();

    if (!trimmedName) {
      Alert.alert('Erreur', 'Le nom du workspace ne peut pas être vide');
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await createWorkspace(trimmedName);
      setWorkspaces([...workspaces, data]);
      setWorkspaceName('');
    } catch (error) {
      Alert.alert('Erreur', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWorkspace = async (id) => {
    setIsLoading(true);
    try {
      await deleteWorkspace(id);
      setWorkspaces(workspaces.filter(workspace => workspace.id !== id));
    } catch (error) {
      Alert.alert('Erreur', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditWorkspace = (workspace) => {
    setEditingWorkspace(workspace);
    setNewWorkspaceName(workspace.displayName);
  };

  const handleUpdateWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      Alert.alert('Erreur', 'Le nom du workspace ne peut pas être vide');
      return;
    }
    
    setIsLoading(true);
    try {
      await updateWorkspace(editingWorkspace.id, newWorkspaceName);
      setEditingWorkspace(null);
      
      // Update the workspace locally to avoid additional API call
      const updatedWorkspaces = workspaces.map(workspace => 
        workspace.id === editingWorkspace.id 
          ? { ...workspace, displayName: newWorkspaceName } 
          : workspace
      );
      setWorkspaces(updatedWorkspaces);
    } catch (error) {
      Alert.alert('Erreur', error.message);
    } finally {
      setIsLoading(false);
    }
  };

const handleWorkspacePress = (workspace) => {
  navigation.navigate('WorkspaceBoardsModal', { workspaceId: workspace.id, workspaceName: workspace.displayName });
};

  const confirmDeleteWorkspace = (id, name) => {
    Alert.alert(
      'Confirmation',
      `Êtes-vous sûr de vouloir supprimer "${name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', onPress: () => handleDeleteWorkspace(id), style: 'destructive' }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>TrellUwU</Text>
        
        <View style={styles.createContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nom du workspace à créer"
            placeholderTextColor="#ccc"
            value={workspaceName}
            onChangeText={setWorkspaceName}
          />
          <TouchableOpacity 
            style={styles.createButton} 
            onPress={handleCreateWorkspace} 
            disabled={isLoading || !workspaceName.trim()}
          >
            <Text style={styles.createButtonText}>Créer</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionTitle}>Mes workspaces</Text>
        
        {workspaces.length === 0 && !isLoading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun workspace pour le moment</Text>
          </View>
        ) : (
          <FlatList
            data={workspaces}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableWithoutFeedback onPress={() => handleWorkspacePress(item)}>
                <View style={styles.workspaceItemContainer}>
                  <Text style={styles.workspaceItem}>{item.displayName}</Text>
                  <View style={styles.actionsContainer}>
                    <TouchableOpacity onPress={() => handleEditWorkspace(item)} style={styles.editButton}>
                      <Text style={styles.editButtonText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => confirmDeleteWorkspace(item.id, item.displayName)} style={styles.deleteButton}>
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            )}
            refreshing={isLoading}
            onRefresh={loadWorkspaces}
          />
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={editingWorkspace !== null}
        onRequestClose={() => setEditingWorkspace(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier le workspace</Text>
            <TextInput
              style={styles.modalInput}
              value={newWorkspaceName}
              onChangeText={setNewWorkspaceName}
              onBlur={() => setNewWorkspaceName(newWorkspaceName.trimEnd())}
              placeholder="Nouveau nom du workspace"
              placeholderTextColor="#aaa"
            />
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setEditingWorkspace(null)}
              >
                <Text style={styles.modalButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.updateButton]} 
                onPress={handleUpdateWorkspace}
                disabled={!newWorkspaceName.trim()}
              >
                <Text style={styles.modalButtonText}>Mettre à jour</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFA500',
    marginBottom: 24,
    alignSelf: 'flex-start',
    fontFamily: 'Pacifico',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 12,
  },
  createContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 48,
    borderColor: '#555',
    borderWidth: 1,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    backgroundColor: '#333',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  createButton: {
    marginLeft: 8,
    backgroundColor: '#FFA500',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  createButtonText: {
    color: '#121212',
    fontWeight: 'bold',
  },
  workspaceItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
    marginVertical: 4,
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  workspaceItem: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  editButtonText: {
    fontSize: 18,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#1f1f1f',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    height: 48,
    borderColor: '#555',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    backgroundColor: '#333',
    borderRadius: 8,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#444',
    marginRight: 8,
  },
  updateButton: {
    backgroundColor: '#1E90FF',
    marginLeft: 8,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
});