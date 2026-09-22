import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { ClipPath, Defs, Path, Rect } from 'react-native-svg';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const ALPFA_RED_PATH = 'M127.25 271.39 c0.54 -0.88 18.07 -24.07 46.68 -61.67 5.32 -6.98 18.07 -23.78 28.32 -37.30 20.02 -26.32 47.95 -62.99 54.35 -71.29 2.15 -2.78 10.84 -14.11 19.29 -25.15 20.65 -26.86 19.68 -25.68 20.31 -25.68 0.34 0 3.13 5.86 6.20 13.04 3.08 7.23 9.72 22.41 14.75 33.84 8.45 19.19 20.36 46.48 32.76 74.85 2.78 6.40 5.08 11.91 5.08 12.26 0 0.88 -9.28 29.25 -9.52 29 -0.29 -0.24 -5.76 -17.29 -15.38 -47.75 -4.88 -15.43 -9.91 -31.35 -11.23 -35.40 -1.32 -4 -6.10 -19.09 -10.69 -33.45 -11.18 -35.06 -11.38 -35.69 -12.16 -35.55 -0.39 0.10 -3.13 4 -6.05 8.69 -9.03 14.26 -40.23 63.67 -45.80 72.51 -2.88 4.59 -8.15 12.94 -11.72 18.55 -21.53 34.03 -25.73 40.67 -41.36 65.43 -8.64 13.72 -18.80 29.79 -20.36 32.13 l-0.93 1.37 1.37 -0.34 c1.27 -0.29 1.32 -0.29 0.73 0.78 -0.34 0.63 -2 3.27 -3.71 5.91 -2.69 4.20 -3.32 4.83 -4.93 5.27 -2.83 0.83 -36.43 0.73 -35.99 -0.05z';

type Props = { progress: Animated.Value; size: number };

// The original filled SVG stays untouched. We only move clipping windows across it,
// so the visible geometry is always the real ALPFA mark — never a recreated stroke.

export default function AnimatedALPFAMark({ progress, size }: Props) {
  const leftWidth = progress.interpolate({
    inputRange: [0, 0.68, 1],
    outputRange: [0, 230, 230],
    extrapolate: 'clamp',
  });
  const rightWidth = progress.interpolate({
    inputRange: [0, 0.28, 1],
    outputRange: [0, 0, 115],
    extrapolate: 'clamp',
  });

  return (
    <View pointerEvents="none" style={[styles.stage, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 500 500" style={StyleSheet.absoluteFill}>
        <Defs>
          <ClipPath id="alpfa-left-reveal">
            <AnimatedRect x="120" y="40" width={leftWidth} height="245" />
          </ClipPath>
          <ClipPath id="alpfa-right-reveal">
            <AnimatedRect x="245" y="40" width={rightWidth} height="245" />
          </ClipPath>
        </Defs>
        <Path d={ALPFA_RED_PATH} fill="#E02125" clipPath="url(#alpfa-left-reveal)" />
        <Path d={ALPFA_RED_PATH} fill="#E02125" clipPath="url(#alpfa-right-reveal)" />
      </Svg>
    </View>
  );
}
