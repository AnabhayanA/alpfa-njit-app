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

// Single splash asset: red ALPFA mark + Highlander + white NJIT lockup.
const ALPFA_LOGO = require('../assets/images/NJITalpfa logo.pdf (6).png');

const NAVY = '#050A16';
const WHITE = '#F7F8FA';
const RED = '#E3212B';
const TOTAL_MS = 4800;

type Props = {
  onAnimationComplete?: () => void;
};

export default function ALPFALoadingScreen({ onAnimationComplete }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);

  const timeline = useRef(new Animated.Value(0)).current;
  const reveal = useRef(new Animated.Value(0)).current;

  const safeHeight = Math.max(1, height - insets.top - insets.bottom);
  const logoSize = Math.min(width * 0.76, safeHeight * 0.43, 360);

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

  useEffect(() => {
    if (reducedMotion === null) return;

    timeline.setValue(0);
    reveal.setValue(0);

    if (reducedMotion) {
      reveal.setValue(1);
      const simple = Animated.sequence([
        Animated.timing(timeline, {
          toValue: 0.58,
          duration: 350,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(650),
        Animated.timing(timeline, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]);

      simple.start(({ finished }) => {
        if (finished) onAnimationComplete?.();
      });
      return () => simple.stop();
    }

    const run = Animated.parallel([
      Animated.timing(timeline, {
        toValue: 1,
        duration: TOTAL_MS,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(reveal, {
        toValue: 1,
        duration: 1050,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    run.start(({ finished }) => {
      if (finished) onAnimationComplete?.();
    });

    return () => run.stop();
  }, [onAnimationComplete, reducedMotion, reveal, timeline]);

  // Calm entrance, short hold, then a strong accelerating camera pass.
  const logoScale = timeline.interpolate({
    inputRange: [0, 0.18, 0.48, 0.64, 0.76, 0.84, 0.90, 0.95, 1],
    outputRange: [0.90, 1, 1.02, 1.05, 1.22, 1.65, 2.55, 4.8, 7.6],
    extrapolate: 'clamp',
  });

  const logoOpacity = timeline.interpolate({
    inputRange: [0, 0.05, 0.12, 0.91, 0.97, 1],
    outputRange: [0, 0.45, 1, 1, 0.82, 0],
    extrapolate: 'clamp',
  });

  const logoY = timeline.interpolate({
    inputRange: [0, 0.55, 0.84, 1],
    outputRange: [safeHeight * 0.012, 0, -safeHeight * 0.008, -safeHeight * 0.035],
    extrapolate: 'clamp',
  });

  // A small red edge glow only during the camera push.
  const glowOpacity = timeline.interpolate({
    inputRange: [0, 0.66, 0.76, 0.90, 0.97, 1],
    outputRange: [0, 0, 0.10, 0.26, 0.12, 0],
    extrapolate: 'clamp',
  });

  const taglineOpacity = timeline.interpolate({
    inputRange: [0, 0.25, 0.34, 0.62, 0.72, 1],
    outputRange: [0, 0, 1, 1, 0, 0],
    extrapolate: 'clamp',
  });

  const taglineY = timeline.interpolate({
    inputRange: [0, 0.25, 0.34, 1],
    outputRange: [7, 7, 0, 0],
    extrapolate: 'clamp',
  });

  const revealScaleX = reveal.interpolate({
    inputRange: [0, 1],
    outputRange: [0.001, 1],
  });

  const revealTranslateX = reveal.interpolate({
    inputRange: [0, 1],
    outputRange: [-logoSize / 2, 0],
  });

  const flashOpacity = timeline.interpolate({
    inputRange: [0, 0.91, 0.955, 0.985, 1],
    outputRange: [0, 0, 0.55, 0.12, 0],
    extrapolate: 'clamp',
  });

  const splashOpacity = timeline.interpolate({
    inputRange: [0, 0.94, 1],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      pointerEvents="auto"
      style={[styles.root, { width, height, opacity: splashOpacity }]}
    >
      <View style={styles.background} />

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
              opacity: logoOpacity,
              transform: [{ translateY: logoY }, { scale: logoScale }],
            },
          ]}
        >
          <View style={{ width: logoSize, height: logoSize }}>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.glowLayer,
                {
                  width: logoSize,
                  height: logoSize,
                  opacity: glowOpacity,
                },
              ]}
            >
              <Image
                source={ALPFA_LOGO}
                resizeMode="contain"
                style={styles.image}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.revealClip,
                {
                  width: logoSize,
                  height: logoSize,
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
                style={styles.image}
                accessibilityIgnoresInvertColors
              />
            </Animated.View>
          </View>
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
                fontSize: Math.max(9, Math.min(width * 0.027, 12)),
                letterSpacing: Math.max(1.8, Math.min(width * 0.0065, 2.8)),
              },
            ]}
          >
            FAMILIA · LEADERSHIP · LEGACY
          </Text>
        </Animated.View>
      </View>

      <Animated.View
        pointerEvents="none"
        style={[styles.flash, { opacity: flashOpacity }]}
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
    backgroundColor: NAVY,
  },
  background: {
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
  logoStage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealClip: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  glowLayer: {
    position: 'absolute',
    left: 0,
    top: 0,
    transform: [{ scale: 1.018 }],
    ...Platform.select({
      ios: {
        shadowColor: RED,
        shadowOpacity: 0.45,
        shadowRadius: 9,
        shadowOffset: { width: 0, height: 0 },
      },
      android: {
        elevation: 3,
      },
      default: {
        shadowColor: RED,
        shadowOpacity: 0.35,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
      },
    }),
  },
  taglineWrap: {
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagline: {
    color: WHITE,
    fontWeight: '700',
    textAlign: 'center',
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: WHITE,
    zIndex: 20,
  },
});
