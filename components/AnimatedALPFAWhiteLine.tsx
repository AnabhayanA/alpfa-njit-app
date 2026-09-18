import React from 'react';
import { Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Vector trace for the white lower stroke of the ALPFA mark.
// Kept separate from the completed artwork so it can genuinely draw on.
const WHITE_LINE_PATH = 'M145 287 L245 258 L326 287';
const DASH_LENGTH = 230;

type Props = {
  progress: Animated.Value;
  size: number;
};

export default function AnimatedALPFAWhiteLine({ progress, size }: Props) {
  const dashOffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [DASH_LENGTH, 0],
    extrapolate: 'clamp',
  });

  const opacity = progress.interpolate({
    inputRange: [0, 0.04, 1],
    outputRange: [0, 1, 1],
    extrapolate: 'clamp',
  });

  return (
    <Svg width={size} height={size} viewBox="0 0 500 500">
      <AnimatedPath
        d={WHITE_LINE_PATH}
        fill="none"
        stroke="#FFFFFF"
        strokeOpacity={opacity}
        strokeWidth={7}
        strokeLinecap="square"
        strokeLinejoin="miter"
        strokeDasharray={`${DASH_LENGTH} ${DASH_LENGTH}`}
        strokeDashoffset={dashOffset}
      />
    </Svg>
  );
}
