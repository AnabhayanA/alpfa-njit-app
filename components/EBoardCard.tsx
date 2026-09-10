import React, { useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useResponsive from '../utils/responsive';
import useTheme from '../utils/useTheme';
import { ThemePalette } from '../constants/theme';

interface EBoardMember {
  id: string;
  name: string;
  position: string;
  major: string;
  classYear: string;
  image?: any;
  bio?: string;
  goal: string;
  whyAlpfa: string;
  role: string;
  funFact?: string;
  linkedin?: string;
  instagram?: string;
  email?: string;
}

interface EBoardCardProps {
  member: EBoardMember;
  animationDelay: number;
}

export default function EBoardCard({ member, animationDelay }: EBoardCardProps) {
  const responsive = useResponsive();
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const entranceOpacity = useRef(new Animated.Value(0)).current;
  const entranceTranslateY = useRef(new Animated.Value(30)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const shineOpacity = useRef(new Animated.Value(0)).current;
  const backScrollRef = useRef<ScrollView>(null);
  const backScrollOffset = useRef(0);
  const linkPressed = useRef(false);

  // Entrance animation
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(entranceOpacity, {
        toValue: 1,
        duration: 500,
        delay: animationDelay,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(entranceTranslateY, {
        toValue: 0,
        speed: 8,
        bounciness: 4,
        delay: animationDelay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handle press with scale animation
  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.97,
      speed: 12,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      speed: 12,
      useNativeDriver: true,
    }).start();
  };

  // 3D Flip animation with shine effect
  const toggleFlip = () => {
    // Shine animation
    Animated.sequence([
      Animated.timing(shineOpacity, {
        toValue: 0.6,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(shineOpacity, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    // Flip animation
    Animated.timing(flipAnimation, {
      toValue: isFlipped ? 0 : 1,
      duration: 600,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  // Front card rotation: 0° → 90° (disappears)
  const frontRotateY = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '90deg', '90deg'],
  });

  // Front card scale for depth
  const frontScale = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.88, 0.88],
  });

  // Front card opacity
  const frontOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.35, 0.5, 1],
    outputRange: [1, 1, 0, 0],
  });

  // Back card rotation: -90° → 0° (appears)
  const backRotateY = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['-90deg', '-90deg', '0deg'],
  });

  // Back card scale for depth
  const backScale = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.88, 0.88, 1],
  });

  // Back card opacity
  const backOpacity = flipAnimation.interpolate({
    inputRange: [0, 0.5, 0.65, 1],
    outputRange: [0, 0, 1, 1],
  });

  const handleLinkPress = async (url: string | undefined, platform: string) => {
    linkPressed.current = true;

    if (!url) {
      return;
    }

    try {
      await Linking.openURL(url);
    } catch (error) {
      console.warn(`Unable to open ${platform} link:`, error);
    }
  };

  const handleCardPress = () => {
    if (linkPressed.current) {
      linkPressed.current = false;
      return;
    }
    toggleFlip();
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          marginBottom: responsive.responsiveSpacing.md,
        },
        {
          opacity: entranceOpacity,
          transform: [{ translateY: entranceTranslateY }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={handleCardPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
      >
        <Animated.View
          style={[
            styles.cardContainer,
            {
              width: responsive.cardWidth,
              transform: [{ scale: pressScale }],
            },
          ]}
        >
          {/* FRONT CARD */}
          <Animated.View
            style={[
              styles.cardFace,
              styles.cardFront,
              {
                width: responsive.cardWidth,
              },
              {
                opacity: frontOpacity,
                transform: [
                  { perspective: 1000 },
                  { rotateY: frontRotateY },
                  { scale: frontScale },
                ],
              },
            ]}
          >
            {/* Header with year */}
            <View style={styles.frontHeader}>
              <Text style={styles.branding}>ALPFA NJIT</Text>
              <Text style={styles.year}>{member.classYear}</Text>
            </View>

            {/* Headshot area */}
            <View style={styles.photoContainer}>
              {member.image ? (
                <Image source={member.image} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="image" size={60} color="rgba(110, 27, 45, 0.2)" />
                </View>
              )}
              {/* Gradient overlay */}
              <View style={styles.photoGradient} />
            </View>

            {/* Info section with gradient overlap */}
            <View style={styles.frontInfoSection}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.position}>{member.position}</Text>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>MAJOR</Text>
                  <Text style={styles.infoValue}>{member.major}</Text>
                </View>
              </View>
            </View>

            {/* Bottom accent */}
            <View style={styles.frontBottom}>
              <View style={styles.accentLine} />
              <Text style={styles.tapHint}>TAP TO DISCOVER</Text>
            </View>

            {/* Shine effect */}
            <Animated.View
              style={[
                styles.shine,
                {
                  opacity: shineOpacity,
                },
              ]}
            />
          </Animated.View>

          {/* BACK CARD */}
          <Animated.View
            style={[
              styles.cardFace,
              styles.cardBack,
              {
                width: responsive.cardWidth,
              },
              {
                opacity: backOpacity,
                transform: [
                  { perspective: 1000 },
                  { rotateY: backRotateY },
                  { scale: backScale },
                ],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.backHeader}>
              <View>
                <Text style={styles.backBranding}>ALPFA NJIT</Text>
                <Text style={styles.leadershipLabel}>LEADERSHIP PROFILE</Text>
              </View>
              <Text style={styles.backCardNumber}>#{member.id}</Text>
            </View>

            {/* Content sections */}
            <ScrollView
              ref={backScrollRef}
              style={styles.backContentScroll}
              contentContainerStyle={styles.backContent}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              onScroll={(event) => {
                backScrollOffset.current = event.nativeEvent.contentOffset.y;
              }}
              scrollEventThrottle={16}
            >
              {/* Bio */}
              {member.bio && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>ABOUT ME</Text>
                  <Text style={styles.sectionText}>{member.bio}</Text>
                </View>
              )}

              {/* Mission */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>🎯 MY ALPFA GOAL</Text>
                <Text style={styles.sectionText}>{member.goal}</Text>
              </View>

              {/* Why ALPFA */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>💙 WHY ALPFA?</Text>
                <Text style={styles.sectionText}>{member.whyAlpfa}</Text>
              </View>

              {/* My Role */}
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>⚡ MY ROLE</Text>
                <Text style={styles.sectionText}>{member.role}</Text>
              </View>

              {/* Fun Fact */}
              {member.funFact && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>✨ FUN FACT</Text>
                  <Text style={styles.sectionText}>{member.funFact}</Text>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.scrollHint}
              onPress={(event) => {
                event.stopPropagation();
                backScrollRef.current?.scrollTo({
                  y: backScrollOffset.current + 150,
                  animated: true,
                });
              }}
              accessibilityRole="button"
              accessibilityLabel="Show more profile details"
            >
              <Ionicons name="chevron-down" size={16} color="#F2D7DF" />
            </TouchableOpacity>

            {/* Social links */}
            <View style={styles.socialSection}>
              <Text style={styles.socialLabel}>CONNECT</Text>
              <View style={styles.socialButtons}>
                {member.linkedin && (
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPressIn={(event) => event.stopPropagation()}
                    onPress={() => handleLinkPress(member.linkedin, 'LinkedIn')}
                    accessibilityRole="link"
                    accessibilityLabel={`Open ${member.name}'s LinkedIn profile`}
                  >
                    <Ionicons name="logo-linkedin" size={16} color="#FFFFFF" />
                    <Text style={styles.socialButtonText}>LinkedIn</Text>
                  </TouchableOpacity>
                )}
                {member.instagram && (
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => handleLinkPress(member.instagram, 'Instagram')}
                  >
                    <Ionicons name="logo-instagram" size={16} color="#FFFFFF" />
                    <Text style={styles.socialButtonText}>Instagram</Text>
                  </TouchableOpacity>
                )}
                {member.email && (
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => handleLinkPress(`mailto:${member.email}`, 'Email')}
                  >
                    <Ionicons name="mail" size={16} color="#FFFFFF" />
                    <Text style={styles.socialButtonText}>Email</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Bottom accent */}
            <View style={styles.backBottom}>
              <View style={styles.accentLine} />
              <Text style={styles.flipHint}>TAP TO FLIP BACK</Text>
            </View>

            {/* Shine effect */}
            <Animated.View
              style={[
                styles.shine,
                {
                  opacity: shineOpacity,
                },
              ]}
            />
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
      {member.linkedin && (
        <Animated.View
          pointerEvents={isFlipped ? 'none' : 'auto'}
          style={[styles.linkedinOverlay, { opacity: frontOpacity }]}
        >
          <TouchableOpacity
            style={styles.linkedinIconButton}
            hitSlop={12}
            onPress={() => handleLinkPress(member.linkedin, 'LinkedIn')}
            accessibilityRole="link"
            accessibilityLabel={`Open ${member.name}'s LinkedIn profile`}
          >
            <Ionicons name="logo-linkedin" size={17} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const createStyles = (colors: ThemePalette) => StyleSheet.create({
  cardWrapper: {
    alignItems: 'center',
    marginBottom: 28,
  },
  cardContainer: {
    height: 600,
    backgroundColor: 'transparent',
  },
  cardFace: {
    position: 'absolute',
    height: 600,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  // FRONT CARD
  cardFront: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: 'rgba(110, 27, 45, 0.1)',
    padding: 22,
  },
  frontHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  branding: {
    fontSize: 11,
    fontWeight: '900',
    color: '#6E1B2D',
    letterSpacing: 1.5,
  },
  year: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  photoContainer: {
    position: 'relative',
    width: '100%',
    height: 270,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 18,
    backgroundColor: colors.backgroundAlt,
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundAlt,
  },
  photoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0)',
  },
  frontInfoSection: {
    marginBottom: 14,
  },
  memberName: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 4,
    flexShrink: 1,
  },
  position: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6E1B2D',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    flexShrink: 1,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6E1B2D',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  frontBottom: {
    gap: 10,
  },
  linkedinOverlay: {
    position: 'absolute',
    right: 24,
    bottom: 24,
  },
  linkedinIconButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A66C2',
  },
  accentLine: {
    height: 2,
    backgroundColor: '#6E1B2D',
    borderRadius: 1,
    width: 32,
  },
  tapHint: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6E1B2D',
    letterSpacing: 0.8,
  },

  // BACK CARD
  cardBack: {
    backgroundColor: '#0F102E',
    padding: 22,
  },
  backHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backBranding: {
    fontSize: 11,
    fontWeight: '900',
    color: '#F2D7DF',
    letterSpacing: 1.5,
  },
  leadershipLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6E1B2D',
    letterSpacing: 1,
    marginTop: 2,
  },
  backCardNumber: {
    fontSize: 10,
    fontWeight: '900',
    color: '#6E1B2D',
    letterSpacing: 0.5,
  },
  backContent: {
    gap: 14,
    paddingRight: 8,
    paddingBottom: 2,
  },
  backContentScroll: {
    flex: 1,
    marginBottom: 14,
  },
  scrollHint: {
    alignSelf: 'center',
    width: 28,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.72,
  },
  section: {
    gap: 4,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F2D7DF',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 16,
  },
  socialSection: {
    gap: 8,
  },
  socialLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F2D7DF',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6E1B2D',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 5,
  },
  socialButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  backBottom: {
    gap: 8,
    marginTop: 10,
  },
  flipHint: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  // Shine effect
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 24,
  },
});