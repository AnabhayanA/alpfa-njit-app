import React, { useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CalendarEvent, formatEventTime } from '../utils/calendarUtils';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 36;

interface EventCardProps {
  event: CalendarEvent;
  animationDelay: number;
}

export default function EventCard({ event, animationDelay }: EventCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const entranceScale = useRef(new Animated.Value(0.95)).current;
  const entranceOpacity = useRef(new Animated.Value(0)).current;
  const entranceTranslateY = useRef(new Animated.Value(20)).current;

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
          opacity: entranceOpacity,
          transform: [
            { scale: entranceScale },
            { translateY: entranceTranslateY },
          ],
        },
      ]}
    >
      <TouchableOpacity onPress={toggleFlip} activeOpacity={0.95}>
        <View style={styles.card3D}>
          {/* FRONT CARD - WHITE */}
          <Animated.View
            style={[
              styles.cardFace,
              styles.cardFront,
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

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 18,
    marginBottom: 20,
  },
  card3D: {
    width: CARD_WIDTH,
    height: 260,
    backgroundColor: 'transparent',
  },
  cardFace: {
    position: 'absolute',
    width: CARD_WIDTH,
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
    backgroundColor: '#FFFFFF',
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
    color: '#0F102E',
    letterSpacing: 1,
  },
  dateNum: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F102E',
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
    color: '#0F102E',
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
