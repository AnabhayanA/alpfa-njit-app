import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import NJITInstituteText from './NJITInstituteText';
import AnimatedALPFAMark from './AnimatedALPFAMark';

const NAVY = '#030712';
const ALPFA_CONNECTOR_PATHS = ["M162.60 271.24 c0 -0.10 1.61 -2.73 3.61 -5.81 3.61 -5.52 3.66 -5.57 6.25 -6.35 2.88 -0.83 45.56 -12.26 59.47 -15.92 4.98 -1.32 11.08 -2.98 13.57 -3.66 2.49 -0.68 4.93 -1.22 5.42 -1.22 0.49 0 1.56 -0.34 2.39 -0.78 0.93 -0.44 2.44 -0.68 4 -0.59 2.73 0.15 5.66 -0.98 -35.40 13.67 -61.67 21.97 -59.33 21.19 -59.33 20.65z","M305.18 251.90 c-27.34 -8.84 -40.87 -13.28 -41.21 -13.67 -1.37 -1.27 2.20 -0.78 10.35 1.51 5.03 1.37 13.09 3.61 17.92 4.93 14.26 3.91 14.75 4.10 15.38 6.10 0.34 0.98 0.49 1.81 0.39 1.86 -0.05 0.10 -1.37 -0.24 -2.83 -0.73z"];
const ALPFA_LETTER_PATHS = ["M220.65 210.11 c1.03 -2.39 2.93 -6.64 4.25 -9.52 l2.34 -5.27 2.78 0 2.83 0 4.39 9.08 c2.44 5.03 4.44 9.33 4.44 9.52 0 0.24 -1.17 0.44 -2.64 0.44 -2.39 0 -2.64 -0.10 -2.93 -1.17 -0.54 -2.25 -1.56 -2.73 -5.47 -2.73 -4.25 0 -5.22 0.39 -6.05 2.44 -0.59 1.37 -0.78 1.46 -3.17 1.46 l-2.59 0 1.81 -4.25z m11.96 -4.15 c-0.54 -1.81 -2.15 -4.79 -2.54 -4.79 -0.39 0 -2.54 4.74 -2.54 5.52 0 0.20 1.22 0.34 2.73 0.34 2.59 0 2.69 -0.05 2.34 -1.07z","M247.56 204.83 l0 -9.52 2.44 0 2.44 0 0 7.57 0 7.57 5.13 0 5.13 0 0 1.95 0 1.95 -7.57 0 -7.57 0 0 -9.52z","M269.04 204.83 l0 -9.52 5.13 0 c6.01 0 8.06 0.63 9.52 3.03 1.17 1.95 1.22 2.93 0.24 4.98 -1.03 2.10 -3.08 3.22 -6.74 3.61 l-3.03 0.34 -0.15 3.56 -0.15 3.52 -2.39 0 -2.44 0 0 -9.52z m9.67 -2.15 c0.39 -0.24 0.59 -1.03 0.49 -1.81 -0.15 -1.32 -0.29 -1.42 -2.69 -1.56 l-2.59 -0.15 0 1.95 0 2 2.10 0 c1.12 0 2.34 -0.20 2.69 -0.44z","M290.63 204.98 l0.15 -9.42 6.98 -0.15 6.93 -0.15 0 2 0 1.95 -4.69 0 -4.64 0 0.15 1.86 0.15 1.81 4.54 0.15 4.49 0.15 0 1.66 0 1.71 -2.54 0.05 c-1.42 0 -3.47 0.15 -4.54 0.34 l-1.95 0.34 0.15 2.54 c0.29 4.05 -0.05 4.54 -2.88 4.54 l-2.39 0 0.10 -9.38z","M310.11 208.89 c1.37 -3.03 3.27 -7.32 4.20 -9.52 l1.76 -4.05 2.78 0 2.78 0 4.44 9.28 c2.49 5.13 4.49 9.38 4.49 9.52 0 0.15 -1.17 0.24 -2.59 0.24 -2.59 0 -2.64 -0.05 -3.52 -1.95 l-0.88 -2 -4.44 0.15 -4.44 0.15 -0.88 1.86 c-0.88 1.76 -0.98 1.81 -3.52 1.81 l-2.64 0 2.44 -5.47z m11.57 -2.25 c-0.05 -0.20 -0.54 -1.37 -1.07 -2.69 -0.49 -1.27 -1.22 -2.29 -1.56 -2.29 -0.59 0 -2.64 3.86 -2.64 4.93 0 0.24 1.22 0.44 2.73 0.44 1.51 0 2.64 -0.15 2.54 -0.39z"];

