import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { boardServices } from '@/services/boardService';
import { Board } from '@/types/Board';

export default function useBoards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBoards = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await boardServices.getBoards();
      setBoards(data);
    } catch (error) {
      setError(error.message);
      Alert.alert('Erreur', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createBoard = async (name: string) => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom du tableau est requis');
      return null;
    }
    
    try {
      const newBoard = await boardServices.createBoard(name);
      setBoards([...boards, newBoard]);
      return newBoard;
    } catch (error) {
      Alert.alert('Erreur', error.message);
      return null;
    }
  };

  const deleteBoard = async (boardId: string) => {
    try {
      await boardServices.deleteBoard(boardId);
      setBoards(boards.filter(board => board.id !== boardId));
      return true;
    } catch (error) {
      Alert.alert('Error', error.message);
      return false;
    }
  };

  const updateBoard = async (boardId: string, updates: Partial<Board>) => {
    try {
      const updatedBoard = await boardServices.updateBoard(boardId, updates);
      setBoards(boards.map(board => 
        board.id === boardId ? updatedBoard : board
      ));
      return updatedBoard;
    } catch (error) {
      Alert.alert('Error', error.message);
      return null;
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  return {
    boards,
    isLoading,
    error,
    fetchBoards,
    createBoard,
    deleteBoard,
    updateBoard
  };
}