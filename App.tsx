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

// Loading-screen artwork only. ALPFANJITLOGO.png stays reserved for the in-app logo.
const LOGO_COLOR = require('./assets/images/NJITalpfa logo (2).png');
const LOGO_WHITE = require('./assets/images/NJITalpfa Logo.pdf (7).png');
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
          opacity: progress.interpolate({ inputRange: [0, 0.12, 1], outputRange: [0, 1, 1] }),
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
  const cropW = size * 0.38;
  const cropH = size * 0.30;

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
        source={LOGO_COLOR}
        resizeMode="stretch"
        style={{
          position: 'absolute',
          width: size,
          height: size,
          left: -size * 0.02,
          top: -size * 0.59,
        }}
      />
    </Animated.View>
  );
}

export default function App() {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const [showSplash, setShowSplash] = useState(true);

  const outlineOpacity = useRef(new Animated.Value(0)).current;
  const linesIn = useRef(new Animated.Value(0)).current;
  const colorOpacity = useRef(new Animated.Value(0)).current;
  const whiteOpacity = useRef(new Animated.Value(0)).current;
  const whiteScale = useRef(new Animated.Value(1)).current;
  const linesOut = useRef(new Animated.Value(0)).current;
  const splitOut = useRef(new Animated.Value(0)).current;
  const highlanderOpacity = useRef(new Animated.Value(0)).current;
  const highlanderScale = useRef(new Animated.Value(0.84)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Initial state: faint outline-like logo.
      Animated.timing(outlineOpacity, {
        toValue: 0.13,
        duration: 260,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.delay(90),

      // 2. Lines animate in.
      Animated.parallel([
        Animated.timing(linesIn, {
          toValue: 1,
          duration: 520,
          easing: Easing.bezier(0.16, 0.84, 0.26, 1),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(210),
          Animated.timing(colorOpacity, {
            toValue: 1,
            duration: 360,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]),

      // 3. Color logo forms.
      Animated.parallel([
        Animated.timing(outlineOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(linesIn, {
          toValue: 0.35,
          duration: 240,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(220),

      // 4. Final white logo with subtle pop/glow.
      Animated.parallel([
        Animated.timing(whiteOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(colorOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(whiteScale, {
            toValue: 1.045,
            duration: 170,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(whiteScale, {
            toValue: 1,
            duration: 180,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]),

      // 5. Hold.
      Animated.delay(1500),

      // 6. Open transition: logo halves and glowing lines move outward.
      Animated.parallel([
        Animated.timing(linesIn, {
          toValue: 1,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(linesOut, {
          toValue: 1,
          duration: 690,
          easing: Easing.bezier(0.55, 0.03, 0.18, 1),
          useNativeDriver: true,
        }),
        Animated.timing(splitOut, {
          toValue: 1,
          duration: 650,
          easing: Easing.bezier(0.55, 0.03, 0.18, 1),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(100),
          Animated.timing(whiteOpacity, {
            toValue: 0,
            duration: 360,
            useNativeDriver: true,
          }),
        ]),
      ]),

      // 7. Highlander focus.
      Animated.parallel([
        Animated.timing(highlanderOpacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(highlanderScale, {
          toValue: 1.08,
          speed: 10,
          bounciness: 3,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(650),

      // 8. Reveal Home.
      Animated.parallel([
        Animated.timing(highlanderOpacity, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(highlanderScale, {
          toValue: 1.16,
          duration: 340,
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
  }, [
    colorOpacity,
    highlanderOpacity,
    highlanderScale,
    linesIn,
    linesOut,
    outlineOpacity,
    splashOpacity,
    splitOut,
    whiteOpacity,
    whiteScale,
  ]);

  const stage = Math.min(width * 0.90, 430);
  const logoSize = stage * 0.78;
  const beamLength = stage * 0.30;
  const beamThickness = Math.max(4, stage * 0.012);
  const highlanderSourceSize = Math.min(stage * 1.75, 680);

  const leftLogoOut = splitOut.interpolate({ inputRange: [0, 1], outputRange: [0, -width * 0.70] });
  const rightLogoOut = splitOut.interpolate({ inputRange: [0, 1], outputRange: [0, width * 0.70] });

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
            style={[styles.splash, { width, height, opacity: splashOpacity }]}
          >
            <View style={[styles.stage, { width: stage, height: stage }]}>
              <Animated.Image
                source={LOGO_WHITE}
                resizeMode="contain"
                style={[
                  styles.logoImage,
                  { width: logoSize, height: logoSize, opacity: outlineOpacity },
                ]}
              />

              <Beam progress={linesIn} exit={linesOut} width={beamLength} height={beamThickness} left={stage * 0.20} top={stage * 0.27} rotate="-53deg" fromX={-stage * 0.68} fromY={stage * 0.18} outX={-stage * 0.95} outY={-stage * 0.38} />
              <Beam progress={linesIn} exit={linesOut} width={beamLength * 0.94} height={beamThickness} left={stage * 0.50} top={stage * 0.27} rotate="56deg" fromX={stage * 0.68} fromY={-stage * 0.20} outX={stage * 0.95} outY={-stage * 0.40} />
              <Beam progress={linesIn} exit={linesOut} width={beamLength * 0.88} height={beamThickness * 0.88} left={stage * 0.18} top={stage * 0.61} rotate="-43deg" fromX={-stage * 0.52} fromY={stage * 0.42} outX={-stage * 0.98} outY={stage * 0.48} />
              <Beam progress={linesIn} exit={linesOut} width={beamLength * 0.82} height={beamThickness * 0.80} left={stage * 0.50} top={stage * 0.62} rotate="18deg" fromX={stage * 0.48} fromY={stage * 0.40} outX={stage * 1.00} outY={stage * 0.50} />

              <Animated.Image
                source={LOGO_COLOR}
                resizeMode="contain"
                style={[styles.logoImage, { width: logoSize, height: logoSize, opacity: colorOpacity }]}
              />

              <Animated.Image
                source={LOGO_WHITE}
                resizeMode="contain"
                style={[
                  styles.logoImage,
                  {
                    width: logoSize,
                    height: logoSize,
                    opacity: whiteOpacity,
                    transform: [{ scale: whiteScale }],
                  },
                ]}
              />

              <Animated.View style={[styles.logoHalf, styles.leftHalf, { width: logoSize / 2, height: logoSize, transform: [{ translateX: leftLogoOut }] }]}> 
                <Image source={LOGO_WHITE} resizeMode="contain" style={{ position: 'absolute', width: logoSize, height: logoSize, left: 0, top: 0 }} />
              </Animated.View>
              <Animated.View style={[styles.logoHalf, styles.rightHalf, { width: logoSize / 2, height: logoSize, transform: [{ translateX: rightLogoOut }] }]}> 
                <Image source={LOGO_WHITE} resizeMode="contain" style={{ position: 'absolute', width: logoSize, height: logoSize, left: -logoSize / 2, top: 0 }} />
              </Animated.View>

              <View style={styles.highlanderCenter}>
                <HighlanderCrop size={highlanderSourceSize} scale={highlanderScale} opacity={highlanderOpacity} />
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
  logoImage: { position: 'absolute', alignSelf: 'center' },
  beamGlow: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,43,61,0.28)',
    shadowColor: '#FF243C',
    shadowOpacity: 0.95,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: 0 },
  },
  beamCore: { position: 'absolute', left: 0, right: 0, top: '27%', height: '46%', borderRadius: 999, backgroundColor: '#FF3047' },
  logoHalf: { position: 'absolute', overflow: 'hidden', alignSelf: 'center' },
  leftHalf: { left: '11%' },
  rightHalf: { right: '11%' },
  highlanderCenter: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  highlanderCrop: {
    overflow: 'hidden',
    borderRadius: 28,
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.50,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
  },
});
