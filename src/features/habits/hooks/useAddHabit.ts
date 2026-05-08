import { useState } from 'react';
import { createHabit } from '../../../services/supabase/habits.service';
import type { NewHabit } from '../../../types/habit.types';

interface UseAddHabitReturn {
  loading: boolean;
  error: string | null;
  addHabit: (data: NewHabit) => Promise<boolean>;
}

/**
 * Custom hook for adding a new habit
 * @returns loading state, error state, and addHabit function
 */
export function useAddHabit(): UseAddHabitReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Add a new habit
   * @param data - The habit data to insert
   * @returns Promise<boolean> - true if successful, false if failed
   */
  async function addHabit(data: NewHabit): Promise<boolean> {
    setLoading(true);
    setError(null);

    try {
      const result = await createHabit(data);

      if (!result.success) {
        setError(result.error || 'Failed to create habit');
        return false;
      }

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    addHabit,
  };
}
