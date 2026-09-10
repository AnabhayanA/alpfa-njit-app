// Calendar utility functions for parsing Google Calendar events

import { Platform } from 'react-native';

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
const CALENDAR_REQUEST_URL = Platform.OS === 'web' ? 'http://localhost:3000/api/calendar' : ICAL_URL;

// Parse iCal format events
function parseICalData(data: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  
  // Split by VEVENT blocks
  const eventBlocks = data.split('BEGIN:VEVENT');
  
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

      const startStr = extractField(block, 'DTSTART');
      const endStr = extractField(block, 'DTEND');

      if (startStr) {
        const parsed = parseICalDateTime(startStr);
        event.startDate = parsed.date;
        event.isAllDay = parsed.isAllDay;
      }

      if (endStr) {
        const parsed = parseICalDateTime(endStr);
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

// Extract field value from iCal data
function extractField(data: string, fieldName: string): string | null {
  const pattern = new RegExp(`${fieldName}[^:]*:([^\r\n]+)`, 'i');
  const match = data.match(pattern);
  return match ? match[1].trim() : null;
}

// Decode iCal text (handle escaped characters)
function decodeICalText(text: string): string {
  return text
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\n/g, '\n')
    .replace(/\\\\/g, '\\');
}

// Parse iCal datetime format (YYYYMMDDTHHMMSSZ or YYYYMMDD)
function parseICalDateTime(dateStr: string): { date: Date; isAllDay: boolean } {
  // Remove timezone info if present
  const cleanStr = dateStr.split(';')[0].split('Z')[0];

  if (cleanStr.length === 8) {
    // All-day event: YYYYMMDD
    const year = parseInt(cleanStr.substring(0, 4), 10);
    const month = parseInt(cleanStr.substring(4, 6), 10) - 1;
    const day = parseInt(cleanStr.substring(6, 8), 10);
    return {
      date: new Date(year, month, day, 0, 0, 0),
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
    return {
      date: new Date(year, month, day, hour, minute, second),
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

// Fetch calendar events
export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  const MAX_RETRIES = 3;
  const TIMEOUT_MS = 10000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Fetching Google Calendar (attempt ${attempt}/${MAX_RETRIES})...`);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(CALENDAR_REQUEST_URL, {
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

      console.log(`Successfully loaded ${events.length} calendar events.`);

      return events;
    } catch (error) {
      console.warn(`Calendar fetch attempt ${attempt} failed:`, error);

      if (attempt === MAX_RETRIES) {
        console.error('All calendar fetch attempts failed.');
        throw error;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new Error('Unable to fetch calendar events.');
}

