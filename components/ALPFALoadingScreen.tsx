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

const ALPFA_LOGO = require('../assets/images/NJITalpfa logo.pdf (6).png');

const NAVY = '#030712';
const WHITE = '#F7F8FA';
const TOTAL_MS = 5200;

type Props = { onAnimationComplete?: () => void };

type StrokeProps = {
  progress: Animated.Value;
  width: number;
  thickness: number;
  left: number;
  top: number;
  rotate: string;
  delay: number;
};

function DrawingStroke({ progress, width, thickness, left, top, rotate, delay }: StrokeProps) {
  const start = delay;
  const end = Math.min(delay + 0.22, 0.42);

  const scaleX = progress.interpolate({
    inputRange: [0, start, end, 1],
    outputRange: [0.001, 0.001, 1, 1],
    extrapolate: 'clamp',
  });

  const opacity = progress.interpolate({
    inputRange: [0, start, start + 0.04, 0.48, 0.58, 1],
    outputRange: [0, 0, 1, 1, 0, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.strokeWrap,
        {
          width,
          height: thickness,
          left,
          top,
          opacity,
          transform: [{ rotate }, { scaleX }],
        },
      ]}
    >
      <View
        style={[
          styles.strokeCore,
          { height: thickness, borderRadius: thickness / 2 },
        ]}
      />
    </Animated.View>
  );
}

export default function ALPFALoadingScreen({ onAnimationComplete }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const timeline = useRef(new Animated.Value(0)).current;

  const safeHeight = Math.max(1, height - insets.top - insets.bottom);
  const logoSize = Math.min(width * 0.80, safeHeight * 0.45, 380);
  const strokeThickness = Math.max(3, Math.min(logoSize * 0.015, 6));

  const stars = useMemo(
    () => [
      [8, 12, 1], [18, 28, 1.5], [29, 9, 1], [42, 21, 1.2], [55, 11, 1.6],
      [67, 30, 1], [82, 16, 1.4], [92, 35, 1], [12, 56, 1.3], [25, 72, 1],
      [39, 62, 1.5], [58, 76, 1], [73, 58, 1.3], [88, 68, 1], [49, 89, 1.2],
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

    animation.start(({ finished }) => {
      if (finished) onAnimationComplete?.();
    });

    return () => animation.stop();
  }, [onAnimationComplete, reducedMotion, timeline]);

  const logoScale = timeline.interpolate({
    inputRange: [0, 0.08, 0.28, 0.42, 0.55, 0.68, 0.78, 0.86, 0.92, 0.97, 1],
    outputRange: [1.45, 1.45, 1.22, 1.02, 0.90, 0.90, 1.05, 1.45, 2.45, 5.2, 8.6],
    extrapolate: 'clamp',
  });

  const logoOpacity = timeline.interpolate({
    inputRange: [0, 0.28, 0.40, 0.93, 0.985, 1],
    outputRange: [0, 0, 1, 1, 0.78, 0],
    extrapolate: 'clamp',
  });

  const logoY = timeline.interpolate({
    inputRange: [0, 0.42, 0.70, 0.90, 1],
    outputRange: [safeHeight * 0.015, 0, 0, -safeHeight * 0.01, -safeHeight * 0.045],
    extrapolate: 'clamp',
  });

  const taglineOpacity = timeline.interpolate({
    inputRange: [0, 0.42, 0.50, 0.66, 0.74, 1],
    outputRange: [0, 0, 1, 1, 0, 0],
    extrapolate: 'clamp',
  });

  const flashOpacity = timeline.interpolate({
    inputRange: [0, 0.92, 0.965, 0.99, 1],
    outputRange: [0, 0, 0.58, 0.10, 0],
    extrapolate: 'clamp',
  });

  const splashOpacity = timeline.interpolate({
    inputRange: [0, 0.95, 1],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  const starOpacity = timeline.interpolate({
    inputRange: [0, 0.08, 0.82, 1],
    outputRange: [0.18, 0.45, 0.45, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      pointerEvents="auto"
      style={[styles.root, { width, height, opacity: splashOpacity }]}
    >
      <View style={styles.background} />

      <Animated.View
        pointerEvents="none"
        style={[styles.starField, { opacity: starOpacity }]}
      >
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
                opacity: 0.45 + (index % 3) * 0.14,
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
            {!reducedMotion && (
              <View style={StyleSheet.absoluteFillObject}>
                <DrawingStroke
                  progress={timeline}
                  width={logoSize * 0.56}
                  thickness={strokeThickness}
                  left={logoSize * 0.05}
                  top={logoSize * 0.31}
                  rotate="-57deg"
                  delay={0.04}
                />
                <DrawingStroke
                  progress={timeline}
                  width={logoSize * 0.42}
                  thickness={strokeThickness}
                  left={logoSize * 0.50}
                  top={logoSize * 0.27}
                  rotate="62deg"
                  delay={0.10}
                />
                <DrawingStroke
                  progress={timeline}
                  width={logoSize * 0.38}
                  thickness={Math.max(2, strokeThickness * 0.55)}
                  left={logoSize * 0.27}
                  top={logoSize * 0.56}
                  rotate="-12deg"
                  delay={0.16}
                />
              </View>
            )}

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
  strokeWrap: {
    position: 'absolute',
    justifyContent: 'center',
  },
  strokeCore: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#FF3546',
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
