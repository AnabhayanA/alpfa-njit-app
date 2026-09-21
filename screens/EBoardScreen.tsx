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
    major: 'Information Systems',
    classYear: '2027',
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
    classYear: '2027',
    image: require('../assets/images/Renzo-Rey.jpg'),
    linkedin: 'https://www.linkedin.com/in/renzo-rey/',
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
    image: require('../assets/images/Brandon-Palacios.jpg'),
    linkedin: 'https://www.linkedin.com/in/brandon-palacios-5827aa244/',
    bio: 'Brandon is a Business Administration student at NJIT with a concentration in Marketing, graduating in 2026. He brings hands-on industry experience from Louis Vuitton, where he progressed from Operations Associate to Acting Operations Manager, leading a 14-person team. He also completed a Retail Marketing Strategy internship with Giorgio Armani, giving him firsthand exposure to luxury brand positioning and merchandising. He currently serves as ALPFA NJIT\'s Marketing Coordinator and is passionate about combining operational precision with creative strategy to help ALPFA grow its presence on campus.',
    goal: 'As Director of Marketing Operations this semester, my goal is to strengthen ALPFA NJIT\'s brand consistency and visibility — from social media and event promotion to member communications — while streamlining how the marketing team plans and executes campaigns. I want to bring the same operational discipline I\'ve built in retail management to our internal workflows, and the same creative eye I\'ve developed through my marketing experience to how we present ALPFA to the NJIT community, so we can grow membership and elevate the org\'s professional image.',
    whyAlpfa: 'ALPFA gives me a meaningful way to combine marketing strategy, operations, and community-building while helping the organization grow on campus.',
    role: 'Lead marketing operations, strengthen brand consistency, and coordinate campaigns that elevate ALPFA NJIT\'s visibility and professional image.',
  },
  {
    name: 'Jose Trujillo',
    position: 'Director of Fundraising',
    major: 'Fintech',
    classYear: '2027',
    image: require('../assets/images/Jose-Trujillo.jpg'),
    linkedin: 'https://www.linkedin.com/in/jhtrujillo/',
    bio: 'I am a junior majoring in Fintech, Salvadoran, and enjoy working with others who have the same shared goals.',
    goal: 'To build on existing connections and continue building connections with alumni, professionals, local businesses, and other chapters to create more fundraising opportunities through events and increase funding possibilities.',
    whyAlpfa: 'ALPFA brings together people with shared goals and creates opportunities to build meaningful relationships across students, professionals, alumni, and chapters.',
    role: 'Build fundraising partnerships and create events that expand opportunities and strengthen ALPFA NJIT\'s funding.',
  },
  {
    name: 'Anwesha Biswal',
    position: 'Secretary',
    major: 'Business',
    classYear: '2029',
    image: require('../assets/images/Anwesha-Biswal.jpg'),
    linkedin: 'https://www.linkedin.com/in/anwesha-b-673308322/',
    bio: 'I am a sophomore majoring in business. I am the secretary of ALPFA. In high school, I was president and secretary of FBLA and helped students build business skills while also planning and organizing speaker, fundraising, and mock competition events. I was also a karate instructor, working alongside senior instructors with different skill sets and helping students of various ages. I aspire to be a person who can help other people by supporting and empowering them.',
    goal: 'My goal for ALPFA is to use my skills to create a strong foundation for this chapter, ensuring we can stay on top of everything that needs to be done. I also want this club to run smoothly so everyone who joins can create long-lasting memories.',
    whyAlpfa: 'ALPFA gives me the opportunity to support and empower others while helping create a strong, organized, and welcoming chapter community.',
    role: 'Manage chapter organization and communication while helping ALPFA NJIT run smoothly for every member.',
  },
  {
    name: 'Ingrid Martinez-Rojas',
    position: 'Chapter President',
    major: 'Business Management, Marketing',
    classYear: '2026',
    image: require('../assets/images/Ingrid-Martinez-Rojas.jpg'),
    linkedin: 'https://www.linkedin.com/in/ingridmartinezrojas/',
    bio: "Ingrid Martinez-Rojas is the President of ALPFA at NJIT and a Business Management student concentrating in Marketing. A first-generation college student, she is passionate about creating opportunities for students through professional development, networking, and community. Ingrid has experience in sales and financial services and is committed to helping ALPFA members build confidence, meaningful connections, and successful careers.",
    goal: "My goal for ALPFA is to grow our chapter by increasing membership and getting more students actively involved. I want to build a strong, engaged community where students feel connected, supported, and excited to take advantage of the professional and personal opportunities ALPFA has to offer.",
    whyAlpfa: "ALPFA creates a community where students can build confidence, meaningful connections, and successful careers through professional development and networking.",
    role: "Lead the chapter, grow membership, and build an engaged community that helps students take advantage of ALPFA opportunities.",
  },
  {
    name: 'Andrea Camila Pardo',
    position: 'Vice President',
    major: 'Data Science, Statistics Track',
    classYear: '2027',
    image: require('../assets/images/Andrea-Camila-Pardo.jpg'),
    linkedin: 'https://www.linkedin.com/in/andreacpardo/',
    bio: "I was born and raised in Ecuador. I am a Data Science major in the Statistics track, and I am also an EOP and McNair scholar. I met ALPFA and it immediately became my family, and I have not left since then.",
    goal: "My goal for ALPFA is to grow our membership while maintaining the quality and family spirit that make our community special.",
    whyAlpfa: "ALPFA immediately became my family and continues to provide a supportive community where members can grow together.",
    role: "Support chapter leadership, grow membership, and help preserve the quality and family-centered culture of ALPFA NJIT.",
  },
  {
    name: 'Angelo Bustamante',
    position: 'Treasurer',
    major: 'Web and Information Systems',
    classYear: '2026',
    image: require('../assets/images/Angelo-Bustamante.jpg'),
    linkedin: 'https://www.linkedin.com/in/angelobustamante/',
    bio: 'I am a senior studying Web and Information Systems, I am half Uruguayan and half peruvian ',
    goal: 'To keep all finances organized and manage the budget responsibly, and help increase funding for the future ',
    whyAlpfa: '',
    role: "Responsible for managing the chapter's finances, budgeting, and financial planning to ensure the organization's sustainability and growth."
  },
  {
    name: 'Andrey Diaz-Ortega',
    position: 'Director of Community Service',
    major: 'Computer Science',
    classYear: '2026',
    linkedin: 'https://www.linkedin.com/in/aad94/',
    image: require('../assets/images/Andrey-Diaz-Ortega.jpg'),
    bio: 'Senior in CS with a research focus in AI development, Im Puerto Rican and Ecuadorian and I love hoops. I am passionate about helping others and giving back to the community.',
    goal: 'To solidify both volunteer and professional relationships within and outside of our ALPFA chapter. My goal is to be of help in any way possible to my fellow E-board members and contribute through community service.',
    whyAlpfa: 'I joined ALPFA to connect with driven students and professionals, expand my network, and develop the leadership, business, and technical skills that will help me grow professionally.',
    role: 'Responsible for organizing and leading community service initiatives and volunteer opportunities.',
  },
  {
    name: 'Justin Aguerta',
    position: 'Director Of Membership',
    major: 'Financial Technology',
    classYear: '2026',
    image: require('../assets/images/Justin-Aguerta.jpg'),
    linkedin: 'https://www.linkedin.com/in/justin-argueta-391b81281/',
    bio:"I’m a senior majoring in financial technology, with minors in data analytics and IT. I’m half Honduran and half Ecuadorian, and growing up with both backgrounds has shaped how I see things and the different perspectives I bring to the table. I’m someone who really values growth, not just for myself, but for the people around me too. I enjoy helping others improve, whether that’s through mentorship, leading by example, or working alongside them and figuring things out together. As part of ALPFA’s board, I want to continue supporting my fellow board members and members while building on everything we’ve already accomplished.",
    goal: 'My goal within ALPFA is to help our board and members continue growing from where we already are. I don’t want to completely change what we’re doing but instead build on what’s already working and find ways to make it even better. I’d like to bring a techy or data-driven approach to how we keep members engaged, support their development, and improve as an organization. At the end of the day, I want ALPFA to be a space where we’re constantly helping each other grow and pushing each other to become better.',
    whyAlpfa: 'I joined ALPFA to connect with driven students and professionals, expand my network, and develop the leadership, business, and technical skills that will help me grow professionally.',
    role: 'Responsible for recruiting and retaining members, as well as organizing events and activities that promote engagement and development.',
  },
  {
    name: 'Nayeli Moranchel',
    position: 'Director of Events',
    major: 'Management Information Systems',
    classYear: '2026',
    image: require('../assets/images/Nayeli-Morachel.jpg'),
    linkedin: 'https://www.linkedin.com/in/nayeli-moranchel/',
    bio: 'I am a senior majoring in Management Information Systems. I am Mexican and Salvadoran.',
    goal: 'I aspire to help ALPFA NJIT grow and establish itself within the university. By organizing memorable events where students can learn and connect with professionals and students. I want to help students who may be struggling with how to prepare for a career after college and create an environment where students are not afraid to ask questions. ',
    whyAlpfa: 'I joined ALPFA to connect with driven students and professionals, expand my network, and develop the leadership, business, and technical skills that will help me grow professionally.',
    role: 'Responsible for planning and executing events that promote engagement and development within the organization.',
  },
  {
    name: 'Diego Guevara',
    position: 'IT Committee Member',
    major: 'Business & Information Systems',
    classYear: '2028',
    image: require('../assets/images/Diego-Guevara.jpg'),
  linkedin: 'https://www.linkedin.com/in/diegoguevara2093/',
    bio: "Diego Guevara is a junior majoring in Business & Information Systems at NJIT. He is of Ecuadorian and Chinese heritage and is passionate about technology, business, and finding ways to use both to create meaningful solutions. As a member of ALPFA’s IT Committee, he is helping support the development and launch of the organization’s official app. He also enjoys developing his leadership, technical, and professional skills while connecting with others who share similar career ambitions.",
    goal: 'My goal within ALPFA is to help strengthen the organization’s digital presence through technology while also building meaningful relationships with other members. I want to contribute to projects such as the ALPFA app, develop my leadership and technical skills, and help create tools and opportunities that make it easier for members to connect, grow professionally, and stay involved with the organization.',
    whyAlpfa: 'I joined ALPFA to connect with driven students and professionals, expand my network, and develop the leadership, business, and technical skills that will help me grow professionally.',
    role: 'Helping develop and launch ALPFA NJIT’s official app while supporting the organization’s technology and digital initiatives.',
  },


].sort((a, b) => {
  const order = [
    'Chapter President',
    'Vice President',
    'Secretary',
    'Treasurer',
    'Director of Professional Development',
    'Director of Marketing Operations',
    'Director Of Membership',
    'Director of Community Service',
    'Director of Events',
    'Director of Fundraising',
    'Director Of IT',
    'IT Committee Member',
  ];
  return order.indexOf(a.position) - order.indexOf(b.position);
}).map((member, index) => ({
  ...member,
  id: String(index + 1).padStart(3, '0'),
}));

