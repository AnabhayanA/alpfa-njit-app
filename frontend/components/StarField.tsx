import shadow from '../utils/shadow';
import { Platform } from 'react-native';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

type Star = {
  x: number;
  y: number;
  size: number;
  opacity: number;
  glow?: boolean;
  delay?: number;
};

type Props = {
  width: number;
  height: number;
  motion?: Animated.Value;
  reducedMotion?: boolean;
};

const STARS: Star[] = [
  { x: 5, y: 8, size: 2, opacity: 0.7 }, { x: 12, y: 17, size: 1, opacity: 0.42 },
  { x: 20, y: 10, size: 2, opacity: 0.58 }, { x: 29, y: 24, size: 1, opacity: 0.36 },
  { x: 37, y: 7, size: 2, opacity: 0.67, glow: true }, { x: 45, y: 19, size: 1, opacity: 0.34 },
  { x: 54, y: 12, size: 2, opacity: 0.82, glow: true }, { x: 62, y: 25, size: 1, opacity: 0.4 },
  { x: 71, y: 8, size: 2, opacity: 0.62 }, { x: 81, y: 19, size: 1, opacity: 0.44 },
  { x: 91, y: 11, size: 2, opacity: 0.69 }, { x: 8, y: 34, size: 1, opacity: 0.32 },
  { x: 17, y: 45, size: 2, opacity: 0.63 }, { x: 27, y: 36, size: 1, opacity: 0.4 },
  { x: 38, y: 50, size: 2, opacity: 0.7, glow: true }, { x: 48, y: 31, size: 1, opacity: 0.32 },
  { x: 58, y: 45, size: 2, opacity: 0.59 }, { x: 68, y: 35, size: 1, opacity: 0.38 },
  { x: 78, y: 51, size: 2, opacity: 0.69 }, { x: 90, y: 40, size: 1, opacity: 0.36 },
  { x: 4, y: 58, size: 2, opacity: 0.54 }, { x: 14, y: 68, size: 1, opacity: 0.32 },
  { x: 24, y: 59, size: 2, opacity: 0.64 }, { x: 34, y: 75, size: 1, opacity: 0.38 },
  { x: 45, y: 64, size: 2, opacity: 0.68, glow: true }, { x: 55, y: 79, size: 1, opacity: 0.34 },
  { x: 65, y: 61, size: 2, opacity: 0.58 }, { x: 76, y: 72, size: 1, opacity: 0.4 },
  { x: 87, y: 64, size: 2, opacity: 0.66 }, { x: 95, y: 78, size: 1, opacity: 0.34 },
  { x: 9, y: 88, size: 2, opacity: 0.5 }, { x: 22, y: 82, size: 1, opacity: 0.32 },
  { x: 36, y: 92, size: 2, opacity: 0.62 }, { x: 51, y: 88, size: 1, opacity: 0.36 },
  { x: 67, y: 94, size: 2, opacity: 0.54 }, { x: 82, y: 87, size: 1, opacity: 0.34 },
  { x: 93, y: 93, size: 2, opacity: 0.5 }, { x: 32, y: 16, size: 1, opacity: 0.34 },
  { x: 73, y: 29, size: 2, opacity: 0.56, glow: true }, { x: 61, y: 84, size: 1, opacity: 0.32 },
];

function GlowStar({ x, y, size, opacity, width, height }: Star & { width: number; height: number }) {
  const twinkle = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkle, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(twinkle, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: Platform.OS !== 'web' }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [twinkle]);

  return (
    <Animated.View
      style={[
        styles.glowStar,
        {
          left: width * (x / 100),
          top: height * (y / 100),
          width: size * 4,
          height: size * 4,
          borderRadius: size * 2,
          opacity: twinkle.interpolate({ inputRange: [0, 1], outputRange: [opacity * 0.55, opacity] }),
          transform: [{ scale: twinkle.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.25] }) }],
        },
      ]}
    />
  );
}

export default function StarField({ width, height, motion, reducedMotion = false }: Props) {
  const staticStars = useMemo(() => STARS.filter((star) => !star.glow), []);
  const glowStars = useMemo(() => STARS.filter((star) => star.glow), []);

  const translateY = motion && !reducedMotion
    ? motion.interpolate({ inputRange: [0, 1], outputRange: [0, height * 0.012] })
    : 0;
  const scale = motion && !reducedMotion
    ? motion.interpolate({ inputRange: [0, 1], outputRange: [1, 1.018] })
    : 1;

  return (
    <Animated.View style={[styles.fill, { width, height, transform: [{ translateY }, { scale }] }]}>
      {staticStars.map((star, index) => (
        <View
          key={`star-${index}`}
          style={[
            styles.star,
            {
              left: width * (star.x / 100),
              top: height * (star.y / 100),
              width: star.size,
              height: star.size,
              borderRadius: star.size,
              opacity: star.opacity,
            },
          ]}
        />
      ))}
      {glowStars.map((star, index) => (
        <GlowStar key={`glow-${index}`} {...star} width={width} height={height} />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', left: 0, top: 0, overflow: 'hidden' },
  star: { position: 'absolute', backgroundColor: '#DCEBFF' },
  glowStar: {
    position: 'absolute',
    backgroundColor: '#D9EAFF',
    ...shadow('#9FC8FF', 0.65, 6, 0, 0),
  },
});
