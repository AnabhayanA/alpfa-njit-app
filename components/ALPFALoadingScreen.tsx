import React, { useEffect, useMemo, useRef, useState } from 'react';
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

import LightStreak from './LightStreak';
import StarField from './StarField';

const ALPFA_LOGO = require('../assets/images/NJITalpfa logo (2).png');
const NAVY = '#030817';
const DURATION = 9000;

const T = {
  starsEnd: 0.4 / 9,
  logoStart: 0.4 / 9,
  travelStart: 1 / 9,
  hero: 4 / 9,
  pushStart: 5 / 9,
  pushPeak: 6.5 / 9,
  sweep: 7 / 9,
  reveal: 7.5 / 9,
  end: 1,
};

const STREAKS = [
  // Early hyperspace pass: starts around 1s and stays lively through 4s.
  { startX: -0.34, startY: 0.18, angle: '16deg', lengthRatio: 0.30, thickness: 1.0, start: 0.12, peak: 0.18, end: 0.28, travelX: 1.18, travelY: 0.10, intensity: 0.72 },
  { startX: 1.02, startY: 0.20, angle: '-17deg', lengthRatio: 0.34, thickness: 1.2, start: 0.14, peak: 0.20, end: 0.30, travelX: -1.18, travelY: 0.08, intensity: 0.82 },
  { startX: -0.30, startY: 0.38, angle: '7deg', lengthRatio: 0.26, thickness: 1.0, start: 0.18, peak: 0.24, end: 0.34, travelX: 1.05, travelY: 0.02, intensity: 0.68 },
  { startX: 1.04, startY: 0.43, angle: '-8deg', lengthRatio: 0.28, thickness: 1.0, start: 0.20, peak: 0.26, end: 0.36, travelX: -1.08, travelY: 0.01, intensity: 0.76 },
  { startX: -0.32, startY: 0.68, angle: '-16deg', lengthRatio: 0.30, thickness: 1.1, start: 0.24, peak: 0.30, end: 0.40, travelX: 1.14, travelY: -0.10, intensity: 0.75 },
  { startX: 1.01, startY: 0.70, angle: '16deg', lengthRatio: 0.32, thickness: 1.2, start: 0.26, peak: 0.32, end: 0.42, travelX: -1.14, travelY: -0.10, intensity: 0.84 },
  { startX: 0.10, startY: -0.13, angle: '58deg', lengthRatio: 0.25, thickness: 1.0, start: 0.28, peak: 0.34, end: 0.43, travelX: 0.46, travelY: 0.86, intensity: 0.66 },
  { startX: 0.68, startY: -0.12, angle: '122deg', lengthRatio: 0.25, thickness: 1.0, start: 0.30, peak: 0.36, end: 0.44, travelX: -0.46, travelY: 0.86, intensity: 0.66 },

  // Final burst: begins immediately at 5s and gets much faster/intense.
  { startX: -0.36, startY: 0.15, angle: '17deg', lengthRatio: 0.40, thickness: 1.6, start: 0.56, peak: 0.60, end: 0.70, travelX: 1.34, travelY: 0.14, intensity: 1.00 },
  { startX: 1.04, startY: 0.16, angle: '-18deg', lengthRatio: 0.42, thickness: 1.7, start: 0.57, peak: 0.61, end: 0.70, travelX: -1.34, travelY: 0.12, intensity: 1.00 },
  { startX: -0.38, startY: 0.48, angle: '5deg', lengthRatio: 0.38, thickness: 1.6, start: 0.59, peak: 0.63, end: 0.72, travelX: 1.34, travelY: 0.00, intensity: 1.00 },
  { startX: 1.06, startY: 0.50, angle: '-6deg', lengthRatio: 0.38, thickness: 1.6, start: 0.60, peak: 0.64, end: 0.73, travelX: -1.34, travelY: 0.00, intensity: 1.00 },
  { startX: -0.34, startY: 0.76, angle: '-17deg', lengthRatio: 0.40, thickness: 1.7, start: 0.61, peak: 0.65, end: 0.74, travelX: 1.34, travelY: -0.14, intensity: 1.00 },
  { startX: 1.02, startY: 0.76, angle: '18deg', lengthRatio: 0.42, thickness: 1.7, start: 0.62, peak: 0.66, end: 0.75, travelX: -1.34, travelY: -0.14, intensity: 1.00 },
  { startX: 0.12, startY: -0.15, angle: '60deg', lengthRatio: 0.32, thickness: 1.5, start: 0.63, peak: 0.67, end: 0.75, travelX: 0.58, travelY: 1.02, intensity: 0.95 },
  { startX: 0.68, startY: -0.15, angle: '120deg', lengthRatio: 0.32, thickness: 1.5, start: 0.64, peak: 0.68, end: 0.76, travelX: -0.58, travelY: 1.02, intensity: 0.95 },
  { startX: 0.12, startY: 1.02, angle: '-60deg', lengthRatio: 0.34, thickness: 1.5, start: 0.65, peak: 0.69, end: 0.77, travelX: 0.58, travelY: -1.04, intensity: 0.95 },
  { startX: 0.68, startY: 1.02, angle: '60deg', lengthRatio: 0.34, thickness: 1.5, start: 0.66, peak: 0.70, end: 0.78, travelX: -0.58, travelY: -1.04, intensity: 0.95 },
] as const;

