import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedALPFAMark from './AnimatedALPFAMark';
import NJITInstituteText from './NJITInstituteText';

const NAVY = '#030712';

type Props = { onAnimationComplete?: () => void };

export default function ALPFALoadingScreen({ onAnimationComplete }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const visibleHeight = Math.max(1, height - insets.top - insets.bottom);
  const size = Math.min(width * 0.88, visibleHeight * 0.52, 390);

  const markProgress = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textX = useRef(new Animated.Value(18)).current;
  const stageOpacity = useRef(new Animated.Value(1)).current;
  const stageScale = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(250),
      Animated.parallel([
        Animated.timing(markProgress, {
          toValue: 1,
          duration: 1050,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(stageScale, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(textX, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1500),
      Animated.parallel([
        Animated.timing(stageScale, {
          toValue: 1.08,
          duration: 450,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(stageOpacity, {
          toValue: 0,
          duration: 400,
          delay: 50,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start(({ finished }) => {
      if (finished) onAnimationComplete?.();
    });

    return () => animation.stop();
  }, [markProgress, onAnimationComplete, stageOpacity, stageScale, textOpacity, textX]);

  return (
    <View style={styles.root} pointerEvents="auto">
      <View style={[styles.centerStage, { top: insets.top, height: visibleHeight }]}>
        <Animated.View
          style={{
            width: size,
            height: size,
            opacity: stageOpacity,
            transform: [{ scale: stageScale }],
          }}
        >
          <AnimatedALPFAMark progress={markProgress} size={size} />

          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              { opacity: textOpacity, transform: [{ translateX: textX }] },
            ]}
          >
            <NJITInstituteText size={size} />
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: NAVY,
  },
  centerStage: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
