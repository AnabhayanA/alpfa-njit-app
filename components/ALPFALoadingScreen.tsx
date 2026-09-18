import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

const NAVY = '#030712';
const SPLASH_DURATION_MS = 5000;

type Props = {
  onAnimationComplete?: () => void;
};

export default function ALPFALoadingScreen({ onAnimationComplete }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationComplete?.();
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return <View pointerEvents="auto" style={styles.root} />;
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: NAVY,
  },
});
