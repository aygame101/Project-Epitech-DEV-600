import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { listServices } from '@/services/listService';
import { List } from '@/types/List';

export default function useLists(boardId: string) {
  const [lists, setLists] = useState<List[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLists = async () => {
    if (!boardId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await listServices.getListsByBoardId(boardId);
      const sortedLists = data
        .filter(list => !list.closed)
        .sort((a, b) => a.pos - b.pos);
      setLists(sortedLists);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
      setError(message);
      Alert.alert('Erreur', message);
    } finally {
      setIsLoading(false);
    }
  };

  const createList = async (name: string) => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom de la liste est requis');
      return null;
    }
    
    try {
      const newList = await listServices.createList(boardId, name);
      setLists([...lists, newList]);
      return newList;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
      Alert.alert('Erreur', message);
      return null;
    }
  };

  const updateList = async (listId: string, updates: Partial<List>) => {
    try {
      const updatedList = await listServices.updateList(listId, updates);
      setLists(lists.map(list => 
        list.id === listId ? updatedList : list
      ));
      return updatedList;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('Error', message);
      return null;
    }
  };

  const archiveList = async (listId: string) => {
    try {
      await listServices.archiveList(listId);
      setLists(lists.map(list => 
        list.id === listId ? { ...list, closed: true } : list
      ));
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('Error', message);
      return false;
    }
  };

  const moveList = async (listId: string, position: number) => {
    try {
      await listServices.moveList(listId, position);
      await fetchLists();
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      Alert.alert('Error', message);
      return false;
    }
  };

  useEffect(() => {
    if (boardId) {
      fetchLists();
    }
  }, [boardId]);

  return {
    lists,
    isLoading,
    error,
    fetchLists,
    createList,
    updateList,
    archiveList,
    moveList
  };
}
