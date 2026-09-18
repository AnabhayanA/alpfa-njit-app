import React, { useEffect } from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import NJITInstituteText from './NJITInstituteText';

const FULL_LOGO = require('../assets/images/NJITalpfa logo.pdf (6).png');
const NAVY = '#030712';
const SPLASH_DURATION_MS = 5000;

type Props = {
  onAnimationComplete?: () => void;
};

export default function ALPFALoadingScreen({ onAnimationComplete }: Props) {
  const { width } = useWindowDimensions();
  const size = Math.min(width * 0.92, 390);

  useEffect(() => {
    const timer = setTimeout(() => onAnimationComplete?.(), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <View pointerEvents="auto" style={styles.root}>
      <View style={[styles.lockup, { width: size, height: size }]}>
        <View
          style={[
            styles.highlanderCrop,
            {
              left: size * 0.20,
              top: size * 0.56,
              width: size * 0.18,
              height: size * 0.18,
            },
          ]}
        >
          <Image
            source={FULL_LOGO}
            resizeMode="contain"
            style={{ width: size, height: size, marginLeft: -size * 0.20, marginTop: -size * 0.56 }}
            accessibilityIgnoresInvertColors
          />
        </View>

        <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
          <NJITInstituteText size={size} />
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
  lockup: {
    position: 'relative',
  },
  highlanderCrop: {
    position: 'absolute',
    overflow: 'hidden',
  },
});
