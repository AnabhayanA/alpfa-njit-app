import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import EBoardCard from '../components/EBoardCard';
import useResponsive from '../utils/responsive';
import useTheme from '../utils/useTheme';
import { ThemePalette } from '../constants/theme';

type RootTabParamList = { Home: undefined; Events: undefined; EBoard: undefined; About: undefined };
type EBoardNavigationProp = BottomTabNavigationProp<RootTabParamList, 'EBoard'>;

// E-Board member data structure
const BOARD_MEMBERS = [
  {
    name: 'Anabhayan Ahruran',
    position: 'Director Of IT',
    major: 'Information Technology',
    classYear: 'NJIT',
    image: require('../assets/images/anabhayan-ahruran.jpg'),
    linkedin: 'https://www.linkedin.com/in/anabhayan-ahruran2027/',
    bio: 'I am Sri Lankan and Malaysian, brought to America at the age of 5.',
    goal: 'My goal is to create a welcoming and supportive environment where every NJIT student feels comfortable getting involved with ALPFA. I want to help students have the same positive experience that I had by encouraging them to attend mixers, networking events, and professional development opportunities. Through ALPFA, I was able to build meaningful connections with the NJIT ALPFA Executive Board, the ALPFA New Jersey Board, recruiters, and fellow students who were all working toward similar career goals. I hope to give other students those same opportunities to grow their professional network, gain confidence, and connect with people who can support their career journey.',
    whyAlpfa: 'ALPFA helped me build meaningful connections with students, board members, recruiters, and professionals working toward similar career goals.',
    role: 'Support the chapter with technology and help create a welcoming digital experience for ALPFA NJIT members.',
  },
  {
    name: 'Renzo Rey',
    position: 'Director of Professional Development',
    major: 'Mechanical Engineering',
    classYear: 'Junior',
    image: undefined,
    bio: 'I am a junior majoring in Mechanical Engineering, half Peruvian and half Argentinian, and support the Knicks and FC Barcelona. I am passionate about helping others and strive to be someone people know they can count on. Whether it is school or everyday life, I try to bring energy, openness, and a willingness to help wherever I can. More than anything, I hope to be remembered as someone who pushed the people around me to believe in themselves and grow.',
    goal: 'My goal is to build ALPFA and the people in it. I want to help build our members become more confident, prepared, and willing to put themselves out there, while becoming people other students look up to and learn from. For my Professional Development Officers, I want to develop a team that pushes each other to grow, leads by example, and becomes a group that students can look to for guidance. I want every person who gets involved with ALPFA to believe more in themselves, recognize their potential, and feel capable of going after opportunities they may not have thought possible before.',
    whyAlpfa: 'ALPFA gives me the opportunity to help others grow, build confidence, and recognize the opportunities available to them.',
    role: 'Lead professional development efforts and help members become more prepared and confident in pursuing their goals.',
  },
  {
    name: 'Brandon Palacios',
    position: 'Director of Marketing Operations',
    major: 'Business Administration, Marketing',
    classYear: '2026',
    image: undefined,
    bio: 'Brandon is a Business Administration student at NJIT with a concentration in Marketing, graduating in 2026. He brings hands-on industry experience from Louis Vuitton, where he progressed from Operations Associate to Acting Operations Manager, leading a 14-person team. He also completed a Retail Marketing Strategy internship with Giorgio Armani, giving him firsthand exposure to luxury brand positioning and merchandising. He currently serves as ALPFA NJIT\'s Marketing Coordinator and is passionate about combining operational precision with creative strategy to help ALPFA grow its presence on campus.',
    goal: 'As Director of Marketing Operations this semester, my goal is to strengthen ALPFA NJIT\'s brand consistency and visibility — from social media and event promotion to member communications — while streamlining how the marketing team plans and executes campaigns. I want to bring the same operational discipline I\'ve built in retail management to our internal workflows, and the same creative eye I\'ve developed through my marketing experience to how we present ALPFA to the NJIT community, so we can grow membership and elevate the org\'s professional image.',
    whyAlpfa: 'ALPFA gives me a meaningful way to combine marketing strategy, operations, and community-building while helping the organization grow on campus.',
    role: 'Lead marketing operations, strengthen brand consistency, and coordinate campaigns that elevate ALPFA NJIT\'s visibility and professional image.',
  },
  {
    name: 'Jose Trujillo',
    position: 'Director of Fundraising',
    major: 'Fintech',
    classYear: 'Junior',
    image: undefined,
    bio: 'I am a junior majoring in Fintech, Salvadoran, and enjoy working with others who have the same shared goals.',
    goal: 'To build on existing connections and continue building connections with alumni, professionals, local businesses, and other chapters to create more fundraising opportunities through events and increase funding possibilities.',
    whyAlpfa: 'ALPFA brings together people with shared goals and creates opportunities to build meaningful relationships across students, professionals, alumni, and chapters.',
    role: 'Build fundraising partnerships and create events that expand opportunities and strengthen ALPFA NJIT\'s funding.',
  },
  {
    name: 'Anwesha Biswal',
    position: 'Secretary',
    major: 'Business',
    classYear: 'Sophomore',
    image: undefined,
    bio: 'I am a sophomore majoring in business. I am the secretary of ALPFA. In high school, I was president and secretary of FBLA and helped students build business skills while also planning and organizing speaker, fundraising, and mock competition events. I was also a karate instructor, working alongside senior instructors with different skill sets and helping students of various ages. I aspire to be a person who can help other people by supporting and empowering them.',
    goal: 'My goal for ALPFA is to use my skills to create a strong foundation for this chapter, ensuring we can stay on top of everything that needs to be done. I also want this club to run smoothly so everyone who joins can create long-lasting memories.',
    whyAlpfa: 'ALPFA gives me the opportunity to support and empower others while helping create a strong, organized, and welcoming chapter community.',
    role: 'Manage chapter organization and communication while helping ALPFA NJIT run smoothly for every member.',
  },
  {
    name: 'Ingrid Martinez-Rojas',
    position: 'Chapter President',
    major: 'Business Management, Marketing',
    classYear: 'NJIT',
    image: undefined,
    bio: 'Ingrid Martinez-Rojas is the President of ALPFA at NJIT and a Business Management student concentrating in Marketing. A first-generation college student, she is passionate about creating opportunities for students through professional development, networking, and community. Ingrid has experience in sales and financial services and is committed to helping ALPFA members build confidence, meaningful connections, and successful careers.',
    goal: 'My goal for ALPFA is to grow our chapter by increasing membership and getting more students actively involved. I want to build a strong, engaged community where students feel connected, supported, and excited to take advantage of the professional and personal opportunities ALPFA has to offer.',
    whyAlpfa: 'ALPFA creates a community where students can build confidence, meaningful connections, and successful careers through professional development and networking.',
    role: 'Lead the chapter, grow membership, and build an engaged community that helps students take advantage of ALPFA opportunities.',
  },
  {
    name: 'Andrea Camila Pardo',
    position: 'Vice President',
    major: 'Data Science, Statistics Track',
    classYear: 'NJIT',
    image: undefined,
    bio: 'I was born and raised in Ecuador. I am a Data Science major in the Statistics track, and I am also an EOP and McNair scholar. I met ALPFA and it immediately became my family, and I have not left since then.',
    goal: 'My goal for ALPFA is to grow our membership while maintaining the quality and family spirit that make our community special.',
    whyAlpfa: 'ALPFA immediately became my family and continues to provide a supportive community where members can grow together.',
    role: 'Support chapter leadership, grow membership, and help preserve the quality and family-centered culture of ALPFA NJIT.',
  },
].sort((a, b) => {
  const order = [
    'Chapter President',
    'Vice President',
    'Secretary',
    'Director of Professional Development',
    'Director of Marketing Operations',
    'Director of Fundraising',
    'Director Of IT',
  ];
  return order.indexOf(a.position) - order.indexOf(b.position);
}).map((member, index) => ({
  ...member,
  id: String(index + 1).padStart(3, '0'),
}));