const HIGHLANDER_BLUE = `M141.60 357.81 c-15.82 -6.88 -36.04 -10.35 -53.32 -9.13 -11.38 0.78 -23.14 2.88 -30.71 5.57 l-3.61 1.22 2.69 -2.69 c1.46 -1.51 3.47 -3.22 4.39 -3.81 0.93 -0.59 2.64 -1.76 3.81 -2.64 1.17 -0.88 4.20 -2.64 6.79 -3.91 l4.69 -2.34 -4.59 -0.29 c-2.54 -0.20 -5.52 -0.73 -6.69 -1.17 -2.05 -0.83 -2.10 -0.93 -1.22 -1.71 0.49 -0.44 2.29 -1.32 4.05 -1.90 3.86 -1.37 9.03 -4.35 10.89 -6.30 l1.37 -1.42 -3.32 -0.24 c-4.93 -0.39 -10.64 -3.17 -9.67 -4.74 0.15 -0.29 1.46 -0.54 2.88 -0.54 3.42 0 10.50 -2.05 14.21 -4.15 3.27 -1.86 6.15 -3.96 13.72 -10.11 8.50 -6.93 15.09 -9.77 24.27 -10.45 3.56 -0.24 5.18 -0.15 7.32 0.49 3.27 0.93 6.05 3.17 6.59 5.32 0.29 1.12 0.78 1.61 1.90 1.90 2.49 0.63 6.15 3.42 7.86 5.96 2.39 3.61 3.17 6.93 2.93 12.50 -0.20 4.15 -0.44 5.13 -2 8.35 -1.03 2.10 -2.98 4.98 -4.74 6.88 l-2.98 3.32 1.76 3.52 c1.76 3.66 3.32 9.81 3.08 12.11 l-0.15 1.32 -2.20 -0.93z`;
const HIGHLANDER_WHITE = `M96.48 341.99 c-0.15 -0.44 -0.29 -1.51 -0.29 -2.44 l0 -1.66 3.13 0 c3.42 0 3.71 0.24 3.71 3.22 l0 1.66 -3.13 0 c-2.39 0 -3.17 -0.20 -3.42 -0.78z`;
const HIGHLANDER_GRAY = [
  `M125.63 338.77 c-2.29 -1.12 -1.86 -3.32 0.63 -3.32 1.12 0 1.86 -0.34 2.34 -1.07 1.12 -1.56 0.98 -1.86 -0.93 -1.86 -1.76 0 -2.25 -0.73 -1.12 -1.86 0.68 -0.68 3.03 -0.78 4.30 -0.10 0.73 0.39 0.93 0.24 1.12 -0.78 0.24 -1.46 -0.78 -2.15 -3.27 -2.15 -1.42 0 -1.76 -0.20 -1.76 -0.98 0 -0.83 0.34 -0.98 2.20 -0.98 2.05 0 2.20 -0.10 2.20 -1.27 0 -1.12 -0.15 -1.22 -1.56 -1.07 l-1.61 0.15 -0.15 -3.56 c-0.15 -3.56 -0.15 -3.56 -1.81 -4.30 -0.93 -0.39 -2.15 -0.68 -2.69 -0.68 -1.12 0 -1.27 -0.63 -0.29 -1.42 0.83 -0.68 8.40 -2.98 9.86 -2.98 1.17 0 3.27 2.25 2.98 3.13 -0.10 0.29 -1.37 0.98 -2.83 1.51 -4.49 1.71 -3.61 4.30 1.32 3.76 1.46 -0.15 2.10 0 2.29 0.54 0.44 1.17 -0.49 4.25 -1.66 5.52 -0.78 0.83 -0.98 1.32 -0.59 1.71 0.63 0.63 0 3.71 -1.32 6.30 -0.83 1.61 -5.62 6.40 -6.35 6.30 -0.15 0 -0.73 -0.24 -1.32 -0.54z`,
  `M118.95 324.85 c0.20 -1.17 0 -1.51 -1.61 -2.34 -2.05 -1.07 -2.20 -1.46 -1.12 -2.98 0.68 -0.93 1.07 -1.03 4.49 -0.78 l3.76 0.24 -0.49 1.27 c-1.03 2.73 -2.20 4.54 -3.47 5.22 -1.76 0.93 -1.86 0.88 -1.56 -0.63z`,
];
const HIGHLANDER_RED = [
  `M130.62 351.76 c-3.47 -1.17 -6.40 -2.15 -6.45 -2.15 -0.10 0 -0.15 -0.98 -0.15 -2.15 0 -1.86 -0.20 -2.25 -1.07 -2.54 -1.51 -0.44 -1.86 -1.07 -1.86 -3.47 l0 -2.10 2.34 0 c1.32 0 3.47 0.34 4.79 0.73 1.46 0.44 2.44 0.54 2.54 0.24 0.10 -0.29 0.93 -0.49 1.86 -0.49 1.61 0 1.66 -0.05 1.66 -2 0 -1.56 0.44 -2.64 2.25 -5.13 3.22 -4.49 4.59 -8.64 4.59 -13.96 l0 -4.30 2.15 0 c2.64 0 2.73 0.24 2.73 7.47 0 5.96 -0.78 8.94 -3.42 12.89 -2.54 3.71 -3.96 5.03 -5.47 5.03 l-1.32 0 1.61 2.83 c2.05 3.52 3.22 6.88 3.22 9.38 0 1.95 0 1.95 -1.81 1.90 -1.03 0 -4.69 -0.98 -8.20 -2.20z`,
  `M109.38 347.12 c-1.76 -0.24 -6.79 -0.49 -11.23 -0.54 l-8.06 -0.15 -0.15 -1.22 c-0.10 -0.63 -0.54 -1.42 -0.93 -1.71 -0.49 -0.34 -0.63 -1.17 -0.54 -2.44 l0.15 -1.95 3.17 -0.59 c4.49 -0.83 7.18 -0.78 7.52 0.10 0.20 0.49 -0.05 0.73 -0.68 0.73 -0.54 0 -0.98 0.15 -0.98 0.39 0.05 1.12 1.12 1.76 3.52 1.95 l2.59 0.20 -0.15 -2.25 -0.20 -2.29 5.76 0.15 c5.08 0.15 5.81 0.24 5.96 1.03 0.10 0.49 -0.15 0.83 -0.59 0.83 -1.32 0 -0.88 1.42 0.68 2.20 0.78 0.39 1.95 0.73 2.69 0.73 0.88 0 1.22 0.24 1.22 0.98 0 0.73 -0.34 0.98 -1.22 0.98 -0.68 0 -1.22 0.20 -1.22 0.44 0 1.03 0.63 2 1.27 2 0.39 0 0.68 0.24 0.68 0.49 0 0.59 -4.74 0.54 -9.28 -0.05z`,
  `M80.08 333.30 c0 -1.51 0.54 -2.15 4.69 -6.01 3.86 -3.52 4.54 -4.35 3.66 -4.44 -0.83 -0.15 -1.03 -0.49 -1.03 -1.81 0 -1.22 0.39 -1.90 1.61 -2.88 0.83 -0.73 3.17 -2.64 5.13 -4.35 7.37 -6.25 9.86 -8.06 14.16 -10.30 5.32 -2.73 10.79 -4.20 15.72 -4.20 5.22 0 5.86 0.24 5.86 2.25 0 1.56 -0.10 1.61 -2.29 1.90 -3.71 0.54 -6.01 1.22 -8.98 2.69 -4.39 2.25 -7.03 4.49 -15.33 12.89 -4.30 4.39 -9.03 8.84 -10.50 9.91 -4.88 3.52 -9.52 6.01 -11.13 6.01 -1.46 0 -1.56 -0.10 -1.56 -1.66z`,
  `M116.31 312.16 c0.20 -2.69 2.44 -4.05 6.54 -4.05 l3.13 0 0 1.66 c0 0.93 -0.29 1.86 -0.59 2.10 -1.22 0.73 -6.01 2.10 -7.62 2.10 -1.56 0 -1.61 -0.05 -1.46 -1.81z`,
];

