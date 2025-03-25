import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import workspaceService from '../../services/WorkspaceService';
import { Workspace } from '../../types/Workspace';

const WorkspacesScreen = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const fetchedWorkspaces = await workspaceService.getWorkspaces();
        setWorkspaces(fetchedWorkspaces);
      } catch (err) {
        setError('Impossible de charger les espaces de travail');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);

  const renderWorkspaceItem = ({ item }: { item: Workspace }) => (
    <View style={styles.workspaceItem}>
      <Text style={styles.workspaceName}>{item.displayName}</Text>
      {item.description && <Text>{item.description}</Text>}
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <FlatList
      data={workspaces}
      renderItem={renderWorkspaceItem}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        <Text style={styles.emptyText}>Aucun espace de travail trouvé</Text>
      }
    />
  );
};

const styles = StyleSheet.create({
  workspaceItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  workspaceName: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20
  }
});

export default WorkspacesScreen;