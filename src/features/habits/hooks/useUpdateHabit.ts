import { useState, useCallback } from 'react';
import { updateHabit } from '../../../services/supabase/habits.service';
import type { Habit } from '../../../types/habit.types';

interface UseUpdateHabitReturn {
  updateHabitById: (
    habitId: string,
    updates: Partial<Pick<Habit, 'name' | 'description' | 'icon' | 'color' | 'frequency'>>,
  ) => Promise<boolean>;
  isUpdating: (habitId: string) => boolean;
  error: string | null;
}

export function useUpdateHabit(): UseUpdateHabitReturn {
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const isUpdating = useCallback(
    (habitId: string) => updatingIds.has(habitId),
    [updatingIds],
  );

  const updateHabitById = useCallback(
    async (habitId: string, updates: Partial<Pick<Habit, 'name' | 'description' | 'icon' | 'color' | 'frequency'>>): Promise<boolean> => {
      if (updatingIds.has(habitId)) return false;

      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.add(habitId);
        return next;
      });
      setError(null);

      try {
        const result = await updateHabit(habitId, updates);

        if (!result.success) {
          setError(result.error || 'Failed to update habit');
          return false;
        }

        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(message);
        return false;
      } finally {
        setUpdatingIds((prev) => {
          const next = new Set(prev);
          next.delete(habitId);
          return next;
        });
      }
    },
    [updatingIds],
  );

  return { updateHabitById, isUpdating, error };
}
