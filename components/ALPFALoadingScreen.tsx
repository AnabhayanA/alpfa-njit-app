import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

const NAVY = '#030712';
const RED = '#E02125';

type Props = { onAnimationComplete?: () => void };

export default function ALPFALoadingScreen({ onAnimationComplete }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1400),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 350,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1.06,
          duration: 350,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start(({ finished }) => {
      if (finished) onAnimationComplete?.();
    });

    return () => animation.stop();
  }, [onAnimationComplete, opacity, scale]);

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.lockup, { opacity, transform: [{ scale }] }]}>
        <Text style={styles.alpfa}>ALPFA</Text>
        <View style={styles.rule} />
        <Text style={styles.njit}>NJIT</Text>
        <Text style={styles.subtitle}>New Jersey Institute of Technology</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockup: {
    width: '86%',
    maxWidth: 380,
    alignItems: 'center',
  },
  alpfa: {
    color: RED,
    fontSize: 54,
    lineHeight: 62,
    fontWeight: '800',
    letterSpacing: 7,
  },
  rule: {
    width: 88,
    height: 3,
    borderRadius: 2,
    backgroundColor: RED,
    marginTop: 12,
    marginBottom: 20,
  },
  njit: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: 5,
  },
  subtitle: {
    color: '#FFFFFF',
    opacity: 0.82,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.7,
    marginTop: 5,
    textAlign: 'center',
  },
});
