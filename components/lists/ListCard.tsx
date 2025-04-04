import { List } from '@/types/List';
import { Card } from '@/types/Card';
import { User } from '@/types/User';
import { CardItem } from '@/components/cards/CardItem';
import { AntDesign } from '@expo/vector-icons';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { styles } from '@/styles/idStyle';

interface ListCardProps {
  list: List;
  cards: Card[];
  onUpdate: (listId: string, newName: string) => void;
  onArchive: (listId: string) => void;
  onAddCard: (listId: string) => void;
  onEdit: (listId: string) => void;
  onEditCard: (cardId: string) => void;
  onViewCard: (cardId: string) => void;
  users: User[];
  assignedMembers: (cardId: string) => string[];
}

export function ListCard({
  list,
  cards,
  onUpdate,
  onArchive,
  onAddCard,
  onEdit,
  onEditCard,
  onViewCard,
  users,
  assignedMembers
}: ListCardProps) {
  const listCards = cards.filter(card => card.idList === list.id);

  return (
    <View style={[styles.listCardContainer, { height: Math.min(600, 120 + listCards.length * 80) }]}>
      <View style={styles.listCardHeader}>
        <Text style={styles.listCardTitle}>{list.name}</Text>
        <Pressable onPress={() => onEdit(list.id)} style={styles.editButton}>
          <AntDesign name="edit" size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView style={styles.cardsContainer}>
        {listCards.map(card => (
          <CardItem
            key={card.id}
            card={card}
            onViewCard={onViewCard}
            assignedMembers={users.filter(user => assignedMembers(card.id).includes(user.id))}
          />
        ))}
      </ScrollView>

      <View style={styles.listCardActions}>
        <Pressable onPress={() => onAddCard(list.id)} style={styles.listCardActionBtn}>
          <Text style={styles.listCardActionText}>+ Carte</Text>
        </Pressable>
        <Pressable onPress={() => onArchive(list.id)} style={styles.listCardActionBtn}>
          <Text style={styles.listCardArchiveText}>Archiver</Text>
        </Pressable>
      </View>
    </View>
  );
}
