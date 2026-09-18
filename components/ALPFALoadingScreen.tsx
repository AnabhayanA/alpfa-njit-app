import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import AnimatedALPFAMark from './AnimatedALPFAMark';
import NJITInstituteText from './NJITInstituteText';

const ALPFA_LOGO = require('../assets/images/NJITalpfa logo.pdf (6).png');

const NAVY = '#030712';
const WHITE = '#F7F8FA';
const RED = '#E02125';
const TOTAL_MS = 5000;

type Props = { onAnimationComplete?: () => void };

export default function ALPFALoadingScreen({ onAnimationComplete }: Props) {
  const { width, height } = useWindowDimensions();
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const timeline = useRef(new Animated.Value(0)).current;
  const drawProgress = useRef(new Animated.Value(0)).current;

  const shortSide = Math.max(1, Math.min(width, height));
  const logoSize = Math.min(Math.max(shortSide * 0.62, 190), 330);

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
    inputRange: [0, 0.12, 0.34, 0.50, 0.64, 0.76, 0.84, 1],
    outputRange: [1.16, 1.16, 1.08, 1.0, 0.78, 0.78, 0.92, 8.6],
    extrapolate: 'clamp',
  });

  const logoY = timeline.interpolate({
    inputRange: [0, 0.50, 0.64, 0.84, 1],
    outputRange: [0, 0, 0, 0, 0],
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
        style={styles.safeContent}
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
                  StyleSheet.absoluteFillObject,
                  {
                    opacity: instituteOpacity,
                    transform: [{ translateX: instituteX }],
                  },
                ]}
              >
                <NJITInstituteText size={logoSize} />
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
    flex: 1,
    alignSelf: 'stretch',
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
    ...StyleSheet.absoluteFillObject,
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
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: WHITE,
    zIndex: 20,
  },
});
