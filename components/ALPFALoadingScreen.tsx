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

// Red ALPFA artwork used for the main reveal.  The NJIT lockup is rendered
// separately in white so the splash stays clean and does not stack logos.
const ALPFA_LOGO = require('../assets/images/NJITalpfa logo.pdf (6).png');

const NAVY = '#050A16';
const NAVY_DEEP = '#02040A';
const RED = '#E3212B';
const WHITE = '#F5F6F8';
const CREAM = '#F7F2E9';
const INK = '#1A1A2E';
const TOTAL_MS = 10000;

type Props = {
  onAnimationComplete?: () => void;
};

export default function ALPFALoadingScreen({ onAnimationComplete }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);

  const timeline = useRef(new Animated.Value(0)).current;
  const reveal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => mounted && setReducedMotion(enabled))
      .catch(() => mounted && setReducedMotion(false));

    const subscription = AccessibilityInfo.addEventListener?.(
      'reduceMotionChanged',
      setReducedMotion
    );

    return () => {
      mounted = false;
      subscription?.remove?.();
    };
  }, []);

  const safeHeight = Math.max(1, height - insets.top - insets.bottom);
  const logoWidth = Math.min(width * 0.64, 250);
  const logoHeight = logoWidth;

  useEffect(() => {
    if (reducedMotion === null) return;

    timeline.setValue(0);
    reveal.setValue(0);

    if (reducedMotion) {
      reveal.setValue(1);

      const simple = Animated.sequence([
        Animated.timing(timeline, {
          toValue: 0.58,
          duration: 450,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(700),
        Animated.timing(timeline, {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]);

      simple.start(({ finished }) => {
        if (finished) onAnimationComplete?.();
      });

      return () => simple.stop();
    }

    // This is the same 10-second master clock used by the HTML prototype.
    const master = Animated.timing(timeline, {
      toValue: 1,
      duration: TOTAL_MS,
      easing: Easing.linear,
      useNativeDriver: true,
    });

    // HTML mask reveal: 0 -> 2.0 seconds with cubic-out easing.
    const logoReveal = Animated.timing(reveal, {
      toValue: 1,
      duration: 2000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    const run = Animated.parallel([master, logoReveal]);

    run.start(({ finished }) => {
      if (finished) onAnimationComplete?.();
    });

    return () => run.stop();
  }, [onAnimationComplete, reducedMotion, reveal, timeline]);

  // HTML logoScaleTimeline: 1 -> 1.02 -> 1.15 -> 1.6 -> 2.6 -> 4.2 -> 7 -> 9.
  const stageScale = timeline.interpolate({
    inputRange: [0, 0.20, 0.45, 0.60, 0.70, 0.76, 0.80, 0.83, 1],
    outputRange: [1, 1.02, 1.15, 1.6, 2.6, 4.2, 7, 9, 9],
    extrapolate: 'clamp',
  });

  // The HTML transform-origin is center 42%; this small upward move recreates
  // that feeling during the large camera push without hard-coding a phone size.
  const stageY = timeline.interpolate({
    inputRange: [0, 0.60, 0.76, 0.83, 1],
    outputRange: [0, 0, -safeHeight * 0.01, -safeHeight * 0.035, -safeHeight * 0.045],
    extrapolate: 'clamp',
  });

  const logoOpacity = timeline.interpolate({
    inputRange: [0, 0.76, 0.83, 1],
    outputRange: [1, 1, 0, 0],
    extrapolate: 'clamp',
  });

  // Netflix-style bump from the HTML: 25% -> 28% -> 32% -> 36%.
  const bumpScale = timeline.interpolate({
    inputRange: [0, 0.25, 0.28, 0.32, 0.36, 1],
    outputRange: [1, 1, 1.16, 0.97, 1, 1],
    extrapolate: 'clamp',
  });

  const bumpFlashOpacity = timeline.interpolate({
    inputRange: [0, 0.25, 0.28, 0.32, 0.36, 1],
    outputRange: [0, 0, 0.20, 0.04, 0, 0],
    extrapolate: 'clamp',
  });

  const revealScaleX = reveal.interpolate({
    inputRange: [0, 1],
    outputRange: [0.001, 1],
  });

  // Keep the reveal anchored to the left, matching the CSS mask wipe.
  const revealTranslateX = reveal.interpolate({
    inputRange: [0, 1],
    outputRange: [-logoWidth / 2, 0],
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

  const creamOpacity = timeline.interpolate({
    inputRange: [0, 0.72, 0.82, 1],
    outputRange: [0, 0, 1, 1],
    extrapolate: 'clamp',
  });

  const flashOpacity = timeline.interpolate({
    inputRange: [0, 0.74, 0.79, 0.88, 1],
    outputRange: [0, 0, 0.90, 0, 0],
    extrapolate: 'clamp',
  });

  const homeOpacity = timeline.interpolate({
    inputRange: [0, 0.76, 0.86, 1],
    outputRange: [0, 0, 1, 1],
    extrapolate: 'clamp',
  });

  const homeY = timeline.interpolate({
    inputRange: [0, 0.76, 0.86, 1],
    outputRange: [safeHeight * 0.02, safeHeight * 0.02, 0, 0],
    extrapolate: 'clamp',
  });

  // Let the real app underneath take over at the very end.
  const splashOpacity = timeline.interpolate({
    inputRange: [0, 0.96, 1],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      pointerEvents="auto"
      style={[styles.root, { width, height, opacity: splashOpacity }]}
    >
      <View style={styles.backdrop} />

      <Animated.View
        pointerEvents="none"
        style={[styles.creamLayer, { opacity: creamOpacity }]}
      />

      <View
        pointerEvents="none"
        style={[
          styles.safeContent,
          {
            top: insets.top,
            height: safeHeight,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.logoStage,
            {
              transform: [{ translateY: stageY }, { scale: stageScale }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.logoHolder,
              {
                width: logoWidth,
                height: logoHeight,
                opacity: logoOpacity,
                transform: [{ scale: bumpScale }],
              },
            ]}
          >
            <Animated.View
              pointerEvents="none"
              style={[
                styles.logoGlow,
                {
                  width: logoWidth,
                  height: logoHeight,
                  opacity: logoOpacity,
                },
              ]}
            >
              <Image
                source={ALPFA_LOGO}
                resizeMode="contain"
                style={[styles.fullImage, styles.glowImage]}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.revealClip,
                {
                  width: logoWidth,
                  height: logoHeight,
                  transform: [
                    { translateX: revealTranslateX },
                    { scaleX: revealScaleX },
                  ],
                },
              ]}
            >
              <Image
                source={ALPFA_LOGO}
                resizeMode="contain"
                style={styles.fullImage}
                accessibilityIgnoresInvertColors
              />
            </Animated.View>

            <Animated.View
              pointerEvents="none"
              style={[
                styles.bumpFlash,
                {
                  width: logoWidth * 0.58,
                  height: logoHeight * 0.58,
                  opacity: bumpFlashOpacity,
                },
              ]}
            />
          </Animated.View>

          <Animated.Text
            style={[
              styles.tagline,
              {
                fontSize: Math.max(10, Math.min(width * 0.031, 12)),
                letterSpacing: Math.max(2.2, Math.min(width * 0.008, 3)),
                opacity: taglineOpacity,
                transform: [{ translateY: taglineY }],
              },
            ]}
          >
            FAMILIA · LEADERSHIP · LEGACY
          </Animated.Text>

          <Animated.View
            style={[
              styles.bottomLockup,
              {
                opacity: lockupOpacity,
                transform: [{ translateY: lockupY }],
              },
            ]}
          >
            <Text style={[styles.njitWordmark, { fontSize: Math.max(13, width * 0.038) }]}>
              NEW JERSEY INSTITUTE{`\n`}OF TECHNOLOGY
            </Text>
          </Animated.View>
        </Animated.View>
      </View>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.homeReveal,
          {
            top: insets.top,
            height: safeHeight,
            opacity: homeOpacity,
            transform: [{ translateY: homeY }],
          },
        ]}
      >
        <Text style={[styles.welcome, { fontSize: Math.max(14, width * 0.038) }]}>Welcome to</Text>
        <Text style={[styles.brand, { fontSize: Math.max(27, Math.min(width * 0.078, 32)) }]}>
          ALPFA <Text style={styles.brandRed}>NJIT</Text>
        </Text>
        <Text
          style={[
            styles.sub,
            {
              fontSize: Math.max(10, Math.min(width * 0.027, 12)),
              letterSpacing: Math.max(2.2, Math.min(width * 0.008, 3)),
            },
          ]}
        >
          LEAD · CONNECT · BELONG
        </Text>
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[styles.whiteFlash, { opacity: flashOpacity }]}
      />
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
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: NAVY,
  },
  creamLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: CREAM,
  },
  safeContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoStage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoHolder: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: RED,
        shadowOpacity: 0.45,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 0 },
      },
      android: {
        elevation: 5,
      },
      default: {
        shadowColor: RED,
        shadowOpacity: 0.40,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 0 },
      },
    }),
  },
  logoGlow: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ scale: 1.025 }],
  },
  glowImage: {
    opacity: 0.24,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  revealClip: {
    overflow: 'hidden',
  },
  bumpFlash: {
    position: 'absolute',
    backgroundColor: WHITE,
    borderRadius: 12,
  },
  tagline: {
    marginTop: 22,
    color: WHITE,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomLockup: {
    marginTop: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  njitWordmark: {
    color: WHITE,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.4,
    lineHeight: 18,
  },
  homeReveal: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
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
    opacity: 0.60,
  },
  whiteFlash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    zIndex: 50,
  },
});
