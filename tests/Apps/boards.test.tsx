import React, { act } from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';

interface List {
  id: string;
  name: string;
  idBoard: string;
}
import BoardDetailScreen from '@/app/board/[id]';
import { boardServices } from '@/services/boardService';
import { listServices } from '@/services/listService';
import { cardServices } from '@/services/cardService';
import { Alert } from 'react-native';

// Configuration des mocks
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({ id: 'board1' })
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children
}));

jest.mock('@/services/boardService');
jest.mock('@/services/listService');
jest.mock('@/services/cardService');

// Mock réaliste de useLists basé sur [id].tsx
jest.mock('@/hooks/useLists', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    lists: [],
    isLoading: false,
    createList: jest.fn((name) => 
      Promise.resolve({ 
        id: `list-${Date.now()}`, 
        name, 
        idBoard: 'board1' 
      })
    ),
    updateList: jest.fn(),
    archiveList: jest.fn((id) => Promise.resolve()),
    fetchLists: jest.fn()
  }))
}));

// Mock réaliste de useChecklists basé sur [id].tsx
jest.mock('@/hooks/useChecklists', () => {
  const actual = jest.requireActual('@/hooks/useChecklists');
  return {
    ...actual,
    __esModule: true,
    default: () => ({
      ...actual.default(),
      allChecklists: [],
      selectedCard: null,
      newChecklistName: '',
      newChecklistItems: [''],
      showModal: false,
      isUpdating: false,
      loadChecklistsForCard: jest.fn(),
      saveChecklistChanges: jest.fn(),
      deleteChecklist: jest.fn(),
      setNewChecklistName: jest.fn(),
      setNewChecklistItems: jest.fn(),
      setSelectedCard: jest.fn(),
      addChecklistItem: jest.fn(),
      removeChecklistItem: jest.fn()
    })
  };
});

describe('Board Management Tests', () => {
  const mockBoard = {
    id: 'board1',
    name: 'Mon Board',
    idOrganization: 'org1'
  };

  const mockList = {
    id: 'list1',
    name: 'À Faire',
    idBoard: 'board1'
  };

  const mockCard = {
    id: 'card1',
    name: 'Ma Carte',
    idList: 'list1',
    desc: 'Description'
  };

  beforeAll(() => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    (boardServices.getBoardById as jest.Mock).mockResolvedValue(mockBoard);
    (listServices.getListsByBoardId as jest.Mock).mockResolvedValue([mockList]);
    (cardServices.getCards as jest.Mock).mockResolvedValue([mockCard]);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // TEST CRÉATION LISTE
  test('create new list and verify UI update', async () => {
    const newList = {...mockList, name: 'Nouvelle Liste'};
    (listServices.createList as jest.Mock).mockResolvedValue(newList);
  
    await act(async () => {
      render(<BoardDetailScreen />);
      
      await act(async () => {
        fireEvent.press(screen.getByText('Ajouter une liste'));
      });
  
      await act(async () => {
        fireEvent.changeText(
          screen.getByPlaceholderText('Entrez le nom de la liste'),
          'Nouvelle Liste'
        );
        fireEvent.press(screen.getByText('Créer'));
      });
    });
  
    await waitFor(() => {
      expect(screen.getByText('Nouvelle Liste')).toBeTruthy();
    });
  });

  // TEST SUPPRESSION LISTE
  test('archive list and verify removal from UI', async () => {
    // Mock initial data with proper typing
    const mockLists: List[] = [{...mockList}];
    const mockListsAfterArchive: List[] = [];

    // Setup mock implementations
    (listServices.getListsByBoardId as jest.Mock)
      .mockResolvedValueOnce(mockLists)
      .mockResolvedValueOnce(mockListsAfterArchive);
      
    (listServices.archiveList as jest.Mock).mockImplementation(() => {
      mockLists.pop(); // Simulate archiving
      return Promise.resolve();
    });

    const { queryByText } = render(<BoardDetailScreen />);
    
    // Verify list appears initially
    await waitFor(() => expect(screen.getByText('À Faire')).toBeTruthy());
    
    // Trigger archive
    fireEvent.press(screen.getByText('À Faire'));
    fireEvent.press(screen.getByText('Archiver'));
    
    // Verify list disappears
    await waitFor(() => {
      expect(queryByText('À Faire')).toBeNull();
      expect(listServices.archiveList).toHaveBeenCalledWith('list1');
    });
  });

  // TEST CRÉATION CARTE
  test('create new card and verify display', async () => {
    const newCard = {...mockCard, name: 'Nouvelle Carte'};
    (cardServices.addCard as jest.Mock).mockResolvedValue(newCard);
  
    await act(async () => {
      render(<BoardDetailScreen />);
      
      await act(async () => {
        fireEvent.press(screen.getByText('+ Carte'));
        fireEvent.changeText(
          screen.getByPlaceholderText('Titre de la carte'),  
          'Nouvelle Carte'
        );
        fireEvent.press(screen.getByText('Créer'));
      });
    });
  
    await waitFor(() => {
      expect(screen.getByText('Nouvelle Carte')).toBeTruthy();
    });
  });

  // TEST SUPPRESSION CARTE 
  test('archive card and verify UI update', async () => {
    (cardServices.archiveCard as jest.Mock).mockResolvedValue(true);

    render(<BoardDetailScreen />);
    
    await waitFor(() => {
      expect(screen.getByText('Ma Carte')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Ma Carte'));
    fireEvent.press(screen.getByText('Archiver'));

    await waitFor(() => {
      expect(cardServices.archiveCard).toHaveBeenCalledWith('card1');
    });
  });

  // TEST ERREUR CRÉATION
  test('show error when list creation fails', async () => {
  (listServices.createList as jest.Mock).mockRejectedValue(
    new Error('Erreur création')
  );

  await act(async () => {
    render(<BoardDetailScreen />);
    
    await act(async () => {
      fireEvent.press(screen.getByText('Ajouter une liste'));
      fireEvent.press(screen.getByText('Créer'));
    });
  });

  expect(Alert.alert).toHaveBeenCalledWith('Erreur', expect.any(String));
});
});
