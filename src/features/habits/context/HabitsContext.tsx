import React, { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { HabitWithLogs } from '../../../types/habit.types';
import type { HabitsState, HabitsContextType } from '../types';
import { getHabits, subscribeToHabits, unsubscribeFromHabits } from '../../../services/supabase/habits.service';
import { useAuth } from '../../auth';

// Initial habits state
const initialState: HabitsState = {
  habits: [],
  completedTodayIds: new Set<string>(),
  loading: true,
  error: null,
};

// Create context with default values
export const HabitsContext = createContext<HabitsContextType>({
  ...initialState,
  refetch: async () => {},
});

// HabitsProvider props
interface HabitsProviderProps {
  children: ReactNode;
}

// Helper function to extract completed habit IDs from habits
function getCompletedTodayIds(habits: HabitWithLogs[]): Set<string> {
  const completedIds = new Set<string>();
  habits.forEach((habit) => {
    if (habit.isCompletedToday) {
      completedIds.add(habit.id);
    }
  });
  return completedIds;
}

// HabitsProvider component
export function HabitsProvider({ children }: HabitsProviderProps) {
  const [state, setState] = useState<HabitsState>(initialState);
  const { user } = useAuth();
  const userId = user?.id;

  // Fetch habits function
  const fetchHabits = useCallback(async () => {
    if (!userId) {
      setState((prev) => ({ ...prev, loading: false, habits: [], completedTodayIds: new Set() }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const result = await getHabits(userId);

      if (result.success && result.data) {
        const completedIds = getCompletedTodayIds(result.data);
        setState({
          habits: result.data,
          completedTodayIds: completedIds,
          loading: false,
          error: null,
        });
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: result.error || 'Failed to fetch habits',
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      }));
    }
  }, [userId]);

  // Refetch function exposed to consumers
  const refetch = useCallback(async () => {
    await fetchHabits();
  }, [fetchHabits]);

  // Set up realtime subscription
  useEffect(() => {
    if (!userId) return;

    let channel: RealtimeChannel | null = null;

    // Initial fetch
    fetchHabits();

    // Set up realtime subscription for habits table
    channel = subscribeToHabits(userId, (payload) => {
      const { eventType, new: newHabit, old: oldHabit } = payload;

      setState((prev) => {
        let updatedHabits = [...prev.habits];

        switch (eventType) {
          case 'INSERT':
            // Add new habit to the list (not completed yet)
            if (newHabit && newHabit.id) {
              const habitWithLogs: HabitWithLogs = {
                ...newHabit,
                logs: [],
                isCompletedToday: false,
              };
              updatedHabits = [habitWithLogs, ...updatedHabits];
            }
            break;

          case 'UPDATE':
            // Update existing habit in the list
            if (newHabit && newHabit.id) {
              updatedHabits = updatedHabits.map((habit) =>
                habit.id === newHabit.id
                  ? { ...habit, ...newHabit, isCompletedToday: habit.isCompletedToday }
                  : habit
              );
            }
            break;

          case 'DELETE':
            // Remove deleted habit from the list
            if (oldHabit && oldHabit.id) {
              updatedHabits = updatedHabits.filter((habit) => habit.id !== oldHabit.id);
            }
            break;
        }

        return {
          ...prev,
          habits: updatedHabits,
          completedTodayIds: getCompletedTodayIds(updatedHabits),
        };
      });
    });

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        unsubscribeFromHabits(channel);
      }
    };
  }, [userId, fetchHabits]);

  // Context value
  const value: HabitsContextType = {
    habits: state.habits,
    completedTodayIds: state.completedTodayIds,
    loading: state.loading,
    error: state.error,
    refetch,
  };

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}
