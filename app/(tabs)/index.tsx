import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, FlatList, SafeAreaView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { fetchWorkspaces, createWorkspace, deleteWorkspace, updateWorkspace } from '@/services/indexService';

export default function HomeScreen() {
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
    setIsLoading(true);
    try {
      const data = await createWorkspace(workspaceName);
      setWorkspaces([...workspaces, data]);
      setWorkspaceName('');
    } catch (error) {
      Alert.alert('Erreur', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWorkspace = async (id: string) => {
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
    setIsLoading(true);
    try {
      await updateWorkspace(editingWorkspace.id, newWorkspaceName);
      setEditingWorkspace(null);
      loadWorkspaces(); // Recharger les workspaces après la mise à jour
    } catch (error) {
      Alert.alert('Erreur', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>TrellUwU</Text>
        <TextInput
          style={styles.input}
          placeholder="Nom du workspace"
          placeholderTextColor="#ccc"
          value={workspaceName}
          onChangeText={setWorkspaceName}
        />
        <Button title="Créer Workspace" onPress={handleCreateWorkspace} disabled={isLoading} />
        <FlatList
          data={workspaces}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.workspaceItemContainer}>
              <Text style={styles.workspaceItem}>{item.displayName}</Text>
              <TouchableOpacity onPress={() => handleEditWorkspace(item)} style={styles.editButton}>
                <Text style={styles.editButtonText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteWorkspace(item.id)} style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          )}
          refreshing={isLoading}
          onRefresh={loadWorkspaces}
        />
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={editingWorkspace !== null}
        onRequestClose={() => setEditingWorkspace(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.modalInput}
              value={newWorkspaceName}
              onChangeText={setNewWorkspaceName}
              placeholder="Nouveau nom du workspace"
            />
            <Button title="Mettre à jour" onPress={handleUpdateWorkspace} />
            <Button title="Annuler" onPress={() => setEditingWorkspace(null)} />
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
    marginBottom: 16,
    alignSelf: 'flex-start',
    fontFamily: 'Pacifico',
  },
  input: {
    height: 40,
    borderColor: '#555',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    color: '#FFFFFF',
    backgroundColor: '#333',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
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
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  workspaceItem: {
    flex: 1,
    color: '#FFFFFF',
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  editButtonText: {
    color: '#1E90FF',
    fontSize: 18,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    color: '#FF5757',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#1f1f1f',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
  },
  modalInput: {
    height: 40,
    borderColor: '#555',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    color: '#FFFFFF',
    backgroundColor: '#333',
    borderRadius: 5,
  },
});
