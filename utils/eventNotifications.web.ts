import type { CalendarEvent } from './calendarUtils';

export const REMINDER_MINUTES_BEFORE = 30;
const STORAGE_KEY = 'alpfa-njit:web-event-reminders';
const CHANGE_EVENT = 'alpfa-reminders-changed';
type Reminder = { id: string; title: string; location: string; startsAt: number; remindAt: number };

function readReminders(): Reminder[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((r): r is Reminder =>
      r && typeof r.id === 'string' && typeof r.title === 'string' &&
      typeof r.location === 'string' && Number.isFinite(r.startsAt) && Number.isFinite(r.remindAt)) : [];
  } catch { return []; }
}

function writeReminders(reminders: Reminder[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeEventReminders(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

export async function isReminderSet(eventId: string): Promise<boolean> {
  return readReminders().some(r => r.id === eventId && r.startsAt > Date.now());
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!window.isSecureContext || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  return (await Notification.requestPermission()) === 'granted';
}

export async function scheduleEventReminder(event: CalendarEvent): Promise<boolean> {
  const startsAt = event.startDate.getTime();
  if (!Number.isFinite(startsAt) || startsAt <= Date.now()) {
    throw new Error('This event has already started or has an invalid start time.');
  }
  // Request directly from the click handler, before any storage or timer work.
  // In-page reminders remain available when system notifications are unsupported or denied.
  await requestNotificationPermissions().catch(() => false);
  if (startsAt <= Date.now()) throw new Error('This event has already started.');
  const reminder: Reminder = {
    id: event.id, title: event.title, location: event.location, startsAt,
    remindAt: Math.max(Date.now(), startsAt - REMINDER_MINUTES_BEFORE * 60_000),
  };
  writeReminders([...readReminders().filter(r => r.id !== event.id), reminder]);
  return true;
}

export async function cancelEventReminder(eventId: string): Promise<void> {
  writeReminders(readReminders().filter(r => r.id !== eventId));
}

function checkReminders() {
  try {
    const now = Date.now();
    const reminders = readReminders();
    const due = reminders.filter(r => r.remindAt <= now && r.startsAt > now);
    const pending = reminders.filter(r => r.remindAt > now && r.startsAt > now);
    if (pending.length === reminders.length) return;
    // Remove delivered/expired reminders before showing a potentially blocking browser alert.
    writeReminders(pending);
    for (const reminder of due) {
      const minutes = Math.max(1, Math.ceil((reminder.startsAt - now) / 60_000));
      const title = `${reminder.title} starts soon`;
      const body = `Starting in ${minutes} minutes${reminder.location ? ` at ${reminder.location}` : ''}.`;
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(title, { body, tag: reminder.id });
          continue;
        } catch { /* Mobile browsers may require a service worker; use the in-page reminder. */ }
      }
      window.alert(`${title}\n\n${body}`);
    }
  } catch (error) { console.warn('Could not check browser reminders:', error); }
}

export function startEventReminders(): () => void {
  checkReminders();
  const timer = window.setInterval(checkReminders, 15_000);
  const onVisible = () => { if (document.visibilityState === 'visible') checkReminders(); };
  document.addEventListener('visibilitychange', onVisible);
  return () => {
    window.clearInterval(timer);
    document.removeEventListener('visibilitychange', onVisible);
  };
}
