import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import BottomNav from './components/BottomNav';
import HomeScreen from './screens/HomeScreen';
import EventsScreen from './screens/EventsScreen';
import EBoardScreen from './screens/EBoardScreen';
import AboutScreen from './screens/AboutScreen';
import CaptureScreen from './screens/CaptureScreen';
import useTheme from './utils/useTheme';

const Tab = createBottomTabNavigator();
const LOADING_LOGO = require('./assets/images/NJITalpfa logo (2).png');
const SPLASH_NAVY = '#0F102E';
const ALPFA_RED = '#E5223D';

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <BottomNav {...props} />}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Capture" component={CaptureScreen} />
      <Tab.Screen name="EBoard" component={EBoardScreen} />
      <Tab.Screen name="About" component={AboutScreen} />
    </Tab.Navigator>
  );
}

function MainApp() {
  return <NavigationContainer><Tabs /></NavigationContainer>;
}

type StrokeProps = {
  progress: Animated.Value;
  burst: Animated.Value;
  width: number;
  height: number;
  left: number;
  top: number;
  rotate: string;
  fromX: number;
  fromY: number;
  outX: number;
  outY: number;
};

function Stroke({ progress, burst, width, height, left, top, rotate, fromX, fromY, outX, outY }: StrokeProps) {
  const opacity = progress.interpolate({ inputRange: [0, 0.08, 0.92, 1], outputRange: [0, 1, 1, 1] });
  return (
    <Animated.View
      style={[
        styles.stroke,
        {
          width,
          height,
          left,
          top,
          opacity,
          transform: [
            { rotate },
            { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [fromX, 0] }) },
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [fromY, 0] }) },
            { translateX: burst.interpolate({ inputRange: [0, 1], outputRange: [0, outX] }) },
            { translateY: burst.interpolate({ inputRange: [0, 1], outputRange: [0, outY] }) },
            { scaleX: burst.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] }) },
          ],
        },
      ]}
    />
  );
}

export default function App() {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const [showSplash, setShowSplash] = useState(true);

  const enter = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const burst = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.92)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(120),
      Animated.timing(enter, {
        toValue: 1,
        duration: 620,
        easing: Easing.bezier(0.16, 0.84, 0.24, 1),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 150, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 240, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(110),
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 280,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(burst, {
          toValue: 1,
          duration: 560,
          easing: Easing.bezier(0.58, 0.02, 0.16, 1),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(100),
          Animated.timing(logoScale, {
            toValue: 1.06,
            duration: 420,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.delay(280),
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1.18,
          duration: 340,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 360,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => setShowSplash(false));
  }, [burst, enter, logoOpacity, logoScale, pulse, splashOpacity]);

  const stage = Math.min(width * 0.88, 390);
  const strokeLength = stage * 0.38;
  const strokeThickness = Math.max(5, stage * 0.016);
  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1.55] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0, 0.42, 0] });

  return (
    <SafeAreaProvider style={styles.safeArea}>
      <View style={[styles.container, { width, height }, Platform.OS === 'web' && styles.webContainer]}>
        <StatusBar style={showSplash ? 'light' : colors.statusBarStyle} />

        <View style={[styles.appViewport, Platform.OS === 'web' && styles.webViewport]}>
          <View style={[styles.mainApp, { backgroundColor: colors.background }]}>
            <MainApp />
          </View>
        </View>

        {showSplash && (
          <Animated.View pointerEvents="none" style={[styles.splash, { width, height, opacity: splashOpacity }]}>
            <View style={[styles.stage, { width: stage, height: stage }]}>
              <Stroke progress={enter} burst={burst} width={strokeLength} height={strokeThickness} left={stage * 0.18} top={stage * 0.31} rotate="-55deg" fromX={-width * 0.72} fromY={height * 0.12} outX={-width * 0.82} outY={-height * 0.12} />
              <Stroke progress={enter} burst={burst} width={strokeLength} height={strokeThickness} left={stage * 0.47} top={stage * 0.31} rotate="55deg" fromX={width * 0.72} fromY={-height * 0.12} outX={width * 0.82} outY={-height * 0.12} />
              <Stroke progress={enter} burst={burst} width={strokeLength * 0.92} height={strokeThickness} left={stage * 0.34} top={stage * 0.60} rotate="0deg" fromX={0} fromY={height * 0.55} outX={0} outY={height * 0.72} />

              <Animated.View
                style={[
                  styles.pulse,
                  {
                    width: stage * 0.28,
                    height: stage * 0.28,
                    borderRadius: stage * 0.14,
                    opacity: pulseOpacity,
                    transform: [{ scale: pulseScale }],
                  },
                ]}
              />

              <Animated.Image
                source={LOADING_LOGO}
                resizeMode="contain"
                style={[
                  styles.loadingLogo,
                  {
                    width: stage * 0.66,
                    height: stage * 0.66,
                    opacity: logoOpacity,
                    transform: [{ scale: logoScale }],
                  },
                ]}
              />
            </View>
          </Animated.View>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, width: '100%', height: '100%' },
  container: { flex: 1, backgroundColor: SPLASH_NAVY, position: 'relative', overflow: 'hidden' },
  webContainer: { backgroundColor: '#201F1D' },
  appViewport: { flex: 1, width: '100%', position: 'relative', overflow: 'hidden' },
  webViewport: {
    width: '100%',
    maxWidth: 430,
    flex: 1,
    alignSelf: 'center',
    borderRadius: 34,
    overflow: 'hidden',
    shadowColor: '#17182F',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },
  mainApp: { flex: 1 },
  splash: {
    position: 'absolute',
    left: 0,
    top: 0,
    backgroundColor: SPLASH_NAVY,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 99999,
    elevation: 99999,
  },
  stage: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  stroke: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: ALPFA_RED,
  },
  pulse: {
    position: 'absolute',
    backgroundColor: ALPFA_RED,
    shadowColor: ALPFA_RED,
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  loadingLogo: { position: 'absolute' },
});
