import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ALPFA_LOGO = require('../assets/images/NJITalpfa logo (2).png');
const WHITE_LOCKUP = require('../assets/images/NJITalpfa Logo.pdf (7).png');

const TOTAL_MS = 10000;
const NAVY = '#050A16';
const NAVY_DEEP = '#02040A';
const RED = '#E3212B';
const WHITE = '#F5F6F8';
const CREAM = '#F7F2E9';
const INK = '#1A1A2E';

type Props = {
  onAnimationComplete?: () => void;
};

export default function ALPFALoadingScreen({ onAnimationComplete }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);

  const timeline = useRef(new Animated.Value(0)).current;
  const revealWidth = useRef(new Animated.Value(0)).current;
  const stageScale = useRef(new Animated.Value(1)).current;
  const bumpScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => mounted && setReducedMotion(enabled))
      .catch(() => mounted && setReducedMotion(false));

    const subscription = AccessibilityInfo.addEventListener?.('reduceMotionChanged', setReducedMotion);
    return () => {
      mounted = false;
      subscription?.remove?.();
    };
  }, []);

  const logoWidth = Math.min(width * 0.64, 280);
  const logoHeight = logoWidth;
  const safeTop = insets.top;
  const safeBottom = insets.bottom;

  useEffect(() => {
    if (reducedMotion === null) return;

    if (reducedMotion) {
      revealWidth.setValue(logoWidth);
      stageScale.setValue(1);
      bumpScale.setValue(1);

      const reduced = Animated.sequence([
        Animated.delay(450),
        Animated.timing(timeline, {
          toValue: 0.86,
          duration: 700,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(500),
        Animated.timing(timeline, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]);

      reduced.start(({ finished }) => {
        if (finished) onAnimationComplete?.();
      });
      return () => reduced.stop();
    }

    const master = Animated.timing(timeline, {
      toValue: 1,
      duration: TOTAL_MS,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    const reveal = Animated.timing(revealWidth, {
      toValue: logoWidth,
      duration: 2000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });

    const zoomEase = Easing.bezier(0.45, 0.02, 0.8, 0.35);
    const scaleSequence = Animated.sequence([
      Animated.timing(stageScale, { toValue: 1.02, duration: 2000, easing: zoomEase, useNativeDriver: true }),
      Animated.timing(stageScale, { toValue: 1.15, duration: 2500, easing: zoomEase, useNativeDriver: true }),
      Animated.timing(stageScale, { toValue: 1.6, duration: 1500, easing: zoomEase, useNativeDriver: true }),
      Animated.timing(stageScale, { toValue: 2.6, duration: 1000, easing: zoomEase, useNativeDriver: true }),
      Animated.timing(stageScale, { toValue: 4.2, duration: 600, easing: zoomEase, useNativeDriver: true }),
      Animated.timing(stageScale, { toValue: 7, duration: 400, easing: zoomEase, useNativeDriver: true }),
      Animated.timing(stageScale, { toValue: 9, duration: 300, easing: zoomEase, useNativeDriver: true }),
      Animated.delay(1700),
    ]);

    const bumpSequence = Animated.sequence([
      Animated.delay(2500),
      Animated.timing(bumpScale, { toValue: 1.16, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(bumpScale, { toValue: 0.97, duration: 400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(bumpScale, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.delay(6400),
    ]);

    const run = Animated.parallel([master, reveal, scaleSequence, bumpSequence]);
    run.start(({ finished }) => {
      if (finished) onAnimationComplete?.();
    });

    return () => run.stop();
  }, [bumpScale, logoWidth, onAnimationComplete, reducedMotion, revealWidth, stageScale, timeline]);

  const creamOpacity = timeline.interpolate({
    inputRange: [0, 0.72, 0.82, 1],
    outputRange: [0, 0, 1, 1],
    extrapolate: 'clamp',
  });

  const logoOpacity = timeline.interpolate({
    inputRange: [0, 0.76, 0.83, 1],
    outputRange: [1, 1, 0, 0],
    extrapolate: 'clamp',
  });

  const glowOpacity = timeline.interpolate({
    inputRange: [0, 0.18, 0.25, 0.28, 0.36, 0.6, 0.76, 0.83, 1],
    outputRange: [0.26, 0.42, 0.52, 0.95, 0.48, 0.62, 0.42, 0, 0],
    extrapolate: 'clamp',
  });

  const taglineOpacity = timeline.interpolate({
    inputRange: [0, 0.34, 0.40, 0.50, 0.58, 1],
    outputRange: [0, 0, 1, 1, 0, 0],
    extrapolate: 'clamp',
  });

  const taglineY = timeline.interpolate({
    inputRange: [0, 0.34, 0.40, 1],
    outputRange: [4, 4, 0, 0],
    extrapolate: 'clamp',
  });

  const lockupOpacity = timeline.interpolate({
    inputRange: [0, 0.37, 0.43, 0.50, 0.58, 1],
    outputRange: [0, 0, 1, 1, 0, 0],
    extrapolate: 'clamp',
  });

  const lockupY = timeline.interpolate({
    inputRange: [0, 0.37, 0.43, 1],
    outputRange: [6, 6, 0, 0],
    extrapolate: 'clamp',
  });

  const flashOpacity = timeline.interpolate({
    inputRange: [0, 0.74, 0.79, 0.88, 1],
    outputRange: [0, 0, 0.9, 0, 0],
    extrapolate: 'clamp',
  });

  const homeOpacity = timeline.interpolate({
    inputRange: [0, 0.76, 0.86, 0.96, 1],
    outputRange: [0, 0, 1, 1, 1],
    extrapolate: 'clamp',
  });

  const homeY = timeline.interpolate({
    inputRange: [0, 0.76, 0.86, 1],
    outputRange: [10, 10, 0, 0],
    extrapolate: 'clamp',
  });

  const homeLogoScale = timeline.interpolate({
    inputRange: [0, 0.75, 0.84, 0.90, 1],
    outputRange: [0.6, 0.6, 1.08, 1, 1],
    extrapolate: 'clamp',
  });

  const overlayOpacity = timeline.interpolate({
    inputRange: [0, 0.965, 1],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  const glowSize = Math.min(width * 0.82, 420);
  const outerSize = Math.max(width * 1.25, height * 0.72);
  const innerSize = Math.max(width * 0.86, 280);

  return (
    <Animated.View style={[styles.root, { width, height, opacity: overlayOpacity }]} pointerEvents="auto">
      <View style={styles.deepBackdrop} />
      <View
        style={[
          styles.radialOuter,
          {
            width: outerSize,
            height: outerSize,
            borderRadius: outerSize / 2,
            left: (width - outerSize) / 2,
            top: height * 0.40 - outerSize / 2,
          },
        ]}
      />
      <View
        style={[
          styles.radialInner,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            left: (width - innerSize) / 2,
            top: height * 0.40 - innerSize / 2,
          },
        ]}
      />

      <Animated.View style={[styles.creamLayer, { opacity: creamOpacity }]} />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.logoStage,
          {
            top: safeTop,
            bottom: safeBottom,
            transform: [{ scale: stageScale }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.neonGlow,
            {
              width: glowSize,
              height: glowSize,
              borderRadius: glowSize / 2,
              opacity: glowOpacity,
              transform: [{ scale: bumpScale }],
            },
          ]}
        />

        <Animated.View style={[styles.logoHolder, { opacity: logoOpacity, transform: [{ scale: bumpScale }] }]}>
          <View style={{ width: logoWidth, height: logoHeight }}>
            <Animated.View style={[styles.revealClip, { width: revealWidth, height: logoHeight }]}>
              <Image
                source={ALPFA_LOGO}
                resizeMode="contain"
                style={{ width: logoWidth, height: logoHeight }}
                accessibilityIgnoresInvertColors
              />
            </Animated.View>
          </View>
        </Animated.View>

        <Animated.Text
          style={[
            styles.tagline,
            {
              marginTop: Math.max(18, width * 0.05),
              opacity: taglineOpacity,
              transform: [{ translateY: taglineY }],
              fontSize: Math.max(10, Math.min(width * 0.028, 12)),
              letterSpacing: Math.max(2.1, Math.min(width * 0.0075, 3)),
            },
          ]}
        >
          FAMILIA  ·  LEADERSHIP  ·  LEGACY
        </Animated.Text>

        <Animated.View
          style={[
            styles.bottomLockup,
            {
              marginTop: Math.max(16, width * 0.04),
              opacity: lockupOpacity,
              transform: [{ translateY: lockupY }],
            },
          ]}
        >
          <Image source={WHITE_LOCKUP} resizeMode="contain" style={{ width: Math.min(width * 0.38, 165), height: 56 }} />
        </Animated.View>
      </Animated.View>

      <Animated.View style={[styles.flash, { opacity: flashOpacity }]} pointerEvents="none" />

      <Animated.View
        style={[
          styles.homePreview,
          {
            top: safeTop,
            bottom: safeBottom,
            opacity: homeOpacity,
            transform: [{ translateY: homeY }],
          },
        ]}
        pointerEvents="none"
      >
        <Animated.Image
          source={ALPFA_LOGO}
          resizeMode="contain"
          style={[
            styles.homeMark,
            {
              width: Math.min(width * 0.24, 100),
              height: Math.min(width * 0.24, 100),
              transform: [{ scale: homeLogoScale }],
            },
          ]}
        />
        <Text style={[styles.welcome, { fontSize: Math.max(14, Math.min(width * 0.038, 16)) }]}>Welcome to</Text>
        <Text style={[styles.brand, { fontSize: Math.max(28, Math.min(width * 0.078, 32)) }]}>ALPFA <Text style={styles.brandRed}>NJIT</Text></Text>
        <Text style={[styles.sub, { fontSize: Math.max(9, Math.min(width * 0.026, 11)) }]}>LEAD  ·  CONNECT  ·  BELONG</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    top: 0,
    overflow: 'hidden',
    zIndex: 99999,
    elevation: 99999,
    backgroundColor: NAVY_DEEP,
  },
  deepBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: NAVY_DEEP,
  },
  radialOuter: {
    position: 'absolute',
    backgroundColor: NAVY,
    opacity: 0.95,
  },
  radialInner: {
    position: 'absolute',
    backgroundColor: '#0A1330',
    opacity: 0.96,
  },
  creamLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: CREAM,
    zIndex: 6,
  },
  logoStage: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  neonGlow: {
    position: 'absolute',
    backgroundColor: Platform.select({
      ios: 'rgba(227,33,43,0.15)',
      android: 'rgba(227,33,43,0.12)',
      default: 'rgba(227,33,43,0.13)',
    }),
    shadowColor: RED,
    shadowOpacity: 0.8,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 0 },
  },
  logoHolder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealClip: {
    overflow: 'hidden',
  },
  tagline: {
    color: WHITE,
    fontWeight: '700',
    textAlign: 'center',
  },
  bottomLockup: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    zIndex: 20,
  },
  homePreview: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
  },
  homeMark: {
    marginBottom: 14,
  },
  welcome: {
    color: INK,
    fontWeight: '500',
    opacity: 0.75,
  },
  brand: {
    color: INK,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
    marginBottom: 10,
  },
  brandRed: {
    color: RED,
  },
  sub: {
    color: INK,
    fontWeight: '700',
    letterSpacing: 3,
    opacity: 0.6,
  },
});
