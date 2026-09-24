import React from 'react';
import { Animated } from 'react-native';
import { Rect, type RectProps } from 'react-native-svg';

export type AnimatedClipRectProps = Omit<RectProps, 'width'> & {
  progress: Animated.Value;
  inputRange: number[];
  outputRange: number[];
};
const AnimatedRect = Animated.createAnimatedComponent(Rect);

export default function AnimatedClipRect({ progress, inputRange, outputRange, ...props }: AnimatedClipRectProps) {
  const width = progress.interpolate({ inputRange, outputRange, extrapolate: 'clamp' });
  return <AnimatedRect {...props} width={width} />;
}
