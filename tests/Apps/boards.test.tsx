import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import BoardsScreen from '@/app/(tabs)/boards';
import { boardServices } from '@/services/boardService';
import { Alert } from 'react-native';

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

// Mock event stopPropagation
const mockStopPropagation = jest.fn();

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn((title, message, buttons) => {
    // Simuler immédiatement le clic sur le bouton "Supprimer" si c'est un test de suppression
    if (buttons && buttons.length > 1 && buttons[1].text === 'Supprimer') {
      buttons[1].onPress();
    }
  })
}));

describe('BoardsScreen', () => {
  const mockBoards = [
    { id: '1', name: 'Tableau 1', desc: 'Description 1' },
    { id: '2', name: 'Tableau 2', desc: 'Description 2' }
  ];

  beforeEach(() => {
    (boardServices.getBoards as jest.Mock).mockResolvedValue(mockBoards);
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    jest.clearAllMocks();
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

  it('navigates to board when pressed', async () => {
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    
    const { getByText } = render(<BoardsScreen />);
    
    await waitFor(() => {
      expect(getByText('Tableau 1')).toBeTruthy();
    });
   
    fireEvent.press(getByText('Tableau 1'));
    
    // Utiliser waitFor ici aussi pour s'assurer que l'action de navigation a le temps de s'exécuter
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/board/1');
    });
  });

  it('opens edit modal when edit button is pressed', async () => {
    const { getByText, getByTestId } = render(<BoardsScreen />);
    
    await waitFor(() => {
      expect(getByTestId('edit-button-1')).toBeTruthy();
    });
    
    // Créez un événement personnalisé avec stopPropagation implémenté
    const event = {
      stopPropagation: mockStopPropagation
    };
    
    // Utilisez l'événement personnalisé
    fireEvent(getByTestId('edit-button-1'), 'press', event);
    
    await waitFor(() => {
      expect(getByText('Modifier le nom du tableau')).toBeTruthy();
    });
  });

  it('updates a board name', async () => {
    const updatedBoard = { id: '1', name: 'Tableau 1 modifié' };
    (boardServices.updateBoard as jest.Mock).mockResolvedValue(updatedBoard);
    
    const { getByTestId, getByText, getByPlaceholderText } = render(<BoardsScreen />);
    
    await waitFor(() => {
      expect(getByTestId('edit-button-1')).toBeTruthy();
    });
    
    // Créez un événement personnalisé avec stopPropagation implémenté
    const event = {
      stopPropagation: mockStopPropagation
    };
    
    // Ouvrir le modal d'édition
    fireEvent(getByTestId('edit-button-1'), 'press', event);
    
    // Modifier le texte
    fireEvent.changeText(
      getByPlaceholderText('Nouveau nom du tableau'),
      'Tableau 1 modifié'
    );
    
    // Enregistrer les modifications
    fireEvent.press(getByText('Enregistrer'));
    
    // Utiliser waitFor pour attendre l'appel à updateBoard
    await waitFor(() => {
      expect(boardServices.updateBoard).toHaveBeenCalledWith(
        '1', 
        { name: 'Tableau 1 modifié' }
      );
    });
  });

  
});