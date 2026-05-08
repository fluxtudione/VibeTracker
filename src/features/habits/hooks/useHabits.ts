import { useContext } from 'react';
import { HabitsContext } from '../context/HabitsContext';

// Custom hook to use habits context
export function useHabits() {
  const context = useContext(HabitsContext);

  if (!context) {
    throw new Error('useHabits must be used within a HabitsProvider. Wrap your component with <HabitsProvider>');
  }

  return context;
}
