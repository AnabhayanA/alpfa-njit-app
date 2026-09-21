import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import AnimatedALPFAMark from './AnimatedALPFAMark';
import NJITInstituteText from './NJITInstituteText';

const NAVY = '#030712';
const BLUE = '#014C8F';
const GRAY = '#888888';

const LETTERS = [
  'M220.65 210.11 c1.03 -2.39 2.93 -6.64 4.25 -9.52 l2.34 -5.27 2.78 0 2.83 0 4.39 9.08 c2.44 5.03 4.44 9.33 4.44 9.52 0 0.24 -1.17 0.44 -2.64 0.44 -2.39 0 -2.64 -0.10 -2.93 -1.17 -0.54 -2.25 -1.56 -2.73 -5.47 -2.73 -4.25 0 -5.22 0.39 -6.05 2.44 -0.59 1.37 -0.78 1.46 -3.17 1.46 l-2.59 0 1.81 -4.25z m11.96 -4.15 c-0.54 -1.81 -2.15 -4.79 -2.54 -4.79 -0.39 0 -2.54 4.74 -2.54 5.52 0 0.20 1.22 0.34 2.73 0.34 2.59 0 2.69 -0.05 2.34 -1.07z',
  'M247.56 204.83 l0 -9.52 2.44 0 2.44 0 0 7.57 0 7.57 5.13 0 5.13 0 0 1.95 0 1.95 -7.57 0 -7.57 0 0 -9.52z',
  'M269.04 204.83 l0 -9.52 5.13 0 c6.01 0 8.06 0.63 9.52 3.03 1.17 1.95 1.22 2.93 0.24 4.98 -1.03 2.10 -3.08 3.22 -6.74 3.61 l-3.03 0.34 -0.15 3.56 -0.15 3.52 -2.39 0 -2.44 0 0 -9.52z m9.67 -2.15 c0.39 -0.24 0.59 -1.03 0.49 -1.81 -0.15 -1.32 -0.29 -1.42 -2.69 -1.56 l-2.59 -0.15 0 1.95 0 2 2.10 0 c1.12 0 2.34 -0.20 2.69 -0.44z',
  'M290.63 204.98 l0.15 -9.42 6.98 -0.15 6.93 -0.15 0 2 0 1.95 -4.69 0 -4.64 0 0.15 1.86 0.15 1.81 4.54 0.15 4.49 0.15 0 1.66 0 1.71 -2.54 0.05 c-1.42 0 -3.47 0.15 -4.54 0.34 l-1.95 0.34 0.15 2.54 c0.29 4.05 -0.05 4.54 -2.88 4.54 l-2.39 0 0.10 -9.38z',
  'M310.11 208.89 c1.37 -3.03 3.27 -7.32 4.20 -9.52 l1.76 -4.05 2.78 0 2.78 0 4.44 9.28 c2.49 5.13 4.49 9.38 4.49 9.52 0 0.15 -1.17 0.24 -2.59 0.24 -2.59 0 -2.64 -0.05 -3.52 -1.95 l-0.88 -2 -4.44 0.15 -4.44 0.15 -0.88 1.86 c-0.88 1.76 -0.98 1.81 -3.52 1.81 l-2.64 0 2.44 -5.47z m11.57 -2.25 c-0.05 -0.20 -0.54 -1.37 -1.07 -2.69 -0.49 -1.27 -1.22 -2.29 -1.56 -2.29 -0.59 0 -2.64 3.86 -2.64 4.93 0 0.24 1.22 0.44 2.73 0.44 1.51 0 2.64 -0.15 2.54 -0.39z',
];

const CONNECTORS = [
  'M162.60 271.24 c0 -0.10 1.61 -2.73 3.61 -5.81 3.61 -5.52 3.66 -5.57 6.25 -6.35 2.88 -0.83 45.56 -12.26 59.47 -15.92 4.98 -1.32 11.08 -2.98 13.57 -3.66 2.49 -0.68 4.93 -1.22 5.42 -1.22 0.49 0 1.56 -0.34 2.39 -0.78 0.93 -0.44 2.44 -0.68 4 -0.59 2.73 0.15 5.66 -0.98 -35.40 13.67 -61.67 21.97 -59.33 21.19 -59.33 20.65z',
  'M305.18 251.90 c-27.34 -8.84 -40.87 -13.28 -41.21 -13.67 -1.37 -1.27 2.20 -0.78 10.35 1.51 5.03 1.37 13.09 3.61 17.92 4.93 14.26 3.91 14.75 4.10 15.38 6.10 0.34 0.98 0.49 1.81 0.39 1.86 -0.05 0.10 -1.37 -0.24 -2.83 -0.73z',
];

type Props = { onAnimationComplete?: () => void };

export default function ALPFALoadingScreen({ onAnimationComplete }: Props) {
  const { width, height } = useWindowDimensions();
  const size = Math.min(width * 0.94, height * 0.58, 410);
  const mark = useRef(new Animated.Value(0)).current;
  const letters = useRef(new Animated.Value(0)).current;
  const connector = useRef(new Animated.Value(0)).current;
  const njit = useRef(new Animated.Value(0)).current;
  const stage = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(180),
      Animated.timing(mark, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.parallel([
        Animated.timing(letters, { toValue: 1, duration: 480, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(connector, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.timing(njit, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.delay(1100),
      Animated.timing(stage, { toValue: 0, duration: 420, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]);
    animation.start(({ finished }) => finished && onAnimationComplete?.());
    return () => animation.stop();
  }, [connector, letters, mark, njit, onAnimationComplete, stage]);

  const lettersY = letters.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });
  const connectorX = connector.interpolate({ inputRange: [0, 1], outputRange: [-18, 0] });
  const njitX = njit.interpolate({ inputRange: [0, 1], outputRange: [22, 0] });

  return (
    <View style={styles.root}>
      <Animated.View style={{ width: size, height: size, opacity: stage }}>
        <AnimatedALPFAMark progress={mark} size={size} />

        <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: letters, transform: [{ translateY: lettersY }] }]}>
          <Svg width={size} height={size} viewBox="0 0 500 500">
            {LETTERS.map((d, i) => <Path key={i} d={d} fill={BLUE} />)}
          </Svg>
        </Animated.View>

        <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: connector, transform: [{ translateX: connectorX }] }]}>
          <Svg width={size} height={size} viewBox="0 0 500 500">
            {CONNECTORS.map((d, i) => <Path key={i} d={d} fill={GRAY} />)}
          </Svg>
        </Animated.View>

        <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: njit, transform: [{ translateX: njitX }] }]}>
          <NJITInstituteText size={size} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
