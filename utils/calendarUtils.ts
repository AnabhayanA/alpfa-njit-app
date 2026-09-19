// Calendar utility functions for parsing Google Calendar events

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  url?: string;
  isAllDay: boolean;
}

export interface GroupedEvents {
  [monthKey: string]: CalendarEvent[];
}

const CALENDAR_ID = 'alpfanjit%40gmail.com';
const ICAL_URL = `https://calendar.google.com/calendar/ical/${CALENDAR_ID}/public/basic.ics`;
// Relative path so it always matches whatever origin/port is serving the page
// (the dev proxy in scripts/web-proxy.mjs handles it under that same origin).
// Google's calendar host doesn't send CORS headers, so a direct browser fetch
// to ICAL_URL would fail; on native there's no CORS restriction so we can
// fetch it directly.
const WEB_CALENDAR_PROXY_PATH = 'http://localhost:3000/api/calendar';

// Candidate URLs to try in order for the current platform.
function getCandidateUrls(): string[] {
  if (Platform.OS === 'web') {
    return [WEB_CALENDAR_PROXY_PATH, ICAL_URL];
  }
  return [ICAL_URL];
}

// Parse iCal format events
function parseICalData(data: string): CalendarEvent[] {
  // Un-fold lines per the iCal spec: a line break followed by a space/tab is a
  // continuation of the previous line, not a new field.
  const unfolded = data.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '');
  const events: CalendarEvent[] = [];

  // Split by VEVENT blocks
  const eventBlocks = unfolded.split('BEGIN:VEVENT');

  for (let i = 1; i < eventBlocks.length; i++) {
    const block = 'BEGIN:VEVENT' + eventBlocks[i];

    try {
      const event: Partial<CalendarEvent> = {
        id: extractField(block, 'UID') || `event-${i}`,
        title: decodeICalText(extractField(block, 'SUMMARY') || 'Untitled Event'),
        description: decodeICalText(extractField(block, 'DESCRIPTION') || ''),
        location: decodeICalText(extractField(block, 'LOCATION') || ''),
        url: extractField(block, 'URL') || undefined,
      };

      const start = extractDateField(block, 'DTSTART');
      const end = extractDateField(block, 'DTEND');

      if (start) {
        const parsed = parseICalDateTime(start.value, start.tzid);
        event.startDate = parsed.date;
        event.isAllDay = parsed.isAllDay;
      }

      if (end) {
        const parsed = parseICalDateTime(end.value, end.tzid);
        event.endDate = parsed.date;
      }

      if (event.startDate) {
        events.push(event as CalendarEvent);
      }
    } catch (error) {
      console.warn('Error parsing event block:', error);
    }
  }

  return events;
}

// Extract field value from iCal data. Anchored to the start of a line so we
// never accidentally match a field name that appears inside another field's
// value (e.g. the word "LOCATION" inside a DESCRIPTION).
function extractField(data: string, fieldName: string): string | null {
  const pattern = new RegExp(`(?:^|\\r?\\n)${fieldName}(?:;[^:\\r\\n]*)?:([^\\r\\n]+)`, 'i');
  const match = data.match(pattern);
  return match ? match[1].trim() : null;
}

// Same as extractField, but also captures the TZID parameter (if any) for
// date/time fields, since DTSTART/DTEND can be given in a named timezone
// instead of UTC (e.g. "DTSTART;TZID=America/New_York:20240115T130000").
function extractDateField(data: string, fieldName: string): { value: string; tzid?: string } | null {
  const pattern = new RegExp(`(?:^|\\r?\\n)${fieldName}(;[^:\\r\\n]*)?:([^\\r\\n]+)`, 'i');
  const match = data.match(pattern);
  if (!match) return null;
  const params = match[1] || '';
  const tzidMatch = params.match(/TZID=([^;]+)/i);
  return { value: match[2].trim(), tzid: tzidMatch ? tzidMatch[1] : undefined };
}

