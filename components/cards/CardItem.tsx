import { User } from '@/types/User';
import { Card } from '@/types/Card';
import { UserAvatar } from '@/components/cards/UserAvatar';
import { View, Text, Pressable } from 'react-native';
import { styles } from '@/styles/idStyle';

interface ChecklistsData {
  [cardId: string]: Array<{
    id: string;
    name: string;
    checkItems: Array<{
      id: string;
      name: string;
      state: 'complete' | 'incomplete';
    }>;
    checkItemsChecked: number;
  }>;
}

interface CardItemProps {
  card: Card;
  onViewCard: (cardId: string) => void;
  assignedMembers: User[];
}

export function CardItem({ card, onViewCard, assignedMembers }: CardItemProps) {
  const checklistsData: ChecklistsData = {};
  const truncateDescription = (text: string, maxLength = 30) => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const cardChecklists = checklistsData[card.id] || [];
  
  let totalItems = 0;
  let totalChecked = 0;

  cardChecklists.forEach(checklist => {
    totalItems += checklist.checkItems.length;
    totalChecked += checklist.checkItemsChecked;
  });

  const progressPercentage = totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0;

  return (
    <Pressable style={styles.cardItem} onPress={() => onViewCard(card.id)}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{card.name}</Text>
        {assignedMembers.length > 0 && (
          <View style={styles.avatarsContainer}>
            {assignedMembers.map((member: User) => (
              <UserAvatar key={member.id} user={member} size={20} />
            ))}
          </View>
        )}
      </View>

      {card.desc && (
        <Text style={styles.cardDescription} numberOfLines={1} ellipsizeMode="tail">
          {truncateDescription(card.desc)}
        </Text>
      )}

      {totalItems > 0 && (
        <View style={styles.checklistProgressContainer}>
          <View style={styles.checklistProgressBar}>
            <View
              style={[
                styles.checklistProgressFill,
                { width: `${progressPercentage}%` }
              ]}
            />
          </View>
          <Text style={styles.checklistProgressText}>
            {progressPercentage}% ({totalChecked}/{totalItems})
          </Text>
        </View>
      )}
    </Pressable>
  );
}
