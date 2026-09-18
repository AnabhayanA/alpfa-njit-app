import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedALPFAMark from './AnimatedALPFAMark';
import AnimatedALPFAWhiteLine from './AnimatedALPFAWhiteLine';
import NJITInstituteText from './NJITInstituteText';

const FULL_LOGO = require('../assets/images/NJITalpfa logo.pdf (6).png');
const NAVY = '#030712';
const TOTAL_MS = 5600;

type Props = { onAnimationComplete?: () => void };

export default function ALPFALoadingScreen({ onAnimationComplete }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const size = Math.min(width * 0.92, 390);
  const visibleHeight = Math.max(1, height - insets.top - insets.bottom);

  const redDraw = useRef(new Animated.Value(0)).current;
  const logoReveal = useRef(new Animated.Value(0)).current;
  const whiteLineDraw = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1.08)).current;
  const njitOpacity = useRef(new Animated.Value(0)).current;
  const njitX = useRef(new Animated.Value(14)).current;
  const exitScale = useRef(new Animated.Value(1)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const intro = Animated.sequence([
      Animated.timing(redDraw, {
        toValue: 1,
        duration: 1050,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.parallel([
        Animated.timing(logoReveal, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(whiteLineDraw, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(njitOpacity, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(njitX, {
          toValue: 0,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]);

    intro.start();

    const exitTimer = setTimeout(() => {
      Animated.sequence([
        Animated.timing(exitScale, {
          toValue: 0.88,
          duration: 140,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(exitScale, {
            toValue: 10,
            duration: 430,
            easing: Easing.in(Easing.exp),
            useNativeDriver: true,
          }),
          Animated.timing(exitOpacity, {
            toValue: 0,
            duration: 430,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]).start(({ finished }) => {
        if (finished) onAnimationComplete?.();
      });
    }, TOTAL_MS - 570);

    return () => {
      intro.stop();
      clearTimeout(exitTimer);
    };
  }, [exitOpacity, exitScale, logoOpacity, logoReveal, logoScale, njitOpacity, njitX, onAnimationComplete, redDraw, whiteLineDraw]);

  const revealWidth = logoReveal.interpolate({
    inputRange: [0, 1],
    outputRange: [0, size],
    extrapolate: 'clamp',
  });

  const whiteLineWidth = whiteLineDraw.interpolate({
    inputRange: [0, 1],
    outputRange: [0, size * 0.60],
    extrapolate: 'clamp',
  });

  const completedLogoOpacity = logoReveal.interpolate({
    inputRange: [0, 0.82, 1],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const redOpacity = logoReveal.interpolate({
    inputRange: [0, 0.72, 1],
    outputRange: [1, 0.45, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      pointerEvents="auto"
      style={[
        styles.root,
        {
          opacity: exitOpacity,
          transform: [{ scale: exitScale }],
        },
      ]}
    >
      <View style={[styles.centerStage, { top: insets.top, height: visibleHeight }]}>
        <Animated.View
          style={[
            styles.lockup,
            {
              width: size,
              height: size,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFillObject, { opacity: redOpacity }]}
          >
            <AnimatedALPFAMark progress={redDraw} size={size} />
          </Animated.View>

          <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
            <AnimatedALPFAWhiteLine progress={whiteLineDraw} size={size} />
          </View>

          <Animated.View
            pointerEvents="none"
            style={[
              styles.fullLogoReveal,
              {
                width: revealWidth,
                height: size,
                opacity: completedLogoOpacity,
              },
            ]}
          >
            <Image
              source={FULL_LOGO}
              resizeMode="contain"
              style={{ width: size, height: size }}
              accessibilityIgnoresInvertColors
            />
          </Animated.View>

          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              {
                opacity: njitOpacity,
                transform: [{ translateX: njitX }],
              },
            ]}
          >
            <NJITInstituteText size={size} />
          </Animated.View>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: NAVY,
  },
  centerStage: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockup: {
    position: 'relative',
  },
  fullLogoReveal: {
    position: 'absolute',
    left: 0,
    top: 0,
    overflow: 'hidden',
  },
});
