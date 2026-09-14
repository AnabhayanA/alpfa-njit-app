import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

type Props = {
  timeline: Animated.Value;
  screenWidth: number;
  screenHeight: number;
  startX: number;
  startY: number;
  angle: string;
  lengthRatio: number;
  thickness: number;
  start: number;
  peak: number;
  end: number;
  travelX: number;
  travelY: number;
  intensity?: number;
};

export default function LightStreak({
  timeline,
  screenWidth,
  screenHeight,
  startX,
  startY,
  angle,
  lengthRatio,
  thickness,
  start,
  peak,
  end,
  travelX,
  travelY,
  intensity = 1,
}: Props) {
  const length = Math.max(screenWidth * lengthRatio, 72);
  const fadeOut = Math.min(end + 0.02, 1);

  const opacity = timeline.interpolate({
    inputRange: [0, start, peak, end, fadeOut, 1],
    outputRange: [0, 0, Math.min(1, 0.88 * intensity), 0.52 * intensity, 0, 0],
    extrapolate: 'clamp',
  });

  const translateX = timeline.interpolate({
    inputRange: [0, start, peak, end, 1],
    outputRange: [0, 0, travelX * screenWidth * 0.58, travelX * screenWidth, travelX * screenWidth],
    extrapolate: 'clamp',
  });

  const translateY = timeline.interpolate({
    inputRange: [0, start, peak, end, 1],
    outputRange: [0, 0, travelY * screenHeight * 0.58, travelY * screenHeight, travelY * screenHeight],
    extrapolate: 'clamp',
  });

  const scaleX = timeline.interpolate({
    inputRange: [0, start, peak, end, 1],
    outputRange: [0.18, 0.18, 1.2, 1.85, 1.85],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          left: screenWidth * startX,
          top: screenHeight * startY,
          width: length,
          height: thickness * 5,
          opacity,
          transform: [
            { rotate: angle },
            { translateX },
            { translateY },
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
    backgroundColor: 'rgba(255, 36, 68, 0.20)',
  },
  core: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#FF2444',
  },
});
