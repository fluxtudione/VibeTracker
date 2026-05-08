import { Tabs } from 'expo-router';
import { HabitsProvider } from '../../src/features/habits';

export default function TabsLayout() {
  return (
    <HabitsProvider>
      <Tabs>
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      </Tabs>
    </HabitsProvider>
  );
}
