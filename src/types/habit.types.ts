import type { Database } from './database.types';

// Types from generated database schema
export type Habit = Database['public']['Tables']['habits']['Row'];
export type HabitLog = Database['public']['Tables']['habit_logs']['Row'];

// Insert types for creating new records
export type NewHabit = Database['public']['Tables']['habits']['Insert'];
export type NewHabitLog = Database['public']['Tables']['habit_logs']['Insert'];

// Update types for updating records
export type UpdateHabit = Database['public']['Tables']['habits']['Update'];

// Payload for toggling habit completion
export interface ToggleHabitPayload {
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
}

// Extended types with computed fields
export interface HabitWithLogs extends Habit {
  logs?: HabitLog[];
  isCompletedToday?: boolean;
}

// Frequency types
export type HabitFrequency = 'daily' | 'weekly' | 'custom';
