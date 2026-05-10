import { useState, useEffect, useCallback } from 'react';
import { getHabitLogsByDateRange } from '../../../services/supabase/habits.service';
import { useAuth } from '../../auth';

export interface WeeklyStats {
  /** Dates in YYYY-MM-DD format for the last 7 days (oldest → newest) */
  days: string[];
  /** Map of date → count of completed habits */
  completionsByDay: Record<string, number>;
  /** Total completions across the week */
  totalCompletions: number;
  /** Average per day */
  averagePerDay: number;
  /** Best day (highest completions) */
  bestDay: { date: string; count: number } | null;
  /** Current streak of consecutive days with at least one completion */
  currentStreak: number;
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function computeStreak(days: string[], completionsByDay: Record<string, number>): number {
  // Walk backwards from today, count consecutive days with ≥ 1 completion
  let streak = 0;
  const reversed = [...days].reverse();
  for (const day of reversed) {
    if ((completionsByDay[day] || 0) > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

interface UseProfileStatsReturn {
  weeklyStats: WeeklyStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProfileStats(): UseProfileStatsReturn {
  const { user } = useAuth();
  const userId = user?.id;
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!userId) {
      setWeeklyStats(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const days = getLast7Days();
      const startDate = days[0];
      const endDate = days[days.length - 1];

      const result = await getHabitLogsByDateRange(userId, startDate, endDate);

      if (!result.success || !result.data) {
        setError(result.error || 'Failed to load stats');
        setLoading(false);
        return;
      }

      // Build completionsByDay map
      const completionsByDay: Record<string, number> = {};
      for (const day of days) {
        completionsByDay[day] = 0;
      }
      for (const log of result.data) {
        if (completionsByDay[log.date] !== undefined) {
          completionsByDay[log.date] = (completionsByDay[log.date] || 0) + 1;
        }
      }

      // Compute total, average, best day, streak
      const totalCompletions = Object.values(completionsByDay).reduce((sum, c) => sum + c, 0);
      const averagePerDay = Math.round((totalCompletions / 7) * 10) / 10;
      let bestDay: { date: string; count: number } | null = null;
      for (const [date, count] of Object.entries(completionsByDay)) {
        if (!bestDay || count > bestDay.count) {
          bestDay = { date, count };
        }
      }
      const currentStreak = computeStreak(days, completionsByDay);

      setWeeklyStats({ days, completionsByDay, totalCompletions, averagePerDay, bestDay, currentStreak });
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refetch = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  return { weeklyStats, loading, error, refetch };
}
