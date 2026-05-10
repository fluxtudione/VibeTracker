import React from 'react';
import { FlatList, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import HabitCard from './HabitCard';
import { useToggleHabit } from '../../features/habits/hooks/useToggleHabit';
import type { Habit } from '../../types/habit.types';

interface HabitListProps {
  habits: Habit[];
  completedIds: string[];
  loading?: boolean;
  onAddPress?: () => void;
  onLongPressHabit?: (habit: Habit) => void;
}

const SkeletonCard = () => (
  <View className="bg-white rounded-xl p-4 mb-3 flex-row items-center">
    <View className="w-10 h-10 rounded-full bg-gray-200 mr-3" />
    <View className="flex-1">
      <View className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <View className="h-3 bg-gray-200 rounded w-1/2" />
    </View>
    <View className="w-6 h-6 rounded-full bg-gray-200" />
  </View>
);

const EmptyState = ({ onAddPress }: { onAddPress?: () => void }) => (
  <View className="flex-1 justify-center items-center py-20">
    <Text className="text-6xl mb-4">🎯</Text>
    <Text className="text-lg font-semibold text-gray-900 mb-2">
      No habits yet
    </Text>
    <Text className="text-sm text-gray-500 text-center px-8 mb-6">
      Start building better habits today. Track your progress and achieve your goals.
    </Text>
    {onAddPress && (
      <TouchableOpacity
        onPress={onAddPress}
        className="bg-blue-500 px-6 py-3 rounded-full"
      >
        <Text className="text-white font-semibold">Add First Habit</Text>
      </TouchableOpacity>
    )}
  </View>
);

const HabitList: React.FC<HabitListProps> = ({
  habits,
  completedIds,
  loading = false,
  onAddPress,
  onLongPressHabit,
}) => {
  const { toggle, isToggling } = useToggleHabit();

  if (loading) {
    return (
      <View className="flex-1 px-4 pt-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </View>
    );
  }

  if (habits.length === 0) {
    return <EmptyState onAddPress={onAddPress} />;
  }

  return (
    <FlatList
      data={habits}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <HabitCard
          habit={item}
          isCompletedToday={completedIds.includes(item.id)}
          onToggle={() => toggle(item.id)}
          isToggling={isToggling(item.id)}
          onLongPress={onLongPressHabit ? () => onLongPressHabit(item) : undefined}
        />
      )}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default HabitList;
