import React from 'react';
import { View, Text } from 'react-native';
import SafeAreaWrapper from '../../src/components/layout/SafeAreaWrapper';

export default function ProfileScreen() {
  return (
    <SafeAreaWrapper>
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-6xl mb-6">🚧</Text>
        <Text className="text-2xl font-bold text-gray-900 mb-3 text-center">
          Coming Soon
        </Text>
        <Text className="text-base text-gray-500 text-center leading-relaxed">
          Profile features are currently under development. Stay tuned for updates!
        </Text>
      </View>
    </SafeAreaWrapper>
  );
}
