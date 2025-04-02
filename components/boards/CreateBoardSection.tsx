import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '@/styles/componentStyle/CreateBoardSectionStyle';
import CreateBoardInput from './CreateBoardInput';

interface CreateBoardSectionProps {
  value: string;
  onChangeText: (text: string) => void;
  onCreatePress: () => void;
  isLoading: boolean;
}

const CreateBoardSection: React.FC<CreateBoardSectionProps> = ({
  value,
  onChangeText,
  onCreatePress,
  isLoading
}) => (
  <View style={styles.container}>
    <Text style={styles.title}>TrellUwU</Text>
    <CreateBoardInput 
      value={value}
      onChangeText={onChangeText}
      onPress={onCreatePress}
      isLoading={isLoading}
      placeholder="Nom du tableau à créer"
    />
  </View>
);

export default CreateBoardSection;
