import { Pressable, Text, View } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { styles } from '@/styles/componentStyle/AddListButtonStyle';

interface AddListButtonProps {
  onPress: () => void;
}

const AddListButton: React.FC<AddListButtonProps> = ({ onPress }) => (
  <Pressable style={styles.addListButton} onPress={onPress}>
    <AntDesign name="plus" size={20} color="#000" />
    <Text style={styles.addListButtonText}>Ajouter une liste</Text>
  </Pressable>
);

export default AddListButton;
