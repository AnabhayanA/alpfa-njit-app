import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedALPFAMark from './AnimatedALPFAMark';
import NJITInstituteText from './NJITInstituteText';

const FULL_LOGO = require('../assets/images/NJITalpfa logo.pdf (6).png');
const NAVY = '#030712';
const SPLASH_DURATION_MS = 5000;

type Props = {
  onAnimationComplete?: () => void;
};

export default function ALPFALoadingScreen({ onAnimationComplete }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const size = Math.min(width * 0.92, 390);
  const visibleHeight = Math.max(1, height - insets.top - insets.bottom);
  const alpfaProgress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => onAnimationComplete?.(), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <View pointerEvents="auto" style={styles.root}>
      <View
        style={[
          styles.centerStage,
          { top: insets.top, height: visibleHeight },
        ]}
      >
      <View style={[styles.lockup, { width: size, height: size }]}>
        <View
          pointerEvents="none"
          style={[
            styles.alpfaLayer,
            {
              width: size,
              height: size,
              transform: [{ translateY: -size * 0.20 }],
            },
          ]}
        >
          <AnimatedALPFAMark progress={alpfaProgress} size={size} />
          <View
            style={[
              styles.alpfaWordmarkCrop,
              {
                left: size * 0.17,
                top: size * 0.49,
                width: size * 0.66,
                height: size * 0.12,
              },
            ]}
          >
            <Image
              source={FULL_LOGO}
              resizeMode="contain"
              style={{
                width: size,
                height: size,
                marginLeft: -size * 0.17,
                marginTop: -size * 0.49,
              }}
              accessibilityIgnoresInvertColors
            />
          </View>
        </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: NAVY,
  },
  centerStage: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockup: {
    position: 'relative',
  },
  alpfaLayer: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  alpfaWordmarkCrop: {
    position: 'absolute',
    overflow: 'hidden',
  },
  highlanderCrop: {
    position: 'absolute',
    overflow: 'hidden',
  },
});
