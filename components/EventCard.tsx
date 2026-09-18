import React, { useRef, useState } from 'react';
import { Alert, Animated, Linking, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CalendarEvent, formatEventTime } from '../utils/calendarUtils';
import useTheme from '../utils/useTheme';
import { cancelEventReminder, isReminderSet, scheduleEventReminder } from '../utils/eventNotifications';

export default function EventCard({ event, animationDelay }: { event: CalendarEvent; animationDelay: number }) {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [expanded, setExpanded] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);
  const [busy, setBusy] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  React.useEffect(() => {
    isReminderSet(event.id).then(setReminderSet);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 320, delay: animationDelay, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, delay: animationDelay, useNativeDriver: true }),
    ]).start();
  }, [animationDelay, event.id, opacity, translateY]);

  const month = event.startDate.toLocaleDateString('en-US', { month: 'short', timeZone: 'America/New_York' }).toUpperCase();
  const day = event.startDate.toLocaleDateString('en-US', { day: 'numeric', timeZone: 'America/New_York' });
  const time = formatEventTime(event.startDate, event.endDate, event.isAllDay);

  const toggleReminder = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (reminderSet) {
        await cancelEventReminder(event.id);
        setReminderSet(false);
      } else {
        const scheduled = await scheduleEventReminder(event);
        if (scheduled) setReminderSet(true);
        else Alert.alert('Reminder unavailable', 'Enable notifications and make sure the event has not started.');
      }
    } finally { setBusy(false); }
  };

  return (
    <Animated.View style={[styles.card, { opacity, transform: [{ translateY }] }]}>
      <TouchableOpacity style={styles.top} activeOpacity={0.85} onPress={() => setExpanded((value) => !value)}>
        <View style={styles.date}>
          <View style={styles.monthBar}><Text style={styles.month}>{month}</Text></View>
          <Text style={styles.day}>{day}</Text>
        </View>
        <View style={styles.main}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.time}>{time}</Text>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={17} color="#777B7D" />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.details}>
          {event.location && <Info icon="location" text={event.location} styles={styles} />}
          {event.description && <Info icon="information-circle-outline" text={event.description} styles={styles} />}
          {event.url && (
            <TouchableOpacity style={styles.link} onPress={() => Linking.openURL(event.url!).catch(() => undefined)}>
              <Text style={styles.linkText}>View event details</Text><Ionicons name="arrow-forward" size={15} color="#8D102B" />
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.reminder}>
        <View style={styles.reminderLabel}><Ionicons name="notifications-outline" size={16} color="#777B7D" /><Text style={styles.reminderText}>Notify me</Text></View>
        <Switch value={reminderSet} onValueChange={toggleReminder} disabled={busy} trackColor={{ false: '#DDDDDB', true: '#C99AA5' }} thumbColor={reminderSet ? '#8D102B' : '#FFFFFF'} />
      </View>
    </Animated.View>
  );
}

function Info({ icon, text, styles }: { icon: keyof typeof Ionicons.glyphMap; text: string; styles: ReturnType<typeof createStyles> }) {
  return <View style={styles.info}><Ionicons name={icon} size={17} color="#8D102B" /><Text style={styles.infoText}>{text}</Text></View>;
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors'], isDark: boolean) => StyleSheet.create({
  card: { marginHorizontal: 18, marginBottom: 14, backgroundColor: colors.surface, borderRadius: 15, padding: 12, shadowColor: '#4B392C', shadowOpacity: 0.09, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  date: { width: 55, height: 61, borderRadius: 10, backgroundColor: isDark ? '#161C31' : '#F2F2F0', overflow: 'hidden', alignItems: 'center', borderWidth: isDark ? 1 : 0, borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'transparent' },
  monthBar: { width: '100%', backgroundColor: '#8D102B', paddingVertical: 4, alignItems: 'center' },
  month: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
  day: { color: colors.textPrimary, fontSize: 25, lineHeight: 38, fontWeight: '900' },
  main: { flex: 1, minWidth: 0 },
  title: { color: colors.textPrimary, fontSize: 14, fontWeight: '900', lineHeight: 18 },
  time: { color: colors.textSecondary, fontSize: 10, marginTop: 4 },
  details: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#EEE8DD', gap: 9 },
  info: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  infoText: { flex: 1, color: colors.textSecondary, fontSize: 11, lineHeight: 16 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  linkText: { color: '#8D102B', fontSize: 11, fontWeight: '800' },
  reminder: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 11, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#EEE8DD' },
  reminderLabel: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  reminderText: { color: colors.textPrimary, fontSize: 11, fontWeight: '600' },
});
