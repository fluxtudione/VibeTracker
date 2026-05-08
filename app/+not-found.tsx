import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <View>
      <Text>404 - Page Not Found</Text>
      <Link href="/">Go Home</Link>
    </View>
  );
}
