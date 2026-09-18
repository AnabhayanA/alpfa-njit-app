import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';
import AnimatedALPFAMark from './AnimatedALPFAMark';
import NJITInstituteText from './NJITInstituteText';

const ALPFA_LOGO = require('../assets/images/NJITalpfa logo.pdf (6).png');

const NAVY = '#030712';
const SPLASH_DURATION_MS = 5000;
const LOGO_SIZE = 320;

type Props = {
  onAnimationComplete?: () => void;
};

export default function ALPFALoadingScreen({ onAnimationComplete }: Props) {
  const drawProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    drawProgress.setValue(0);

    const drawing = Animated.timing(drawProgress, {
      toValue: 1,
      duration: 1800,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    });

    const timer = setTimeout(() => {
      onAnimationComplete?.();
    }, SPLASH_DURATION_MS);

    drawing.start();

    return () => {
      drawing.stop();
      clearTimeout(timer);
    };
  }, [drawProgress, onAnimationComplete]);

  return (
    <View pointerEvents="auto" style={styles.root}>
      <View style={styles.logoStage}>
        <AnimatedALPFAMark progress={drawProgress} size={LOGO_SIZE} />

        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
          <Image
            source={ALPFA_LOGO}
            resizeMode="contain"
            style={styles.logoImage}
            accessibilityIgnoresInvertColors
          />
        </View>

        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
          <NJITInstituteText size={LOGO_SIZE} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoStage: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    position: 'relative',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
});
