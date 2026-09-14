import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
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
const SPLASH_NAVY = '#060B1A';
const ALPFA_RED = '#E5223D';

const STARS = [
  ['6%', '8%', 2, 0.5], ['13%', '18%', 1, 0.38], ['21%', '11%', 2, 0.62], ['29%', '27%', 1, 0.34],
  ['37%', '14%', 2, 0.52], ['46%', '7%', 1, 0.36], ['58%', '19%', 2, 0.68], ['67%', '10%', 1, 0.42],
  ['77%', '25%', 2, 0.52], ['88%', '13%', 1, 0.40], ['95%', '31%', 2, 0.60], ['9%', '38%', 1, 0.32],
  ['18%', '52%', 2, 0.58], ['28%', '43%', 1, 0.36], ['40%', '57%', 2, 0.64], ['51%', '39%', 1, 0.30],
  ['61%', '51%', 2, 0.54], ['72%', '42%', 1, 0.38], ['84%', '57%', 2, 0.62], ['93%', '48%', 1, 0.34],
  ['7%', '69%', 2, 0.48], ['17%', '82%', 1, 0.32], ['31%', '72%', 2, 0.60], ['44%', '88%', 1, 0.36],
  ['55%', '74%', 2, 0.58], ['66%', '90%', 1, 0.34], ['79%', '76%', 2, 0.52], ['91%', '88%', 1, 0.40],
  ['24%', '94%', 2, 0.48], ['73%', '64%', 1, 0.34], ['49%', '25%', 2, 0.52], ['82%', '35%', 1, 0.34],
] as const;

const STREAKS = [
  { left: '2%', top: '24%', rotate: '18deg', width: 128 },
  { left: '67%', top: '21%', rotate: '-18deg', width: 132 },
  { left: '-4%', top: '43%', rotate: '8deg', width: 112 },
  { left: '73%', top: '45%', rotate: '-8deg', width: 126 },
  { left: '4%', top: '67%', rotate: '-18deg', width: 132 },
  { left: '68%', top: '70%', rotate: '18deg', width: 128 },
  { left: '21%', top: '8%', rotate: '62deg', width: 118 },
  { left: '58%', top: '10%', rotate: '118deg', width: 118 },
  { left: '25%', top: '82%', rotate: '-62deg', width: 118 },
  { left: '57%', top: '82%', rotate: '62deg', width: 118 },
] as const;

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

