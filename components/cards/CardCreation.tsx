import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import ThemedText from '../ui/ThemedText';
import ThemedView from '../ui/ThemedView';
import { useThemeColor } from '../../hooks/useThemeColor';
import { Card } from '../../types/Card';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface CardCreationProps {
  listId: string;
  onCreate: (card: Partial<Card>) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}

const CardCreation: React.FC<CardCreationProps> = ({ 
  listId, 
  onCreate, 
  onCancel,
  autoFocus = false
}) => {
  const [title, setTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(autoFocus);
  const [description, setDescription] = useState('');
  const { colors } = useThemeColor();

  useEffect(() => {
    if (autoFocus) {
      setIsExpanded(true);
    }
  }, [autoFocus]);

  const handleSubmit = () => {
    if (title.trim()) {
      onCreate({
        title: title.trim(),
        description: description.trim(),
        listId,
        position: Date.now(),
      });
      setTitle('');
      setDescription('');
      setIsExpanded(false);
      Keyboard.dismiss();
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setIsExpanded(false);
    Keyboard.dismiss();
    if (onCancel) onCancel();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <ThemedView style={styles.container}>
        {isExpanded ? (
          <ScrollView 
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.expandedContainer}
          >
            <TextInput
              style={[
                styles.input, 
                { 
                  color: colors.text,
                  borderColor: colors.border,
                }
              ]}
              placeholder="Enter card title..."
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
              autoFocus={isExpanded}
              multiline
              onSubmitEditing={handleSubmit}
              returnKeyType="done"
              blurOnSubmit={false}
            />
            <TextInput
              style={[
                styles.input, 
                styles.descriptionInput, 
                { 
                  color: colors.text,
                  borderColor: colors.border,
                }
              ]}
              placeholder="Enter description (optional)..."
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              scrollEnabled={false}
            />
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[
                  styles.button, 
                  { 
                    backgroundColor: colors.primary,
                    opacity: title.trim() ? 1 : 0.6,
                  }
                ]}
                onPress={handleSubmit}
                disabled={!title.trim()}
              >
                <ThemedText style={styles.buttonText}>Add Card</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleCancel}
                style={styles.cancelButton}
              >
                <Icon name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          <TouchableOpacity 
            onPress={() => {
              setIsExpanded(true);
            }}
            style={styles.collapsedContainer}
          >
            <Icon 
              name="add" 
              size={20} 
              color={colors.textSecondary} 
              style={styles.addIcon}
            />
            <ThemedText style={styles.addCardText}>
              {title.trim() ? title : 'Add a card'}
            </ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    marginBottom: 8,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  expandedContainer: {
    padding: 12,
  },
  collapsedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  descriptionInput: {
    minHeight: 80,
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1,
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
  cancelButton: {
    padding: 4,
  },
  addCardText: {
    opacity: 0.7,
    marginLeft: 8,
  },
  addIcon: {
    opacity: 0.7,
  },
});

export default CardCreation;