import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import ListCard from '../ListCard';
import { List } from '@/types/List';

// Mock des icônes
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: () => 'MockMaterialIcon',
  Feather: () => 'MockFeatherIcon'
}));

// Mock des polices
jest.mock('expo-font', () => ({
  useFonts: () => [true, null]
}));

const mockList: List = {
  id: 'list1',
  name: 'Test List',
  idBoard: 'board1',
  pos: 1,
  closed: false
};

// Mock simplifié pour ThemedView et ThemedText
jest.mock('@/components/ThemedView', () => {
  const { View } = require('react-native');
  const MockThemedView = ({ children }: { children: React.ReactNode }) => <View>{children}</View>;
  return MockThemedView;
});

jest.mock('@/components/ThemedText', () => {
  const { Text } = require('react-native');
  const MockThemedText = ({ children, style }: { children: React.ReactNode, style?: any }) => (
    <Text style={style}>{children}</Text>
  );
  return MockThemedText;
});

describe('ListCard', () => {
  const mockOnUpdate = jest.fn();
  const mockOnArchive = jest.fn();
  const mockOnAddCard = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders list name correctly', () => {
    const { getByText } = render(
      <ListCard 
        list={mockList}
        onUpdate={mockOnUpdate}
        onArchive={mockOnArchive}
        onAddCard={mockOnAddCard}
      />
    );

    expect(getByText('Test List')).toBeTruthy();
  });

  it('calls onAddCard when add card button is pressed', () => {
    const { getByText } = render(
      <ListCard 
        list={mockList}
        onUpdate={mockOnUpdate}
        onArchive={mockOnArchive}
        onAddCard={mockOnAddCard}
      />
    );

    fireEvent.press(getByText('Ajouter une carte'));
    expect(mockOnAddCard).toHaveBeenCalledWith('list1');
  });

  it('calls onArchive when archive is triggered', async () => {
    // Mock pour simuler l'ouverture du menu
    jest.spyOn(React, 'useState').mockImplementationOnce(() => [true, jest.fn()]);

    const { getByText } = render(
      <ListCard 
        list={mockList}
        onUpdate={mockOnUpdate}
        onArchive={mockOnArchive}
        onAddCard={mockOnAddCard}
      />
    );

    fireEvent.press(getByText('Archiver cette liste'));
    expect(mockOnArchive).toHaveBeenCalledWith('list1');
  });

  it('toggles menu visibility when menu button is pressed', () => {
    const { getByTestId, queryByText } = render(
      <ListCard 
        list={mockList}
        onUpdate={mockOnUpdate}
        onArchive={mockOnArchive}
        onAddCard={mockOnAddCard}
      />
    );

    // Menu devrait être fermé initialement
    expect(queryByText('Archiver cette liste')).toBeNull();

    // Ouvrir le menu
    fireEvent.press(getByTestId('list-menu-button'));
    expect(queryByText('Archiver cette liste')).toBeTruthy();
  });

  it('calls onUpdate when list name is changed', () => {
    const { getByDisplayValue, getByTestId } = render(
      <ListCard 
        list={mockList}
        onUpdate={mockOnUpdate}
        onArchive={mockOnArchive}
        onAddCard={mockOnAddCard}
      />
    );

    const input = getByDisplayValue('Test List');
    fireEvent.changeText(input, 'New List Name');
    fireEvent(input, 'submitEditing');

    expect(mockOnUpdate).toHaveBeenCalledWith('list1', { name: 'New List Name' });
  });

  it('shows loading state when isLoading prop is true', () => {
    const { getByTestId } = render(
      <ListCard 
        list={mockList}
        onUpdate={mockOnUpdate}
        onArchive={mockOnArchive}
        onAddCard={mockOnAddCard}
        isLoading={true}
      />
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
});
