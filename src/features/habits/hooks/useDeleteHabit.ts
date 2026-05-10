import { useState, useCallback } from 'react';
import { deleteHabit } from '../../../services/supabase/habits.service';

interface UseDeleteHabitReturn {
  deleteHabitById: (habitId: string) => Promise<boolean>;
  isDeleting: (habitId: string) => boolean;
  error: string | null;
}

export function useDeleteHabit(): UseDeleteHabitReturn {
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const isDeleting = useCallback(
    (habitId: string) => deletingIds.has(habitId),
    [deletingIds],
  );

  const deleteHabitById = useCallback(
    async (habitId: string): Promise<boolean> => {
      if (deletingIds.has(habitId)) return false;

      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.add(habitId);
        return next;
      });
      setError(null);

      try {
        const result = await deleteHabit(habitId);

        if (!result.success) {
          setError(result.error || 'Failed to delete habit');
          return false;
        }

        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(message);
        return false;
      } finally {
        setDeletingIds((prev) => {
          const next = new Set(prev);
          next.delete(habitId);
          return next;
        });
      }
    },
    [deletingIds],
  );

  return { deleteHabitById, isDeleting, error };
}
