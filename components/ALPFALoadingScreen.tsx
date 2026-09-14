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

const STREAKS = [
  { startX: -0.28, startY: 0.18, angle: '18deg', lengthRatio: 0.34, delay: 0.00, directionX: -1, directionY: -0.2 },
  { startX: 0.94, startY: 0.20, angle: '-18deg', lengthRatio: 0.36, delay: 0.08, directionX: 1, directionY: -0.2 },
  { startX: -0.30, startY: 0.39, angle: '8deg', lengthRatio: 0.30, delay: 0.16, directionX: -1, directionY: 0 },
  { startX: 0.95, startY: 0.42, angle: '-8deg', lengthRatio: 0.32, delay: 0.04, directionX: 1, directionY: 0 },
  { startX: -0.26, startY: 0.66, angle: '-18deg', lengthRatio: 0.34, delay: 0.12, directionX: -1, directionY: 0.25 },
  { startX: 0.93, startY: 0.69, angle: '18deg', lengthRatio: 0.34, delay: 0.20, directionX: 1, directionY: 0.25 },
  { startX: 0.13, startY: -0.10, angle: '58deg', lengthRatio: 0.30, delay: 0.06, directionX: -0.25, directionY: -1 },
  { startX: 0.63, startY: -0.12, angle: '122deg', lengthRatio: 0.30, delay: 0.18, directionX: 0.25, directionY: -1 },
  { startX: 0.14, startY: 0.98, angle: '-58deg', lengthRatio: 0.31, delay: 0.10, directionX: -0.25, directionY: 1 },
  { startX: 0.62, startY: 0.99, angle: '58deg', lengthRatio: 0.31, delay: 0.22, directionX: 0.25, directionY: 1 },
] as const;

type Props = {
  onAnimationComplete?: () => void;
};

export default function ALPFALoadingScreen({ onAnimationComplete }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);

  const starsMotion = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.18)).current;
  const logoTranslateY = useRef(new Animated.Value(10)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(8)).current;
  const streakProgress = useRef(new Animated.Value(0)).current;
  const rushProgress = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const backgroundZoom = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  const safeHeight = Math.max(1, height - insets.top - insets.bottom);
  const heroWidth = Math.min(width * 0.54, 360);
  const streakThickness = Math.max(2, Math.min(width * 0.006, 3.6));

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
        Animated.timing(logoOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.delay(450),
        Animated.parallel([
          Animated.timing(taglineOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
          Animated.timing(taglineY, { toValue: 0, duration: 250, useNativeDriver: true }),
        ]),
        Animated.delay(450),
        Animated.timing(overlayOpacity, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]);

      reduced.start(({ finished }) => {
        if (finished) onAnimationComplete?.();
      });

      return () => reduced.stop();
    }

    const starLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(starsMotion, {
          toValue: 1,
          duration: 2200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(starsMotion, {
          toValue: 0,
          duration: 2200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );

    const intro = Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 0.68,
          duration: 600,
          easing: Easing.bezier(0.16, 0.78, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateY, {
          toValue: 2,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(230),
          Animated.timing(glowOpacity, {
            toValue: 0.42,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 0.96,
          duration: 500,
          easing: Easing.bezier(0.17, 0.8, 0.22, 1),
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(streakProgress, {
          toValue: 0.72,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1.06,
          duration: 340,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(streakProgress, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(70),
          Animated.parallel([
            Animated.timing(taglineOpacity, {
              toValue: 1,
              duration: 260,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(taglineY, {
              toValue: 0,
              duration: 260,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]),
      Animated.delay(80),
      Animated.parallel([
        Animated.timing(rushProgress, {
          toValue: 1,
          duration: 400,
          easing: Easing.bezier(0.12, 0.84, 0.12, 1),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 4.8,
          duration: 400,
          easing: Easing.bezier(0.12, 0.84, 0.12, 1),
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateY, {
          toValue: -height * 0.015,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(taglineOpacity, {
          toValue: 0,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundZoom, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(glowOpacity, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]);

    starLoop.start();
    intro.start(({ finished }) => {
      starLoop.stop();
      if (finished) onAnimationComplete?.();
    });

    return () => {
      starLoop.stop();
      intro.stop();
    };
  }, [
    backgroundZoom,
    glowOpacity,
    height,
    logoOpacity,
    logoScale,
    logoTranslateY,
    onAnimationComplete,
    overlayOpacity,
    reducedMotion,
    rushProgress,
    starsMotion,
    streakProgress,
    taglineOpacity,
    taglineY,
  ]);

  const backgroundScale = backgroundZoom.interpolate({ inputRange: [0, 1], outputRange: [1, 1.16] });
  const heroGlowScale = logoScale.interpolate({ inputRange: [0.18, 1.06, 4.8], outputRange: [0.4, 1, 1.6] });
  const streakItems = useMemo(() => STREAKS, []);
  const shouldReduce = reducedMotion === true;

  return (
    <Animated.View style={[styles.root, { width, height, opacity: overlayOpacity }]} pointerEvents="auto">
      <Animated.View style={[styles.spaceLayer, { transform: [{ scale: backgroundScale }] }]}>
        <StarField width={width} height={height} motion={starsMotion} reducedMotion={shouldReduce} />
      </Animated.View>

      {!shouldReduce && (
        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
          {streakItems.map((streak, index) => (
            <LightStreak
              key={`streak-${index}`}
              progress={streakProgress}
              rush={rushProgress}
              screenWidth={width}
              screenHeight={height}
              startX={streak.startX}
              startY={streak.startY}
              angle={streak.angle}
              lengthRatio={streak.lengthRatio}
              thickness={streakThickness}
              delay={streak.delay}
              directionX={streak.directionX}
              directionY={streak.directionY}
            />
          ))}
        </View>
      )}

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
              width: Math.min(width * 0.72, 480),
              height: Math.min(width * 0.72, 480),
              borderRadius: Math.min(width * 0.36, 240),
              opacity: glowOpacity,
              transform: [{ scale: heroGlowScale }],
            },
          ]}
        />

        <Animated.View
          style={[
            styles.logoWrap,
            {
              opacity: logoOpacity,
              transform: [{ translateY: logoTranslateY }, { scale: logoScale }],
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
              marginTop: Math.max(10, width * 0.02),
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
  },
  tagline: {
    color: '#F6F8FC',
    fontWeight: '800',
    textAlign: 'center',
  },
});
