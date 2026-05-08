import React from 'react';
import { View, ActivityIndicator } from 'react-native';

interface LoadingProps {
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ fullScreen = false }) => {
  if (fullScreen) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View className="py-4 justify-center items-center">
      <ActivityIndicator size="small" color="#3B82F6" />
    </View>
  );
};

export default Loading;
