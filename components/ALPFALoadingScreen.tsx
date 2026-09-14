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

const NAVY = '#030712';
const WHITE = '#F7F8FA';
const RED = '#E3212B';
const TOTAL_MS = 5200;

type Props = { onAnimationComplete?: () => void };

export default function ALPFALoadingScreen({ onAnimationComplete }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const timeline = useRef(new Animated.Value(0)).current;

  const safeHeight = Math.max(1, height - insets.top - insets.bottom);
  const logoSize = Math.min(width * 0.78, safeHeight * 0.44, 370);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => mounted && setReducedMotion(enabled))
      .catch(() => mounted && setReducedMotion(false));
    const subscription = AccessibilityInfo.addEventListener?.('reduceMotionChanged', setReducedMotion);
    return () => { mounted = false; subscription?.remove?.(); };
  }, []);

  useEffect(() => {
    if (reducedMotion === null) return;
    timeline.setValue(0);

    const animation = reducedMotion
      ? Animated.sequence([
          Animated.timing(timeline, { toValue: 0.60, duration: 450, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.delay(700),
          Animated.timing(timeline, { toValue: 1, duration: 350, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ])
      : Animated.timing(timeline, { toValue: 1, duration: TOTAL_MS, easing: Easing.linear, useNativeDriver: true });

    animation.start(({ finished }) => { if (finished) onAnimationComplete?.(); });
    return () => animation.stop();
  }, [onAnimationComplete, reducedMotion, timeline]);

  // Opening inspiration: the mark starts bold and close, then recedes into depth.
  // After the hold it reverses direction and accelerates through the camera.
  const logoScale = timeline.interpolate({
    inputRange: [0, 0.05, 0.18, 0.32, 0.48, 0.62, 0.73, 0.82, 0.89, 0.95, 1],
    outputRange: [1.62, 1.62, 1.28, 1.04, 0.90, 0.90, 1.02, 1.36, 2.15, 4.7, 8.2],
    extrapolate: 'clamp',
  });

  const logoOpacity = timeline.interpolate({
    inputRange: [0, 0.035, 0.10, 0.92, 0.98, 1],
    outputRange: [0, 0.65, 1, 1, 0.80, 0],
    extrapolate: 'clamp',
  });

  const logoY = timeline.interpolate({
    inputRange: [0, 0.32, 0.62, 0.88, 1],
    outputRange: [safeHeight * 0.015, 0, 0, -safeHeight * 0.01, -safeHeight * 0.04],
    extrapolate: 'clamp',
  });

  // Restrained red energy: only a soft duplicate glow, strongest during the final rush.
  const glowOpacity = timeline.interpolate({
    inputRange: [0, 0.04, 0.20, 0.58, 0.72, 0.90, 0.98, 1],
    outputRange: [0, 0.14, 0.10, 0.06, 0.10, 0.30, 0.12, 0],
    extrapolate: 'clamp',
  });

  const glowScale = timeline.interpolate({
    inputRange: [0, 0.62, 0.90, 1],
    outputRange: [1.015, 1.015, 1.03, 1.05],
    extrapolate: 'clamp',
  });

  const taglineOpacity = timeline.interpolate({
    inputRange: [0, 0.35, 0.43, 0.62, 0.72, 1],
    outputRange: [0, 0, 1, 1, 0, 0],
    extrapolate: 'clamp',
  });

  const taglineY = timeline.interpolate({
    inputRange: [0, 0.35, 0.43, 1],
    outputRange: [8, 8, 0, 0],
    extrapolate: 'clamp',
  });

  const flashOpacity = timeline.interpolate({
    inputRange: [0, 0.91, 0.955, 0.985, 1],
    outputRange: [0, 0, 0.52, 0.10, 0],
    extrapolate: 'clamp',
  });

  const splashOpacity = timeline.interpolate({
    inputRange: [0, 0.95, 1],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View pointerEvents="auto" style={[styles.root, { width, height, opacity: splashOpacity }]}>
      <View style={styles.background} />

      <View pointerEvents="none" style={[styles.safeContent, { top: insets.top, height: safeHeight }]}>
        <Animated.View
          style={[
            styles.logoStage,
            { opacity: logoOpacity, transform: [{ translateY: logoY }, { scale: logoScale }] },
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
                  transform: [{ scale: glowScale }],
                },
              ]}
            >
              <Image source={ALPFA_LOGO} resizeMode="contain" style={styles.image} />
            </Animated.View>

            <Image
              source={ALPFA_LOGO}
              resizeMode="contain"
              style={[styles.image, { width: logoSize, height: logoSize }]}
              accessibilityIgnoresInvertColors
            />
          </View>
        </Animated.View>

        <Animated.View style={[styles.taglineWrap, { opacity: taglineOpacity, transform: [{ translateY: taglineY }] }]}>
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

      <Animated.View pointerEvents="none" style={[styles.flash, { opacity: flashOpacity }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute', left: 0, top: 0, overflow: 'hidden', zIndex: 99999, elevation: 99999,
    backgroundColor: NAVY,
  },
  background: { ...StyleSheet.absoluteFillObject, backgroundColor: NAVY },
  safeContent: {
    position: 'absolute', left: 0, right: 0, alignItems: 'center', justifyContent: 'center',
  },
  logoStage: { alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  glowLayer: {
    position: 'absolute', left: 0, top: 0,
    ...Platform.select({
      ios: { shadowColor: RED, shadowOpacity: 0.55, shadowRadius: 11, shadowOffset: { width: 0, height: 0 } },
      android: { elevation: 4 },
      default: { shadowColor: RED, shadowOpacity: 0.45, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
    }),
  },
  taglineWrap: { marginTop: 5, alignItems: 'center', justifyContent: 'center' },
  tagline: { color: WHITE, fontWeight: '700', textAlign: 'center' },
  flash: { ...StyleSheet.absoluteFillObject, backgroundColor: WHITE, zIndex: 20 },
});
