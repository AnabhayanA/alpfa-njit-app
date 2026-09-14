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

type Region = { x: number; y: number; width: number; height: number };

type LogoPieceProps = {
  size: number;
  region: Region;
  buildProgress: Animated.Value;
  exitProgress: Animated.Value;
  fromX: number;
  fromY: number;
  exitX: number;
  exitY: number;
};

function LogoPiece({
  size,
  region,
  buildProgress,
  exitProgress,
  fromX,
  fromY,
  exitX,
  exitY,
}: LogoPieceProps) {
  const frame = {
    left: region.x * size,
    top: region.y * size,
    width: region.width * size,
    height: region.height * size,
  };

  return (
    <Animated.View
      style={[
        styles.logoCrop,
        frame,
        {
          opacity: buildProgress.interpolate({
            inputRange: [0, 0.12, 1],
            outputRange: [0, 1, 1],
          }),
          transform: [
            {
              translateX: buildProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [fromX, 0],
              }),
            },
            {
              translateY: buildProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [fromY, 0],
              }),
            },
            {
              translateX: exitProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, exitX],
              }),
            },
            {
              translateY: exitProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, exitY],
              }),
            },
          ],
        },
      ]}
    >
      <Image
        source={LOGO}
        resizeMode="stretch"
        style={{
          position: 'absolute',
          width: size,
          height: size,
          left: -frame.left,
          top: -frame.top,
        }}
      />
    </Animated.View>
  );
}

function ConstructedLogo({
  size,
  buildProgress,
  completeOpacity,
  exitProgress,
  highlanderScale,
  highlanderOpacity,
}: {
  size: number;
  buildProgress: Animated.Value;
  completeOpacity: Animated.Value;
  exitProgress: Animated.Value;
  highlanderScale: Animated.Value;
  highlanderOpacity: Animated.Value;
}) {
  const highlanderRegion = { x: 0.32, y: 0.42, width: 0.36, height: 0.36 };
  const highlanderFrame = {
    left: highlanderRegion.x * size,
    top: highlanderRegion.y * size,
    width: highlanderRegion.width * size,
    height: highlanderRegion.height * size,
  };

  return (
    <View style={{ width: size, height: size }}>
      {/* ALPFA pieces assemble around a Highlander that never changes position. */}
      <LogoPiece
        size={size}
        region={{ x: 0.10, y: 0.10, width: 0.30, height: 0.36 }}
        buildProgress={buildProgress}
        exitProgress={exitProgress}
        fromX={-size * 0.36}
        fromY={size * 0.03}
        exitX={-size * 0.95}
        exitY={-size * 0.08}
      />
      <LogoPiece
        size={size}
        region={{ x: 0.38, y: 0.10, width: 0.20, height: 0.34 }}
        buildProgress={buildProgress}
        exitProgress={exitProgress}
        fromX={size * 0.34}
        fromY={-size * 0.18}
        exitX={size * 0.96}
        exitY={-size * 0.12}
      />
      <LogoPiece
        size={size}
        region={{ x: 0.12, y: 0.42, width: 0.28, height: 0.18 }}
        buildProgress={buildProgress}
        exitProgress={exitProgress}
        fromX={-size * 0.28}
        fromY={size * 0.24}
        exitX={-size * 1.0}
        exitY={size * 0.16}
      />
      <LogoPiece
        size={size}
        region={{ x: 0.50, y: 0.35, width: 0.25, height: 0.23 }}
        buildProgress={buildProgress}
        exitProgress={exitProgress}
        fromX={size * 0.30}
        fromY={size * 0.18}
        exitX={size * 1.0}
        exitY={size * 0.18}
      />
      <LogoPiece
        size={size}
        region={{ x: 0.18, y: 0.56, width: 0.28, height: 0.18 }}
        buildProgress={buildProgress}
        exitProgress={exitProgress}
        fromX={-size * 0.20}
        fromY={size * 0.28}
        exitX={-size * 0.82}
        exitY={size * 0.38}
      />

      {/* Stationary Highlander anchor. It only gets a tiny zoom/fade at the end. */}
      <Animated.View
        style={[
          styles.logoCrop,
          highlanderFrame,
          {
            opacity: highlanderOpacity,
            transform: [{ scale: highlanderScale }],
          },
        ]}
      >
        <Image
          source={LOGO}
          resizeMode="stretch"
          style={{
            position: 'absolute',
            width: size,
            height: size,
            left: -highlanderFrame.left,
            top: -highlanderFrame.top,
          }}
        />
      </Animated.View>

      {/* Exact source image locks in the final assembled proportions before opening. */}
      <Animated.Image
        source={LOGO}
        resizeMode="stretch"
        style={[
          StyleSheet.absoluteFill,
          { width: size, height: size, opacity: completeOpacity },
        ]}
      />
    </View>
  );
}

export default function App() {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const [showSplash, setShowSplash] = useState(true);

  const buildProgress = useRef(new Animated.Value(0)).current;
  const completeOpacity = useRef(new Animated.Value(0)).current;
  const exitProgress = useRef(new Animated.Value(0)).current;
  const highlanderScale = useRef(new Animated.Value(1)).current;
  const highlanderOpacity = useRef(new Animated.Value(1)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(180),
      Animated.timing(buildProgress, {
        toValue: 1,
        duration: 1050,
        easing: Easing.bezier(0.18, 0.82, 0.22, 1),
        useNativeDriver: true,
      }),
      Animated.timing(completeOpacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.delay(1450),
      Animated.parallel([
        Animated.timing(completeOpacity, {
          toValue: 0,
          duration: 170,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(exitProgress, {
          toValue: 1,
          duration: 760,
          easing: Easing.bezier(0.55, 0.03, 0.18, 1),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(260),
          Animated.parallel([
            Animated.timing(highlanderScale, {
              toValue: 1.08,
              duration: 390,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(highlanderOpacity, {
              toValue: 0,
              duration: 390,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]),
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => setShowSplash(false));
  }, [
    buildProgress,
    completeOpacity,
    exitProgress,
    highlanderOpacity,
    highlanderScale,
    splashOpacity,
  ]);

  const canvasSize = Math.min(width * 1.35, height * 0.72, 560);

  return (
    <SafeAreaProvider>
      <View style={[styles.container, Platform.OS === 'web' && styles.webContainer]}>
        <StatusBar style={showSplash ? 'light' : colors.statusBarStyle} />
        <View style={[styles.appViewport, Platform.OS === 'web' && styles.webViewport]}>
          {/* Home is already mounted below the splash, so the logo literally opens to reveal it. */}
          <View style={[styles.mainApp, { backgroundColor: colors.background }]}>
            <MainApp />
          </View>

          {showSplash && (
            <Animated.View style={[styles.splash, { opacity: splashOpacity }]} pointerEvents="none">
              <View style={{ transform: [{ translateY: -canvasSize * 0.08 }] }}>
                <ConstructedLogo
                  size={canvasSize}
                  buildProgress={buildProgress}
                  completeOpacity={completeOpacity}
                  exitProgress={exitProgress}
                  highlanderScale={highlanderScale}
                  highlanderOpacity={highlanderOpacity}
                />
              </View>
            </Animated.View>
          )}
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: SPLASH_NAVY },
  webContainer: { backgroundColor: '#201F1D', paddingVertical: 24 },
  appViewport: { flex: 1, width: '100%' },
  webViewport: {
    width: '100%',
    maxWidth: 430,
    minHeight: '100%',
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SPLASH_NAVY,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 100,
  },
  logoCrop: { position: 'absolute', overflow: 'hidden' },
});