type Props = { onAnimationComplete?: () => void };

export default function ALPFALoadingScreen({ onAnimationComplete }: Props) {
  const { width } = useWindowDimensions();
  const lockupWidth = Math.min(width * 0.72, 330);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.94)).current;
  const translateY = useRef(new Animated.Value(38)).current;
  const alpfaProgress = useRef(new Animated.Value(0)).current;
  const alpfaLettersOpacity = useRef(new Animated.Value(0)).current;
  const connectorOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(160),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, damping: 16, stiffness: 120, mass: 0.8, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 620, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.delay(300),
      Animated.timing(alpfaProgress, { toValue: 1, duration: 850, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(alpfaLettersOpacity, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(connectorOpacity, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.delay(1200),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.035, duration: 300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    ]);
    animation.start(({ finished }) => finished && onAnimationComplete?.());
    return () => animation.stop();
  }, [alpfaLettersOpacity, alpfaProgress, connectorOpacity, onAnimationComplete, opacity, scale, translateY]);

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.composition, { width: lockupWidth, height: lockupWidth * 0.92, opacity, transform: [{ translateY }, { scale }] }]}>
        <View style={[styles.alpfaStage, { width: lockupWidth, height: lockupWidth }]}>
          <AnimatedALPFAMark progress={alpfaProgress} size={lockupWidth} />
          <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: alpfaLettersOpacity }]} pointerEvents="none">
            <Svg width={lockupWidth} height={lockupWidth} viewBox="0 0 500 500">
              {ALPFA_LETTER_PATHS.map((d, index) => <Path key={`alpfa-letter-${index}`} d={d} fill="#FFFFFF" />)}
            </Svg>
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFillObject, styles.connectorLayer, { opacity: connectorOpacity }]} pointerEvents="none">
            <Svg width={lockupWidth} height={lockupWidth} viewBox="0 0 500 500">
              <Path d={ALPFA_CONNECTOR_PATHS[0]} fill="#FFFFFF" />
              <Path d={ALPFA_CONNECTOR_PATHS[1]} fill="#888888" />
            </Svg>
          </Animated.View>
        </View>
        <View style={[styles.lockup, { width: lockupWidth, height: lockupWidth * 0.26 }]}>
        <Svg width={lockupWidth * 0.25} height={lockupWidth * 0.26} viewBox="45 288 112 82">
          <Path d={HIGHLANDER_BLUE} fill="#022B6A" />
          {HIGHLANDER_RED.map((d, index) => <Path key={`red-${index}`} d={d} fill="#E02125" />)}
          {HIGHLANDER_GRAY.map((d, index) => <Path key={`gray-${index}`} d={d} fill="#97A0AB" />)}
          <Path d={HIGHLANDER_WHITE} fill="#FFFFFF" />
        </Svg>
        <View style={styles.wordmark}>
          <NJITInstituteText size={lockupWidth * 0.72} />
        </View>
        </View>
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
  composition: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  alpfaStage: {
    position: 'absolute',
    left: 0,
    top: 23,
  },
  connectorLayer: {
    transform: [{ translateY: -72 }],
  },
  lockup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    width: '75%',
    height: '100%',
    marginLeft: -2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
