import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const REMINDER_KEY = '@aado/reading-reminder';
const CHANNEL_ID = 'reading-reminders';

type ReadingReminder = {
  hour: number;
  notificationId: string;
};

async function getNotifications() {
  if (Platform.OS === 'web') return null;
  return import('expo-notifications');
}

export async function initializeReadingReminders(): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Reading reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function loadReadingReminderHour(): Promise<number | null> {
  const raw = await AsyncStorage.getItem(REMINDER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ReadingReminder>;
    return typeof parsed.hour === 'number' ? parsed.hour : null;
  } catch {
    return null;
  }
}

export async function setReadingReminder(hour: number | null): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) throw new Error('Reading reminders are available in the iOS and Android apps.');

  await initializeReadingReminders();
  if (hour != null) {
    const permissions = await Notifications.getPermissionsAsync();
    const finalPermissions = permissions.granted
      ? permissions
      : await Notifications.requestPermissionsAsync();
    if (!finalPermissions.granted) {
      throw new Error('Notification permission was not granted. You can enable it in device settings.');
    }
  }

  const existingRaw = await AsyncStorage.getItem(REMINDER_KEY);
  if (existingRaw) {
    try {
      const existing = JSON.parse(existingRaw) as Partial<ReadingReminder>;
      if (typeof existing.notificationId === 'string') {
        await Notifications.cancelScheduledNotificationAsync(existing.notificationId);
      }
    } catch {
      // A malformed local setting should not prevent a new reminder.
    }
  }

  if (hour == null) {
    await AsyncStorage.removeItem(REMINDER_KEY);
    return;
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time for a quiet reading moment',
      body: 'Open Aado and continue where you left off.',
      data: { kind: 'aado-reading-reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute: 0,
      channelId: CHANNEL_ID,
    },
  });
  await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify({ hour, notificationId }));
}
