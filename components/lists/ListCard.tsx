import { StyleSheet, Pressable, TextInput, View } from 'react-native';
import { useState } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { List } from '@/types/List';

type ListCardProps = {
  list: List;
  onUpdate: (listId: string, newName: string) => Promise<void>;
  onArchive: (listId: string) => Promise<void>;
  onAddCard: (listId: string) => void;
};

export default function ListCard({ list, onUpdate, onArchive, onAddCard }: ListCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(list.name);
  const [showMenu, setShowMenu] = useState(false);

  const handleSave = async () => {
    if (newName.trim() && newName !== list.name) {
      await onUpdate(list.id, newName);
    }
    setIsEditing(false);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              autoFocus
              onBlur={handleSave}
              onSubmitEditing={handleSave}
            />
          </View>
        ) : (
          <Pressable 
            style={styles.titleContainer} 
            onPress={() => setIsEditing(true)}
          >
            <ThemedText style={styles.title}>{list.name}</ThemedText>
          </Pressable>
        )}
        
        <Pressable 
          style={styles.menuButton}
          onPress={() => setShowMenu(!showMenu)}
        >
          <Feather name="more-horizontal" size={20} color="#6B778C" />
        </Pressable>
      </View>
      
      {showMenu && (
        <ThemedView style={styles.menu}>
          <Pressable 
            style={styles.menuItem}
            onPress={() => {
              onArchive(list.id);
              setShowMenu(false);
            }}
          >
            <MaterialIcons name="archive" size={16} color="#6B778C" />
            <ThemedText>Archiver cette liste</ThemedText>
          </Pressable>
        </ThemedView>
      )}
      
      <View style={styles.cardContainer}>
        {/* Les cartes seraient rendues ici */}
      </View>
      
      <Pressable 
        style={styles.addCardButton}
        onPress={() => onAddCard(list.id)}
      >
        <MaterialIcons name="add" size={20} color="#6B778C" />
        <ThemedText style={styles.addCardText}>Ajouter une carte</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 272,
    borderRadius: 3,
    backgroundColor: '#EBECF0',
    marginHorizontal: 8,
    maxHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  titleContainer: {
    flex: 1,
    paddingVertical: 6,
  },
  title: {
    fontWeight: '600',
    fontSize: 14,
  },
  menuButton: {
    padding: 6,
  },
  menu: {
    position: 'absolute',
    top: 40,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 8,
  },
  editContainer: {
    flex: 1,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#0079BF',
    borderRadius: 3,
    padding: 8,
    fontSize: 14,
  },
  cardContainer: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 4,
  },
  addCardText: {
    color: '#6B778C',
    fontSize: 14,
  }
});