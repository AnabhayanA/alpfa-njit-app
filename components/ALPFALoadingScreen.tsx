import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedALPFAMark from './AnimatedALPFAMark';
import NJITInstituteText from './NJITInstituteText';

const FULL_LOGO = require('../assets/images/NJITalpfa logo.pdf (6).png');
const NAVY = '#030712';
const SPLASH_DURATION_MS = 3800;
const EXIT_ANIMATION_MS = 430;

type Props = { onAnimationComplete?: () => void };

export default function ALPFALoadingScreen({ onAnimationComplete }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const size = Math.min(width * 0.92, 390);
  const visibleHeight = Math.max(1, height - insets.top - insets.bottom);

  const alpfaProgress = useRef(new Animated.Value(0)).current;
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;
  const wordmarkTranslate = useRef(new Animated.Value(-18)).current;
  const njitOpacity = useRef(new Animated.Value(0)).current;
  const njitTranslate = useRef(new Animated.Value(8)).current;
  const groupScale = useRef(new Animated.Value(0.96)).current;
  const exitScale = useRef(new Animated.Value(1)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(alpfaProgress, {
        toValue: 1,
        duration: 820,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.parallel([
        Animated.timing(wordmarkOpacity, {
          toValue: 1,
          duration: 360,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(wordmarkTranslate, {
          toValue: 0,
          duration: 360,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(njitOpacity, {
          toValue: 1,
          duration: 480,
          useNativeDriver: true,
        }),
        Animated.timing(njitTranslate, {
          toValue: 0,
          duration: 480,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(groupScale, {
          toValue: 1,
          friction: 8,
          tension: 45,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const exitTimer = setTimeout(() => {
      Animated.sequence([
        Animated.timing(exitScale, {
          toValue: 0.92,
          duration: 80,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(exitScale, {
            toValue: 8,
            duration: EXIT_ANIMATION_MS - 80,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(exitOpacity, {
            toValue: 0,
            duration: EXIT_ANIMATION_MS - 80,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]).start(({ finished }) => {
        if (finished) onAnimationComplete?.();
      });
    }, SPLASH_DURATION_MS - EXIT_ANIMATION_MS);

    return () => clearTimeout(exitTimer);
  }, [alpfaProgress, exitOpacity, exitScale, groupScale, njitOpacity, njitTranslate, onAnimationComplete, wordmarkOpacity, wordmarkTranslate]);

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
              transform: [{ scale: groupScale }],
            },
          ]}
        >
          <View
            pointerEvents="none"
            style={[
              styles.alpfaLayer,
              {
                width: size,
                height: size,
                transform: [{ translateY: size * 0.015 }],
              },
            ]}
          >
            <AnimatedALPFAMark progress={alpfaProgress} size={size} />
            <Animated.View
              style={[
                styles.alpfaWordmarkCrop,
                {
                  left: size * 0.20,
                  top: size * 0.43,
                  width: size * 0.60,
                  height: size * 0.10,
                  opacity: wordmarkOpacity,
                  transform: [{ translateX: wordmarkTranslate }],
                },
              ]}
            >
              <Image
                source={FULL_LOGO}
                resizeMode="contain"
                style={{
                  width: size,
                  height: size,
                  marginLeft: -size * 0.20,
                  marginTop: -size * 0.43,
                }}
                accessibilityIgnoresInvertColors
              />
            </Animated.View>
          </View>

          <Animated.View
            style={[
              styles.njitLayer,
              {
                opacity: njitOpacity,
                transform: [{ translateY: njitTranslate }],
              },
            ]}
          >
            <View
              style={[
                styles.highlanderCrop,
                {
                  left: size * 0.20,
                  top: size * 0.56,
                  width: size * 0.18,
                  height: size * 0.18,
                },
              ]}
            >
              <Image
                source={FULL_LOGO}
                resizeMode="contain"
                style={{
                  width: size,
                  height: size,
                  marginLeft: -size * 0.20,
                  marginTop: -size * 0.56,
                }}
                accessibilityIgnoresInvertColors
              />
            </View>

            <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
              <NJITInstituteText size={size} />
            </View>
          </Animated.View>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
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
  alpfaLayer: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  alpfaWordmarkCrop: {
    position: 'absolute',
    overflow: 'hidden',
  },
  njitLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  highlanderCrop: {
    position: 'absolute',
    overflow: 'hidden',
  },
});
