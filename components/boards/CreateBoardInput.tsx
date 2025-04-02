import React from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { styles } from '@/styles/componentStyle/CreateBoardInputStyle';

interface CreateBoardInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onPress: () => void;
  isLoading: boolean;
  placeholder: string;
}

const CreateBoardInput: React.FC<CreateBoardInputProps> = ({
  value,
  onChangeText,
  onPress,
  isLoading,
  placeholder
}) => (
  <View style={styles.container}>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#999"
      value={value}
      onChangeText={onChangeText}
    />
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={isLoading || !value.trim()}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#FFF" />
      ) : (
        <Text style={styles.buttonText}>Créer</Text>
      )}
    </TouchableOpacity>
  </View>
);

export default CreateBoardInput;
