import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedALPFAMark from './AnimatedALPFAMark';
import NJITInstituteText from './NJITInstituteText';

const FULL_LOGO = require('../assets/images/NJITalpfa logo.pdf (6).png');
const NAVY = '#030712';
const TOTAL_MS = 5600;

type Props = { onAnimationComplete?: () => void };

export default function ALPFALoadingScreen({ onAnimationComplete }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const visibleHeight = Math.max(1, height - insets.top - insets.bottom);
  const usableWidth = Math.max(1, width);
  const size =
    Platform.OS === 'web'
      ? Math.min(usableWidth * 0.92, 390)
      : Math.min(usableWidth * 0.84, visibleHeight * 0.46, 360);

  const redDraw = useRef(new Animated.Value(0)).current;
  const artworkReveal = useRef(new Animated.Value(0)).current;
  const njitOpacity = useRef(new Animated.Value(0)).current;
  const njitX = useRef(new Animated.Value(14)).current;
  const stageScale = useRef(new Animated.Value(1.12)).current;
  const exitScale = useRef(new Animated.Value(1)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  // Native is intentionally simple: one real image, one native-driver timeline.
  // This avoids SVG/JS-thread animation problems in Expo Go.
  const nativeOpacity = useRef(new Animated.Value(0)).current;
  const nativeScale = useRef(new Animated.Value(0.72)).current;
  const nativeTranslateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    if (Platform.OS !== 'web') {
      const animation = Animated.sequence([
        Animated.delay(450),
        Animated.parallel([
          Animated.timing(nativeOpacity, {
            toValue: 1,
            duration: 850,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(nativeScale, {
            toValue: 1,
            duration: 950,
            easing: Easing.out(Easing.back(1.08)),
            useNativeDriver: true,
          }),
          Animated.timing(nativeTranslateY, {
            toValue: 0,
            duration: 850,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(2100),
        Animated.timing(nativeScale, {
          toValue: 0.9,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(nativeScale, {
            toValue: 5.5,
            duration: 650,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(nativeOpacity, {
            toValue: 0,
            duration: 600,
            delay: 100,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]);

      animation.start(({ finished }) => {
        if (finished) onAnimationComplete?.();
      });

      return () => animation.stop();
    }

    const intro = Animated.sequence([
      Animated.delay(350),
      Animated.timing(redDraw, {
        toValue: 1,
        duration: 1050,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.parallel([
        Animated.timing(artworkReveal, {
          toValue: 1,
          duration: 1150,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(stageScale, {
          toValue: 1,
          duration: 1150,
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
          toValue: 0.86,
          duration: 170,
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
    }, TOTAL_MS - 600);

    return () => {
      intro.stop();
      clearTimeout(exitTimer);
    };
  }, [artworkReveal, exitOpacity, exitScale, nativeOpacity, nativeScale, nativeTranslateY, njitOpacity, njitX, onAnimationComplete, redDraw, stageScale]);

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.root} pointerEvents="auto">
        <View style={[styles.centerStage, { top: insets.top, height: visibleHeight }]}>
          <Animated.View
            style={{
              width: size,
              height: size,
              opacity: nativeOpacity,
              transform: [{ translateY: nativeTranslateY }, { scale: nativeScale }],
            }}
          >
            <Image
              source={FULL_LOGO}
              resizeMode="contain"
              style={styles.nativeLogo}
              accessibilityIgnoresInvertColors
            />
          </Animated.View>
        </View>
      </View>
    );
  }

  const revealWidth = artworkReveal.interpolate({
    inputRange: [0, 1],
    outputRange: [0, size],
    extrapolate: 'clamp',
  });

  const artworkOpacity = artworkReveal.interpolate({
    inputRange: [0, 0.03, 1],
    outputRange: [0, 1, 1],
    extrapolate: 'clamp',
  });

  const redGuideOpacity = artworkReveal.interpolate({
    inputRange: [0, 0.65, 1],
    outputRange: [1, 0.65, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      pointerEvents="auto"
      style={[styles.root, { opacity: exitOpacity, transform: [{ scale: exitScale }] }]}
    >
      <View style={[styles.centerStage, { top: insets.top, height: visibleHeight }]}>
        <Animated.View
          style={[
            styles.lockup,
            { width: size, height: size, transform: [{ scale: stageScale }] },
          ]}
        >
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFillObject, { opacity: redGuideOpacity }]}
          >
            <AnimatedALPFAMark progress={redDraw} size={size} />
          </Animated.View>

          <Animated.View
            pointerEvents="none"
            style={[
              styles.artworkReveal,
              { width: revealWidth, height: size, opacity: artworkOpacity },
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
              { opacity: njitOpacity, transform: [{ translateX: njitX }] },
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
  nativeLogo: {
    width: '100%',
    height: '100%',
  },
  lockup: {
    position: 'relative',
  },
  artworkReveal: {
    position: 'absolute',
    left: 0,
    top: 0,
    overflow: 'hidden',
  },
});
