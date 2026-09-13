import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarEvent, fetchCalendarEvents, getCachedEvents } from '../utils/calendarUtils';

type RootTabParamList = {
  Home: undefined;
  Events: undefined;
  Capture: undefined;
  EBoard: undefined;
  About: undefined;
};

type HomeNavigation = BottomTabNavigationProp<RootTabParamList, 'Home'>;

const LINKS = {
  website: 'https://nonnair.github.io/alpfa-njit/',
  highlander: 'https://njit.campuslabs.com/engage/organization/alpfa',
};

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigation>();
  const insets = useSafeAreaInsets();
  const [nextEvent, setNextEvent] = useState<CalendarEvent | null>(null);
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 520, useNativeDriver: true }),
      Animated.spring(rise, { toValue: 0, speed: 12, bounciness: 4, useNativeDriver: true }),
    ]).start();

    const selectNext = (events: CalendarEvent[]) => {
      const now = Date.now();
      const upcoming = events
        .filter((event) => event.endDate.getTime() >= now)
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
      setNextEvent(upcoming[0] || null);
    };

    getCachedEvents().then((cache) => cache && selectNext(cache.events)).catch(() => undefined);
    fetchCalendarEvents().then(selectNext).catch(() => undefined);
  }, [fade, rise]);

  const open = (url: string) => Linking.openURL(url).catch(() => undefined);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.topRedSlash} />
      <View style={styles.topNavySlash} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 118 }]}
      >
        <Animated.View style={{ opacity: fade, transform: [{ translateY: rise }] }}>
          <View style={styles.brandRow}>
            <Image source={require('../assets/images/ALPFANJITLOGO.png')} style={styles.logo} resizeMode="cover" />
            <View style={styles.brandCopy}>
              <Text style={styles.brandName}>ALPFA NJIT</Text>
              <Text style={styles.brandTag}>Latinos{`\n`}Leaders{`\n`}Stronger Together</Text>
            </View>
            <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('About')} accessibilityLabel="Open About">
              <Ionicons name="person-circle-outline" size={23} color="#081C37" />
            </TouchableOpacity>
          </View>

          <Text style={styles.welcome}>Welcome back,</Text>
          <Text style={styles.familia}>Familia</Text>
          <Text style={styles.motto}>BUILD  •  CONNECT  •  BELONG</Text>

          <TouchableOpacity style={styles.eventCard} activeOpacity={0.9} onPress={() => navigation.navigate('Events')}>
            <View style={styles.eventRedSlash} />
            <View style={styles.eventBurgundySlash} />
            <View style={styles.eventTop}>
              <View style={styles.dateTile}>
                <Text style={styles.month}>{nextEvent ? nextEvent.startDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : 'NEXT'}</Text>
                <Text style={styles.day}>{nextEvent ? nextEvent.startDate.getDate() : '—'}</Text>
                <Text style={styles.hour}>{nextEvent ? nextEvent.startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'EVENT'}</Text>
              </View>
              <View style={styles.nextCopy}>
                <Text style={styles.nextLabel}>NEXT EVENT</Text>
                <View style={styles.goldLine} />
              </View>
              <Text style={styles.cardWords}>PEOPLE{`\n`}PURPOSE{`\n`}PROGRESS</Text>
            </View>

            <Text style={styles.eventTitle} numberOfLines={2}>{nextEvent?.title || 'More ALPFA NJIT events coming soon'}</Text>
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={14} color="#FFFFFF" />
              <Text style={styles.metaText}>{nextEvent ? nextEvent.startDate.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Check the Events page for updates'}</Text>
            </View>
            {!!nextEvent?.location && (
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={14} color="#FFFFFF" />
                <Text style={styles.metaText} numberOfLines={1}>{nextEvent.location}</Text>
              </View>
            )}
            <View style={styles.eventArrow}><Ionicons name="chevron-forward" size={17} color="#FFFFFF" /></View>
          </TouchableOpacity>

          <Text style={styles.quickHeading}>QUICK LINKS</Text>
          <View style={styles.quickGrid}>
            <QuickLink label="Events" icon="calendar" color="#C01C3B" background="#FCE5E9" onPress={() => navigation.navigate('Events')} />
            <QuickLink label="E-Board" icon="people" color="#0794C8" background="#DFF5FC" onPress={() => navigation.navigate('EBoard')} />
            <QuickLink label="About" icon="document-text" color="#C48518" background="#FFF0CB" onPress={() => navigation.navigate('About')} />
            <QuickLink label="Join" icon="person-add" color="#16845B" background="#DCF7EA" onPress={() => open(LINKS.highlander)} />
            <QuickLink label="Share a Photo" icon="camera" color="#7650B5" background="#ECE4FB" onPress={() => navigation.navigate('Capture')} />
            <QuickLink label="Website" icon="open-outline" color="#F06C43" background="#FFE8DF" onPress={() => open(LINKS.website)} />
          </View>

          <View style={styles.bottomMessage}>
            <Text style={styles.bottomHeadline}>MORE LATINOS.{`\n`}BRIGHTER TOMORROWS.</Text>
            <Text style={styles.bottomSub}>ALPFA NJIT</Text>
          </View>
        </Animated.View>
      </ScrollView>

      <View pointerEvents="none" style={styles.bottomNavySlash} />
      <View pointerEvents="none" style={styles.bottomRedSlash} />
    </View>
  );
}

