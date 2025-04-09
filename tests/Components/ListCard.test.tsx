import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ListCard } from '../../components/lists/ListCard';
import { List } from '@/types/List';
import { Card } from '@/types/Card';
import { User } from '@/types/User';

// Mock data
const mockList: List = {
  id: 'list1',
  name: 'Test List',
  idBoard: 'board1',
  pos: 1,
  closed: false
};

const mockCards: Card[] = [
  {
    id: 'card1',
    name: 'Test Card',
    idList: 'list1',
    idBoard: 'board1',
    desc: ''
  }
];

const mockUsers: User[] = [
  {
    id: 'user1',
    fullName: 'Test User',
    username: 'testuser'
  }
];

const mockAssignedMembers = jest.fn((cardId: string) => ['user1']);

// Mock icons
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: () => 'MockMaterialIcon',
  Feather: () => 'MockFeatherIcon',
  AntDesign: () => 'MockAntDesignIcon'
}));

// Mock fonts
jest.mock('expo-font', () => ({
  useFonts: () => [true, null]
}));

// Mock themed components
jest.mock('@/components/ThemedView', () => {
  const { View } = require('react-native');
  return ({ children }: { children: React.ReactNode }) => <View>{children}</View>;
});

jest.mock('@/components/ThemedText', () => {
  const { Text } = require('react-native');
  return ({ children, style }: { children: React.ReactNode, style?: any }) => (
    <Text style={style}>{children}</Text>
  );
});

describe('ListCard Component', () => {
  const mockOnUpdate = jest.fn();
  const mockOnArchive = jest.fn();
  const mockOnAddCard = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnEditCard = jest.fn();
  const mockOnViewCard = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderListCard = (props = {}) => {
    return render(
      <ListCard
        list={mockList}
        cards={mockCards}
        onUpdate={mockOnUpdate}
        onArchive={mockOnArchive}
        onAddCard={mockOnAddCard}
        onEdit={mockOnEdit}
        onEditCard={mockOnEditCard}
        onViewCard={mockOnViewCard}
        users={mockUsers}
        assignedMembers={mockAssignedMembers}
        {...props}
      />
    );
  };

  describe('Rendering', () => {
    it('should render cards in the list', () => {
      const { getByText } = renderListCard();
      expect(getByText('Test Card')).toBeTruthy();
    });

    it('should render action buttons', () => {
      const { getByText } = renderListCard();
      expect(getByText('+ Carte')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('should call onAddCard when add card button is pressed', () => {
      const { getByText } = renderListCard();
      fireEvent.press(getByText('+ Carte'));
      expect(mockOnAddCard).toHaveBeenCalledWith('list1');
    });

    it('should call onViewCard when a card is pressed', () => {
      const { getByText } = renderListCard();
      fireEvent.press(getByText('Test Card'));
      expect(mockOnViewCard).toHaveBeenCalledWith('card1');
    });

  describe('Edge Cases', () => {
    
    it('should handle empty cards list', () => {
      const { queryByText } = renderListCard({
        cards: []
      });
      expect(queryByText('Test Card')).toBeNull();
    });
  });
})});
