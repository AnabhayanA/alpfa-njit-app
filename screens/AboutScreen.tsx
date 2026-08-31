import React from 'react';
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

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
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Image
            source={require('../assets/images/ALPFANJITLOGO.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>ALPFA NJIT</Text>
          <Text style={styles.subtitle}>Building Leaders. Creating Opportunities.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>About ALPFA NJIT</Text>
          <Text style={styles.body}>
            ALPFA NJIT connects students with professional development, networking, leadership,
            and career opportunities that help them grow inside and outside the classroom.
          </Text>
        </View>

        <View style={styles.infoGrid}>
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

        <Text style={styles.sectionTitle}>Connect With Us</Text>

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
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.linkButton}>
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
    paddingTop: 65,
    paddingBottom: 35,
    paddingHorizontal: 20,
  },
  logo: {
    width: 130,
    height: 130,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
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
    margin: 18,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
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
    marginHorizontal: 18,
    marginTop: 10,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
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
    marginHorizontal: 18,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginHorizontal: 18,
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
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