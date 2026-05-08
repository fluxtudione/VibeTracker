import type { HabitWithLogs } from '../../types/habit.types';

// Habits state for context
export interface HabitsState {
  habits: HabitWithLogs[];
  completedTodayIds: Set<string>;
  loading: boolean;
  error: string | null;
}

// Habits context type
export interface HabitsContextType {
  habits: HabitWithLogs[];
  completedTodayIds: Set<string>;
  setCompletedTodayIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
