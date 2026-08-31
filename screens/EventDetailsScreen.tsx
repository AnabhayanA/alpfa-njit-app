import React from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

export default function EventDetailsScreen({
  navigation,
  route,
}: any) {
  const event =
    route?.params?.event || {
      title:
        'ALPFA NJIT General Body Meeting',
      date: 'September 8, 2026',
      time: '5:00 PM',
      location: 'NJIT Campus',
      description:
        'Join ALPFA NJIT for our upcoming General Body Meeting. Meet the team, connect with fellow students, and learn about upcoming opportunities.',
    };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
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

          <View style={styles.calendar}>
            <Ionicons
              name="calendar"
              size={45}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.upcoming}>
            UPCOMING EVENT
          </Text>

          <Text style={styles.title}>
            {event.title}
          </Text>
        </View>

        <View style={styles.content}>
          <InfoRow
            icon="calendar-outline"
            title="Date"
            value={event.date}
          />

          <InfoRow
            icon="time-outline"
            title="Time"
            value={event.time}
          />

          <InfoRow
            icon="location-outline"
            title="Location"
            value={event.location}
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              About this event
            </Text>

            <Text style={styles.description}>
              {event.description}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({
  icon,
  title,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons
          name={icon}
          size={20}
          color="#6E1B2D"
        />
      </View>

      <View>
        <Text style={styles.infoTitle}>
          {title}
        </Text>

        <Text style={styles.infoValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F8',
  },

  hero: {
    backgroundColor: '#0F102E',
    paddingBottom: 35,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  backButton: {
    alignSelf: 'flex-start',
    paddingTop: 55,
    paddingBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  backText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  calendar: {
    width: 85,
    height: 85,
    borderRadius: 24,
    backgroundColor: '#6E1B2D',
    alignItems: 'center',
    justifyContent: 'center',
  },

  upcoming: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 20,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 8,
  },

  content: {
    padding: 18,
  },

  infoRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },

  infoIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: '#F5F1F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  infoTitle: {
    color: '#999999',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  infoValue: {
    color: '#17182F',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 3,
  },

  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 19,
    marginTop: 12,
  },

  sectionTitle: {
    color: '#17182F',
    fontSize: 19,
    fontWeight: '900',
  },

  description: {
    color: '#777777',
    fontSize: 12,
    lineHeight: 20,
    marginTop: 9,
  },
});