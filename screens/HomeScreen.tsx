import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import useResponsive from '../utils/responsive';
import { colors } from '../constants/theme';

type RootTabParamList = { Home: undefined; Events: undefined; EBoard: undefined; About: undefined };
type HomeNavigationProp = BottomTabNavigationProp<RootTabParamList, 'Home'>;

const LINKS = {
  website: 'https://nonnair.github.io/alpfa-njit/',
  linkedin: 'https://www.linkedin.com/in/alpfanjit/',
  instagram: 'https://www.instagram.com/alpfa_njit/',
  alpfa: 'https://alpfa.org/',
  highlander: 'https://njit.campuslabs.com/engage/organization/alpfa',
  email: 'mailto:alpfanjit@gmail.com',
};

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

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();
  const responsive = useResponsive();
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;
  const scrollOffsetY = useRef(0);
  const [lastScrollDir, setLastScrollDir] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 650, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, speed: 12, bounciness: 5, useNativeDriver: true }),
    ]).start();
  }, [fade, slide]);

  const handleScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const scrollDiff = currentOffset - scrollOffsetY.current;
    
    // Determine scroll direction with a threshold
    if (scrollDiff > 8 && lastScrollDir !== 'down') {
      setLastScrollDir('down');
      navigation.setParams({ navScrollState: 'down' } as any);
    } else if (scrollDiff < -8 && lastScrollDir !== 'up') {
      setLastScrollDir('up');
      navigation.setParams({ navScrollState: 'up' } as any);
    }
    
    scrollOffsetY.current = currentOffset;
  };

  const goToEvents = () => navigation.navigate('Events');
  const goToEBoard = () => navigation.navigate('EBoard');

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: responsive.responsiveSpacing.xxl + 40, maxWidth: responsive.contentMaxWidth || undefined, alignSelf: 'center', width: '100%' }]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Animated.View style={[styles.header, { opacity: fade, transform: [{ translateY: slide }], paddingHorizontal: responsive.horizontalPadding, paddingTop: responsive.isSmallPhone ? 42 : 62, paddingBottom: responsive.isSmallPhone ? 22 : 29 }]}>
          <View style={styles.headerTop}>
            <View style={styles.headerText}>
              <Text style={[styles.eyebrow, { fontSize: responsive.isSmallPhone ? 9 : 10 }]}>WELCOME TO</Text>
              <Text style={[styles.headerTitle, { fontSize: responsive.isSmallPhone ? 26 : responsive.isTablet ? 34 : 30 }]}>ALPFA NJIT</Text>
              <Text style={[styles.headerSubtitle, { fontSize: responsive.isSmallPhone ? 11 : 12 }]}>Building Leaders. Creating Opportunities.</Text>
            </View>
          </View>
        </Animated.View>

        <TouchableOpacity activeOpacity={0.92} style={[styles.featuredCard, { marginHorizontal: responsive.horizontalPadding, marginTop: responsive.responsiveSpacing.lg, padding: responsive.isSmallPhone ? 18 : 22 }]} onPress={goToEvents}>
          <View style={styles.featuredTopRow}>
            <View style={styles.badge}><View style={styles.badgeDot} /><Text style={styles.badgeText}>ALPFA NJIT</Text></View>
            <Ionicons name="arrow-forward" size={19} color="rgba(255,255,255,0.75)" />
          </View>
          <Text style={[styles.featuredTitle, { fontSize: responsive.isSmallPhone ? 20 : 24 }]}>Your community.</Text>
          <Text style={[styles.featuredTitleAccent, { fontSize: responsive.isSmallPhone ? 20 : 24 }]}>Your opportunity.</Text>
          <Text style={[styles.featuredText, { fontSize: responsive.isSmallPhone ? 11 : 12 }]}>Connect with students, professionals, events, and opportunities through ALPFA NJIT.</Text>
          <View style={styles.featuredBottom}><Text style={styles.featuredAction}>Explore ALPFA</Text><View style={styles.featuredArrow}><Ionicons name="arrow-forward" size={15} color="#6E1B2D" /></View></View>
        </TouchableOpacity>

        <View style={[styles.section, { marginHorizontal: responsive.horizontalPadding, marginTop: responsive.responsiveSpacing.xxl }]}>
          <Text style={styles.sectionTitle}>Explore</Text>
          <Text style={styles.sectionCaption}>Everything ALPFA</Text>
          <View style={styles.actionsGrid}>
            <ActionCard icon="calendar" title="Events" subtitle="What's happening" type="burgundy" onPress={goToEvents} compact={responsive.compactLayout} />
            <ActionCard icon="briefcase" title="Opportunities" subtitle="Grow your career" type="navy" onPress={() => openLink(LINKS.website)} />
            <ActionCard icon="people" title="E-Board" subtitle="Meet our leaders" type="light" onPress={goToEBoard} />
            <ActionCard icon="person-add" title="Join ALPFA" subtitle="Become a member" type="light" onPress={() => openLink(LINKS.highlander)} />
          </View>
        </View>

        <View style={[styles.section, { marginHorizontal: responsive.horizontalPadding, marginTop: responsive.responsiveSpacing.xxl }]}>
          <View style={styles.rowBetween}><View><Text style={styles.sectionTitle}>Events</Text><Text style={styles.sectionCaption}>Stay involved</Text></View><TouchableOpacity onPress={goToEvents}><Text style={styles.seeAll}>View calendar</Text></TouchableOpacity></View>
          <TouchableOpacity activeOpacity={0.88} style={styles.preview} onPress={goToEvents}>
            <View style={styles.calendarIcon}><Ionicons name="calendar" size={25} color="#FFFFFF" /></View>
            <View style={styles.previewContent}><Text style={styles.previewTitle}>See What's Happening</Text><Text style={styles.previewText}>View upcoming ALPFA NJIT meetings, workshops, networking events, and more.</Text></View>
            <Ionicons name="chevron-forward" size={21} color="#6E1B2D" />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { marginHorizontal: responsive.horizontalPadding, marginTop: responsive.responsiveSpacing.xxl }]}>
          <Text style={styles.sectionTitle}>Level Up</Text><Text style={styles.sectionCaption}>Career and opportunities</Text>
          <TouchableOpacity activeOpacity={0.9} style={styles.careerCard} onPress={() => openLink(LINKS.website)}>
            <View style={styles.careerIcon}><Ionicons name="rocket" size={26} color="#FFFFFF" /></View>
            <View style={styles.careerContent}><Text style={styles.careerTitle}>Your next opportunity is out there.</Text><Text style={styles.careerText}>Discover internships, fellowships, scholarships, and career programs.</Text><Text style={styles.careerLink}>Explore opportunities</Text></View>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { marginHorizontal: responsive.horizontalPadding, marginTop: responsive.responsiveSpacing.xxl }]}><Text style={styles.connectTitle}>Stay Connected</Text><Text style={styles.connectText}>Follow ALPFA NJIT and stay connected with everything happening in our community.</Text><View style={styles.socialRow}>
          <SocialButton label="Instagram" icon="logo-instagram" onPress={() => openLink(LINKS.instagram)} /><SocialButton label="LinkedIn" icon="logo-linkedin" onPress={() => openLink(LINKS.linkedin)} /><SocialButton label="Website" icon="globe-outline" onPress={() => openLink(LINKS.website)} />
        </View><View style={styles.socialRow}><SocialButton label="ALPFA.org" icon="business-outline" onPress={() => openLink(LINKS.alpfa)} /><SocialButton label="Highlander Hub" icon="school-outline" onPress={() => openLink(LINKS.highlander)} /><SocialButton label="Email" icon="mail-outline" onPress={() => openLink(LINKS.email)} /></View></View>

        <View style={styles.footer}><Image source={require('../assets/images/ALPFANJITLOGO.png')} style={styles.footerLogo} resizeMode="contain" /><Text style={styles.footerTitle}>ALPFA NJIT</Text><Text style={styles.footerText}>Building Leaders. Creating Opportunities.</Text><Text style={styles.footerCopyright}>2026 ALPFA NJIT</Text></View>
      </ScrollView>
    </View>
  );
}

