import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import EBoardCard from '../components/EBoardCard';

// E-Board member data structure
const BOARD_MEMBERS = [
  {
    id: '001',
    name: 'President Name',
    position: 'Chapter President',
    major: 'Business Administration',
    classYear: '2026',
    image: undefined,
    goal: 'To create an inclusive and empowering community where every ALPFA member feels valued and supported.',
    whyAlpfa: 'ALPFA represents the bridge between my academic journey and my professional aspirations. It\'s where I found my community.',
    role: 'Oversee all chapter operations and ensure the success of ALPFA NJIT initiatives.',
    funFact: 'Loves exploring new restaurants and trying different cuisines.',
    linkedin: 'https://linkedin.com/in/president',
    instagram: 'https://instagram.com/president',
  },
  {
    id: '002',
    name: 'Vice President Name',
    position: 'Vice President',
    major: 'Computer Science',
    classYear: '2026',
    image: undefined,
    goal: 'To leverage technology to enhance member engagement and create innovative programs for ALPFA NJIT.',
    whyAlpfa: 'ALPFA gave me the confidence and network I needed to pursue my dreams in tech.',
    role: 'Support the president and lead technology initiatives for the chapter.',
    funFact: 'Built a mobile app that has over 1,000 downloads.',
    linkedin: 'https://linkedin.com/in/vicepresident',
  },
  {
    id: '003',
    name: 'Secretary Name',
    position: 'Secretary',
    major: 'Finance',
    classYear: '2027',
    image: undefined,
    goal: 'To ensure smooth operations and clear communication across all ALPFA NJIT initiatives.',
    whyAlpfa: 'Being part of ALPFA has taught me the importance of organization and teamwork.',
    role: 'Manage communications, documentation, and member records for the chapter.',
    funFact: 'Fluent in three languages.',
    instagram: 'https://instagram.com/secretary',
  },
  {
    id: '004',
    name: 'Treasurer Name',
    position: 'Treasurer',
    major: 'Accounting',
    classYear: '2026',
    image: undefined,
    goal: 'To manage resources effectively and ensure ALPFA NJIT has the funding to achieve its mission.',
    whyAlpfa: 'ALPFA showed me that financial literacy and community impact go hand in hand.',
    role: 'Manage chapter finances and ensure transparent financial operations.',
    funFact: 'Started investing in stocks at age 18.',
  },
  {
    id: '005',
    name: 'Events Director Name',
    position: 'Director of Events',
    major: 'Marketing',
    classYear: '2027',
    image: undefined,
    goal: 'To create memorable experiences that bring the ALPFA community together and foster professional growth.',
    whyAlpfa: 'Events are where connections happen, and I love creating those moments for our members.',
    role: 'Plan and execute all chapter events, networking nights, and professional development workshops.',
    funFact: 'Has planned events for over 200 attendees.',
    linkedin: 'https://linkedin.com/in/eventsdirector',
    instagram: 'https://instagram.com/eventsdirector',
  },
  {
    id: '006',
    name: 'Member Experience Name',
    position: 'Director of Member Experience',
    major: 'Human Resources',
    classYear: '2027',
    image: undefined,
    goal: 'To ensure every member feels welcomed, valued, and supported throughout their ALPFA journey.',
    whyAlpfa: 'I joined ALPFA because I wanted to make a difference in people\'s lives and careers.',
    role: 'Enhance member satisfaction and create inclusive experiences for all ALPFA members.',
    funFact: 'Volunteers at a local mentorship program every weekend.',
    instagram: 'https://instagram.com/memberexperience',
  },
];

export default function EBoardScreen() {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 650, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, speed: 9, bounciness: 5, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.eyebrow}>ALPFA NJIT</Text>
            <Text style={styles.title}>E-BOARD</Text>
            <Text style={styles.subtitle}>Meet the people behind the chapter.</Text>
            <Text style={styles.subtitleSecondary}>Building leaders. Creating opportunities.</Text>
          </View>

          {/* Feature Card */}
          <View style={styles.featureCard}>
            <View style={styles.featureCircle}>
              <Text style={styles.featureInitials}>AL</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureLabel}>ALPFA NJIT</Text>
              <Text style={styles.featureTitle}>Leadership in action.</Text>
              <Text style={styles.featureText}>Each E-Board member brings unique skills and perspectives to our community.</Text>
            </View>
          </View>

          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Leadership Team</Text>
            <Text style={styles.memberCount}>{BOARD_MEMBERS.length} members</Text>
          </View>

          {/* Member Cards */}
          {BOARD_MEMBERS.map((member, index) => (
            <EBoardCard
              key={member.id}
              member={member}
              animationDelay={index * 100}
            />
          ))}

          {/* Bottom Card */}
          <View style={styles.bottomCard}>
            <Text style={styles.bottomEmoji}>🤝</Text>
            <Text style={styles.bottomTitle}>Building the next generation.</Text>
            <Text style={styles.bottomText}>ALPFA NJIT continues to grow through leadership, service, and opportunity for every member.</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },
  content: {
    paddingTop: 64,
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  eyebrow: {
    color: '#6E1B2D',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  title: {
    color: '#11142D',
    fontSize: 35,
    fontWeight: '900',
    marginTop: 8,
  },
  subtitle: {
    color: '#586178',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  subtitleSecondary: {
    color: '#586178',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    fontStyle: 'italic',
  },
  header: {
    marginBottom: 24,
  },
  featureCard: {
    marginTop: 22,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  featureCircle: {
    width: 66,
    height: 66,
    borderRadius: 20,
    backgroundColor: '#0F102E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureInitials: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 22,
  },
  featureContent: {
    flex: 1,
    marginLeft: 14,
  },
  featureLabel: {
    color: '#6E1B2D',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  featureTitle: {
    color: '#17182F',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 6,
  },
  featureText: {
    color: '#5A6176',
    fontSize: 11,
    lineHeight: 18,
    marginTop: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 32,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#17182F',
    fontSize: 18,
    fontWeight: '900',
  },
  memberCount: {
    color: '#6E1B2D',
    fontSize: 11,
    fontWeight: '800',
  },
  bottomCard: {
    backgroundColor: '#0F102E',
    borderRadius: 22,
    padding: 20,
    marginTop: 18,
    alignItems: 'center',
  },
  bottomEmoji: {
    fontSize: 27,
  },
  bottomTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 8,
  },
  bottomText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
  },
});