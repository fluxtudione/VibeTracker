import { useState, useCallback } from 'react';
import { toggleHabitCompletion } from '../../../services/supabase/habits.service';
import { useAuth } from '../../auth';
import { useHabits } from './useHabits';

interface UseToggleHabitReturn {
  toggle: (habitId: string) => Promise<void>;
  isToggling: (habitId: string) => boolean;
}

export function useToggleHabit(): UseToggleHabitReturn {
  const { user } = useAuth();
  const { completedTodayIds, setCompletedTodayIds } = useHabits();
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  const isToggling = useCallback(
    (habitId: string) => togglingIds.has(habitId),
    [togglingIds]
  );

  const toggle = useCallback(
    async (habitId: string) => {
      // Prevent multiple toggles while in-flight
      if (togglingIds.has(habitId) || !user?.id) return;

      // Mark as toggling
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.add(habitId);
        return next;
      });

      // Store previous state for rollback
      const previousCompletedIds = new Set(completedTodayIds);
      const wasCompleted = completedTodayIds.has(habitId);

      try {
        // Optimistic update: update local state BEFORE API call
        setCompletedTodayIds((prev: Set<string>) => {
          const next = new Set(prev);
          if (wasCompleted) {
            next.delete(habitId);
          } else {
            next.add(habitId);
          }
          return next;
        });

        // Call API
        const result = await toggleHabitCompletion(habitId, user.id);

        if (!result.success) {
          // Rollback on API failure
          setCompletedTodayIds(previousCompletedIds);
          console.error('Failed to toggle habit:', result.error);
          // TODO: Show toast notification for error
          // For now, we'll just log the error
        }
      } catch (error) {
        // Rollback on exception
        setCompletedTodayIds(previousCompletedIds);
        console.error('Error toggling habit:', error);
        // TODO: Show toast notification for error
      } finally {
        // Clear toggling state
        setTogglingIds((prev) => {
          const next = new Set(prev);
          next.delete(habitId);
          return next;
        });
      }
    },
    [user?.id, completedTodayIds, togglingIds, setCompletedTodayIds]
  );

  return { toggle, isToggling };
}