function ActionCard({ icon, title, subtitle, type, onPress, compact }: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string; type: 'burgundy' | 'navy' | 'light'; onPress: () => void; compact?: boolean }) {
  const isLight = type === 'light';
  return <TouchableOpacity activeOpacity={0.82} onPress={onPress} style={[styles.actionCard, compact && styles.compactActionCard, type === 'burgundy' && styles.burgundy, type === 'navy' && styles.navy, isLight && styles.light]}><View style={[styles.actionIcon, isLight && styles.actionIconLight]}><Ionicons name={icon} size={22} color={isLight ? '#6E1B2D' : '#FFFFFF'} /></View><Text style={[styles.actionTitle, isLight && styles.darkText]}>{title}</Text><Text style={[styles.actionSubtitle, isLight && styles.darkSubtext]}>{subtitle}</Text><Ionicons name="arrow-forward" size={16} color={isLight ? '#6E1B2D' : '#FFFFFF'} style={styles.actionArrow} /></TouchableOpacity>;
}

function SocialButton({ label, icon, onPress }: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return <TouchableOpacity activeOpacity={0.8} style={styles.socialButton} onPress={onPress}><View style={styles.socialIcon}><Ionicons name={icon} size={20} color="#6E1B2D" /></View><Text style={styles.socialLabel}>{label}</Text></TouchableOpacity>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F6F8' },
  scrollContent: { paddingBottom: 45 },
  header: { backgroundColor: '#0F102E', paddingTop: 62, paddingBottom: 29 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerText: { flex: 1 }, eyebrow: { color: 'rgba(255,255,255,0.62)', fontSize: 10, fontWeight: '900', letterSpacing: 2 }, headerTitle: { color: '#FFFFFF', fontSize: 30, fontWeight: '900', marginTop: 6 }, headerSubtitle: { color: 'rgba(255,255,255,0.67)', fontSize: 12, marginTop: 8, lineHeight: 18 },
  featuredCard: { backgroundColor: '#6E1B2D', borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } }, featuredTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }, badgeDot: { width: 8, height: 8, borderRadius: 99, backgroundColor: '#FFFFFF', marginRight: 8 }, badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' }, featuredTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', marginTop: 18 }, featuredTitleAccent: { color: '#FFE9EE', fontSize: 24, fontWeight: '900', marginTop: 2 }, featuredText: { color: 'rgba(255,255,255,0.82)', fontSize: 12, lineHeight: 19, marginTop: 12 }, featuredBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }, featuredAction: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' }, featuredArrow: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  section: { marginTop: 26 }, rowBetween: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, sectionTitle: { color: '#17182F', fontSize: 24, fontWeight: '900' }, sectionCaption: { color: '#676C80', fontSize: 11, marginTop: 4 }, seeAll: { color: '#6E1B2D', fontSize: 12, fontWeight: '800' }, actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 14 },
  actionCard: { width: '48%', padding: 16, borderRadius: 18, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } }, compactActionCard: { width: '100%', marginBottom: 12 }, burgundy: { backgroundColor: '#6E1B2D' }, navy: { backgroundColor: '#0F102E' }, light: { backgroundColor: '#FFFFFF' }, actionIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }, actionIconLight: { backgroundColor: '#F3E5EA' }, actionTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '800', marginTop: 14 }, darkText: { color: '#17182F' }, actionSubtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 4 }, darkSubtext: { color: '#676C80' }, actionArrow: { alignSelf: 'flex-end', marginTop: 12 },
  preview: { marginTop: 14, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } }, calendarIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#6E1B2D', alignItems: 'center', justifyContent: 'center' }, previewContent: { flex: 1, marginLeft: 14 }, previewTitle: { color: '#17182F', fontSize: 18, fontWeight: '900' }, previewText: { color: '#555B70', fontSize: 11, lineHeight: 17, marginTop: 5 },
  careerCard: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 18, marginTop: 14, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } }, careerIcon: { width: 52, height: 52, borderRadius: 18, backgroundColor: '#0F102E', alignItems: 'center', justifyContent: 'center' }, careerContent: { flex: 1, marginLeft: 14 }, careerTitle: { color: '#17182F', fontSize: 18, fontWeight: '900' }, careerText: { color: '#4C5368', fontSize: 11, lineHeight: 17, marginTop: 6 }, careerLink: { color: '#6E1B2D', fontSize: 12, fontWeight: '800', marginTop: 10 },
  connectTitle: { color: '#17182F', fontSize: 22, fontWeight: '900' }, connectText: { color: '#535B72', fontSize: 12, lineHeight: 18, marginTop: 6 }, socialRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 12 }, socialButton: { width: '31%', backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center', marginBottom: 10 }, socialIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#F7E9EE', alignItems: 'center', justifyContent: 'center' }, socialLabel: { color: '#17182F', fontSize: 10, fontWeight: '800', marginTop: 8, textAlign: 'center' }, footer: { alignItems: 'center', paddingTop: 28, paddingBottom: 40 }, footerLogo: { width: 80, height: 80 }, footerTitle: { color: '#17182F', fontSize: 18, fontWeight: '900', marginTop: 10 }, footerText: { color: '#53607B', fontSize: 12, marginTop: 6 }, footerCopyright: { color: '#6E1B2D', fontSize: 10, marginTop: 8, fontWeight: '700' },
});
