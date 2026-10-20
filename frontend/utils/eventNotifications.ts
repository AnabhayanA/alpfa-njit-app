// Local (in-app) notification scheduling for upcoming ALPFA NJIT events

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalendarEvent } from './calendarUtils';
import { explainPermissionSettings } from './permissionSettings';

const STORAGE_KEY = 'alpfa-njit:event-reminders';
export const REMINDER_MINUTES_BEFORE = 30;

// Show alerts even while the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

type ReminderMap = Record<string, string>; // eventId -> scheduled notification identifier

async function getReminderMap(): Promise<ReminderMap> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.warn('Unable to read stored event reminders:', error);
    return {};
  }
}

async function saveReminderMap(map: ReminderMap): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (error) {
    console.warn('Unable to save event reminders:', error);
  }
}

export async function isReminderSet(eventId: string): Promise<boolean> {
  const map = await getReminderMap();
  return Boolean(map[eventId]);
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('event-reminders', {
      name: 'Event Reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') {
    return true;
  }

  const result = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  const granted = result.granted || result.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  if (!granted && !result.canAskAgain) explainPermissionSettings('Notification');
  return granted;
}

// Schedule a reminder to fire shortly before the event starts
export async function scheduleEventReminder(event: CalendarEvent): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const granted = await requestNotificationPermissions();
  if (!granted) {
    return false;
  }

  const triggerDate = new Date(event.startDate.getTime() - REMINDER_MINUTES_BEFORE * 60 * 1000);
  if (triggerDate.getTime() <= Date.now()) {
    return false;
  }

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: `${event.title} starts soon`,
      body: `Starting in ${REMINDER_MINUTES_BEFORE} minutes${event.location ? ` at ${event.location}` : ''}.`,
      data: { eventId: event.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
      ...(Platform.OS === 'android' ? { channelId: 'event-reminders' } : {}),
    },
  });

  const map = await getReminderMap();
  map[event.id] = identifier;
  await saveReminderMap(map);
  return true;
}

export async function cancelEventReminder(eventId: string): Promise<void> {
  const map = await getReminderMap();
  const identifier = map[eventId];
  if (identifier) {
    await Notifications.cancelScheduledNotificationAsync(identifier);
    delete map[eventId];
    await saveReminderMap(map);
  }
}

// Native reminders are managed by the operating system.
export function startEventReminders(): () => void { return () => {}; }
export function subscribeEventReminders(_onChange: () => void): () => void { return () => {}; }
