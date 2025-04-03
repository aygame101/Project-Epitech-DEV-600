import { View, Text, StyleSheet } from 'react-native';
import { User } from '@/types/User';

interface UserAvatarProps {
  user: User;
  size?: number;
}

export function UserAvatar({ user, size = 32 }: UserAvatarProps) {
  const initials = user.fullName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Text style={[styles.text, { fontSize: size * 0.4 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 50,
    backgroundColor: '#FFA500',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
});
