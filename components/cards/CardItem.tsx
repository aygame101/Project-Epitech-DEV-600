import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  View, 
  StyleSheet, 
  GestureResponderEvent,
  Animated,
  Platform 
} from 'react-native';
import { Card } from '../types/Card';
import ThemedText from '../ui/ThemedText';
import ThemedView from '../ui/ThemedView';
import { useThemeColor } from '../../hooks/useThemeColor';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface CardItemProps {
  card: Card;
  onPress?: () => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const CardItem: React.FC<CardItemProps> = ({ 
  card, 
  onPress, 
  onLongPress,
  onSwipeLeft,
  onSwipeRight 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { colors } = useThemeColor();
  const translateX = new Animated.Value(0);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = event.nativeEvent;
      if (translationX < -100 && onSwipeLeft) {
        onSwipeLeft();
      } else if (translationX > 100 && onSwipeRight) {
        onSwipeRight();
      }
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          styles.container,
          { 
            backgroundColor: colors.cardBackground,
            transform: [{ translateX }],
            shadowColor: Platform.OS === 'ios' ? '#000' : undefined,
            shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 1 } : undefined,
            shadowOpacity: Platform.OS === 'ios' ? 0.2 : undefined,
            shadowRadius: Platform.OS === 'ios' ? 1 : undefined,
            elevation: Platform.OS === 'android' ? 2 : undefined,
          }
        ]}
      >
        <TouchableOpacity
          onPress={onPress || toggleExpand}
          onLongPress={onLongPress}
          activeOpacity={0.7}
          delayLongPress={300}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <ThemedText style={styles.title}>{card.title}</ThemedText>
              {card.dueDate && (
                <View style={[styles.dueDate, { backgroundColor: colors.primaryLight }]}>
                  <ThemedText style={styles.dueDateText}>
                    {new Date(card.dueDate).toLocaleDateString()}
                  </ThemedText>
                </View>
              )}
            </View>
            
            {card.description && isExpanded && (
              <ThemedText style={styles.description}>
                {card.description}
              </ThemedText>
            )}

            {(card.labels?.length > 0 || card.checklists?.length > 0) && (
              <View style={styles.footer}>
                {card.labels?.length > 0 && (
                  <View style={styles.labelsContainer}>
                    {card.labels.map((label, index) => (
                      <View
                        key={`label-${index}`}
                        style={[
                          styles.label,
                          { backgroundColor: label.color || colors.primary },
                        ]}
                      />
                    ))}
                  </View>
                )}

                {card.checklists?.length > 0 && (
                  <View style={styles.checklistInfo}>
                    <Icon 
                      name="check-box" 
                      size={16} 
                      color={colors.textSecondary} 
                    />
                    <ThemedText style={styles.checklistText}>
                      {card.checklists.reduce((acc, checklist) => 
                        acc + checklist.items.filter(item => item.completed).length, 0
                      )}/{card.checklists.reduce((acc, checklist) => 
                        acc + checklist.items.length, 0
                      )}
                    </ThemedText>
                  </View>
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    marginBottom: 8,
    padding: 12,
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontWeight: '500',
    flex: 1,
  },
  dueDate: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  dueDateText: {
    fontSize: 12,
  },
  description: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 8,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  labelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  label: {
    width: 32,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
    marginBottom: 4,
  },
  checklistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checklistText: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.8,
  },
});

export default CardItem;