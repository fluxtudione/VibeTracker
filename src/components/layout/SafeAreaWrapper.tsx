import React from 'react';
import { SafeAreaView, View } from 'react-native';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({ children, className = '' }) => {
  return (
    <SafeAreaView className={`flex-1 bg-white ${className}`}>
      {children}
    </SafeAreaView>
  );
};

export default SafeAreaWrapper;
