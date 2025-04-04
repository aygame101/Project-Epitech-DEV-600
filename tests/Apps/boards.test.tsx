import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { boardServices } from '@/services/boardService';
import { listServices } from '@/services/listService';
import { cardServices } from '@/services/cardService';
import BoardDetailScreen from '@/app/board/[id]';

// Mock des services
jest.mock('@/services/boardService');
jest.mock('@/services/listService');
jest.mock('@/services/cardService');
jest.mock('expo-router');
jest.mock('@expo/vector-icons', () => ({
  AntDesign: 'View'
}));

describe('Board Management', () => {
  const mockBoard = {
    id: 'board1',
    name: 'Test Board',
    idOrganization: 'org1'
  };

  const mockList = {
    id: 'list1',
    name: 'Test List',
    idBoard: 'board1'
  };

  const mockCard = {
    id: 'card1',
    name: 'Test Card', 
    idList: 'list1'
  };

  const mockRouter = {
    back: jest.fn(),
    push: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock router
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'board1' });

    // Mock board service
    (boardServices.getBoardById as jest.Mock).mockResolvedValue(mockBoard);
    (boardServices.getBoardDetails as jest.Mock).mockResolvedValue(mockBoard);
    (boardServices.deleteBoard as jest.Mock).mockResolvedValue({});

    // Mock list service
    (listServices.createList as jest.Mock).mockImplementation((boardId, name) => {
      return Promise.resolve({...mockList, name, idBoard: boardId});
    });
    (listServices.archiveList as jest.Mock).mockResolvedValue({});

    // Mock card service
    (cardServices.addCard as jest.Mock).mockResolvedValue(mockCard);
    (cardServices.getCardsByBoard as jest.Mock).mockResolvedValue([mockCard]);
    (cardServices.getCardMembers as jest.Mock).mockResolvedValue([]);
    (cardServices.getWorkspaceMembers as jest.Mock).mockResolvedValue([]);
    (cardServices.archiveCard as jest.Mock).mockResolvedValue({});
  });

  it('should create and delete board, list and card successfully', async () => {
    const { getByText, getByPlaceholderText, queryByText } = render(<BoardDetailScreen />);

    // 1. Test création board
    await waitFor(() => {
      expect(getByText('Test Board')).toBeTruthy();
    });

    // 2. Test création liste
    fireEvent.press(getByText('Ajouter une liste'));
    fireEvent.changeText(getByPlaceholderText('Nom de la liste'), 'Test List');
    fireEvent.press(getByText('Créer'));

    await waitFor(() => {
      expect(listServices.createList).toHaveBeenCalledWith('board1', 'Test List');
      expect(getByText('Test List')).toBeTruthy();
    });

    // 3. Test création carte
    fireEvent.press(getByText('+ Carte'));
    fireEvent.changeText(getByPlaceholderText('Titre de la carte'), 'Test Card');
    fireEvent.press(getByText('Créer'));

    await waitFor(() => {
      expect(cardServices.addCard).toHaveBeenCalledWith('list1', 'Test Card', '');
      expect(getByText('Test Card')).toBeTruthy();
    });
  });
});