// Decode iCal text (handle escaped characters)
function decodeICalText(text: string): string {
  return text
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\n/g, '\n')
    .replace(/\\\\/g, '\\');
}

// Converts wall-clock components in a named IANA timezone to the correct
// UTC instant, accounting for that zone's offset (and DST) on that date.
// Avoids pulling in a timezone library for what's otherwise a small lookup.
function zonedTimeToUtc(year: number, month: number, day: number, hour: number, minute: number, second: number, timeZone: string): Date {
  const asUTC = Date.UTC(year, month, day, hour, minute, second);

  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    // Unknown/invalid timezone name — fall back to treating it as UTC.
    return new Date(asUTC);
  }

  const parts = formatter.formatToParts(new Date(asUTC));
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  // Midnight is sometimes reported as hour 24 by Intl; normalize to 0.
  const hourPart = get('hour') % 24;

  const asIfLocal = Date.UTC(get('year'), get('month') - 1, get('day'), hourPart, get('minute'), get('second'));
  const offset = asIfLocal - asUTC;
  return new Date(asUTC - offset);
}

// Parse iCal datetime format (YYYYMMDDTHHMMSSZ, YYYYMMDDTHHMMSS with TZID, or YYYYMMDD)
function parseICalDateTime(dateStr: string, tzid?: string): { date: Date; isAllDay: boolean } {
  const isUtc = dateStr.endsWith('Z');
  const cleanStr = dateStr.replace('Z', '');

  if (cleanStr.length === 8) {
    // All-day event: YYYYMMDD. Anchored at noon UTC so formatting the date
    // in any reasonable timezone (including America/New_York) still shows
    // the same calendar day.
    const year = parseInt(cleanStr.substring(0, 4), 10);
    const month = parseInt(cleanStr.substring(4, 6), 10) - 1;
    const day = parseInt(cleanStr.substring(6, 8), 10);
    return {
      date: new Date(Date.UTC(year, month, day, 12, 0, 0)),
      isAllDay: true,
    };
  } else if (cleanStr.length >= 15) {
    // DateTime: YYYYMMDDTHHMMSS
    const year = parseInt(cleanStr.substring(0, 4), 10);
    const month = parseInt(cleanStr.substring(4, 6), 10) - 1;
    const day = parseInt(cleanStr.substring(6, 8), 10);
    const hour = parseInt(cleanStr.substring(9, 11), 10);
    const minute = parseInt(cleanStr.substring(11, 13), 10);
    const second = parseInt(cleanStr.substring(13, 15), 10);

    if (isUtc) {
      return { date: new Date(Date.UTC(year, month, day, hour, minute, second)), isAllDay: false };
    }

    // No "Z" suffix: either a named TZID or a "floating" local time. Either
    // way, the ALPFA NJIT calendar's wall-clock times are Eastern, and the
    // app displays everything in America/New_York, so that's the safest
    // default when no TZID is given.
    return {
      date: zonedTimeToUtc(year, month, day, hour, minute, second, tzid || 'America/New_York'),
      isAllDay: false,
    };
  }

  return { date: new Date(), isAllDay: false };
}


// Format date for display in America/New_York timezone
export function formatEventDate(date: Date, isAllDay: boolean): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/New_York',
  };

  const dateStr = date.toLocaleDateString('en-US', options);
  const parts = dateStr.split(' ');

  return `${parts[0].toUpperCase()}\n${parts[2]}\n${parts[0].substring(0, 3).toUpperCase()}`;
}

