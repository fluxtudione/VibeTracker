import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface HabitCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const HabitCheckbox: React.FC<HabitCheckboxProps> = ({
  checked,
  onToggle,
  disabled = false,
  loading = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Simple scale animation on toggle
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [checked]);

  if (loading) {
    return (
      <View className="w-6 h-6 justify-center items-center">
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={onToggle}
      disabled={disabled}
      activeOpacity={0.7}
      className={`w-6 h-6 justify-center items-center ${disabled ? 'opacity-50' : ''}`}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {checked ? (
          <Feather name="check-circle" size={24} color="#3B82F6" />
        ) : (
          <Feather name="circle" size={24} color="#D1D5DB" />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default HabitCheckbox;
