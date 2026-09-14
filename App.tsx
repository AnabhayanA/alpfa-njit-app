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
  ['8%', '12%', 2, 0.55], ['18%', '24%', 1, 0.40], ['31%', '9%', 2, 0.68], ['44%', '18%', 1, 0.35],
  ['62%', '11%', 2, 0.50], ['78%', '21%', 1, 0.45], ['91%', '14%', 2, 0.60], ['12%', '38%', 1, 0.32],
  ['26%', '44%', 2, 0.52], ['39%', '33%', 1, 0.38], ['55%', '42%', 2, 0.66], ['73%', '36%', 1, 0.35],
  ['86%', '48%', 2, 0.58], ['6%', '62%', 2, 0.46], ['20%', '72%', 1, 0.34], ['34%', '64%', 2, 0.62],
  ['49%', '78%', 1, 0.36], ['64%', '69%', 2, 0.54], ['79%', '82%', 1, 0.40], ['93%', '67%', 2, 0.60],
  ['14%', '88%', 1, 0.36], ['40%', '91%', 2, 0.52], ['69%', '92%', 1, 0.34], ['88%', '90%', 2, 0.48],
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
  const logoScale = useRef(new Animated.Value(0.12)).current;
  const logoLift = useRef(new Animated.Value(28)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const streakProgress = useRef(new Animated.Value(0)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const driftLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(starDrift, {
          toValue: 1,
          duration: 2200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(starDrift, {
          toValue: 0,
          duration: 2200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );

    driftLoop.start();

    Animated.sequence([
      Animated.delay(180),
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 0.46,
          duration: 900,
          easing: Easing.bezier(0.18, 0.78, 0.22, 1),
          useNativeDriver: true,
        }),
        Animated.timing(logoLift, {
          toValue: 0,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 0.72,
          duration: 620,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(120),
          Animated.timing(taglineOpacity, {
            toValue: 1,
            duration: 360,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.delay(420),
      Animated.parallel([
        Animated.timing(streakProgress, {
          toValue: 1,
          duration: 520,
          easing: Easing.bezier(0.32, 0.02, 0.12, 1),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1.55,
          duration: 620,
          easing: Easing.bezier(0.22, 0.75, 0.12, 1),
          useNativeDriver: true,
        }),
        Animated.timing(taglineOpacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 0,
          duration: 220,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(splashOpacity, {
          toValue: 0,
          duration: 340,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      driftLoop.stop();
      setShowSplash(false);
    });

    return () => driftLoop.stop();
  }, [logoLift, logoOpacity, logoScale, splashOpacity, starDrift, streakProgress, taglineOpacity]);

  const logoSize = Math.min(width * 0.72, 340);
  const starTranslateY = starDrift.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });
  const streakOpacity = streakProgress.interpolate({ inputRange: [0, 0.05, 0.85, 1], outputRange: [0, 1, 1, 0] });
  const streakScaleY = streakProgress.interpolate({ inputRange: [0, 1], outputRange: [0.15, 4.8] });
  const streakScaleX = streakProgress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] });

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
            <Animated.View style={[styles.starField, { transform: [{ translateY: starTranslateY }] }]}>
              {STARS.map(([left, top, size, opacity], index) => (
                <View
                  key={`${left}-${top}-${index}`}
                  style={[
                    styles.star,
                    {
                      left,
                      top,
                      width: size,
                      height: size,
                      borderRadius: size,
                      opacity,
                    },
                  ]}
                />
              ))}
            </Animated.View>

            <Animated.View
              style={[
                styles.logoWrap,
                {
                  transform: [
                    { translateY: logoLift },
                    { scale: logoScale },
                  ],
                  opacity: logoOpacity,
                },
              ]}
            >
              <Animated.Image
                source={LOADING_LOGO}
                resizeMode="contain"
                style={{ width: logoSize, height: logoSize }}
              />
            </Animated.View>

            <Animated.View style={[styles.taglineWrap, { opacity: taglineOpacity }]}>
              <Text style={styles.brandText}>ALPFA NJIT</Text>
              <Text style={styles.tagline}>FAMILIA  ·  LEADERSHIP  ·  LEGACY</Text>
            </Animated.View>

            <View style={styles.streakLayer}>
              {[
                { left: '15%', top: '20%', rotate: '-18deg' },
                { left: '78%', top: '18%', rotate: '20deg' },
                { left: '10%', top: '68%', rotate: '-28deg' },
                { left: '82%', top: '72%', rotate: '26deg' },
                { left: '48%', top: '8%', rotate: '0deg' },
                { left: '54%', top: '84%', rotate: '180deg' },
              ].map((streak, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.streak,
                    {
                      left: streak.left,
                      top: streak.top,
                      opacity: streakOpacity,
                      transform: [
                        { rotate: streak.rotate },
                        { scaleY: streakScaleY },
                        { scaleX: streakScaleX },
                      ],
                    },
                  ]}
                />
              ))}
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
  starField: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#DDEBFF',
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
  },
  taglineWrap: {
    position: 'absolute',
    top: '66%',
    alignItems: 'center',
    zIndex: 5,
  },
  brandText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2.4,
  },
  tagline: {
    marginTop: 10,
    color: '#F7DADF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  streakLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
  },
  streak: {
    position: 'absolute',
    width: 3,
    height: 54,
    borderRadius: 999,
    backgroundColor: ALPFA_RED,
    shadowColor: ALPFA_RED,
    shadowOpacity: 0.75,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
});