export default function App() {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const [showSplash, setShowSplash] = useState(true);

  const starDrift = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.08)).current;
  const logoLift = useRef(new Animated.Value(24)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const streakBuild = useRef(new Animated.Value(0)).current;
  const streakRush = useRef(new Animated.Value(0)).current;
  const redBloom = useRef(new Animated.Value(0)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const driftLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(starDrift, { toValue: 1, duration: 2600, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(starDrift, { toValue: 0, duration: 2600, easing: Easing.linear, useNativeDriver: true }),
      ])
    );

    driftLoop.start();

    Animated.sequence([
      // 1. Stars only — let the space intro establish itself.
      Animated.delay(800),

      // 2. Distant logo appears.
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 0.24,
          duration: 800,
          easing: Easing.bezier(0.18, 0.72, 0.22, 1),
          useNativeDriver: true,
        }),
        Animated.timing(logoLift, {
          toValue: 10,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      // 3. Slow cinematic approach.
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 0.56,
          duration: 800,
          easing: Easing.bezier(0.18, 0.76, 0.22, 1),
          useNativeDriver: true,
        }),
        Animated.timing(logoLift, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      // 4. Tagline reveal and readable hold.
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.delay(420),

      // 5. Red streaks visibly build around the logo.
      Animated.parallel([
        Animated.timing(streakBuild, {
          toValue: 1,
          duration: 620,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 0.72,
          duration: 620,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(180),

      // 6. Final push — logo and streaks rush toward the viewer.
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 2.7,
          duration: 700,
          easing: Easing.bezier(0.22, 0.82, 0.12, 1),
          useNativeDriver: true,
        }),
        Animated.timing(streakRush, {
          toValue: 1,
          duration: 700,
          easing: Easing.bezier(0.22, 0.82, 0.12, 1),
          useNativeDriver: true,
        }),
        Animated.timing(taglineOpacity, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(430),
          Animated.timing(redBloom, {
            toValue: 1,
            duration: 220,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]),

      // 7. Quick red light wash, then reveal the real Home screen underneath.
      Animated.parallel([
        Animated.timing(redBloom, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 420,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      driftLoop.stop();
      setShowSplash(false);
    });

    return () => driftLoop.stop();
  }, [logoLift, logoOpacity, logoScale, redBloom, splashOpacity, starDrift, streakBuild, streakRush, taglineOpacity]);

  const logoSize = Math.min(width * 0.78, 360);
  const starTranslateY = starDrift.interpolate({ inputRange: [0, 1], outputRange: [0, 12] });
  const starScale = starDrift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });
  const streakOpacity = streakBuild.interpolate({ inputRange: [0, 0.08, 1], outputRange: [0, 0.15, 1] });
  const streakScaleX = Animated.multiply(
    streakBuild.interpolate({ inputRange: [0, 1], outputRange: [0.05, 1] }),
    streakRush.interpolate({ inputRange: [0, 1], outputRange: [1, 3.8] })
  );
  const streakTranslateX = streakRush.interpolate({ inputRange: [0, 1], outputRange: [0, 115] });
  const bloomOpacity = redBloom.interpolate({ inputRange: [0, 1], outputRange: [0, 0.68] });
  const bloomScale = redBloom.interpolate({ inputRange: [0, 1], outputRange: [0.45, 3.4] });

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
            <Animated.View style={[styles.starField, { transform: [{ translateY: starTranslateY }, { scale: starScale }] }]}>
              {STARS.map(([left, top, size, opacity], index) => (
                <View
                  key={`${left}-${top}-${index}`}
                  style={[styles.star, { left, top, width: size, height: size, borderRadius: size, opacity }]}
                />
              ))}
            </Animated.View>

            <View style={styles.streakLayer}>
              {STREAKS.map((streak, index) => (
                <Animated.View
                  key={`${streak.left}-${streak.top}-${index}`}
                  style={[
                    styles.streak,
                    {
                      left: streak.left,
                      top: streak.top,
                      width: streak.width,
                      opacity: streakOpacity,
                      transform: [
                        { rotate: streak.rotate },
                        { translateX: streakTranslateX },
                        { scaleX: streakScaleX },
                      ],
                    },
                  ]}
                />
              ))}
            </View>

            <Animated.View
              style={[
                styles.logoWrap,
                {
                  opacity: logoOpacity,
                  transform: [{ translateY: logoLift }, { scale: logoScale }],
                },
              ]}
            >
              <Animated.Image source={LOADING_LOGO} resizeMode="contain" style={{ width: logoSize, height: logoSize }} />
            </Animated.View>

            <Animated.View style={[styles.taglineWrap, { opacity: taglineOpacity }]}>
              <Text style={styles.tagline}>FAMILIA  ·  LEADERSHIP  ·  LEGACY</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.redBloom,
                {
                  width: Math.min(width, height) * 0.38,
                  height: Math.min(width, height) * 0.38,
                  borderRadius: Math.min(width, height) * 0.19,
                  opacity: bloomOpacity,
                  transform: [{ scale: bloomScale }],
                },
              ]}
            />
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
  starField: { ...StyleSheet.absoluteFillObject },
  star: { position: 'absolute', backgroundColor: '#DDEBFF' },
  streakLayer: { ...StyleSheet.absoluteFillObject, zIndex: 3 },
  streak: {
    position: 'absolute',
    height: 4,
    borderRadius: 999,
    backgroundColor: ALPFA_RED,
    shadowColor: ALPFA_RED,
    shadowOpacity: 0.95,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  logoWrap: { alignItems: 'center', justifyContent: 'center', zIndex: 5 },
  taglineWrap: {
    position: 'absolute',
    top: '67%',
    alignItems: 'center',
    zIndex: 6,
  },
  tagline: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.2,
  },
  redBloom: {
    position: 'absolute',
    backgroundColor: ALPFA_RED,
    zIndex: 10,
    shadowColor: ALPFA_RED,
    shadowOpacity: 0.9,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 0 },
  },
});