function QuickLink({ label, icon, color, background, onPress }: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  background: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.quickCard} activeOpacity={0.76} onPress={onPress}>
      <View style={[styles.quickIcon, { backgroundColor: background }]}>
        <Ionicons name={icon} size={17} color={color} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={13} color="#89909A" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAF8F4', overflow: 'hidden' },
  content: { paddingHorizontal: 14 },
  brandRow: { flexDirection: 'row', alignItems: 'center', minHeight: 52 },
  logo: { width: 54, height: 54, borderRadius: 10, backgroundColor: '#0F102E' },
  brandCopy: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, marginLeft: 9 },
  brandName: { color: '#081C37', fontSize: 15, fontWeight: '900', letterSpacing: 0.4 },
  brandTag: { color: '#081C37', fontSize: 6, lineHeight: 8, letterSpacing: 0.3 },
  profileButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.75)', alignItems: 'center', justifyContent: 'center' },
  welcome: { color: '#081C37', fontSize: 29, lineHeight: 31, fontWeight: '900', marginTop: 9 },
  familia: { color: '#9D1734', fontSize: 29, lineHeight: 30, fontWeight: '900' },
  motto: { color: '#081C37', fontSize: 7, fontWeight: '800', letterSpacing: 1.6, marginTop: 5 },
  eventCard: { minHeight: 151, marginTop: 10, padding: 12, borderRadius: 16, backgroundColor: '#081C37', overflow: 'hidden', shadowColor: '#081C37', shadowOpacity: 0.24, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
  eventRedSlash: { position: 'absolute', width: 150, height: 52, right: -47, top: -10, backgroundColor: '#B51C35', transform: [{ rotate: '-42deg' }] },
  eventBurgundySlash: { position: 'absolute', width: 150, height: 48, right: -58, bottom: -4, backgroundColor: '#6E1B2D', transform: [{ rotate: '-42deg' }] },
  eventTop: { flexDirection: 'row', alignItems: 'center' },
  dateTile: { width: 57, height: 61, borderRadius: 12, backgroundColor: '#9D1734', alignItems: 'center', justifyContent: 'center' },
  month: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
  day: { color: '#FFFFFF', fontSize: 22, lineHeight: 23, fontWeight: '900' },
  hour: { color: 'rgba(255,255,255,0.8)', fontSize: 7, fontWeight: '700' },
  nextCopy: { flex: 1, paddingLeft: 11, flexDirection: 'row', alignItems: 'center', gap: 8 },
  nextLabel: { color: 'rgba(255,255,255,0.67)', fontSize: 7, fontWeight: '800', letterSpacing: 1.3 },
  goldLine: { height: 1, width: 37, backgroundColor: '#C99731' },
  cardWords: { color: 'rgba(255,255,255,0.55)', fontSize: 6, lineHeight: 9, letterSpacing: 1.2, textAlign: 'right' },
  eventTitle: { color: '#FFFFFF', fontSize: 16, lineHeight: 19, fontWeight: '900', maxWidth: '78%', marginTop: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5, maxWidth: '82%' },
  metaText: { color: 'rgba(255,255,255,0.86)', fontSize: 9, flexShrink: 1 },
  eventArrow: { position: 'absolute', right: 11, bottom: 11, width: 31, height: 31, borderRadius: 16, backgroundColor: '#B51C35', alignItems: 'center', justifyContent: 'center' },
  quickHeading: { color: '#081C37', fontSize: 8, fontWeight: '900', letterSpacing: 1.8, marginTop: 14, marginBottom: 6 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 7 },
  quickCard: { width: '48.8%', minHeight: 42, borderRadius: 13, paddingHorizontal: 9, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', gap: 7, shadowColor: '#081C37', shadowOpacity: 0.06, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  quickIcon: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { color: '#081C37', fontSize: 10, fontWeight: '700', flex: 1 },
  bottomMessage: { marginTop: 22, paddingBottom: 30 },
  bottomHeadline: { color: '#081C37', fontSize: 7, fontWeight: '900', lineHeight: 10, letterSpacing: 1.6 },
  bottomSub: { color: '#9D1734', fontSize: 7, fontWeight: '800', marginTop: 5, letterSpacing: 1.2 },
  topRedSlash: { position: 'absolute', width: 220, height: 40, right: -80, top: 54, backgroundColor: '#B51C35', transform: [{ rotate: '-39deg' }], opacity: 0.96 },
  topNavySlash: { position: 'absolute', width: 190, height: 25, right: -90, top: 85, backgroundColor: '#081C37', transform: [{ rotate: '-39deg' }] },
  bottomNavySlash: { position: 'absolute', width: 240, height: 62, right: -89, bottom: 20, backgroundColor: '#081C37', transform: [{ rotate: '-27deg' }] },
  bottomRedSlash: { position: 'absolute', width: 260, height: 34, left: -130, bottom: 30, backgroundColor: '#9D1734', transform: [{ rotate: '-27deg' }], opacity: 0.95 },
});
