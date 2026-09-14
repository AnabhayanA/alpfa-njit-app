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
const DURATION = 7600;

const STREAKS = [
  // First outward wave during the approach.
  { angleDeg: 202, lengthRatio: 0.24, thickness: 1.0, start: 0.16, peak: 0.205, end: 0.29, startRadius: 0.03, endRadius: 0.58, intensity: 0.62 },
  { angleDeg: 338, lengthRatio: 0.26, thickness: 1.1, start: 0.18, peak: 0.225, end: 0.31, startRadius: 0.04, endRadius: 0.62, intensity: 0.72 },
  { angleDeg: 178, lengthRatio: 0.22, thickness: 0.9, start: 0.20, peak: 0.245, end: 0.33, startRadius: 0.02, endRadius: 0.68, intensity: 0.58 },
  { angleDeg: 4, lengthRatio: 0.23, thickness: 1.0, start: 0.22, peak: 0.265, end: 0.35, startRadius: 0.03, endRadius: 0.70, intensity: 0.68 },
  { angleDeg: 142, lengthRatio: 0.23, thickness: 1.0, start: 0.24, peak: 0.285, end: 0.37, startRadius: 0.02, endRadius: 0.64, intensity: 0.62 },
  { angleDeg: 38, lengthRatio: 0.25, thickness: 1.1, start: 0.26, peak: 0.305, end: 0.39, startRadius: 0.03, endRadius: 0.68, intensity: 0.72 },
  { angleDeg: 226, lengthRatio: 0.22, thickness: 0.9, start: 0.28, peak: 0.325, end: 0.41, startRadius: 0.02, endRadius: 0.62, intensity: 0.58 },
  { angleDeg: 314, lengthRatio: 0.24, thickness: 1.0, start: 0.30, peak: 0.345, end: 0.43, startRadius: 0.03, endRadius: 0.66, intensity: 0.66 },

  // Fast starburst wave before the final camera pass.
  { angleDeg: 188, lengthRatio: 0.34, thickness: 1.55, start: 0.48, peak: 0.515, end: 0.61, startRadius: 0.04, endRadius: 0.88, intensity: 1.00 },
  { angleDeg: 352, lengthRatio: 0.36, thickness: 1.65, start: 0.49, peak: 0.525, end: 0.62, startRadius: 0.04, endRadius: 0.90, intensity: 1.00 },
  { angleDeg: 155, lengthRatio: 0.31, thickness: 1.45, start: 0.50, peak: 0.535, end: 0.63, startRadius: 0.03, endRadius: 0.86, intensity: 0.92 },
  { angleDeg: 25, lengthRatio: 0.33, thickness: 1.55, start: 0.51, peak: 0.545, end: 0.64, startRadius: 0.03, endRadius: 0.88, intensity: 0.98 },
  { angleDeg: 132, lengthRatio: 0.30, thickness: 1.40, start: 0.52, peak: 0.555, end: 0.65, startRadius: 0.03, endRadius: 0.84, intensity: 0.90 },
  { angleDeg: 48, lengthRatio: 0.31, thickness: 1.45, start: 0.53, peak: 0.565, end: 0.66, startRadius: 0.03, endRadius: 0.86, intensity: 0.94 },
  { angleDeg: 225, lengthRatio: 0.33, thickness: 1.55, start: 0.54, peak: 0.575, end: 0.67, startRadius: 0.04, endRadius: 0.90, intensity: 1.00 },
  { angleDeg: 315, lengthRatio: 0.34, thickness: 1.60, start: 0.55, peak: 0.585, end: 0.68, startRadius: 0.04, endRadius: 0.92, intensity: 1.00 },
  { angleDeg: 270, lengthRatio: 0.30, thickness: 1.45, start: 0.56, peak: 0.595, end: 0.69, startRadius: 0.03, endRadius: 0.88, intensity: 0.92 },
  { angleDeg: 90, lengthRatio: 0.30, thickness: 1.45, start: 0.565, peak: 0.60, end: 0.695, startRadius: 0.03, endRadius: 0.88, intensity: 0.92 },
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
  const heroWidth = Math.min(width * 0.54, 360);
  const streakItems = useMemo(() => STREAKS, []);

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
        Animated.timing(reducedOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(800),
        Animated.timing(reducedOpacity, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]);

      reduced.start(({ finished }) => {
        if (finished) onAnimationComplete?.();
      });

      return () => reduced.stop();
    }

    timeline.setValue(0);

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

  // Logo appears far away, approaches quickly, then holds cleanly before the final pass.
  const logoOpacity = timeline.interpolate({
    inputRange: [0, 0.045, 0.085, 0.70, 0.76, 1],
    outputRange: [0, 0, 1, 1, 0.96, 0],
    extrapolate: 'clamp',
  });

  const logoScale = timeline.interpolate({
    inputRange: [0, 0.045, 0.14, 0.30, 0.42, 0.48, 0.60, 0.70, 0.76, 1],
    outputRange: [0.14, 0.14, 0.24, 0.62, 0.94, 1.02, 1.18, 3.7, 5.4, 5.4],
    extrapolate: 'clamp',
  });

  const logoY = timeline.interpolate({
    inputRange: [0, 0.08, 0.30, 0.48, 0.60, 0.70, 0.76, 1],
    outputRange: [height * 0.018, height * 0.018, height * 0.005, 0, 0, -height * 0.02, -height * 0.035, -height * 0.035],
    extrapolate: 'clamp',
  });

  const logoX = timeline.interpolate({
    inputRange: [0, 0.60, 0.70, 0.76, 1],
    outputRange: [0, 0, -width * 0.03, -width * 0.14, -width * 0.14],
    extrapolate: 'clamp',
  });

  const logoRotate = timeline.interpolate({
    inputRange: [0, 0.60, 0.70, 0.76, 1],
    outputRange: ['0deg', '0deg', '-0.5deg', '-1.5deg', '-1.5deg'],
    extrapolate: 'clamp',
  });

  const taglineOpacity = timeline.interpolate({
    inputRange: [0, 0.34, 0.40, 0.55, 0.61, 1],
    outputRange: [0, 0, 1, 1, 0, 0],
    extrapolate: 'clamp',
  });

  const taglineY = timeline.interpolate({
    inputRange: [0, 0.34, 0.40, 0.55, 1],
    outputRange: [10, 10, 0, 0, 0],
    extrapolate: 'clamp',
  });

  const glowOpacity = timeline.interpolate({
    inputRange: [0, 0.08, 0.28, 0.48, 0.60, 0.72, 1],
    outputRange: [0, 0.10, 0.24, 0.34, 0.50, 0.64, 0],
    extrapolate: 'clamp',
  });

  // The star field accelerates outward with the logo instead of sliding sideways.
  const spaceScale = timeline.interpolate({
    inputRange: [0, 0.30, 0.48, 0.60, 0.70, 0.78, 1],
    outputRange: [1, 1.01, 1.025, 1.08, 1.24, 1.42, 1.42],
    extrapolate: 'clamp',
  });

  const spaceOpacity = timeline.interpolate({
    inputRange: [0, 0.72, 0.80, 0.90, 1],
    outputRange: [1, 1, 0.88, 0.30, 0],
    extrapolate: 'clamp',
  });

  // A large diagonal red edge replaces the old side-to-side streak transition.
  const sweepOpacity = timeline.interpolate({
    inputRange: [0, 0.675, 0.705, 0.755, 0.80, 1],
    outputRange: [0, 0, 0.20, 1, 0, 0],
    extrapolate: 'clamp',
  });

  const sweepX = timeline.interpolate({
    inputRange: [0, 0.68, 0.72, 0.79, 1],
    outputRange: [width * 1.10, width * 1.10, width * 0.18, -width * 1.20, -width * 1.20],
    extrapolate: 'clamp',
  });

  const sweepScale = timeline.interpolate({
    inputRange: [0, 0.68, 0.76, 1],
    outputRange: [0.9, 0.9, 1.35, 1.35],
    extrapolate: 'clamp',
  });

  const whiteoutOpacity = timeline.interpolate({
    inputRange: [0, 0.73, 0.775, 0.82, 0.89, 1],
    outputRange: [0, 0, 0.12, 0.88, 0.24, 0],
    extrapolate: 'clamp',
  });

  const overlayOpacity = timeline.interpolate({
    inputRange: [0, 0.80, 0.91, 1],
    outputRange: [1, 1, 0.56, 0],
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
      <Animated.View style={[styles.spaceLayer, { opacity: spaceOpacity, transform: [{ scale: spaceScale }] }]}>
        <StarField width={width} height={height} motion={timeline} reducedMotion={false} />
      </Animated.View>

      <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
        {streakItems.map((streak, index) => (
          <LightStreak
            key={`streak-${index}`}
            timeline={timeline}
            screenWidth={width}
            screenHeight={height}
            angleDeg={streak.angleDeg}
            lengthRatio={streak.lengthRatio}
            thickness={Math.max(1.8, Math.min(width * 0.0048, 3.0)) * streak.thickness}
            start={streak.start}
            peak={streak.peak}
            end={streak.end}
            startRadius={streak.startRadius}
            endRadius={streak.endRadius}
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
              width: Math.min(width * 0.74, 500),
              height: Math.min(width * 0.74, 500),
              borderRadius: Math.min(width * 0.37, 250),
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
              marginTop: Math.max(10, width * 0.02),
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
            width: width * 0.72,
            height: height * 1.45,
            left: width * 0.42,
            top: -height * 0.22,
            opacity: sweepOpacity,
            transform: [
              { translateX: sweepX },
              { rotate: '-28deg' },
              { scale: sweepScale },
            ],
          },
        ]}
      >
        <View style={styles.redSweepGlow} />
        <View style={styles.redSweepCore} />
      </Animated.View>

      <Animated.View pointerEvents="none" style={[styles.whiteout, { opacity: whiteoutOpacity }]} />
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
      ios: 'rgba(255, 36, 68, 0.10)',
      android: 'rgba(255, 36, 68, 0.08)',
      default: 'rgba(255, 36, 68, 0.09)',
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
  },
  tagline: {
    color: '#F6F8FC',
    fontWeight: '800',
    textAlign: 'center',
  },
  redSweep: {
    position: 'absolute',
    zIndex: 20,
    justifyContent: 'center',
  },
  redSweepGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 36, 68, 0.24)',
  },
  redSweepCore: {
    width: '34%',
    height: '100%',
    alignSelf: 'center',
    backgroundColor: '#FF2444',
  },
  whiteout: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 25,
    backgroundColor: '#FFF8F8',
  },
});