export default function EBoardScreen() {
  const navigation = useNavigation<EBoardNavigationProp>();
  const responsive = useResponsive();
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;
  const scrollOffsetY = useRef(0);
  const [lastScrollDir, setLastScrollDir] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 650, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, speed: 9, bounciness: 5, useNativeDriver: true }),
    ]).start();
  }, []);

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
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: responsive.horizontalPadding,
            paddingBottom: responsive.responsiveSpacing.xxl + 40,
            maxWidth: responsive.contentMaxWidth || undefined,
            alignSelf: 'center',
            width: '100%',
          },
        ]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
          {/* Header */}
            <View style={[styles.header, { marginBottom: responsive.isSmallPhone ? 18 : 24, paddingTop: responsive.isSmallPhone ? 44 : 64 }]}>
            <Text style={styles.eyebrow}>ALPFA NJIT</Text>
            <Text style={[styles.title, { fontSize: responsive.isSmallPhone ? 28 : 35 }]}>E-BOARD</Text>
            <Text style={[styles.subtitle, { fontSize: responsive.isSmallPhone ? 12 : 13 }]}>Meet the people behind the chapter.</Text>
            <Text style={[styles.subtitleSecondary, { fontSize: responsive.isSmallPhone ? 11 : 12 }]}>Building leaders. Creating opportunities.</Text>
          </View>

          {/* Feature Card */}
          <View style={[styles.featureCard, { padding: responsive.isSmallPhone ? 14 : 20, borderRadius: responsive.isSmallPhone ? 18 : 22 }]}>
            <View style={styles.featureCircle}>
              <Text style={styles.featureInitials}>AL</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureLabel}>ALPFA NJIT</Text>
              <Text style={[styles.featureTitle, { fontSize: responsive.isSmallPhone ? 17 : 20 }]}>Leadership in action.</Text>
              <Text style={[styles.featureText, { fontSize: responsive.isSmallPhone ? 10 : 11 }]}>Each E-Board member brings unique skills and perspectives to our community.</Text>
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

const createStyles = (colors: ThemePalette) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: 20,
    paddingBottom: 50,
  },
  eyebrow: {
    color: '#6E1B2D',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 35,
    fontWeight: '900',
    marginTop: 8,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  subtitleSecondary: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    fontStyle: 'italic',
  },
  header: {
  },
  featureCard: {
    marginTop: 22,
    backgroundColor: colors.surface,
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
    flexShrink: 0,
  },
  featureInitials: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 22,
  },
  featureContent: {
    flex: 1,
    marginLeft: 14,
    minWidth: 0,
  },
  featureLabel: {
    color: '#6E1B2D',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  featureTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 6,
  },
  featureText: {
    color: colors.textSecondary,
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
    paddingHorizontal: 2,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    flexShrink: 1,
  },
  memberCount: {
    color: '#6E1B2D',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 12,
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