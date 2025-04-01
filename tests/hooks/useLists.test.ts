import { renderHook, act } from '@testing-library/react-native';
import useLists from '../../hooks/useLists';
import { listServices } from '../../services/listService';

// Mock the listServices
jest.mock('../../services/listService');

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      apiKey: 'test-api-key',
      token: 'test-token'
    }
  }
}));

// Mock minimal react-native
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn()
  }
}));

describe('useLists', () => {
  const mockLists = [
    { id: 'list1', name: 'To Do', idBoard: 'board1', pos: 1, closed: false },
    { id: 'list2', name: 'In Progress', idBoard: 'board1', pos: 2, closed: false }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (listServices.getListsByBoardId as jest.Mock).mockResolvedValue(mockLists);
  });

  it('should fetch and sort lists for a board', async () => {
    const { result } = renderHook(() => useLists('board1'));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.lists).toEqual(mockLists);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle error when fetching lists fails', async () => {
    const errorMessage = 'Failed to fetch lists';
    (listServices.getListsByBoardId as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useLists('board1'));
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.lists).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
    expect(jest.requireMock('react-native').Alert.alert).toHaveBeenCalledWith('Erreur', errorMessage);
  });

  it('should create a new list', async () => {
    const newList = { id: 'list3', name: 'Done', idBoard: 'board1', pos: 3 };
    (listServices.createList as jest.Mock).mockResolvedValue(newList);

    const { result } = renderHook(() => useLists('board1'));
    
    await act(async () => {
      await result.current.createList('Done');
    });

    expect(listServices.createList).toHaveBeenCalledWith('board1', 'Done');
    expect(result.current.lists).toContainEqual(newList);
  });

  it('should update a list', async () => {
    const updatedList = { ...mockLists[0], name: 'Updated Name' };
    (listServices.updateList as jest.Mock).mockImplementation(async (id, updates) => {
      return { ...mockLists.find(l => l.id === id), ...updates };
    });

    const { result } = renderHook(() => useLists('board1'));
    
    // First load lists
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Then update
    await act(async () => {
      await result.current.updateList('list1', { name: 'Updated Name' });
    });

    expect(listServices.updateList).toHaveBeenCalledWith('list1', { name: 'Updated Name' });
    expect(result.current.lists).toContainEqual(
      expect.objectContaining({ id: 'list1', name: 'Updated Name' })
    );
  });

  it('should archive a list', async () => {
    (listServices.archiveList as jest.Mock).mockImplementation(async (id) => {
      return { ...mockLists.find(l => l.id === id), closed: true };
    });

    const { result } = renderHook(() => useLists('board1'));
    
    // First load lists
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Then archive
    await act(async () => {
      await result.current.archiveList('list1');
    });

    expect(listServices.archiveList).toHaveBeenCalledWith('list1');
    expect(result.current.lists).toContainEqual(
      expect.objectContaining({ id: 'list1', closed: true })
    );
  });

  it('should move a list', async () => {
    (listServices.moveList as jest.Mock).mockResolvedValue(true);

    const { result } = renderHook(() => useLists('board1'));
    
    await act(async () => {
      await result.current.moveList('list1', 3);
    });

    expect(listServices.moveList).toHaveBeenCalledWith('list1', 3);
    expect(listServices.getListsByBoardId).toHaveBeenCalledTimes(2); // initial + after move
  });
});
