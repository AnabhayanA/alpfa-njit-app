import shadow from '../utils/shadow';
import { Platform } from 'react-native';
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

export default function EBoardCard({ member, animationDelay }: { member: EBoardMember; animationDelay: number }) {
  const responsive = useResponsive();
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [isFlipped, setIsFlipped] = useState(false);
  const flip = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay: animationDelay, useNativeDriver: Platform.OS !== 'web' }),
      Animated.spring(translateY, { toValue: 0, delay: animationDelay, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, [animationDelay, opacity, translateY]);

  const toggleFlip = () => {
    Animated.timing(flip, {
      toValue: isFlipped ? 0 : 1,
      duration: 520,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
    setIsFlipped((value) => !value);
  };

  const frontRotateY = flip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotateY = flip.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const frontOpacity = flip.interpolate({ inputRange: [0, 0.49, 0.5, 1], outputRange: [1, 1, 0, 0] });
  const backOpacity = flip.interpolate({ inputRange: [0, 0.49, 0.5, 1], outputRange: [0, 0, 1, 1] });
  const initials = member.name.split(' ').map((part) => part[0]).slice(0, 2).join('');
  const cardWidth = responsive.cardWidth;

  const openLink = (url?: string) => {
    if (url) Linking.openURL(url).catch(() => undefined);
  };

  return (
    <Animated.View style={[styles.wrapper, { width: cardWidth, opacity, transform: [{ translateY }] }]}>
      <View style={styles.cardStage}>
        <Animated.View
          style={[[styles.face, styles.front, { opacity: frontOpacity, transform: [{ perspective: 1000 }, { rotateY: frontRotateY }] }], { pointerEvents: isFlipped ? 'none' : 'auto' }]}
        >
          <TouchableOpacity style={styles.frontPressable} activeOpacity={0.92} onPress={toggleFlip}>
            <View style={styles.profileRow}>
              {member.image ? (
                <View style={styles.photoFrame}>
                  <Image source={member.image} style={styles.photo} resizeMode="cover" />
                </View>
              ) : (
                <View style={styles.placeholder}><Text style={styles.initials}>{initials}</Text></View>
              )}
              <View style={styles.identity}>
                <Text style={styles.name}>{member.name}</Text>
                <Text style={styles.position}>{member.position}</Text>
                <Text style={styles.meta}>{member.major} · {member.classYear}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#777B7D" />
            </View>
            <View style={styles.frontFooter}>
              <Text style={styles.hint}>Tap to view profile</Text>
              <Ionicons name="sync-outline" size={15} color="#8D102B" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[[styles.face, styles.back, { opacity: backOpacity, transform: [{ perspective: 1000 }, { rotateY: backRotateY }] }], { pointerEvents: isFlipped ? 'auto' : 'none' }]}
        >
          <TouchableOpacity style={styles.backHeader} activeOpacity={0.85} onPress={toggleFlip}>
            <View>
              <Text style={styles.backName}>{member.name}</Text>
              <Text style={styles.backPosition}>{member.position}</Text>
            </View>
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <ScrollView
            style={styles.detailsScroll}
            contentContainerStyle={styles.details}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            {member.bio && <Detail label="BIO" text={member.bio} />}
            <Detail label="GOAL" text={member.goal} />
            <Detail label="WHY ALPFA" text={member.whyAlpfa} />
            {member.funFact && <Detail label="FUN FACT" text={member.funFact} />}
          </ScrollView>

          {(member.linkedin || member.instagram || member.email) && (
            <View style={styles.socialRow}>
              {member.linkedin && <Social icon="logo-linkedin" label="LinkedIn" onPress={() => openLink(member.linkedin)} />}
              {member.instagram && <Social icon="logo-instagram" label="Instagram" onPress={() => openLink(member.instagram)} />}
              {member.email && <Social icon="mail" label="Email" onPress={() => openLink(`mailto:${member.email}`)} />}
            </View>
          )}
        </Animated.View>
      </View>
    </Animated.View>
  );
}

function Detail({ label, text }: { label: string; text: string }) {
  return (
    <View style={stylesStatic.detailBlock}>
      <Text style={stylesStatic.detailLabel}>{label}</Text>
      <Text style={stylesStatic.detailText}>{text}</Text>
    </View>
  );
}

function Social({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={stylesStatic.socialButton} onPress={onPress} activeOpacity={0.75}>
      <Ionicons name={icon} size={16} color="#FFFFFF" />
      <Text style={stylesStatic.socialText}>{label}</Text>
    </TouchableOpacity>
  );
}

const stylesStatic = StyleSheet.create({
  detailBlock: { marginBottom: 13 },
  detailLabel: { color: '#F2D7DF', fontSize: 9, fontWeight: '900', letterSpacing: 1.4, marginBottom: 5 },
  detailText: { color: 'rgba(255,255,255,0.88)', fontSize: 11, lineHeight: 17 },
  socialButton: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 7, paddingHorizontal: 10 },
  socialText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
});

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  wrapper: { marginBottom: 14 },
  cardStage: { height: 300 },
  face: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 18,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
    ...shadow('#4B392C', 0.12, 13, 0, 5),
    elevation: 4,
  },
  front: { backgroundColor: colors.surface },
  frontPressable: { flex: 1, padding: 14 },
  profileRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 13 },
  photoFrame: { width: 112, height: 184, borderRadius: 18, overflow: 'hidden', backgroundColor: '#EEE8DE', flexShrink: 0 },
  photo: { width: '100%', height: '100%' },
  placeholder: { width: 112, height: 184, borderRadius: 18, backgroundColor: '#EFE7DB', borderWidth: 1, borderColor: '#E0D4C4', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  initials: { color: '#8D102B', fontSize: 28, fontWeight: '900' },
  identity: { flex: 1, minWidth: 0 },
  name: { color: colors.textPrimary, fontSize: 18, lineHeight: 22, fontWeight: '900' },
  position: { color: '#8D102B', fontSize: 12, lineHeight: 17, fontWeight: '800', marginTop: 6 },
  meta: { color: colors.textSecondary, fontSize: 10, lineHeight: 15, marginTop: 8 },
  frontFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E7CFA5' },
  hint: { color: '#8D102B', fontSize: 10, fontWeight: '800' },
  back: { backgroundColor: '#0F102E', padding: 16 },
  backHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: 11, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.14)' },
  backName: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  backPosition: { color: '#F2D7DF', fontSize: 10, fontWeight: '700', marginTop: 3 },
  detailsScroll: { flex: 1, marginTop: 12 },
  details: { paddingBottom: 8 },
  socialRow: { flexDirection: 'row', justifyContent: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.14)', paddingTop: 4 },
});
