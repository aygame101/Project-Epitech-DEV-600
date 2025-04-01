import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import BoardsScreen from '../boards';
import { boardServices } from '@/services/boardService';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() }))
}));

// Mock boardServices
jest.mock('@/services/boardService', () => ({
  boardServices: {
    getBoards: jest.fn(),
    createBoard: jest.fn(),
    updateBoard: jest.fn(),
    deleteBoard: jest.fn()
  }
}));

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn()
}));

describe('BoardsScreen', () => {
  const mockBoards = [
    { id: '1', name: 'Tableau 1', desc: 'Description 1' },
    { id: '2', name: 'Tableau 2', desc: 'Description 2' }
  ];

  beforeEach(() => {
    (boardServices.getBoards as jest.Mock).mockResolvedValue(mockBoards);
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with loading state', async () => {
    (boardServices.getBoards as jest.Mock).mockImplementationOnce(
      () => new Promise(() => {})
    );
    
    const { getByTestId } = render(<BoardsScreen />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('displays boards after loading', async () => {
    const { getByText, queryByTestId } = render(<BoardsScreen />);
    
    await waitFor(() => {
      expect(queryByTestId('loading-indicator')).toBeNull();
      expect(getByText('Tableau 1')).toBeTruthy();
      expect(getByText('Tableau 2')).toBeTruthy();
    });
  });

  it('shows empty state when no boards', async () => {
    (boardServices.getBoards as jest.Mock).mockResolvedValueOnce([]);
    
    const { getByText } = render(<BoardsScreen />);
    
    await waitFor(() => {
      expect(getByText('Aucun tableau pour le moment')).toBeTruthy();
    });
  });

  it('creates a new board', async () => {
    const newBoard = { id: '3', name: 'Nouveau tableau' };
    (boardServices.createBoard as jest.Mock).mockResolvedValue(newBoard);
    
    const { getByPlaceholderText, getByText } = render(<BoardsScreen />);
    
    fireEvent.changeText(
      getByPlaceholderText('Nom du tableau à créer'),
      'Nouveau tableau'
    );
    fireEvent.press(getByText('Créer'));
    
    await waitFor(() => {
      expect(boardServices.createBoard).toHaveBeenCalledWith('Nouveau tableau');
      expect(getByText('Nouveau tableau')).toBeTruthy();
    });
  });

  it('navigates to board when pressed', async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValueOnce({ push: mockPush });
    
    const { getByText } = render(<BoardsScreen />);
    
    await waitFor(() => {
      fireEvent.press(getByText('Tableau 1'));
      expect(mockPush).toHaveBeenCalledWith('/board/1');
    });
  });

  it('opens edit modal when edit button is pressed', async () => {
    const { getByText, getByTestId } = render(<BoardsScreen />);
    
    await waitFor(() => {
      // Trouver le bouton d'édition (peut nécessiter un testID sur le bouton)
      fireEvent.press(getByTestId('edit-button-1'));
      expect(getByText('Modifier le nom du tableau')).toBeTruthy();
    });
  });

  it('deletes a board after confirmation', async () => {
    const { getByTestId } = render(<BoardsScreen />);
    
    await waitFor(() => {
      fireEvent.press(getByTestId('delete-button-1'));
      // Simuler la confirmation
      const alertMock = require('react-native/Libraries/Alert/Alert');
      const confirmCall = alertMock.alert.mock.calls[0][2][1];
      confirmCall.onPress();
      
      expect(boardServices.deleteBoard).toHaveBeenCalledWith('1');
    });
  });
});
