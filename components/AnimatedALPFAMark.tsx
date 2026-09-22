import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Defs, Filter, GaussianBlur, Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const ALPFA_RED_PATH = 'M127.25 271.39 c0.54 -0.88 18.07 -24.07 46.68 -61.67 5.32 -6.98 18.07 -23.78 28.32 -37.30 20.02 -26.32 47.95 -62.99 54.35 -71.29 2.15 -2.78 10.84 -14.11 19.29 -25.15 20.65 -26.86 19.68 -25.68 20.31 -25.68 0.34 0 3.13 5.86 6.20 13.04 3.08 7.23 9.72 22.41 14.75 33.84 8.45 19.19 20.36 46.48 32.76 74.85 2.78 6.40 5.08 11.91 5.08 12.26 0 0.88 -9.28 29.25 -9.52 29 -0.29 -0.24 -5.76 -17.29 -15.38 -47.75 -4.88 -15.43 -9.91 -31.35 -11.23 -35.40 -1.32 -4 -6.10 -19.09 -10.69 -33.45 -11.18 -35.06 -11.38 -35.69 -12.16 -35.55 -0.39 0.10 -3.13 4 -6.05 8.69 -9.03 14.26 -40.23 63.67 -45.80 72.51 -2.88 4.59 -8.15 12.94 -11.72 18.55 -21.53 34.03 -25.73 40.67 -41.36 65.43 -8.64 13.72 -18.80 29.79 -20.36 32.13 l-0.93 1.37 1.37 -0.34 c1.27 -0.29 1.32 -0.29 0.73 0.78 -0.34 0.63 -2 3.27 -3.71 5.91 -2.69 4.20 -3.32 4.83 -4.93 5.27 -2.83 0.83 -36.43 0.73 -35.99 -0.05z';

type Props = { progress: Animated.Value; size: number };

// These centerlines follow the two long strokes that visually build the ALPFA mark.
// We reveal the real filled SVG underneath each moving mask, so it looks like the
// thick red logo itself is being drawn rather than an outline tracing its border.
const DRAW_STROKES = [
  { d: 'M127 271 L296 50', length: 280, width: 48, start: 0.00, end: 0.72 },
  { d: 'M296 50 L346 213', length: 190, width: 48, start: 0.20, end: 0.86 },
];

export default function AnimatedALPFAMark({ progress, size }: Props) {
  const finalOpacity = progress.interpolate({
    inputRange: [0, 0.84, 0.96, 1],
    outputRange: [0, 0, 0.75, 1],
    extrapolate: 'clamp',
  });

  return (
    <View pointerEvents="none" style={[styles.stage, { width: size, height: size }]}>
      {DRAW_STROKES.map((stroke, index) => {
        const reveal = progress.interpolate({
          inputRange: [stroke.start, stroke.end],
          outputRange: [stroke.length, 0],
          extrapolate: 'clamp',
        });
        const opacity = progress.interpolate({
          inputRange: [stroke.start, Math.min(stroke.start + 0.03, stroke.end), stroke.end],
          outputRange: [0, 1, 1],
          extrapolate: 'clamp',
        });
        return (
          <Svg key={index} width={size} height={size} viewBox="0 0 500 500" style={StyleSheet.absoluteFill}>
            <Defs>
              <Filter id={`redGlow-${index}`} x="-40%" y="-40%" width="180%" height="180%">
                <GaussianBlur stdDeviation="7" />
              </Filter>
            </Defs>
            <AnimatedPath
              d={stroke.d}
              fill="none"
              stroke="#E02125"
              strokeWidth={stroke.width + 16}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={`${stroke.length} ${stroke.length}`}
              strokeDashoffset={reveal}
              opacity={opacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.24] })}
              filter={`url(#redGlow-${index})`}
            />
            <AnimatedPath
              d={stroke.d}
              fill="none"
              stroke="#E02125"
              strokeWidth={stroke.width}
              strokeLinecap="butt"
              strokeLinejoin="miter"
              strokeDasharray={`${stroke.length} ${stroke.length}`}
              strokeDashoffset={reveal}
              opacity={opacity}
            />
          </Svg>
        );
      })}
      <Animated.View style={[styles.stage, { width: size, height: size, opacity: finalOpacity }]}>
        <Svg width={size} height={size} viewBox="0 0 500 500">
          <Path d={ALPFA_RED_PATH} fill="#E02125" />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { position: 'absolute', left: 0, top: 0 },
});
