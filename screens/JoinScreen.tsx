import React from 'react';

import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

const LINKS = {
  website:
    'https://nonnair.github.io/alpfa-njit/',

  highlanderHub:
    'https://njit.campuslabs.com/engage/organization/alpfa',

  instagram:
    'https://www.instagram.com/alpfa_njit',

  linkedin:
    'https://www.linkedin.com/in/alpfanjit/',
};

export default function JoinScreen({
  navigation,
}: any) {
  const openLink = async (
    url: string
  ) => {
    await Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#FFFFFF"
          />

          <Text style={styles.backText}>
            Back
          </Text>
        </TouchableOpacity>

        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <Ionicons
              name="people"
              size={42}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.title}>
            Join ALPFA NJIT
          </Text>

          <Text style={styles.subtitle}>
            Build your network. Grow your
            career. Find your community.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Become part of the community
          </Text>

          <Text style={styles.cardText}>
            ALPFA NJIT connects students with
            professional development,
            leadership opportunities,
            networking, and a community
            committed to helping you succeed.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            openLink(LINKS.highlanderHub)
          }
        >
          <Ionicons
            name="school"
            size={22}
            color="#FFFFFF"
          />

          <View style={styles.buttonText}>
            <Text
              style={styles.primaryTitle}
            >
              Join through Highlander Hub
            </Text>

            <Text
              style={styles.primarySubtitle}
            >
              NJIT's student organization
              platform
            </Text>
          </View>

          <Ionicons
            name="arrow-forward"
            size={20}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>
          Learn More
        </Text>

        <LinkButton
          icon="globe-outline"
          label="ALPFA NJIT Website"
          onPress={() =>
            openLink(LINKS.website)
          }
        />

        <LinkButton
          icon="logo-instagram"
          label="Instagram"
          onPress={() =>
            openLink(LINKS.instagram)
          }
        />

        <LinkButton
          icon="logo-linkedin"
          label="LinkedIn"
          onPress={() =>
            openLink(LINKS.linkedin)
          }
        />
      </ScrollView>
    </View>
  );
}

function LinkButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.linkButton}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.linkIcon}>
        <Ionicons
          name={icon}
          size={21}
          color="#6E1B2D"
        />
      </View>

      <Text style={styles.linkLabel}>
        {label}
      </Text>

      <Ionicons
        name="open-outline"
        size={18}
        color="#999999"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F8',
  },

  content: {
    paddingBottom: 50,
  },

  backButton: {
    backgroundColor: '#0F102E',
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  backText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  hero: {
    backgroundColor: '#0F102E',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingBottom: 35,
  },

  iconCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#6E1B2D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 31,
    fontWeight: '900',
  },

  subtitle: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 9,
  },

  card: {
    backgroundColor: '#FFFFFF',
    margin: 18,
    padding: 21,
    borderRadius: 20,
  },

  cardTitle: {
    color: '#17182F',
    fontSize: 19,
    fontWeight: '900',
  },

  cardText: {
    color: '#777777',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 9,
  },

  primaryButton: {
    marginHorizontal: 18,
    backgroundColor: '#6E1B2D',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  buttonText: {
    flex: 1,
    marginLeft: 13,
  },

  primaryTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  primarySubtitle: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 10,
    marginTop: 4,
  },

  sectionTitle: {
    color: '#17182F',
    fontSize: 19,
    fontWeight: '900',
    marginHorizontal: 18,
    marginTop: 30,
    marginBottom: 10,
  },

  linkButton: {
    marginHorizontal: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 13,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },

  linkIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: '#F5F1F2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  linkLabel: {
    flex: 1,
    color: '#17182F',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 13,
  },
});