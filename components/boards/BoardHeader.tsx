import { Pressable, Text, View } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { styles } from '@/styles/componentStyle/BoardHeaderStyle';

interface BoardHeaderProps {
  title: string;
  onBack: () => void;
}

const BoardHeader: React.FC<BoardHeaderProps> = ({ title, onBack }) => (
  <View style={styles.header}>
    <Pressable onPress={onBack} style={styles.backButton}>
      <AntDesign name="arrowleft" size={28} color="#FFA500" />
    </Pressable>
    <Text style={styles.boardTitle}>{title}</Text>
  </View>
);

export default BoardHeader;
