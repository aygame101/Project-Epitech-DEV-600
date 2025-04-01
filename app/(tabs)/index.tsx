import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, FlatList, SafeAreaView, TouchableOpacity, TouchableWithoutFeedback, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchWorkspaces, createWorkspace, deleteWorkspace, updateWorkspace } from '@/services/indexService';
import { styles } from '../../styles/indexStyle';

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

