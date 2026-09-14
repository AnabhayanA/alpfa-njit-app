import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ALPFA_LOGO = require('../assets/images/NJITalpfa logo (2).png');

const NAVY = '#050A16';
const RED = '#E3212B';
const WHITE = '#F5F6F8';
const TOTAL_MS = 7200;

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
  const logoWidth = Math.min(width * 0.62, 290);
  const logoHeight = logoWidth;

  useEffect(() => {
    if (reducedMotion === null) return;

    if (reducedMotion) {
      revealWidth.setValue(logoWidth);
      const reduced = Animated.sequence([
        Animated.timing(timeline, {
          toValue: 0.58,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(650),
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
      duration: 1500,
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
    inputRange: [0, 0.03, 0.12, 0.82, 0.92, 1],
    outputRange: [0, 0.25, 1, 1, 0.98, 0],
    extrapolate: 'clamp',
  });

  const logoScale = timeline.interpolate({
    inputRange: [0, 0.16, 0.36, 0.56, 0.72, 0.84, 0.92, 1],
    outputRange: [0.96, 1, 1.04, 1.14, 1.5, 2.5, 5.4, 7.2],
    extrapolate: 'clamp',
  });

  const logoY = timeline.interpolate({
    inputRange: [0, 0.56, 0.84, 1],
    outputRange: [8, 0, -height * 0.01, -height * 0.025],
    extrapolate: 'clamp',
  });

  const taglineOpacity = timeline.interpolate({
    inputRange: [0, 0.30, 0.38, 0.56, 0.66, 1],
    outputRange: [0, 0, 1, 1, 0, 0],
    extrapolate: 'clamp',
  });

  const taglineY = timeline.interpolate({
    inputRange: [0, 0.30, 0.38, 1],
    outputRange: [6, 6, 0, 0],
    extrapolate: 'clamp',
  });

  const glowOpacity = timeline.interpolate({
    inputRange: [0, 0.08, 0.28, 0.56, 0.76, 0.90, 1],
    outputRange: [0, 0.15, 0.34, 0.42, 0.6, 0.25, 0],
    extrapolate: 'clamp',
  });

  const flashOpacity = timeline.interpolate({
    inputRange: [0, 0.86, 0.93, 0.975, 1],
    outputRange: [0, 0, 0.92, 0.26, 0],
    extrapolate: 'clamp',
  });

  const overlayOpacity = timeline.interpolate({
    inputRange: [0, 0.94, 1],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

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
            styles.logoGroup,
            {
              opacity: logoOpacity,
              transform: [{ translateY: logoY }, { scale: logoScale }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.glow,
              {
                width: logoWidth * 0.82,
                height: logoWidth * 0.28,
                borderRadius: logoWidth * 0.14,
                opacity: glowOpacity,
              },
            ]}
          />

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
  logoGroup: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: 'rgba(227,33,43,0.16)',
    shadowColor: RED,
    shadowOpacity: 0.7,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
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
