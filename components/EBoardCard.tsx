import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

interface EBoardMember {
  id: string;
  name: string;
  position: string;
  major: string;
  classYear: string;
  image?: any;
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
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const entranceOpacity = useRef(new Animated.Value(0)).current;
  const entranceTranslateY = useRef(new Animated.Value(30)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const shineOpacity = useRef(new Animated.Value(0)).current;

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
    if (url) {
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        }
      } catch (error) {
        console.warn(`Unable to open ${platform} link:`, error);
      }
    }
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: entranceOpacity,
          transform: [{ translateY: entranceTranslateY }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={toggleFlip}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
      >
        <Animated.View
          style={[
            styles.cardContainer,
            {
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
            <View style={styles.backContent}>
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
            </View>

            {/* Social links */}
            <View style={styles.socialSection}>
              <Text style={styles.socialLabel}>CONNECT</Text>
              <View style={styles.socialButtons}>
                {member.linkedin && (
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => handleLinkPress(member.linkedin, 'LinkedIn')}
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: 600,
    backgroundColor: 'transparent',
  },
  cardFace: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: 600,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },

  // FRONT CARD
  cardFront: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(110, 27, 45, 0.1)',
    padding: 24,
  },
  frontHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
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
    color: '#0F102E',
    letterSpacing: 0.5,
  },
  photoContainer: {
    position: 'relative',
    width: '100%',
    height: 280,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 18,
    backgroundColor: '#F6F6F8',
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
    backgroundColor: '#F6F6F8',
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
    color: '#0F102E',
    marginBottom: 4,
  },
  position: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6E1B2D',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
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
    color: '#0F102E',
  },
  frontBottom: {
    gap: 10,
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
    padding: 24,
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
    flex: 1,
    gap: 12,
    marginBottom: 14,
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