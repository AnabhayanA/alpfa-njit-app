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
import AnimatedALPFAMark from './AnimatedALPFAMark';

const ALPFA_LOGO = require('../assets/images/NJITalpfa logo.pdf (6).png');

const NAVY = '#030712';
const WHITE = '#F7F8FA';
const RED = '#E02125';
const TOTAL_MS = 5000;

type Props = { onAnimationComplete?: () => void };

export default function ALPFALoadingScreen({ onAnimationComplete }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const timeline = useRef(new Animated.Value(0)).current;
  const drawProgress = useRef(new Animated.Value(0)).current;

  const safeHeight = Math.max(1, height - insets.top - insets.bottom);
  const logoSize = Math.min(width * 0.82, safeHeight * 0.48, 390);

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
            toValue: 0.7,
            duration: 450,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay(550),
          Animated.timing(timeline, {
            toValue: 1,
            duration: 300,
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
          Animated.delay(500),
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
    inputRange: [0, 0.12, 0.34, 0.50, 0.64, 0.76, 0.84, 0.91, 0.955, 0.985, 1],
    outputRange: [1.26, 1.26, 1.14, 1.0, 0.72, 0.72, 0.88, 1.42, 3.0, 7.2, 10.4],
    extrapolate: 'clamp',
  });

  const logoY = timeline.interpolate({
    inputRange: [0, 0.50, 0.64, 0.84, 0.955, 1],
    outputRange: [safeHeight * 0.015, 0, safeHeight * 0.015, 0, -safeHeight * 0.01, -safeHeight * 0.05],
    extrapolate: 'clamp',
  });

  const vectorOpacity = timeline.interpolate({
    inputRange: [0, 0.08, 0.14, 0.32, 0.40, 1],
    outputRange: [0, 0, 1, 1, 0, 0],
    extrapolate: 'clamp',
  });

  const vectorGlowOpacity = timeline.interpolate({
    inputRange: [0, 0.10, 0.20, 0.32, 0.40, 1],
    outputRange: [0, 0, 0.10, 0.18, 0, 0],
    extrapolate: 'clamp',
  });

  const logoOpacity = timeline.interpolate({
    inputRange: [0, 0.28, 0.38, 0.94, 0.982, 1],
    outputRange: [0, 0, 1, 1, 0.70, 0],
    extrapolate: 'clamp',
  });

  const instituteOpacity = timeline.interpolate({
    inputRange: [0, 0.34, 0.44, 0.90, 0.96, 1],
    outputRange: [0, 0, 1, 1, 0.75, 0],
    extrapolate: 'clamp',
  });

  const instituteX = timeline.interpolate({
    inputRange: [0, 0.34, 0.48, 1],
    outputRange: [16, 16, 0, 0],
    extrapolate: 'clamp',
  });

  const flashOpacity = timeline.interpolate({
    inputRange: [0, 0.95, 0.98, 0.993, 1],
    outputRange: [0, 0, 1, 0.28, 0],
    extrapolate: 'clamp',
  });

  const splashOpacity = timeline.interpolate({
    inputRange: [0, 0.978, 1],
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

              <Animated.View
                pointerEvents="none"
                style={[
                  styles.njitOverlay,
                  {
                    opacity: instituteOpacity,
                    transform: [{ translateX: instituteX }],
                  },
                ]}
              >
                <View style={styles.njitDivider} />
                <Text
                  style={[
                    styles.njitText,
                    {
                      fontSize: Math.max(8, Math.min(logoSize * 0.028, 11)),
                      lineHeight: Math.max(10, Math.min(logoSize * 0.035, 14)),
                    },
                  ]}
                >
                  NEW JERSEY INSTITUTE{`\n`}OF TECHNOLOGY
                </Text>
              </Animated.View>
            </Animated.View>
          </View>
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
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  image: {
    width: '100%',
    height: '100%',
  },
  njitOverlay: {
    position: 'absolute',
    left: '46%',
    top: '67%',
    width: '50%',
    minHeight: '18%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  njitDivider: {
    width: 1,
    height: '72%',
    minHeight: 34,
    marginRight: 10,
    backgroundColor: 'rgba(247,248,250,0.82)',
  },
  njitText: {
    flexShrink: 1,
    color: WHITE,
    textAlign: 'left',
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: WHITE,
    zIndex: 20,
  },
});
