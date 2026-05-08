import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from 'expo/vector-icons';
import SafeAreaWrapper from '../../src/components/layout/SafeAreaWrapper';
import HabitList from '../../src/components/habits/HabitList';
import { useHabits } from '../../src/features/habits';
import { useAuth } from '../../src/features/auth';
import type { HabitWithLogs } from '../../src/types/habit.types';

export default function HomeScreen() {
  const router = useRouter();
  const { habits, completedTodayIds, loading, error, refetch } = useHabits();
  const { signOut } = useAuth();

  const handleToggle = (habitId: string) => {
    // Toggle logic will be implemented in Phase 8
    console.log('Toggle habit:', habitId);
  };

  const handleAddPress = () => {
    router.push('/habits/add');
  };

  const handleLogout = async () => {
    await signOut();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getFormattedDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return today.toLocaleDateString('en-US', options);
  };

  return (
    <SafeAreaWrapper>
      {/* Header */}
      <View className="px-4 pt-4 pb-2 flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-gray-900">{getGreeting()}</Text>
          <Text className="text-sm text-gray-500 mt-1">{getFormattedDate()}</Text>
        </View>
        <TouchableOpacity
          onPress={handleLogout}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
        >
          <Ionicons name="log-out-outline" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Error State */}
      {error && (
        <View className="mx-4 my-2 p-3 bg-red-50 rounded-lg">
          <Text className="text-red-600 text-sm">{error}</Text>
          <TouchableOpacity onPress={refetch} className="mt-2">
            <Text className="text-red-600 font-semibold text-sm">Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Habit List */}
      <View className="flex-1">
        <HabitList
          habits={habits as HabitWithLogs[]}
          completedIds={Array.from(completedTodayIds)}
          onToggle={handleToggle}
          loading={loading}
          onAddPress={handleAddPress}
        />
      </View>

      {/* FAB Button */}
      <TouchableOpacity
        onPress={handleAddPress}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-blue-500 items-center justify-center shadow-lg"
        style={styles.fab}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  fab: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