type Props = {
  onAnimationComplete?: () => void;
};

export default function ALPFALoadingScreen({ onAnimationComplete }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);

  const timeline = useRef(new Animated.Value(0)).current;
  const reducedOpacity = useRef(new Animated.Value(0)).current;

  const safeHeight = Math.max(1, height - insets.top - insets.bottom);
  const heroWidth = Math.min(width * 0.52, 360);
  const streakThickness = Math.max(2, Math.min(width * 0.0055, 3.2));

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReducedMotion(enabled);
      })
      .catch(() => {
        if (mounted) setReducedMotion(false);
      });

    const subscription = AccessibilityInfo.addEventListener?.('reduceMotionChanged', setReducedMotion);

    return () => {
      mounted = false;
      subscription?.remove?.();
    };
  }, []);

  useEffect(() => {
    if (reducedMotion === null) return;

    if (reducedMotion) {
      const reduced = Animated.sequence([
        Animated.timing(reducedOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.delay(850),
        Animated.timing(reducedOpacity, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]);

      reduced.start(({ finished }) => {
        if (finished) onAnimationComplete?.();
      });
      return () => reduced.stop();
    }

    const run = Animated.timing(timeline, {
      toValue: 1,
      duration: DURATION,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    run.start(({ finished }) => {
      if (finished) onAnimationComplete?.();
    });

    return () => run.stop();
  }, [onAnimationComplete, reducedMotion, reducedOpacity, timeline]);

  const shouldReduce = reducedMotion === true;
  const streakItems = useMemo(() => STREAKS, []);

  const logoOpacity = timeline.interpolate({
    inputRange: [0, T.logoStart, 0.09, T.pushPeak, 0.76, T.reveal, 1],
    outputRange: [0, 0, 1, 1, 0.98, 0, 0],
    extrapolate: 'clamp',
  });

  const logoScale = timeline.interpolate({
    inputRange: [0, T.logoStart, T.travelStart, T.hero, T.pushStart, T.pushPeak, T.sweep, T.reveal, 1],
    outputRange: [0.16, 0.16, 0.24, 1, 1.02, 2.55, 2.9, 3.05, 3.05],
    extrapolate: 'clamp',
  });

  const logoX = timeline.interpolate({
    inputRange: [0, T.pushStart, T.pushPeak, T.sweep, T.reveal, 1],
    outputRange: [0, 0, -width * 0.02, -width * 0.08, -width * 0.20, -width * 0.20],
    extrapolate: 'clamp',
  });

  const logoY = timeline.interpolate({
    inputRange: [0, T.logoStart, T.hero, T.pushStart, T.pushPeak, T.reveal, 1],
    outputRange: [height * 0.018, height * 0.018, 0, 0, -height * 0.01, -height * 0.025, -height * 0.025],
    extrapolate: 'clamp',
  });

  const logoRotate = timeline.interpolate({
    inputRange: [0, T.pushStart, T.pushPeak, T.sweep, T.reveal, 1],
    outputRange: ['0deg', '0deg', '-0.6deg', '-1.8deg', '-2.2deg', '-2.2deg'],
    extrapolate: 'clamp',
  });

  const taglineOpacity = timeline.interpolate({
    inputRange: [0, 0.42, T.hero, 0.52, 0.60, 1],
    outputRange: [0, 0, 1, 1, 0, 0],
    extrapolate: 'clamp',
  });

  const taglineY = timeline.interpolate({
    inputRange: [0, 0.42, T.hero, 0.52, 1],
    outputRange: [10, 10, 0, 0, 0],
    extrapolate: 'clamp',
  });

  const glowOpacity = timeline.interpolate({
    inputRange: [0, 0.08, T.hero, T.pushStart, T.pushPeak, T.reveal, 1],
    outputRange: [0, 0.12, 0.34, 0.42, 0.62, 0, 0],
    extrapolate: 'clamp',
  });

  const spaceScale = timeline.interpolate({
    inputRange: [0, T.pushStart, T.pushPeak, T.sweep, T.reveal, 1],
    outputRange: [1, 1.02, 1.13, 1.28, 1.44, 1.44],
    extrapolate: 'clamp',
  });

  const starTranslateY = timeline.interpolate({
    inputRange: [0, T.hero, T.pushStart, T.pushPeak, T.reveal, 1],
    outputRange: [0, height * 0.008, height * 0.012, height * 0.038, height * 0.07, height * 0.07],
    extrapolate: 'clamp',
  });

  const sweepOpacity = timeline.interpolate({
    inputRange: [0, 0.72, T.sweep, 0.81, T.reveal, 1],
    outputRange: [0, 0, 0.15, 1, 0, 0],
    extrapolate: 'clamp',
  });

  const sweepX = timeline.interpolate({
    inputRange: [0, T.sweep, 0.81, T.reveal, 1],
    outputRange: [width, width, -width * 0.20, -width * 1.15, -width * 1.15],
    extrapolate: 'clamp',
  });

  const whiteoutOpacity = timeline.interpolate({
    inputRange: [0, 0.78, 0.81, T.reveal, 0.88, 1],
    outputRange: [0, 0, 0.82, 0.36, 0, 0],
    extrapolate: 'clamp',
  });

  const overlayOpacity = timeline.interpolate({
    inputRange: [0, T.reveal, 0.91, 1],
    outputRange: [1, 1, 0.72, 0],
    extrapolate: 'clamp',
  });

  const revealOpacity = timeline.interpolate({
    inputRange: [0, T.reveal, 0.90, 0.98, 1],
    outputRange: [0, 0, 1, 1, 0],
    extrapolate: 'clamp',
  });

  if (shouldReduce) {
    return (
      <Animated.View style={[styles.root, { width, height, opacity: reducedOpacity }]}>
        <StarField width={width} height={height} reducedMotion />
        <View style={[styles.safeContent, { top: insets.top, bottom: insets.bottom, height: safeHeight }]}>
          <Image source={ALPFA_LOGO} resizeMode="contain" style={{ width: heroWidth, height: heroWidth }} />
          <Text style={[styles.tagline, { marginTop: Math.max(10, width * 0.02) }]}>FAMILIA · LEADERSHIP · LEGACY</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.root, { width, height, opacity: overlayOpacity }]} pointerEvents="auto">
      <Animated.View
        style={[
          styles.spaceLayer,
          {
            transform: [{ translateY: starTranslateY }, { scale: spaceScale }],
          },
        ]}
      >
        <StarField width={width} height={height} motion={timeline} reducedMotion={false} />
      </Animated.View>

      <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        {streakItems.map((streak, index) => (
          <LightStreak
            key={`streak-${index}`}
            timeline={timeline}
            screenWidth={width}
            screenHeight={height}
            startX={streak.startX}
            startY={streak.startY}
            angle={streak.angle}
            lengthRatio={streak.lengthRatio}
            thickness={Math.max(streakThickness * streak.thickness, 1.8)}
            start={streak.start}
            peak={streak.peak}
            end={streak.end}
            travelX={streak.travelX}
            travelY={streak.travelY}
            intensity={streak.intensity}
          />
        ))}
      </View>

      <View
        pointerEvents="none"
        style={[
          styles.safeContent,
          {
            top: insets.top,
            bottom: insets.bottom,
            height: safeHeight,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.radialGlow,
            {
              width: Math.min(width * 0.74, 520),
              height: Math.min(width * 0.74, 520),
              borderRadius: Math.min(width * 0.37, 260),
              opacity: glowOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        />

        <Animated.View
          style={[
            styles.logoWrap,
            {
              opacity: logoOpacity,
              transform: [
                { translateX: logoX },
                { translateY: logoY },
                { rotate: logoRotate },
                { scale: logoScale },
              ],
            },
          ]}
        >
          <Image
            source={ALPFA_LOGO}
            resizeMode="contain"
            style={{ width: heroWidth, height: heroWidth }}
            accessibilityIgnoresInvertColors
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.taglineWrap,
            {
              opacity: taglineOpacity,
              transform: [{ translateY: taglineY }],
            },
          ]}
        >
          <Text
            style={[
              styles.tagline,
              {
                fontSize: Math.max(9, Math.min(width * 0.025, 12)),
                letterSpacing: Math.max(1.5, Math.min(width * 0.005, 2.4)),
              },
            ]}
          >
            FAMILIA · LEADERSHIP · LEGACY
          </Text>
        </Animated.View>
      </View>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.redSweep,
          {
            width: width * 0.42,
            height: height * 1.55,
            opacity: sweepOpacity,
            transform: [{ translateX: sweepX }, { rotate: '-24deg' }],
          },
        ]}
      />

      <Animated.View pointerEvents="none" style={[styles.whiteout, { opacity: whiteoutOpacity }]} />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.revealCopy,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            opacity: revealOpacity,
          },
        ]}
      >
        <Text style={styles.welcomeSmall}>Welcome to</Text>
        <Text style={styles.welcomeBrand}>
          <Text style={styles.welcomeWhite}>ALPFA </Text>
          <Text style={styles.welcomeRed}>NJIT</Text>
        </Text>
        <Text style={styles.welcomeTag}>LEAD · CONNECT · BELONG</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    top: 0,
    backgroundColor: NAVY,
    overflow: 'hidden',
    zIndex: 99999,
    elevation: 99999,
  },
  spaceLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: NAVY,
  },
  safeContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radialGlow: {
    position: 'absolute',
    backgroundColor: Platform.select({
      ios: 'rgba(255, 36, 68, 0.11)',
      android: 'rgba(255, 36, 68, 0.09)',
      default: 'rgba(255, 36, 68, 0.10)',
    }),
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
  },
  taglineWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    marginTop: 10,
  },
  tagline: {
    color: '#F6F8FC',
    fontWeight: '800',
    textAlign: 'center',
  },
  redSweep: {
    position: 'absolute',
    top: '-20%',
    left: 0,
    backgroundColor: '#FF2444',
    shadowColor: '#FF2444',
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  whiteout: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFF9F7',
    zIndex: 20,
  },
  revealCopy: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeSmall: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 6,
  },
  welcomeBrand: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  welcomeWhite: {
    color: '#FFFFFF',
  },
  welcomeRed: {
    color: '#E5223D',
  },
  welcomeTag: {
    marginTop: 12,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.3,
  },
});
