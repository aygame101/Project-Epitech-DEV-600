import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, FlatList, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchWorkspaces, createWorkspace, deleteWorkspace, updateWorkspace } from '@/services/indexService';
import { fetchWeatherByCoordinates, WeatherData } from '@/services/weatherService';
import { styles } from '../../styles/indexStyle';

import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import WeatherWidget from '@/components/ui/WeatherWidget';
import WorkspaceItem from '@/components/boards/WorkspaceItem';
import EditWorkspaceModal from '@/components/modals/EditWorkspaceModal';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaces, setWorkspaces] = useState<Array<{id: string, displayName: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<{id: string, displayName: string} | null>(null);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  // États pour la météo
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // États pour la suppression
  const [workspaceToDelete, setWorkspaceToDelete] = useState<{id: string, name: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadWorkspaces();
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    setWeatherLoading(true);
    try {
      // Utilisez Paris comme exemple
      const lat = 48.8566;
      const lon = 2.3522;
      
      const data = await fetchWeatherByCoordinates(lat, lon);
      setWeather(data);
    } catch (error) {
      console.error('Erreur détaillée:', error);
      setWeatherError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setWeatherLoading(false);
    }
  };

  const loadWorkspaces = async () => {
    setIsLoading(true);
    try {
      const data = await fetchWorkspaces();
      setWorkspaces(data);
    } catch (error) {
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Erreur inconnue');
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
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Erreur inconnue');
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
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditWorkspace = (workspace: {id: string, displayName: string}) => {
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
      if (!editingWorkspace) return;
      
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
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkspacePress = (workspace: {id: string, displayName: string}) => {
    (navigation as any).navigate('WorkspaceBoardsModal', { 
      workspaceId: workspace.id, 
      workspaceName: workspace.displayName 
    });
  };

  const confirmDeleteWorkspace = (id: string, name: string) => {
    setWorkspaceToDelete({id, name});
  };

  const handleConfirmDelete = async () => {
    if (!workspaceToDelete) return;
    
    setIsDeleting(true);
    try {
      await handleDeleteWorkspace(workspaceToDelete.id);
    } catch (error) {
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsDeleting(false);
      setWorkspaceToDelete(null);
    }
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header avec titre et widget météo */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>TrellUwU</Text>
          <WeatherWidget 
            weather={weather} 
            loading={weatherLoading} 
            error={weatherError} 
          />
        </View>
        
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
              <WorkspaceItem
                workspace={item}
                isDeleting={isDeleting && workspaceToDelete?.id === item.id}
                onPress={() => handleWorkspacePress(item)}
                onEdit={() => handleEditWorkspace(item)}
                onDelete={() => confirmDeleteWorkspace(item.id, item.displayName)}
              />
            )}
            refreshing={isLoading}
            onRefresh={loadWorkspaces}
          />
        )}
      </View>

      <EditWorkspaceModal
        visible={editingWorkspace !== null}
        currentName={newWorkspaceName}
        onClose={() => setEditingWorkspace(null)}
        onSave={handleUpdateWorkspace}
        onChangeText={setNewWorkspaceName}
        isValid={!!newWorkspaceName.trim()}
      />
    <DeleteConfirmationModal
      visible={!!workspaceToDelete}
      title="Confirmer la suppression"
      message={`Êtes-vous sûr de vouloir supprimer "${workspaceToDelete?.name}" ?`}
      isDeleting={isDeleting}
      onCancel={() => setWorkspaceToDelete(null)}
      onConfirm={handleConfirmDelete}
    />
    </SafeAreaView>
  );
}
