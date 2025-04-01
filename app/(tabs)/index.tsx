import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, FlatList, SafeAreaView, TouchableOpacity, TouchableWithoutFeedback, Modal, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchWorkspaces, createWorkspace, deleteWorkspace, updateWorkspace } from '@/services/indexService';
import { fetchWeatherByCoordinates, WeatherData } from '@/services/weatherService';
import { styles } from '../../styles/indexStyle';

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
    Alert.alert(
      'Confirmation',
      `Êtes-vous sûr de vouloir supprimer "${name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', onPress: () => handleDeleteWorkspace(id), style: 'destructive' }
      ]
    );
  };

  // Rendu du widget météo
  const renderWeatherWidget = () => {
    if (weatherLoading) {
      return (
        <View style={weatherStyles.widget}>
          <ActivityIndicator size="small" color="#0000ff" />
        </View>
      );
    }

    if (weatherError) {
      return (
        <View style={weatherStyles.widget}>
          <Text style={weatherStyles.errorText}>⚠️</Text>
        </View>
      );
    }

    if (weather) {
      // Déterminer l'icône météo en fonction du code weather
      let weatherIcon = '☀️'; // Par défaut: soleil
      
      if (weather.weather && weather.weather.length > 0) {
        const weatherId = weather.weather[0].id;
        
        if (weatherId >= 200 && weatherId < 300) {
          weatherIcon = '⚡'; // Orage
        } else if (weatherId >= 300 && weatherId < 500) {
          weatherIcon = '🌦️'; // Bruine
        } else if (weatherId >= 500 && weatherId < 600) {
          weatherIcon = '🌧️'; // Pluie
        } else if (weatherId >= 600 && weatherId < 700) {
          weatherIcon = '❄️'; // Neige
        } else if (weatherId >= 700 && weatherId < 800) {
          weatherIcon = '🌫️'; // Brouillard
        } else if (weatherId === 800) {
          weatherIcon = '☀️'; // Ciel dégagé
        } else if (weatherId > 800) {
          weatherIcon = '☁️'; // Nuageux
        }
      }

      return (
        <View style={weatherStyles.widget}>
          <Text style={weatherStyles.temp}>{weatherIcon} {Math.round(weather.main?.temp)}°C</Text>
          <Text style={weatherStyles.city}>{weather.name}</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header avec titre et widget météo */}
        <View style={weatherStyles.headerContainer}>
          <Text style={styles.title}>TrellUwU</Text>
          {renderWeatherWidget()}
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

// Styles pour le widget météo
const weatherStyles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  widget: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  temp: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  city: {
    fontSize: 12,
    color: '#eee',
  },
  errorText: {
    fontSize: 18,
    color: '#ffcc00',
  }
});
