import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import AnimatedALPFAMark from './AnimatedALPFAMark';

const ALPFA_LOGO = require('../assets/images/NJITalpfa logo.pdf (6).png');

const NAVY = '#030712';
const WHITE = '#F7F8FA';
const RED = '#E02125';
const TOTAL_MS = 5300;

type Props = { onAnimationComplete?: () => void };

export default function ALPFALoadingScreen({ onAnimationComplete }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const timeline = useRef(new Animated.Value(0)).current;
  const drawProgress = useRef(new Animated.Value(0)).current;

  const safeHeight = Math.max(1, height - insets.top - insets.bottom);
  const logoSize = Math.min(width * 0.8, safeHeight * 0.45, 380);

  const stars = useMemo(
    () => [
      [8, 12, 1], [18, 28, 1.5], [29, 9, 1], [42, 21, 1.2], [55, 11, 1.6],
      [67, 30, 1], [82, 16, 1.4], [92, 35, 1], [12, 56, 1.3], [25, 72, 1],
      [39, 62, 1.5], [58, 76, 1], [73, 58, 1.3], [88, 68, 1], [49, 89, 1.2],
      [5, 82, 1], [16, 91, 1.3], [33, 40, 1], [63, 43, 1.4], [95, 83, 1.2],
    ],
    []
  );

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
    drawProgress.setValue(reducedMotion ? 1 : 0);

    const animation = reducedMotion
      ? Animated.sequence([
          Animated.timing(timeline, {
            toValue: 0.62,
            duration: 450,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay(650),
          Animated.timing(timeline, {
            toValue: 1,
            duration: 350,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      : Animated.timing(timeline, {
          toValue: 1,
          duration: TOTAL_MS,
          easing: Easing.linear,
          useNativeDriver: true,
        });

    const drawingAnimation = reducedMotion
      ? null
      : Animated.sequence([
          Animated.delay(700),
          Animated.timing(drawProgress, {
            toValue: 1,
            duration: 1250,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: false,
          }),
        ]);

    drawingAnimation?.start();
    animation.start(({ finished }) => {
      if (finished) onAnimationComplete?.();
    });

    return () => {
      animation.stop();
      drawingAnimation?.stop();
    };
  }, [drawProgress, onAnimationComplete, reducedMotion, timeline]);

  const logoScale = timeline.interpolate({
    inputRange: [0, 0.12, 0.35, 0.48, 0.61, 0.72, 0.82, 0.89, 0.94, 0.975, 1],
    outputRange: [1.34, 1.34, 1.18, 1.0, 0.66, 0.66, 0.72, 1.12, 2.55, 6.8, 10.2],
    extrapolate: 'clamp',
  });

  const logoY = timeline.interpolate({
    inputRange: [0, 0.48, 0.61, 0.82, 0.94, 1],
    outputRange: [safeHeight * 0.02, 0, safeHeight * 0.02, 0, -safeHeight * 0.012, -safeHeight * 0.055],
    extrapolate: 'clamp',
  });

  const vectorOpacity = timeline.interpolate({
    inputRange: [0, 0.10, 0.16, 0.34, 0.42, 1],
    outputRange: [0, 0, 1, 1, 0, 0],
    extrapolate: 'clamp',
  });

  const vectorGlowOpacity = timeline.interpolate({
    inputRange: [0, 0.13, 0.22, 0.35, 0.42, 1],
    outputRange: [0, 0, 0.12, 0.22, 0, 0],
    extrapolate: 'clamp',
  });

  const logoOpacity = timeline.interpolate({
    inputRange: [0, 0.31, 0.40, 0.94, 0.982, 1],
    outputRange: [0, 0, 1, 1, 0.70, 0],
    extrapolate: 'clamp',
  });

  const taglineOpacity = timeline.interpolate({
    inputRange: [0, 0.49, 0.55, 0.69, 0.77, 1],
    outputRange: [0, 0, 1, 1, 0, 0],
    extrapolate: 'clamp',
  });

  const flashOpacity = timeline.interpolate({
    inputRange: [0, 0.945, 0.978, 0.992, 1],
    outputRange: [0, 0, 1, 0.30, 0],
    extrapolate: 'clamp',
  });

  const splashOpacity = timeline.interpolate({
    inputRange: [0, 0.978, 1],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  const starOpacity = timeline.interpolate({
    inputRange: [0, 0.10, 0.78, 0.93, 1],
    outputRange: [0.05, 0.38, 0.44, 0.16, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      pointerEvents="auto"
      style={[styles.root, { width, height, opacity: splashOpacity }]}
    >
      <View style={styles.background} />

      <Animated.View pointerEvents="none" style={[styles.starField, { opacity: starOpacity }]}>
        {stars.map(([x, y, size], index) => (
          <View
            key={index}
            style={[
              styles.star,
              {
                left: `${x}%`,
                top: `${y}%`,
                width: size,
                height: size,
                borderRadius: size,
                opacity: 0.42 + (index % 3) * 0.16,
              },
            ]}
          />
        ))}
      </Animated.View>

      <View
        pointerEvents="none"
        style={[styles.safeContent, { top: insets.top, height: safeHeight }]}
      >
        <Animated.View
          style={[
            styles.logoStage,
            { transform: [{ translateY: logoY }, { scale: logoScale }] },
          ]}
        >
          <View style={{ width: logoSize, height: logoSize }}>
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFillObject,
                styles.vectorGlow,
                { opacity: vectorGlowOpacity },
              ]}
            >
              <AnimatedALPFAMark progress={drawProgress} size={logoSize} />
            </Animated.View>

            <Animated.View
              pointerEvents="none"
              style={[StyleSheet.absoluteFillObject, { opacity: vectorOpacity }]}
            >
              <AnimatedALPFAMark progress={drawProgress} size={logoSize} />
            </Animated.View>

            <Animated.View
              style={{ width: logoSize, height: logoSize, opacity: logoOpacity }}
            >
              <Image
                source={ALPFA_LOGO}
                resizeMode="contain"
                style={styles.image}
                accessibilityIgnoresInvertColors
              />

              <View style={styles.njitOverlay} pointerEvents="none">
                <Text
                  style={[
                    styles.njitText,
                    { fontSize: Math.max(8, Math.min(logoSize * 0.032, 12)) },
                  ]}
                >
                  NEW JERSEY INSTITUTE{`\n`}OF TECHNOLOGY
                </Text>
              </View>
            </Animated.View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.taglineWrap, { opacity: taglineOpacity }]}>
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
  starField: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#DDEBFF',
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
  vectorGlow: {
    shadowColor: RED,
    shadowOpacity: 0.45,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 0 },
  },
  image: {
    width: '100%',
    height: '100%',
  },
  njitOverlay: {
    position: 'absolute',
    left: '32%',
    top: '68%',
    width: '58%',
    alignItems: 'center',
  },
  njitText: {
    color: WHITE,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 0.25,
    lineHeight: 13,
  },
  taglineWrap: {
    marginTop: 4,
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
