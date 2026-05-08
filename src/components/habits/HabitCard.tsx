import React from 'react';
import { View, Text } from 'react-native';
import Card from '../ui/Card';
import HabitCheckbox from './HabitCheckbox';
import type { Habit } from '../../types/habit.types';

interface HabitCardProps {
  habit: Habit;
  isCompletedToday: boolean;
  onToggle: () => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, isCompletedToday, onToggle }) => {
  const accentColor = habit.color || '#3B82F6';

  return (
    <Card className="mb-3 flex-row items-center">
      {/* Icon */}
      <View
        className="w-10 h-10 rounded-full justify-center items-center mr-3"
        style={{ backgroundColor: `${accentColor}20` }}
      >
        <Text className="text-xl">{habit.icon || '📋'}</Text>
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
          {habit.name}
        </Text>
        {habit.description && (
          <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>
            {habit.description}
          </Text>
        )}
      </View>

      {/* Checkbox */}
      <HabitCheckbox
        checked={isCompletedToday}
        onToggle={onToggle}
        disabled={false}
        loading={false}
      />
    </Card>
  );
};

export default HabitCard;
