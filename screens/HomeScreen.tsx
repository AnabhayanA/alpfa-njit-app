import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarEvent, fetchCalendarEvents, getCachedEvents } from '../utils/calendarUtils';
import useTheme from '../utils/useTheme';

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
  email: 'mailto:alpfanjit@gmail.com',
};

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigation>();
  const { isDark, colors, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, 560);
  const scale = Math.max(1.06, Math.min(contentWidth / 350, 1.3));
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
    <View style={[styles.screen, { backgroundColor: isDark ? '#070B18' : '#F8F7F4' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View pointerEvents="none" style={styles.backgroundDecor}>
        <View style={[styles.liquidOrb, styles.liquidRed, isDark && styles.liquidRedDark]} />
        <View style={[styles.liquidOrb, styles.liquidBlue, isDark && styles.liquidBlueDark]} />
        <View style={[styles.liquidOrb, styles.liquidPurple, isDark && styles.liquidPurpleDark]} />
        <View style={[styles.liquidOrb, styles.liquidCyan, isDark && styles.liquidCyanDark]} />
      </View>

      <ScrollView
        style={styles.foreground}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical
        bounces
        contentContainerStyle={[
          styles.content,
          {
            width: contentWidth,
            alignSelf: 'center',
            paddingHorizontal: Math.max(12, 14 * scale),
            paddingTop: insets.top + Math.max(5, 8 * scale),
            paddingBottom: insets.bottom + 132,
          },
        ]}
      >
        <Animated.View style={{ opacity: fade, transform: [{ translateY: rise }], zIndex: 2 }}>
          <View style={[styles.brandRow, { minHeight: 52 * scale }]}>
            <Image source={require('../assets/images/ALPFANJITLOGO.png')} style={[styles.logo, { width: 54 * scale, height: 54 * scale, borderRadius: 10 * scale }]} resizeMode="cover" />
            <View style={styles.brandCopy}>
              <Text style={[styles.brandName, { color: colors.textPrimary }]}>ALPFA NJIT</Text>
              <Text style={[styles.brandTag, { color: colors.textSecondary }]}>Latinos{`\n`}Leaders{`\n`}Stronger Together</Text>
            </View>
            <TouchableOpacity
              style={[styles.themeButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.72)' }]}
              onPress={toggleTheme}
              accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color={isDark ? '#FFFFFF' : '#081C37'} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.profileButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.72)' }]} onPress={() => navigation.navigate('About')} accessibilityLabel="Open About">
              <Ionicons name="person-circle-outline" size={23} color={isDark ? '#FFFFFF' : '#081C37'} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.welcome, { color: colors.textPrimary, fontSize: 29 * scale, lineHeight: 31 * scale, marginTop: 12 * scale }]}>Welcome back,</Text>
          <Text style={[styles.familia, { fontSize: 29 * scale, lineHeight: 30 * scale }]}>Familia</Text>
          <Text style={[styles.motto, { color: colors.textSecondary }]}>BUILD  •  CONNECT  •  BELONG</Text>

          <TouchableOpacity style={[styles.eventCard, isDark && styles.eventCardDark, { minHeight: 164 * scale, marginTop: 12 * scale, padding: 14 * scale, borderRadius: 18 * scale }]} activeOpacity={0.9} onPress={() => navigation.navigate('Events')}>
            <View pointerEvents="none" style={styles.eventDecor}>
              <View style={styles.eventLiquidBlue} />
              <View style={styles.eventLiquidRed} />
              <View style={styles.eventRedSlash} />
              <View style={styles.eventBurgundySlash} />
            </View>

            <View style={styles.eventContent}>
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

              <Text style={[styles.eventTitle, { fontSize: 16 * scale, lineHeight: 19 * scale }]} numberOfLines={2}>{nextEvent?.title || 'More ALPFA NJIT events coming soon'}</Text>
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
            </View>
          </TouchableOpacity>

          <Text style={[styles.quickHeading, { color: colors.textPrimary, marginTop: 18 * scale, marginBottom: 9 * scale }]}>QUICK LINKS</Text>
          <View style={[styles.quickGrid, { gap: Math.max(5, 7 * scale) }]}>
            <QuickLink isDark={isDark} scale={scale} label="Events" icon="calendar" color="#C01C3B" background="#FCE5E9" onPress={() => navigation.navigate('Events')} />
            <QuickLink isDark={isDark} scale={scale} label="E-Board" icon="people" color="#0794C8" background="#DFF5FC" onPress={() => navigation.navigate('EBoard')} />
            <QuickLink isDark={isDark} scale={scale} label="About" icon="document-text" color="#C48518" background="#FFF0CB" onPress={() => navigation.navigate('About')} />
            <QuickLink isDark={isDark} scale={scale} label="Join" icon="person-add" color="#16845B" background="#DCF7EA" onPress={() => open(LINKS.highlander)} />
            <QuickLink isDark={isDark} scale={scale} label="Share a Photo" icon="camera" color="#7650B5" background="#ECE4FB" onPress={() => navigation.navigate('Capture')} />
            <QuickLink isDark={isDark} scale={scale} label="Website" icon="open-outline" color="#F06C43" background="#FFE8DF" onPress={() => open(LINKS.website)} />
            <QuickLink isDark={isDark} scale={scale} label="Contact" icon="mail" color="#8D102B" background="#F4E9E8" onPress={() => open(LINKS.email)} />
          </View>

          <View style={[styles.bottomMessage, isDark && styles.bottomMessageDark]}>
            <Text style={[styles.bottomHeadline, isDark && styles.bottomHeadlineDark]}>MORE LATINOS.{`\n`}BRIGHTER TOMORROWS.</Text>
            <Text style={styles.bottomSub}>ALPFA NJIT</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function QuickLink({ label, icon, color, background, onPress, scale, isDark }: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  background: string;
  onPress: () => void;
  scale: number;
  isDark: boolean;
}) {
  return (
    <TouchableOpacity style={[styles.quickCard, isDark && styles.quickCardDark, { minHeight: 42 * scale, borderRadius: 13 * scale, paddingHorizontal: 9 * scale }]} activeOpacity={0.76} onPress={onPress}>
      <View style={[styles.quickIcon, { backgroundColor: background, width: 28 * scale, height: 28 * scale, borderRadius: 9 * scale }]}>
        <Ionicons name={icon} size={17 * scale} color={color} />
      </View>
      <Text style={[styles.quickLabel, isDark && styles.quickLabelDark, { fontSize: 10 * scale }]} numberOfLines={1}>{label}</Text>
      <Ionicons name="chevron-forward" size={13 * scale} color="#89909A" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAF8F4', overflow: 'hidden' },
  backgroundDecor: { ...StyleSheet.absoluteFill, zIndex: 0 },
  foreground: { flex: 1, zIndex: 1, backgroundColor: 'transparent' },
  content: {},
  brandRow: { flexDirection: 'row', alignItems: 'center', minHeight: 52 },
  logo: { width: 54, height: 54, borderRadius: 10, backgroundColor: '#0F102E' },
  brandCopy: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, marginLeft: 9 },
  brandName: { color: '#081C37', fontSize: 18, fontWeight: '900', letterSpacing: 0.4 },
  brandTag: { color: '#081C37', fontSize: 8, lineHeight: 10, letterSpacing: 0.3 },
  themeButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginRight: 7, borderWidth: 1, borderColor: 'rgba(255,255,255,0.24)' },
  profileButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.82)', alignItems: 'center', justifyContent: 'center' },
  welcome: { color: '#081C37', fontSize: 29, lineHeight: 31, fontWeight: '900', marginTop: 9 },
  familia: { color: '#9D1734', fontSize: 29, lineHeight: 30, fontWeight: '900' },
  motto: { color: '#081C37', fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginTop: 7 },
  eventCard: { minHeight: 151, marginTop: 10, padding: 12, borderRadius: 16, backgroundColor: '#081C37', overflow: 'hidden', shadowColor: '#081C37', shadowOpacity: 0.24, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
  eventDecor: { ...StyleSheet.absoluteFill, zIndex: 0 },
  eventCardDark: { backgroundColor: 'rgba(10,20,48,0.94)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  eventLiquidBlue: { position: 'absolute', width: 190, height: 190, borderRadius: 95, left: -70, bottom: -115, backgroundColor: 'rgba(28,119,255,0.28)' },
  eventLiquidRed: { position: 'absolute', width: 180, height: 180, borderRadius: 90, right: -75, top: -105, backgroundColor: 'rgba(236,30,73,0.34)' },
  eventContent: { zIndex: 1 },
  eventRedSlash: { position: 'absolute', width: 150, height: 52, right: -47, top: -10, backgroundColor: '#B51C35', transform: [{ rotate: '-42deg' }] },
  eventBurgundySlash: { position: 'absolute', width: 150, height: 48, right: -58, bottom: -4, backgroundColor: '#6E1B2D', transform: [{ rotate: '-42deg' }] },
  eventTop: { flexDirection: 'row', alignItems: 'center' },
  dateTile: { width: 65, height: 72, borderRadius: 14, backgroundColor: '#9D1734', alignItems: 'center', justifyContent: 'center' },
  month: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  day: { color: '#FFFFFF', fontSize: 27, lineHeight: 28, fontWeight: '900' },
  hour: { color: 'rgba(255,255,255,0.8)', fontSize: 8, fontWeight: '700' },
  nextCopy: { flex: 1, paddingLeft: 11, flexDirection: 'row', alignItems: 'center', gap: 8 },
  nextLabel: { color: 'rgba(255,255,255,0.67)', fontSize: 9, fontWeight: '800', letterSpacing: 1.3 },
  goldLine: { height: 1, width: 37, backgroundColor: '#C99731' },
  cardWords: { color: 'rgba(255,255,255,0.55)', fontSize: 7, lineHeight: 10, letterSpacing: 1.1, textAlign: 'right' },
  eventTitle: { color: '#FFFFFF', fontSize: 16, lineHeight: 19, fontWeight: '900', maxWidth: '78%', marginTop: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5, maxWidth: '82%' },
  metaText: { color: 'rgba(255,255,255,0.86)', fontSize: 11, flexShrink: 1 },
  eventArrow: { position: 'absolute', right: 11, bottom: 11, width: 31, height: 31, borderRadius: 16, backgroundColor: '#B51C35', alignItems: 'center', justifyContent: 'center' },
  quickHeading: { color: '#081C37', fontSize: 10, fontWeight: '900', letterSpacing: 1.8, marginTop: 14, marginBottom: 6 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 7 },
  quickCard: { width: '48.8%', minHeight: 42, borderRadius: 13, paddingHorizontal: 9, backgroundColor: 'rgba(255,255,255,0.78)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.88)', flexDirection: 'row', alignItems: 'center', gap: 7, shadowColor: '#081C37', shadowOpacity: 0.06, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  quickCardDark: { backgroundColor: 'rgba(20,28,54,0.82)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', shadowOpacity: 0.18 },
  quickIcon: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { color: '#081C37', fontSize: 10, fontWeight: '700', flex: 1 },
  quickLabelDark: { color: '#F7F8FC' },
  bottomMessage: { marginTop: 30, marginBottom: 10, padding: 16, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.62)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.78)' },
  bottomMessageDark: { backgroundColor: 'rgba(17,25,52,0.74)', borderColor: 'rgba(255,255,255,0.10)' },
  bottomHeadline: { color: '#081C37', fontSize: 10, fontWeight: '900', lineHeight: 14, letterSpacing: 1.6 },
  bottomHeadlineDark: { color: '#F7F8FC' },
  bottomSub: { color: '#9D1734', fontSize: 9, fontWeight: '800', marginTop: 7, letterSpacing: 1.2 },
  liquidOrb: { position: 'absolute', borderRadius: 999 },
  liquidRed: { width: 320, height: 320, right: -120, top: 18, backgroundColor: 'rgba(225,32,68,0.30)', transform: [{ rotate: '-18deg' }] },
  liquidBlue: { width: 300, height: 300, left: -135, top: 235, backgroundColor: 'rgba(31,117,255,0.25)' },
  liquidPurple: { width: 310, height: 310, right: -145, top: 455, backgroundColor: 'rgba(126,73,255,0.23)' },
  liquidCyan: { width: 270, height: 270, left: -125, bottom: 20, backgroundColor: 'rgba(0,194,255,0.20)' },
  liquidRedDark: { backgroundColor: 'rgba(255,39,82,0.28)' },
  liquidBlueDark: { backgroundColor: 'rgba(25,108,255,0.24)' },
  liquidPurpleDark: { backgroundColor: 'rgba(142,77,255,0.22)' },
  liquidCyanDark: { backgroundColor: 'rgba(0,207,255,0.18)' },
  topRedSlash: { position: 'absolute', width: 220, height: 40, right: -80, top: 54, backgroundColor: '#B51C35', transform: [{ rotate: '-39deg' }], opacity: 0.96 },
  topNavySlash: { position: 'absolute', width: 190, height: 25, right: -90, top: 85, backgroundColor: '#081C37', transform: [{ rotate: '-39deg' }] },
  bottomNavySlash: { position: 'absolute', width: 250, height: 66, right: -82, bottom: 16, backgroundColor: '#081C37', transform: [{ rotate: '-27deg' }], opacity: 0.96 },
  bottomRedSlash: { position: 'absolute', width: 270, height: 38, right: -118, bottom: 60, backgroundColor: '#9D1734', transform: [{ rotate: '-27deg' }], opacity: 0.92 },
});
