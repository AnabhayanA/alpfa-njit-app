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
const LOGO = require('./assets/images/ALPFANJITLOGO.png');

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

type Region = { x: number; y: number; width: number; height: number };

function LogoCrop({ size, region, progress, fromX, fromY, stationary = false }: {
  size: number;
  region: Region;
  progress: Animated.Value;
  fromX: number;
  fromY: number;
  stationary?: boolean;
}) {
  const frame = {
    left: region.x * size,
    top: region.y * size,
    width: region.width * size,
    height: region.height * size,
  };
  const motion = stationary ? undefined : {
    opacity: progress.interpolate({ inputRange: [0, 0.14, 1], outputRange: [0, 1, 1] }),
    transform: [
      { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [fromX, 0] }) },
      { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [fromY, 0] }) },
    ],
  };

  return (
    <Animated.View style={[styles.logoCrop, frame, motion]}>
      <Image source={LOGO} resizeMode="stretch" style={{ position: 'absolute', width: size, height: size, left: -frame.left, top: -frame.top }} />
    </Animated.View>
  );
}

function ConstructedLogo({ size, progress, completeOpacity }: {
  size: number;
  progress: Animated.Value;
  completeOpacity: Animated.Value;
}) {
  return (
    <View style={{ width: size, height: size }}>
      {/* Every moving section is another untouched crop from that same image. */}
      <LogoCrop size={size} region={{ x: 0.12, y: 0.12, width: 0.34, height: 0.43 }} progress={progress} fromX={-size * 0.18} fromY={size * 0.05} />
      <LogoCrop size={size} region={{ x: 0.39, y: 0.12, width: 0.17, height: 0.43 }} progress={progress} fromX={size * 0.18} fromY={-size * 0.08} />
      <LogoCrop size={size} region={{ x: 0.18, y: 0.45, width: 0.35, height: 0.12 }} progress={progress} fromX={-size * 0.12} fromY={size * 0.13} />
      <LogoCrop size={size} region={{ x: 0.28, y: 0.37, width: 0.29, height: 0.12 }} progress={progress} fromX={size * 0.12} fromY={size * 0.12} />

      {/* Drawn over every moving crop, so no Highlander pixel can move. */}
      <LogoCrop size={size} region={{ x: 0.32, y: 0.42, width: 0.36, height: 0.36 }} progress={progress} fromX={0} fromY={0} stationary />

      {/* This exact full image guarantees perfect proportions at assembly. */}
      <Animated.Image source={LOGO} resizeMode="stretch" style={[StyleSheet.absoluteFill, { width: size, height: size, opacity: completeOpacity }]} />
    </View>
  );
}

export default function App() {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const [showSplash, setShowSplash] = useState(true);
  const buildProgress = useRef(new Animated.Value(0)).current;
  const completeOpacity = useRef(new Animated.Value(0)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const exitScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(buildProgress, {
        toValue: 1,
        duration: 1120,
        delay: 120,
        easing: Easing.bezier(0.22, 0.78, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(completeOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.delay(500),
      Animated.parallel([
        Animated.timing(splashOpacity, { toValue: 0, duration: 480, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
        Animated.timing(exitScale, { toValue: 0.93, duration: 480, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start(() => setShowSplash(false));
  }, [buildProgress, completeOpacity, exitScale, splashOpacity]);

  const canvasSize = Math.min(width * 1.35, height * 0.72, 560);

  return (
    <SafeAreaProvider>
      <View style={[styles.container, Platform.OS === 'web' && styles.webContainer]}>
        <StatusBar style={showSplash ? 'light' : colors.statusBarStyle} />
        <View style={[styles.appViewport, Platform.OS === 'web' && styles.webViewport]}>
          <View style={[styles.mainApp, { backgroundColor: colors.background }]}><MainApp /></View>
          {showSplash && (
            <Animated.View style={[styles.splash, { opacity: splashOpacity }]}>
              <Animated.View style={{ transform: [{ translateY: -canvasSize * 0.1 }, { scale: exitScale }] }}>
                <ConstructedLogo size={canvasSize} progress={buildProgress} completeOpacity={completeOpacity} />
              </Animated.View>
            </Animated.View>
          )}
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F102E' },
  webContainer: { backgroundColor: '#201F1D', paddingVertical: 24 },
  appViewport: { flex: 1, width: '100%' },
  webViewport: { width: '100%', maxWidth: 430, minHeight: '100%', alignSelf: 'center', borderRadius: 34, overflow: 'hidden', shadowColor: '#17182F', shadowOpacity: 0.18, shadowRadius: 24, shadowOffset: { width: 0, height: 12 } },
  mainApp: { flex: 1 },
  splash: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: '#0F102E', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  logoCrop: { position: 'absolute', overflow: 'hidden' },
});
