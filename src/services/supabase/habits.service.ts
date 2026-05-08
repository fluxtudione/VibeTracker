import { supabase } from './client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Habit, HabitWithLogs, NewHabit, HabitLog, NewHabitLog } from '../../types/habit.types';
import { handleSupabaseError } from '../api/errorHandler';

// Type for service response
export interface ServiceResult<T = void> {
  data: T | null;
  error: string | null;
  success: boolean;
}

/**
 * Get all active habits for a user with completion status for a specific date
 * @param userId - The user's UUID
 * @param date - Date string in YYYY-MM-DD format (defaults to today)
 * @returns Promise with habits array including completion status
 */
export async function getHabits(
  userId: string,
  date?: string
): Promise<ServiceResult<HabitWithLogs[]>> {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Fetch habits with left join to habit_logs for the specific date
    const { data, error } = await supabase
      .from('habits')
      .select(`
        *,
        habit_logs!left(*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('habit_logs.date', targetDate);

    if (error) {
      return {
        data: null,
        error: handleSupabaseError(error),
        success: false,
      };
    }

    // Transform data to include isCompletedToday flag
    const habitsWithStatus: HabitWithLogs[] = (data || []).map((item: any) => {
      const habit: Habit = {
        id: item.id,
        user_id: item.user_id,
        name: item.name,
        description: item.description,
        icon: item.icon,
        color: item.color,
        frequency: item.frequency,
        is_active: item.is_active,
        created_at: item.created_at,
        updated_at: item.updated_at,
      };

      // Check if there's a log for today
      const logs = item.habit_logs || [];
      const isCompletedToday = logs.some(
        (log: any) => log.date === targetDate
      );

      return {
        ...habit,
        logs: logs as HabitLog[],
        isCompletedToday,
      };
    });

    return {
      data: habitsWithStatus,
      error: null,
      success: true,
    };
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error),
      success: false,
    };
  }
}

/**
 * Create a new habit for the user
 * @param habitData - The habit data to insert
 * @returns Promise with the created habit
 */
export async function createHabit(
  habitData: NewHabit
): Promise<ServiceResult<Habit>> {
  try {
    const { data, error } = await supabase
      .from('habits')
      .insert(habitData)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: handleSupabaseError(error),
        success: false,
      };
    }

    if (!data) {
      return {
        data: null,
        error: 'No data returned after creating habit',
        success: false,
      };
    }

    return {
      data: data as Habit,
      error: null,
      success: true,
    };
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error),
      success: false,
    };
  }
}

/**
 * Toggle habit completion for a specific date
 * If already completed today -> delete the log (uncomplete)
 * If not completed today -> insert a new log (complete)
 * @param habitId - The habit UUID
 * @param userId - The user's UUID
 * @param date - Date string in YYYY-MM-DD format (defaults to today)
 * @returns Promise with the new completion status
 */
export async function toggleHabitCompletion(
  habitId: string,
  userId: string,
  date?: string
): Promise<ServiceResult<{ completed: boolean; log?: HabitLog }>> {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Check if there's already a log for this habit on this date
    const { data: existingLog, error: fetchError } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('habit_id', habitId)
      .eq('user_id', userId)
      .eq('date', targetDate)
      .maybeSingle();

    if (fetchError) {
      return {
        data: null,
        error: handleSupabaseError(fetchError),
        success: false,
      };
    }

    // If log exists, delete it (uncomplete)
    if (existingLog) {
      const { error: deleteError } = await supabase
        .from('habit_logs')
        .delete()
        .eq('id', existingLog.id);

      if (deleteError) {
        return {
          data: null,
          error: handleSupabaseError(deleteError),
          success: false,
        };
      }

      return {
        data: { completed: false },
        error: null,
        success: true,
      };
    }

    // If no log exists, create one (complete)
    const newLog: NewHabitLog = {
      habit_id: habitId,
      user_id: userId,
      date: targetDate,
      completed_at: new Date().toISOString(),
    };

    const { data: insertedLog, error: insertError } = await supabase
      .from('habit_logs')
      .insert(newLog)
      .select()
      .single();

    if (insertError) {
      return {
        data: null,
        error: handleSupabaseError(insertError),
        success: false,
      };
    }

    return {
      data: { completed: true, log: insertedLog as HabitLog },
      error: null,
      success: true,
    };
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error),
      success: false,
    };
  }
}

/**
 * Delete a habit (soft delete by setting is_active to false or hard delete)
 * This implementation uses hard delete which will cascade delete habit_logs
 * @param habitId - The habit UUID to delete
 * @returns Promise with success status
 */
export async function deleteHabit(
  habitId: string
): Promise<ServiceResult<void>> {
  try {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitId);

    if (error) {
      return {
        data: null,
        error: handleSupabaseError(error),
        success: false,
      };
    }

    return {
      data: null,
      error: null,
      success: true,
    };
  } catch (error) {
    return {
      data: null,
      error: handleSupabaseError(error),
      success: false,
    };
  }
}

/**
 * Subscribe to real-time changes on habits table for a specific user
 * @param userId - The user's UUID
 * @param callback - Callback function to handle real-time updates
 * @returns RealtimeChannel that can be used to unsubscribe
 */
export function subscribeToHabits(
  userId: string,
  callback: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new: Habit;
    old: Habit;
  }) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`habits:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'habits',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const eventType = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE';
        callback({
          eventType,
          new: (payload.new as Habit) || {} as Habit,
          old: (payload.old as Habit) || {} as Habit,
        });
      }
    )
    .subscribe();

  return channel;
}

/**
 * Unsubscribe from a real-time channel
 * @param channel - The RealtimeChannel to unsubscribe from
 */
export function unsubscribeFromHabits(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}

