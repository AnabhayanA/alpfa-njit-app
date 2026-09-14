import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

type Props = {
  progress: Animated.Value;
  rush: Animated.Value;
  screenWidth: number;
  screenHeight: number;
  startX: number;
  startY: number;
  angle: string;
  lengthRatio: number;
  thickness: number;
  delay?: number;
  directionX: number;
  directionY: number;
};

export default function LightStreak({
  progress,
  rush,
  screenWidth,
  screenHeight,
  startX,
  startY,
  angle,
  lengthRatio,
  thickness,
  delay = 0,
  directionX,
  directionY,
}: Props) {
  const length = Math.max(screenWidth * lengthRatio, 64);
  const start = Math.min(Math.max(delay, 0), 0.45);
  const mid = Math.min(start + 0.34, 0.78);
  const late = Math.min(start + 0.7, 0.95);

  const opacity = progress.interpolate({
    inputRange: [0, start, mid, late, 1],
    outputRange: [0, 0, 0.95, 0.62, 0],
  });
  const buildScale = progress.interpolate({
    inputRange: [0, start, 1],
    outputRange: [0.04, 0.04, 1],
  });
  const rushScale = rush.interpolate({ inputRange: [0, 1], outputRange: [1, 3.1] });
  const translateX = rush.interpolate({ inputRange: [0, 1], outputRange: [0, directionX * screenWidth * 0.18] });
  const translateY = rush.interpolate({ inputRange: [0, 1], outputRange: [0, directionY * screenHeight * 0.09] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          left: screenWidth * startX,
          top: screenHeight * startY,
          width: length,
          height: thickness * 4,
          opacity,
          transform: [
            { rotate: angle },
            { translateX },
            { translateY },
            { scaleX: Animated.multiply(buildScale, rushScale) },
          ],
        },
      ]}
    >
      <View style={[styles.glow, { height: thickness * 4, borderRadius: thickness * 2 }]} />
      <View style={[styles.core, { height: thickness, borderRadius: thickness / 2 }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', justifyContent: 'center' },
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