export default function EBoardScreen() {
  const navigation = useNavigation<EBoardNavigationProp>();
  const responsive = useResponsive();
  const { colors, isDark } = useTheme();
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
      <View pointerEvents="none" style={styles.liquidLayer}>
        <View style={[styles.liquidOrb, styles.liquidRed, isDark && styles.liquidRedDark]} />
        <View style={[styles.liquidOrb, styles.liquidBlue, isDark && styles.liquidBlueDark]} />
        <View style={[styles.liquidOrb, styles.liquidPurple, isDark && styles.liquidPurpleDark]} />
        <View style={[styles.liquidOrb, styles.liquidCyan, isDark && styles.liquidCyanDark]} />
      </View>
      <ScrollView
        style={styles.foreground}
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
            <Text style={[styles.title, { fontSize: responsive.isSmallPhone ? 25 : 28 }]}>Meet the E-Board</Text>
            <Text style={[styles.subtitle, { fontSize: responsive.isSmallPhone ? 11 : 12 }]}>The student leaders building community at NJIT.</Text>
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

          <Text style={styles.follow}>Follow @alpfanjit</Text>
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
  foreground: { flex: 1, backgroundColor: 'transparent' },
  liquidLayer: { ...StyleSheet.absoluteFill },
  liquidOrb: { position: 'absolute', borderRadius: 999 },
  liquidRed: { width: 320, height: 320, right: -145, top: 45, backgroundColor: 'rgba(225,32,68,0.27)' },
  liquidBlue: { width: 310, height: 310, left: -155, top: 390, backgroundColor: 'rgba(31,117,255,0.23)' },
  liquidPurple: { width: 330, height: 330, right: -165, top: 850, backgroundColor: 'rgba(126,73,255,0.21)' },
  liquidCyan: { width: 300, height: 300, left: -150, top: 1320, backgroundColor: 'rgba(0,194,255,0.19)' },
  liquidRedDark: { backgroundColor: 'rgba(255,39,82,0.32)' },
  liquidBlueDark: { backgroundColor: 'rgba(25,108,255,0.29)' },
  liquidPurpleDark: { backgroundColor: 'rgba(142,77,255,0.27)' },
  liquidCyanDark: { backgroundColor: 'rgba(0,207,255,0.23)' },
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
  follow: { color: '#8D102B', fontSize: 11, fontWeight: '800', textAlign: 'center', marginTop: 22, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#E7CFA5' },
});
