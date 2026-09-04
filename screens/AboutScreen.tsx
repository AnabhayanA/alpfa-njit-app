import React, { useState, useRef } from 'react';
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import useResponsive from '../utils/responsive';

type RootTabParamList = { Home: undefined; Events: undefined; EBoard: undefined; About: undefined };
type AboutNavigationProp = BottomTabNavigationProp<RootTabParamList, 'About'>;

const LINKS = {
  instagram: 'https://www.instagram.com/alpfa_njit/',
  linkedin: 'https://www.linkedin.com/in/alpfanjit/',
  website: 'https://nonnair.github.io/alpfa-njit/',
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

export default function AboutScreen() {
  const navigation = useNavigation<AboutNavigationProp>();
  const responsive = useResponsive();
  const scrollOffsetY = useRef(0);
  const [lastScrollDir, setLastScrollDir] = useState<'up' | 'down' | null>(null);

  const handleScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const scrollDiff = currentOffset - scrollOffsetY.current;
    
    if (scrollDiff > 8 && lastScrollDir !== 'down') {
      setLastScrollDir('down');
      navigation.setParams({ navScrollState: 'down' } as any);
    } else if (scrollDiff < -8 && lastScrollDir !== 'up') {
      setLastScrollDir('up');
      navigation.setParams({ navScrollState: 'up' } as any);
    }
    
    scrollOffsetY.current = currentOffset;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingHorizontal: responsive.horizontalPadding, paddingBottom: responsive.responsiveSpacing.xxl + 40, maxWidth: responsive.contentMaxWidth || undefined, alignSelf: 'center', width: '100%' }]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={[styles.hero, { paddingTop: responsive.isSmallPhone ? 34 : 52, paddingBottom: responsive.isSmallPhone ? 22 : 28, marginHorizontal: -responsive.horizontalPadding, paddingHorizontal: responsive.horizontalPadding + 20 }]}>
          <Image
            source={require('../assets/images/ALPFANJITLOGO.png')}
            style={[styles.logo, { width: responsive.isSmallPhone ? 88 : 110, height: responsive.isSmallPhone ? 88 : 110, borderRadius: responsive.isSmallPhone ? 20 : 26 }]}
            resizeMode="contain"
          />
          <Text style={[styles.title, { fontSize: responsive.isSmallPhone ? 24 : 28 }]}>ALPFA NJIT</Text>
          <Text style={[styles.subtitle, { fontSize: responsive.isSmallPhone ? 10 : 11 }]}>Building Leaders. Creating Opportunities.</Text>
        </View>

        <View style={[styles.card, { marginHorizontal: responsive.horizontalPadding, padding: responsive.isSmallPhone ? 18 : 22, borderRadius: responsive.isSmallPhone ? 18 : 24 }]}>
          <Text style={[styles.cardTitle, { fontSize: responsive.isSmallPhone ? 17 : 19 }]}>About ALPFA NJIT</Text>
          <Text style={[styles.body, { fontSize: responsive.isSmallPhone ? 11 : 12 }]}> 
            ALPFA NJIT connects students with professional development, networking, leadership,
            and career opportunities that help them grow inside and outside the classroom.
          </Text>
        </View>

        <View style={[styles.infoGrid, { marginHorizontal: responsive.horizontalPadding }]}>
          <InfoCard
            title="Our Mission"
            text="Empower students with leadership, networking, and career development opportunities that shape their future."
            icon="flag"
          />
          <InfoCard
            title="Get Involved"
            text="Attend meetings, connect with peers, and discover ways to participate in chapter events and leadership."
            icon="sparkles"
          />
          <InfoCard
            title="Connect With Us"
            text="Follow our social channels and stay in touch through the official website, LinkedIn, and Highlander Hub."
            icon="people"
          />
        </View>

        <Text style={[styles.sectionTitle, { marginHorizontal: responsive.horizontalPadding }]}>Connect With Us</Text>

        <LinkButton
          icon="logo-instagram"
          title="Instagram"
          subtitle="@alpfa_njit"
          onPress={() => openLink(LINKS.instagram)}
        />
        <LinkButton
          icon="logo-linkedin"
          title="LinkedIn"
          subtitle="ALPFA NJIT"
          onPress={() => openLink(LINKS.linkedin)}
        />
        <LinkButton
          icon="globe-outline"
          title="ALPFA NJIT Website"
          subtitle="nonnair.github.io/alpfa-njit"
          onPress={() => openLink(LINKS.website)}
        />
        <LinkButton
          icon="business-outline"
          title="ALPFA National"
          subtitle="alpfa.org"
          onPress={() => openLink(LINKS.alpfa)}
        />
        <LinkButton
          icon="school-outline"
          title="Highlander Hub"
          subtitle="NJIT ALPFA organization"
          onPress={() => openLink(LINKS.highlander)}
        />
        <LinkButton
          icon="mail-outline"
          title="Email"
          subtitle="alpfanjit@gmail.com"
          onPress={() => openLink(LINKS.email)}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>ALPFA NJIT</Text>
          <Text style={styles.footerSubtext}>© 2026 ALPFA NJIT</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoCard({
  title,
  text,
  icon,
}: {
  title: string;
  text: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={20} color="#6E1B2D" />
      </View>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

function LinkButton({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[styles.linkButton, { marginHorizontal: 18 }]}>
      <View style={styles.linkIcon}>
        <Ionicons name={icon} size={22} color="#6E1B2D" />
      </View>
      <View style={styles.linkContent}>
        <Text style={styles.linkTitle}>{title}</Text>
        <Text style={styles.linkSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="arrow-forward" size={18} color="#999999" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F8',
  },
  content: {
    paddingBottom: 40,
  },
  hero: {
    backgroundColor: '#0F102E',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    backgroundColor: '#FFFFFF',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    marginTop: 18,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 7,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginTop: 18,
    borderWidth: 1,
    borderColor: 'rgba(15, 16, 46, 0.05)',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  cardTitle: {
    color: '#17182F',
    fontSize: 19,
    fontWeight: '900',
  },
  body: {
    color: '#4B5365',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 10,
  },
  infoGrid: {
    marginTop: 10,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(15, 16, 46, 0.04)',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8EAF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: {
    color: '#17182F',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 12,
  },
  infoText: {
    color: '#53607B',
    fontSize: 11,
    lineHeight: 18,
    marginTop: 6,
  },
  sectionTitle: {
    color: '#17182F',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 18,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(15, 16, 46, 0.04)',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F7EBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkContent: {
    flex: 1,
    marginLeft: 12,
  },
  linkTitle: {
    color: '#17182F',
    fontSize: 15,
    fontWeight: '800',
  },
  linkSubtitle: {
    color: '#697389',
    fontSize: 11,
    marginTop: 3,
  },
  footer: {
    alignItems: 'center',
    marginTop: 22,
  },
  footerText: {
    color: '#17182F',
    fontWeight: '900',
    fontSize: 16,
  },
  footerSubtext: {
    color: '#6E1B2D',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 6,
  },
});