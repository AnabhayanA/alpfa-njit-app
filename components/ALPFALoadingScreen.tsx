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

// White ALPFA + Highlander + NJIT lockup requested for the loading screen.
const ALPFA_LOGO = require('../assets/images/NJITalpfa Logo.pdf (7).png');

const NAVY = '#050A16';
const WHITE = '#F5F6F8';
const RED = '#E5223D';
const TOTAL_MS = 6200;

type Props = {
  onAnimationComplete?: () => void;
};

export default function ALPFALoadingScreen({ onAnimationComplete }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);

  const timeline = useRef(new Animated.Value(0)).current;
  const revealWidth = useRef(new Animated.Value(0)).current;

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
  const logoWidth = Math.min(width * 0.72, 340);
  const logoHeight = logoWidth;

  useEffect(() => {
    if (reducedMotion === null) return;

    if (reducedMotion) {
      revealWidth.setValue(logoWidth);
      const reduced = Animated.sequence([
        Animated.timing(timeline, {
          toValue: 0.7,
          duration: 450,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(450),
        Animated.timing(timeline, {
          toValue: 1,
          duration: 300,
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
      duration: 1250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });

    const run = Animated.parallel([master, reveal]);

    run.start(({ finished }) => {
      if (finished) onAnimationComplete?.();
    });

    return () => run.stop();
  }, [logoWidth, onAnimationComplete, reducedMotion, revealWidth, timeline]);

  const logoOpacity = timeline.interpolate({
    inputRange: [0, 0.03, 0.10, 0.84, 0.94, 1],
    outputRange: [0, 0.25, 1, 1, 0.98, 0],
    extrapolate: 'clamp',
  });

  const logoScale = timeline.interpolate({
    inputRange: [0, 0.18, 0.42, 0.64, 0.78, 0.86, 0.91, 0.95, 1],
    outputRange: [0.96, 1, 1.04, 1.12, 1.38, 1.9, 3.1, 5.8, 8.5],
    extrapolate: 'clamp',
  });

  const logoY = timeline.interpolate({
    inputRange: [0, 0.64, 0.86, 0.95, 1],
    outputRange: [8, 0, -height * 0.006, -height * 0.02, -height * 0.04],
    extrapolate: 'clamp',
  });

  const taglineOpacity = timeline.interpolate({
    inputRange: [0, 0.30, 0.38, 0.58, 0.69, 1],
    outputRange: [0, 0, 1, 1, 0, 0],
    extrapolate: 'clamp',
  });

  const taglineY = timeline.interpolate({
    inputRange: [0, 0.30, 0.38, 1],
    outputRange: [6, 6, 0, 0],
    extrapolate: 'clamp',
  });

  const accentOpacity = timeline.interpolate({
    inputRange: [0, 0.12, 0.26, 0.82, 0.94, 1],
    outputRange: [0, 0, 0.34, 0.34, 0.16, 0],
    extrapolate: 'clamp',
  });

  const flashOpacity = timeline.interpolate({
    inputRange: [0, 0.91, 0.955, 0.985, 1],
    outputRange: [0, 0, 0.88, 0.18, 0],
    extrapolate: 'clamp',
  });

  const overlayOpacity = timeline.interpolate({
    inputRange: [0, 0.955, 1],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  const accentThickness = Math.max(3, Math.min(width * 0.012, 5));

  return (
    <Animated.View
      pointerEvents="auto"
      style={[styles.root, { width, height, opacity: overlayOpacity }]}
    >
      <View style={styles.background} />

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
            styles.accentLayer,
            {
              width: logoWidth,
              height: logoHeight,
              opacity: accentOpacity,
              transform: [{ translateY: logoY }, { scale: logoScale }],
            },
          ]}
        >
          <View
            style={[
              styles.redAccent,
              {
                width: logoWidth * 0.36,
                height: accentThickness,
                left: logoWidth * 0.14,
                top: logoHeight * 0.21,
                transform: [{ rotate: '-58deg' }],
              },
            ]}
          />
          <View
            style={[
              styles.redAccent,
              {
                width: logoWidth * 0.29,
                height: accentThickness,
                left: logoWidth * 0.57,
                top: logoHeight * 0.21,
                transform: [{ rotate: '63deg' }],
              },
            ]}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.logoGroup,
            {
              opacity: logoOpacity,
              transform: [{ translateY: logoY }, { scale: logoScale }],
            },
          ]}
        >
          <View style={{ width: logoWidth, height: logoHeight }}>
            <Animated.View
              style={[
                styles.revealClip,
                { width: revealWidth, height: logoHeight },
              ]}
            >
              <Image
                source={ALPFA_LOGO}
                resizeMode="contain"
                style={{ width: logoWidth, height: logoHeight }}
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
                fontSize: Math.max(9, Math.min(width * 0.028, 12)),
                letterSpacing: Math.max(2, Math.min(width * 0.007, 3)),
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
  accentLayer: {
    position: 'absolute',
  },
  redAccent: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: RED,
    shadowColor: RED,
    shadowOpacity: Platform.OS === 'android' ? 0.45 : 0.72,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  logoGroup: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealClip: {
    overflow: 'hidden',
  },
  taglineWrap: {
    marginTop: 10,
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
    backgroundColor: '#FFFFFF',
    zIndex: 20,
  },
});
