import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EventCard from '../components/EventCard';
import {
  fetchCalendarEvents,
  groupEventsByMonth,
  getMonthDisplayName,
  CalendarEvent,
  GroupedEvents,
} from '../utils/calendarUtils';

async function openLink(url: string) {
  try {
    const canOpen = await Linking.canOpenURL(url).catch(() => false);
    if (canOpen || url.startsWith('http')) {
      await Linking.openURL(url);
      return;
    }
    await Linking.openURL(url);
  } catch (error) {
    console.warn('Unable to open link:', url, error);
  }
}

export default function EventsScreen() {
  const [events, setEvents] = useState<GroupedEvents>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerSlideY = useRef(new Animated.Value(-20)).current;

  // Load events on mount
  useEffect(() => {
    loadEvents();

    // Animate header on mount
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(headerSlideY, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const calendarEvents = await fetchCalendarEvents();
      const grouped = groupEventsByMonth(calendarEvents);
      setEvents(grouped);
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Unable to load events. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const calendarEvents = await fetchCalendarEvents();
      const grouped = groupEventsByMonth(calendarEvents);
      setEvents(grouped);
      setError(null);
    } catch (err) {
      console.error('Error refreshing events:', err);
      setError('Unable to refresh events. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  // Get sorted month keys
  const monthKeys = Object.keys(events).sort();
  const hasEvents = monthKeys.length > 0;

  // Count total events
  const totalEvents = Object.values(events).flat().length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#6E1B2D" />
        }
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerOpacity,
              transform: [{ translateY: headerSlideY }],
            },
          ]}
        >
          <View>
            <Text style={styles.eyebrow}>ALPFA NJIT</Text>
            <Text style={styles.title}>Upcoming Events</Text>
            <Text style={styles.subtitle}>Connect. Learn. Lead.</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="calendar" size={26} color="#FFFFFF" />
          </View>
        </Animated.View>

        {/* Loading State */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#6E1B2D" />
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        ) : error ? (
          /* Error State */
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#6E1B2D" />
            <Text style={styles.errorTitle}>Unable to Load Events</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadEvents}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : hasEvents ? (
          /* Events List */
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {totalEvents} Upcoming {totalEvents === 1 ? 'Event' : 'Events'}
              </Text>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>

            {monthKeys.map((monthKey, monthIndex) => (
              <View key={monthKey}>
                <Text style={styles.monthHeader}>
                  {getMonthDisplayName(monthKey)}
                </Text>

                {events[monthKey].map((event, eventIndex) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    animationDelay={300 + monthIndex * 50 + eventIndex * 100}
                  />
                ))}
              </View>
            ))}

            {/* Contact Card */}
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.contactCard}
              onPress={() => openLink('mailto:alpfanjit@gmail.com')}
            >
              <Ionicons name="mail-outline" size={25} color="#FFFFFF" />
              <View style={styles.contactContent}>
                <Text style={styles.contactTitle}>Questions About Events?</Text>
                <Text style={styles.contactEmail}>alpfanjit@gmail.com</Text>
              </View>
            </TouchableOpacity>
          </>
        ) : (
          /* Empty State */
          <View style={styles.centerContainer}>
            <Ionicons name="calendar-outline" size={64} color="#6E1B2D" />
            <Text style={styles.emptyTitle}>No Upcoming Events</Text>
            <Text style={styles.emptyText}>Check back soon for new ALPFA NJIT events!</Text>
            <TouchableOpacity style={styles.contactCard2} onPress={() => openLink('mailto:alpfanjit@gmail.com')}>
              <Text style={styles.contactLink}>Contact Us</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F6F8' },
  content: { paddingBottom: 35 },
  
  // Header
  header: {
    backgroundColor: '#0F102E',
    paddingHorizontal: 21,
    paddingTop: 28,
    paddingBottom: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    marginTop: 3,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 11,
    marginTop: 5,
  },
  headerIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: '#6E1B2D',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section Header
  sectionHeader: {
    marginHorizontal: 18,
    marginTop: 25,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#17182F',
    fontSize: 20,
    fontWeight: '900',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF7EE',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: '#3AC57D',
    marginRight: 6,
  },
  liveText: {
    color: '#1A8A52',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  // Month Header
  monthHeader: {
    marginHorizontal: 18,
    marginTop: 28,
    marginBottom: 14,
    fontSize: 18,
    fontWeight: '900',
    color: '#0F102E',
  },

  // Loading/Error/Empty States
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 80,
    minHeight: 400,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#586078',
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '900',
    color: '#0F102E',
  },
  errorText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '500',
    color: '#586078',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#6E1B2D',
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '900',
    color: '#0F102E',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '500',
    color: '#586078',
    textAlign: 'center',
  },

  // Contact Cards
  contactCard: {
    marginHorizontal: 18,
    marginTop: 28,
    backgroundColor: '#0F102E',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactContent: {
    flex: 1,
    marginLeft: 14,
  },
  contactTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  contactEmail: {
    color: '#F2D7DF',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 4,
  },

  // Empty state contact card
  contactCard2: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#6E1B2D',
    borderRadius: 10,
  },
  contactLink: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});