// Format time for display
export function formatEventTime(startDate: Date, endDate: Date, isAllDay: boolean): string {
  if (isAllDay) {
    return 'All Day';
  }

  try {
    // Format time in 12-hour format with AM/PM
    const startHour = startDate.getHours();
    const startMinute = startDate.getMinutes();
    const endHour = endDate.getHours();
    const endMinute = endDate.getMinutes();

    const formatTime = (hour: number, minute: number): string => {
      let displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const displayMinute = minute.toString().padStart(2, '0');
      const meridiem = hour >= 12 ? 'PM' : 'AM';
      return `${displayHour}:${displayMinute} ${meridiem}`;
    };

    const startTimeStr = formatTime(startHour, startMinute);
    const endTimeStr = formatTime(endHour, endMinute);

    return `${startTimeStr} – ${endTimeStr}`;
  } catch (error) {
    console.warn('Error formatting event time:', error);
    return 'Time TBD';
  }
}

// Get month key for grouping (YYYY-MM)
function getMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

// Get month display name
export function getMonthDisplayName(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'America/New_York' });
}

// Group events by month
export function groupEventsByMonth(events: CalendarEvent[]): GroupedEvents {
  const grouped: GroupedEvents = {};

  // Filter only future events
  const now = new Date();
  const futureEvents = events.filter(event => event.startDate >= now);

  // Sort by start date
  futureEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  // Group by month
  futureEvents.forEach(event => {
    const monthKey = getMonthKey(event.startDate);
    if (!grouped[monthKey]) {
      grouped[monthKey] = [];
    }
    grouped[monthKey].push(event);
  });

  return grouped;
}

// Fetch calendar events, trying each candidate URL (with retries) in order.
export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  const MAX_RETRIES_PER_URL = 2;
  const TIMEOUT_MS = 10000;
  const candidateUrls = getCandidateUrls();

  let lastError: unknown = new Error('Unable to fetch calendar events.');

  for (const url of candidateUrls) {
    for (let attempt = 1; attempt <= MAX_RETRIES_PER_URL; attempt++) {
      try {
        console.log(`Fetching Google Calendar from ${url} (attempt ${attempt}/${MAX_RETRIES_PER_URL})...`);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'text/calendar,text/plain,*/*',
          },
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error(`Calendar request failed: ${response.status}`);
        }

        const text = await response.text();

        if (!text.includes('BEGIN:VCALENDAR')) {
          throw new Error('Invalid calendar response');
        }

        const events = parseICalData(text);
        console.log(`Successfully loaded ${events.length} calendar events from ${url}.`);
        await cacheEvents(events);
        return events;
      } catch (error) {
        lastError = error;
        console.warn(`Calendar fetch from ${url} attempt ${attempt} failed:`, error);
        if (attempt < MAX_RETRIES_PER_URL) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
  }

  console.error('All calendar fetch attempts failed.');
  throw lastError;
}

const EVENTS_CACHE_KEY = 'alpfa-njit:calendar-cache:v1';

interface EventsCache {
  savedAt: string; // ISO timestamp
  events: Array<Omit<CalendarEvent, 'startDate' | 'endDate'> & { startDate: string; endDate: string }>;
}

// Persists the most recently successful fetch so the Events screen has
// something to show if a later fetch fails (e.g. no internet connection).
async function cacheEvents(events: CalendarEvent[]): Promise<void> {
  try {
    const cache: EventsCache = {
      savedAt: new Date().toISOString(),
      events: events.map((event) => ({
        ...event,
        startDate: event.startDate.toISOString(),
        endDate: event.endDate.toISOString(),
      })),
    };
    await AsyncStorage.setItem(EVENTS_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('Unable to cache calendar events:', error);
  }
}

// Reads the last successfully cached events, if any, along with when they
// were saved. Never throws — returns null on any failure.
export async function getCachedEvents(): Promise<{ events: CalendarEvent[]; savedAt: Date } | null> {
  try {
    const raw = await AsyncStorage.getItem(EVENTS_CACHE_KEY);
    if (!raw) return null;

    const cache: EventsCache = JSON.parse(raw);
    const events = cache.events.map((event) => ({
      ...event,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
    }));

    return { events, savedAt: new Date(cache.savedAt) };
  } catch (error) {
    console.warn('Unable to read cached calendar events:', error);
    return null;
  }
}

