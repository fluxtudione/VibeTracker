import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import type { Habit } from '../../types/habit.types';

// Android notification channel ID — must match what we register
const ANDROID_CHANNEL_ID = 'habit-reminders';

// Prefix for notification identifiers so we can cancel/update them per habit
const NOTIFICATION_ID_PREFIX = 'habit-reminder-';

/**
 * Build a per-habit notification identifier string.
 */
function notificationId(habitId: string): string {
  return `${NOTIFICATION_ID_PREFIX}${habitId}`;
}

/**
 * Parse a "HH:MM" or "HH:MM:SS" string into hour and minute numbers.
 * Falls back to 8:00 (08:00) if the string is malformed.
 */
function parseTime(timeStr: string): { hour: number; minute: number } {
  // Accept both "HH:MM" and "HH:MM:SS"
  const parts = timeStr.split(':');
  const hour = Math.max(0, Math.min(23, parseInt(parts[0], 10) || 8));
  const minute = Math.max(0, Math.min(59, parseInt(parts[1], 10) || 0));
  return { hour, minute };
}

// ---------------------------------------------------------------------------
// 1. Setup — called once on app start (in root _layout)
// ---------------------------------------------------------------------------

/**
 * Configure how incoming notifications are handled while the app is foregrounded.
 * Call this ONCE in the root _layout.
 */
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Request notification permissions (iOS) and create the Android channel.
 * Returns `true` if permissions are granted (or already granted).
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('[Notifications] Physical device required — skipping permission request');
    return false;
  }

  // Android: create the notification channel first
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Habit Reminders',
      description: 'Daily reminders to complete your habits',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Only ask if we haven't already been granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[Notifications] Permission not granted');
    return false;
  }

  console.log('[Notifications] Permission granted');
  return true;
}

// ---------------------------------------------------------------------------
// 2. Schedule / Cancel per habit
// ---------------------------------------------------------------------------

/**
 * Schedule (or re-schedule) a daily reminder for a specific habit.
 * If `reminder_enabled` is false, this cancels any existing notification.
 *
 * @param habit - Habit object with reminder_enabled & reminder_time fields
 */
export async function scheduleHabitReminder(habit: Habit): Promise<void> {
  const id = notificationId(habit.id);

  // Cancel any existing notification for this habit first
  await Notifications.cancelScheduledNotificationAsync(id);

  // If reminder is disabled or no time set, just cancel and return
  if (!habit.reminder_enabled || !habit.reminder_time) {
    console.log(`[Notifications] Reminder disabled for habit "${habit.name}" — cancelled`);
    return;
  }

  const { hour, minute } = parseTime(habit.reminder_time);

  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: {
      title: `⏰ ${habit.icon || '📌'} ${habit.name}`,
      body: habit.description
        ? `Don't forget: ${habit.description}`
        : `Time to complete your habit!`,
      sound: 'default',
      ...(Platform.OS === 'android'
        ? { channelId: ANDROID_CHANNEL_ID }
        : {}),
    },
    trigger: {
      channelId: Platform.OS === 'android' ? ANDROID_CHANNEL_ID : undefined,
      hour,
      minute,
      repeats: true,
    } as Notifications.DailyTriggerInput,
  });

  console.log(
    `[Notifications] Scheduled daily reminder for "${habit.name}" at ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
  );
}

/**
 * Cancel the scheduled reminder for a given habit ID.
 */
export async function cancelHabitReminder(habitId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId(habitId));
}

/**
 * Schedule reminders for all habits that have reminder_enabled = true.
 * Useful when the app starts or habits are refreshed.
 */
export async function scheduleAllReminders(habits: Habit[]): Promise<void> {
  await Promise.all(habits.map((habit) => scheduleHabitReminder(habit)));
}
