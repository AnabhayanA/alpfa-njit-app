import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
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

const LOGO_COLOR = require('./assets/images/NJITalpfa logo (2).png');
const ORIGINAL_LOGO = require('./assets/images/ALPFANJITLOGO.png');
const SPLASH_NAVY = '#0F102E';

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

type BeamProps = {
  progress: Animated.Value;
  exit: Animated.Value;
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

function Beam({ progress, exit, width, height, left, top, rotate, fromX, fromY, outX, outY }: BeamProps) {
  return (
    <Animated.View
      style={[
        styles.beamGlow,
        {
          width,
          height,
          left,
          top,
          opacity: progress.interpolate({ inputRange: [0, 0.18, 1], outputRange: [0, 1, 1] }),
          transform: [
            { rotate },
            { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [fromX, 0] }) },
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [fromY, 0] }) },
            { translateX: exit.interpolate({ inputRange: [0, 1], outputRange: [0, outX] }) },
            { translateY: exit.interpolate({ inputRange: [0, 1], outputRange: [0, outY] }) },
          ],
        },
      ]}
    >
      <View style={styles.beamCore} />
    </Animated.View>
  );
}

function HighlanderCrop({ size, scale, opacity }: { size: number; scale: Animated.Value; opacity: Animated.Value }) {
  const cropW = size * 0.40;
  const cropH = size * 0.40;

  return (
    <Animated.View
      style={[
        styles.highlanderCrop,
        {
          width: cropW,
          height: cropH,
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <Image
        source={ORIGINAL_LOGO}
        resizeMode="stretch"
        style={{
          position: 'absolute',
          width: size,
          height: size,
          left: -size * 0.30,
          top: -size * 0.40,
        }}
      />
    </Animated.View>
  );
}

export default function App() {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const [showSplash, setShowSplash] = useState(true);

  const linesIn = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const linesOut = useRef(new Animated.Value(0)).current;
  const highlanderOpacity = useRef(new Animated.Value(0)).current;
  const highlanderScale = useRef(new Animated.Value(0.82)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(120),

      // Storyboard frame 2: glowing ALPFA-style lines sweep into place.
      Animated.parallel([
        Animated.timing(linesIn, {
          toValue: 1,
          duration: 780,
          easing: Easing.bezier(0.16, 0.84, 0.26, 1),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(230),
          Animated.timing(logoOpacity, {
            toValue: 0.90,
            duration: 430,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),

      Animated.delay(520),

      // Storyboard frame 6: the same geometry blasts outward and opens the center.
      Animated.parallel([
        Animated.timing(linesOut, {
          toValue: 1,
          duration: 720,
          easing: Easing.bezier(0.55, 0.03, 0.18, 1),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 0,
          duration: 420,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),

      // Storyboard frame 7: Highlander owns the center for a beat.
      Animated.parallel([
        Animated.timing(highlanderOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(highlanderScale, {
          toValue: 1.06,
          speed: 11,
          bounciness: 3,
          useNativeDriver: true,
        }),
      ]),

      Animated.delay(620),

      Animated.parallel([
        Animated.timing(highlanderOpacity, {
          toValue: 0,
          duration: 320,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(highlanderScale, {
          toValue: 1.13,
          duration: 360,
          easing: Easing.out(Easing.cubic),
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
  }, [highlanderOpacity, highlanderScale, linesIn, linesOut, logoOpacity, splashOpacity]);

  const stage = Math.min(width * 0.92, 430);
  const beamLength = stage * 0.33;
  const beamThickness = Math.max(4, stage * 0.014);
  const highlanderSourceSize = Math.min(stage * 1.42, 560);

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
          <Animated.View
            pointerEvents="none"
            style={[
              styles.splash,
              {
                width,
                height,
                opacity: splashOpacity,
              },
            ]}
          >
            <View style={[styles.stage, { width: stage, height: stage }]}>
              <Beam
                progress={linesIn}
                exit={linesOut}
                width={beamLength}
                height={beamThickness}
                left={stage * 0.23}
                top={stage * 0.27}
                rotate="-53deg"
                fromX={-stage * 0.65}
                fromY={stage * 0.18}
                outX={-stage * 0.82}
                outY={-stage * 0.28}
              />
              <Beam
                progress={linesIn}
                exit={linesOut}
                width={beamLength * 0.92}
                height={beamThickness}
                left={stage * 0.49}
                top={stage * 0.27}
                rotate="56deg"
                fromX={stage * 0.65}
                fromY={-stage * 0.20}
                outX={stage * 0.82}
                outY={-stage * 0.31}
              />
              <Beam
                progress={linesIn}
                exit={linesOut}
                width={beamLength * 0.88}
                height={beamThickness * 0.86}
                left={stage * 0.20}
                top={stage * 0.58}
                rotate="-43deg"
                fromX={-stage * 0.52}
                fromY={stage * 0.40}
                outX={-stage * 0.90}
                outY={stage * 0.42}
              />
              <Beam
                progress={linesIn}
                exit={linesOut}
                width={beamLength * 0.78}
                height={beamThickness * 0.76}
                left={stage * 0.50}
                top={stage * 0.61}
                rotate="18deg"
                fromX={stage * 0.45}
                fromY={stage * 0.38}
                outX={stage * 0.92}
                outY={stage * 0.48}
              />

              <Animated.Image
                source={LOGO_COLOR}
                resizeMode="contain"
                style={[
                  styles.redLogo,
                  {
                    width: stage * 0.68,
                    height: stage * 0.68,
                    opacity: logoOpacity,
                  },
                ]}
              />

              <View style={styles.highlanderCenter}>
                <HighlanderCrop
                  size={highlanderSourceSize}
                  scale={highlanderScale}
                  opacity={highlanderOpacity}
                />
              </View>
            </View>
          </Animated.View>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, width: '100%', height: '100%' },
  container: {
    flex: 1,
    backgroundColor: SPLASH_NAVY,
    position: 'relative',
    overflow: 'hidden',
  },
  webContainer: { backgroundColor: '#201F1D' },
  appViewport: {
    flex: 1,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
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
  stage: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  beamGlow: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,43,61,0.28)',
    shadowColor: '#FF243C',
    shadowOpacity: 0.95,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: 0 },
  },
  beamCore: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '27%',
    height: '46%',
    borderRadius: 999,
    backgroundColor: '#FF3047',
  },
  redLogo: {
    position: 'absolute',
    alignSelf: 'center',
  },
  highlanderCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlanderCrop: {
    overflow: 'hidden',
    borderRadius: 24,
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.48,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
});
