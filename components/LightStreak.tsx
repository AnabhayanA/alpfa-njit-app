import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

type Props = {
  timeline: Animated.Value;
  screenWidth: number;
  screenHeight: number;
  angleDeg: number;
  lengthRatio: number;
  thickness: number;
  start: number;
  peak: number;
  end: number;
  startRadius?: number;
  endRadius?: number;
  intensity?: number;
};

export default function LightStreak({
  timeline,
  screenWidth,
  screenHeight,
  angleDeg,
  lengthRatio,
  thickness,
  start,
  peak,
  end,
  startRadius = 0.05,
  endRadius = 0.78,
  intensity = 1,
}: Props) {
  const length = Math.max(screenWidth * lengthRatio, 64);
  const centerX = screenWidth / 2;
  const centerY = screenHeight / 2;
  const theta = (angleDeg * Math.PI) / 180;
  const baseRadius = Math.min(screenWidth, screenHeight);
  const fadeOut = Math.min(end + 0.025, 1);

  const opacity = timeline.interpolate({
    inputRange: [0, start, peak, end, fadeOut, 1],
    outputRange: [0, 0, Math.min(1, 0.96 * intensity), 0.52 * intensity, 0, 0],
    extrapolate: 'clamp',
  });

  const radius = timeline.interpolate({
    inputRange: [0, start, peak, end, 1],
    outputRange: [
      baseRadius * startRadius,
      baseRadius * startRadius,
      baseRadius * ((startRadius + endRadius) * 0.34),
      baseRadius * endRadius,
      baseRadius * endRadius,
    ],
    extrapolate: 'clamp',
  });

  const translateX = Animated.multiply(radius, Math.cos(theta));
  const translateY = Animated.multiply(radius, Math.sin(theta));

  const scaleX = timeline.interpolate({
    inputRange: [0, start, peak, end, 1],
    outputRange: [0.18, 0.18, 1.15, 1.7, 1.7],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          left: centerX - length / 2,
          top: centerY - thickness * 2.5,
          width: length,
          height: thickness * 5,
          opacity,
          transform: [
            { translateX },
            { translateY },
            { rotate: `${angleDeg}deg` },
            { scaleX },
          ],
        },
      ]}
    >
      <View style={[styles.glow, { height: thickness * 5, borderRadius: thickness * 2.5 }]} />
      <View style={[styles.core, { height: thickness, borderRadius: thickness / 2 }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 36, 68, 0.22)',
  },
  core: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#FF2444',
  },
});
