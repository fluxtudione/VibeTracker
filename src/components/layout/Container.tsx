import React from 'react';
import { ScrollView, View, type ScrollViewProps } from 'react-native';

interface ContainerProps extends ScrollViewProps {
  children: React.ReactNode;
  className?: string;
}

const Container: React.FC<ContainerProps> = ({ children, className = '', ...props }) => {
  return (
    <ScrollView
      className={`px-4 ${className}`}
      contentContainerStyle={{ paddingVertical: 16 }}
      showsVerticalScrollIndicator={false}
      {...props}
    >
      {children}
    </ScrollView>
  );
};

export default Container;
