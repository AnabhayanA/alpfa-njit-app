import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CalendarEvent, formatEventTime } from '../utils/calendarUtils';
import useResponsive from '../utils/responsive';
import useTheme from '../utils/useTheme';
import { ThemePalette } from '../constants/theme';
import {
  cancelEventReminder,
  isReminderSet,
  REMINDER_MINUTES_BEFORE,
  scheduleEventReminder,
} from '../utils/eventNotifications';

interface EventCardProps {
  event: CalendarEvent;
  animationDelay: number;
}

export default function EventCard({ event, animationDelay }: EventCardProps) {
  const responsive = useResponsive();
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);
  const [reminderBusy, setReminderBusy] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const entranceScale = useRef(new Animated.Value(0.95)).current;
  const entranceOpacity = useRef(new Animated.Value(0)).current;
  const entranceTranslateY = useRef(new Animated.Value(20)).current;

  // Check whether a reminder is already scheduled for this event
  React.useEffect(() => {
    isReminderSet(event.id).then(setReminderSet);
  }, [event.id]);

  const handleToggleReminder = async () => {
    if (reminderBusy) return;
    setReminderBusy(true);
    try {
      if (reminderSet) {
        await cancelEventReminder(event.id);
        setReminderSet(false);
      } else {
        const scheduled = await scheduleEventReminder(event);
        if (scheduled) {
          setReminderSet(true);
        } else {
          Alert.alert(
            'Unable to Set Reminder',
            'Enable notifications for this app, or check that the event has not already started.'
          );
        }
      }
    } catch (error) {
      console.warn('Unable to toggle event reminder:', error);
    } finally {
      setReminderBusy(false);
    }
  };

  // Entrance animation on mount
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(entranceScale, {
        toValue: 1,
        duration: 400,
        delay: animationDelay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(entranceOpacity, {
        toValue: 1,
        duration: 400,
        delay: animationDelay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(entranceTranslateY, {
        toValue: 0,
        duration: 400,
        delay: animationDelay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // 3D Flip animation with proper perspective
  const toggleFlip = () => {
    Animated.timing(flipAnimation, {
      toValue: isFlipped ? 0 : 1,
      duration: 600,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  // Front card rotation: 0° → 90° (disappears)
  const frontRotateY = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '90deg', '90deg'],
  });

  // Front card scale for depth effect
  const frontScale = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.9, 0.9],
  });

  // Front card opacity: fades out as it rotates
  const frontOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.4, 0.5, 1],
    outputRange: [1, 1, 0, 0],
  });

  // Back card rotation: -90° → 0° (appears)
  const backRotateY = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['-90deg', '-90deg', '0deg'],
  });

  // Back card scale for depth effect
  const backScale = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.9, 0.9, 1],
  });

  // Back card opacity: fades in as it rotates
  const backOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 0.6, 1],
    outputRange: [0, 0, 1, 1],
  });

  // Formatted event information
  const dayOfWeek = event.startDate.toLocaleDateString('en-US', {
    weekday: 'short',
    timeZone: 'America/New_York',
  }).toUpperCase();
  const dateNum = event.startDate.getDate();
  const monthShort = event.startDate.toLocaleDateString('en-US', {
    month: 'short',
    timeZone: 'America/New_York',
  }).toUpperCase();

  const fullDate = event.startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/New_York',
  });

  const eventTime = formatEventTime(event.startDate, event.endDate, event.isAllDay);

  const handleEventLink = async () => {
    if (event.url) {
      try {
        const canOpen = await Linking.canOpenURL(event.url);
        if (canOpen) {
          await Linking.openURL(event.url);
        }
      } catch (error) {
        console.warn('Unable to open event link:', error);
      }
    }
  };

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          marginBottom: responsive.responsiveSpacing.lg,
        },
        {
          opacity: entranceOpacity,
          transform: [
            { scale: entranceScale },
            { translateY: entranceTranslateY },
          ],
        },
      ]}
    >
      <TouchableOpacity onPress={toggleFlip} activeOpacity={0.95}>
        <View style={[
          styles.card3D,
          {
            width: responsive.cardWidth,
          },
        ]}>
          {/* FRONT CARD - WHITE */}
          <Animated.View
            style={[
              styles.cardFace,
              styles.cardFront,
              {
                width: responsive.cardWidth,
              },
              {
                opacity: frontOpacity,
                transform: [
                  { perspective: 1000 },
                  { rotateY: frontRotateY },
                  { scale: frontScale },
                ],
              },
            ]}
          >
            {/* Top section */}
            <View style={styles.frontTop}>
              <Text style={styles.branding}>ALPFA NJIT</Text>
            </View>

            {/* Date section */}
            <View style={styles.dateSection}>
              <Text style={styles.dayOfWeek}>{dayOfWeek}</Text>
              <Text style={styles.dateNum}>{dateNum}</Text>
              <Text style={styles.month}>{monthShort}</Text>
            </View>

            {/* Title */}
            <Text style={styles.eventTitle} numberOfLines={2}>
              {event.title}
            </Text>

            {/* Category */}
            {event.description && (
              <Text style={styles.eventCategory}>
                {event.description.split('\n')[0]}
              </Text>
            )}

            {/* Bottom section */}
            <View style={styles.frontBottom}>
              <Text style={styles.tapText}>Tap to view details</Text>
              <Ionicons name="chevron-forward" size={14} color="#6E1B2D" />
            </View>
          </Animated.View>

          {/* BACK CARD - NAVY */}
          <Animated.View
            style={[
              styles.cardFace,
              styles.cardBack,
              {
                width: responsive.cardWidth,
              },
              {
                opacity: backOpacity,
                transform: [
                  { perspective: 1000 },
                  { rotateY: backRotateY },
                  { scale: backScale },
                ],
              },
            ]}
          >
            {/* Top section */}
            <View style={styles.backTop}>
              <Text style={styles.backBranding}>ALPFA NJIT</Text>
              <Text style={styles.detailsLabel}>EVENT DETAILS</Text>
            </View>

            {/* Details */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Ionicons name="time" size={16} color="#F2D7DF" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>TIME</Text>
                  <Text style={styles.detailValue}>{eventTime}</Text>
                </View>
              </View>

              {event.location && (
                <View style={styles.detailRow}>
                  <Ionicons name="location" size={16} color="#F2D7DF" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>LOCATION</Text>
                    <Text style={styles.detailValue}>{event.location}</Text>
                  </View>
                </View>
              )}

              {event.description && (
                <View style={styles.detailRow}>
                  <Ionicons name="document-text" size={16} color="#F2D7DF" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>ABOUT</Text>
                    <Text style={styles.detailValue}>{event.description}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Bottom section */}
            <View style={styles.backBottom}>
              <TouchableOpacity
                style={[styles.reminderButton, reminderSet && styles.reminderButtonActive]}
                onPress={handleToggleReminder}
                disabled={reminderBusy}
              >
                <Ionicons
                  name={reminderSet ? 'notifications' : 'notifications-outline'}
                  size={14}
                  color={reminderSet ? '#0F102E' : '#F2D7DF'}
                />
                <Text
                  style={[
                    styles.reminderButtonText,
                    reminderSet && styles.reminderButtonTextActive,
                  ]}
                >
                  {reminderSet ? 'Reminder Set' : `Notify Me`}
                </Text>
              </TouchableOpacity>
              {event.url && (
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={handleEventLink}
                >
                  <Text style={styles.linkButtonText}>View Event →</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.flipBack}>Tap to flip back</Text>
            </View>
          </Animated.View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const createStyles = (colors: ThemePalette) => StyleSheet.create({
  cardContainer: {
    marginBottom: 20,
  },
  card3D: {
    height: 260,
    backgroundColor: 'transparent',
  },
  cardFace: {
    position: 'absolute',
    height: 260,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  // FRONT CARD STYLES
  cardFront: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(110, 27, 45, 0.08)',
  },
  frontTop: {
    marginBottom: 16,
  },
  branding: {
    fontSize: 11,
    fontWeight: '900',
    color: '#6E1B2D',
    letterSpacing: 2,
  },
  dateSection: {
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  dayOfWeek: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  dateNum: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.textPrimary,
    marginTop: 2,
  },
  month: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6E1B2D',
    marginTop: 2,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
    lineHeight: 24,
    marginBottom: 8,
  },
  eventCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6E1B2D',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  frontBottom: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tapText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6E1B2D',
  },

  // BACK CARD STYLES
  cardBack: {
    backgroundColor: '#0F102E',
  },
  backTop: {
    marginBottom: 14,
  },
  backBranding: {
    fontSize: 11,
    fontWeight: '900',
    color: '#F2D7DF',
    letterSpacing: 2,
  },
  detailsLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6E1B2D',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  detailsContainer: {
    flex: 1,
    gap: 10,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F2D7DF',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 2,
    lineHeight: 16,
  },
  backBottom: {
    gap: 8,
  },
  reminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(242,215,223,0.4)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  reminderButtonActive: {
    backgroundColor: '#F2D7DF',
    borderColor: '#F2D7DF',
  },
  reminderButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F2D7DF',
  },
  reminderButtonTextActive: {
    color: '#0F102E',
  },
  linkButton: {
    backgroundColor: '#6E1B2D',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  linkButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  flipBack: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
});
