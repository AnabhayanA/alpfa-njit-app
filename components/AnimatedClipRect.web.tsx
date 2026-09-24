import React, { useEffect, useState } from 'react';
import { Rect } from 'react-native-svg';
import type { AnimatedClipRectProps } from './AnimatedClipRect';

export default function AnimatedClipRect({ progress, inputRange, outputRange, ...props }: AnimatedClipRectProps) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    // Listen to the source value: unattached interpolation nodes do not receive
    // updates from React Native Web's animation graph.
    const listener = progress.addListener(({ value: next }) => setValue(next));
    return () => progress.removeListener(listener);
  }, [progress]);
  const clamped = Math.max(inputRange[0], Math.min(value, inputRange[inputRange.length - 1]));
  let segment = 0;
  while (segment < inputRange.length - 2 && clamped > inputRange[segment + 1]) segment++;
  const fraction = (clamped - inputRange[segment]) / (inputRange[segment + 1] - inputRange[segment]);
  const width = outputRange[segment] + fraction * (outputRange[segment + 1] - outputRange[segment]);
  return <Rect {...props} width={width} />;
}
