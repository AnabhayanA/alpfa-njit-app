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
const SPLASH_NAVY = '#030817';
const ALPFA_RED = '#FF2947';

const STARS = [
  ['5%','8%',2,.75],['12%','17%',1,.45],['20%','10%',2,.58],['29%','24%',1,.38],['37%','7%',2,.68],
  ['45%','19%',1,.36],['54%','12%',2,.82],['62%','25%',1,.42],['71%','8%',2,.62],['81%','19%',1,.46],
  ['91%','11%',2,.70],['8%','34%',1,.34],['17%','45%',2,.64],['27%','36%',1,.42],['38%','50%',2,.72],
  ['48%','31%',1,.34],['58%','45%',2,.60],['68%','35%',1,.40],['78%','51%',2,.70],['90%','40%',1,.38],
  ['4%','58%',2,.56],['14%','68%',1,.34],['24%','59%',2,.66],['34%','75%',1,.40],['45%','64%',2,.70],
  ['55%','79%',1,.36],['65%','61%',2,.60],['76%','72%',1,.42],['87%','64%',2,.68],['95%','78%',1,.36],
  ['9%','88%',2,.52],['22%','82%',1,.34],['36%','92%',2,.64],['51%','88%',1,.38],['67%','94%',2,.56],
  ['82%','87%',1,.36],['93%','93%',2,.52],['32%','16%',1,.36],['73%','29%',2,.58],['61%','84%',1,.34],
] as const;

const FLARES = [
  { left: '19%', top: '26%', size: 8 },
  { left: '64%', top: '16%', size: 10 },
  { left: '84%', top: '57%', size: 8 },
  { left: '37%', top: '72%', size: 7 },
] as const;

const STREAKS = [
  { left:'-12%', top:'20%', rot:'17deg', len:148, outX:-70, outY:-22 },
  { left:'69%', top:'17%', rot:'-17deg', len:154, outX:72, outY:-24 },
  { left:'-15%', top:'38%', rot:'8deg', len:132, outX:-78, outY:-8 },
  { left:'75%', top:'39%', rot:'-9deg', len:142, outX:82, outY:-8 },
  { left:'-10%', top:'63%', rot:'-15deg', len:154, outX:-76, outY:24 },
  { left:'70%', top:'68%', rot:'16deg', len:148, outX:78, outY:24 },
  { left:'13%', top:'-2%', rot:'57deg', len:128, outX:-28, outY:-76 },
  { left:'61%', top:'0%', rot:'123deg', len:128, outX:28, outY:-78 },
  { left:'15%', top:'82%', rot:'-58deg', len:132, outX:-30, outY:78 },
  { left:'61%', top:'82%', rot:'58deg', len:132, outX:30, outY:80 },
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

function RedStreak({ streak, build, rush }: { streak: typeof STREAKS[number]; build: Animated.Value; rush: Animated.Value }) {
  const opacity = build.interpolate({ inputRange: [0, 0.12, 0.45, 1], outputRange: [0, 0.2, 0.65, 1] });
  const scaleX = Animated.multiply(
    build.interpolate({ inputRange: [0, 1], outputRange: [0.05, 1] }),
    rush.interpolate({ inputRange: [0, 1], outputRange: [1, 2.8] })
  );
  const translateX = rush.interpolate({ inputRange: [0, 1], outputRange: [0, streak.outX] });
  const translateY = rush.interpolate({ inputRange: [0, 1], outputRange: [0, streak.outY] });

  return (
    <Animated.View
      style={[
        styles.streakWrap,
        {
          left: streak.left,
          top: streak.top,
          width: streak.len,
          opacity,
          transform: [{ rotate: streak.rot }, { translateX }, { translateY }, { scaleX }],
        },
      ]}
    >
      <View style={styles.streakGlow} />
      <View style={styles.streakCore} />
    </Animated.View>
  );
}

export default function App() {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const [showSplash, setShowSplash] = useState(true);

  const starsMotion = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.10)).current;
  const logoY = useRef(new Animated.Value(22)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const streakBuild = useRef(new Animated.Value(0)).current;
  const rush = useRef(new Animated.Value(0)).current;
  const lightWash = useRef(new Animated.Value(0)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const starLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(starsMotion, { toValue: 1, duration: 2400, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(starsMotion, { toValue: 0, duration: 2400, easing: Easing.linear, useNativeDriver: true }),
      ])
    );

    starLoop.start();

    Animated.sequence([
      // 0.0 - 0.4s: establish the star field.
      Animated.delay(380),

      // 0.4 - 1.0s: real ALPFA NJIT logo appears far away and approaches.
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(logoScale, { toValue: 0.40, duration: 620, easing: Easing.bezier(0.18, 0.78, 0.22, 1), useNativeDriver: true }),
        Animated.timing(logoY, { toValue: 10, duration: 620, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),

      // 1.0 - 1.5s: approach with the first subtle red trails.
      Animated.parallel([
        Animated.timing(logoScale, { toValue: 0.72, duration: 520, easing: Easing.bezier(0.18, 0.78, 0.22, 1), useNativeDriver: true }),
        Animated.timing(logoY, { toValue: 0, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(streakBuild, { toValue: 0.32, duration: 520, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),

      // 1.5 - 2.0s: hero logo and tagline.
      Animated.parallel([
        Animated.timing(logoScale, { toValue: 0.88, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(70),
          Animated.timing(taglineOpacity, { toValue: 1, duration: 250, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]),
      ]),
      Animated.delay(180),

      // 2.0 - 2.4s: red streaks fully build around the real logo.
      Animated.parallel([
        Animated.timing(streakBuild, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(logoScale, { toValue: 0.98, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),

      // 2.4 - 2.8s: final cinematic push toward the camera.
      Animated.parallel([
        Animated.timing(rush, { toValue: 1, duration: 440, easing: Easing.bezier(0.16, 0.84, 0.12, 1), useNativeDriver: true }),
        Animated.timing(logoScale, { toValue: 3.5, duration: 440, easing: Easing.bezier(0.16, 0.84, 0.12, 1), useNativeDriver: true }),
        Animated.timing(taglineOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(275),
          Animated.timing(lightWash, { toValue: 1, duration: 150, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]),
      ]),

      // 2.8 - 3.1s: red/white light wash fades into the real Home screen.
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 0, duration: 170, useNativeDriver: true }),
        Animated.timing(lightWash, { toValue: 0, duration: 280, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(splashOpacity, { toValue: 0, duration: 320, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
    ]).start(() => {
      starLoop.stop();
      setShowSplash(false);
    });

    return () => starLoop.stop();
  }, [lightWash, logoOpacity, logoScale, logoY, rush, splashOpacity, starsMotion, streakBuild, taglineOpacity]);

  const cinemaWidth = Math.min(width, 430);
  const logoSize = Math.min(cinemaWidth * 0.84, 360);
  const starY = starsMotion.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });
  const starScale = starsMotion.interpolate({ inputRange: [0, 1], outputRange: [1, 1.025] });
  const washOpacity = lightWash.interpolate({ inputRange: [0, 0.45, 1], outputRange: [0, 0.65, 0.96] });
  const washScale = lightWash.interpolate({ inputRange: [0, 1], outputRange: [0.18, 4.2] });

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
            <View style={[styles.cinemaStage, { width: cinemaWidth, height }]}>
              <Animated.View style={[styles.starField, { transform: [{ translateY: starY }, { scale: starScale }] }]}>
                {STARS.map(([left, top, size, opacity], i) => (
                  <View key={`star-${i}`} style={[styles.star, { left, top, width: size, height: size, borderRadius: size, opacity }]} />
                ))}
                {FLARES.map((flare, i) => (
                  <View key={`flare-${i}`} style={[styles.flare, { left: flare.left, top: flare.top, width: flare.size, height: flare.size }]}>
                    <View style={styles.flareHorizontal} />
                    <View style={styles.flareVertical} />
                    <View style={styles.flareDot} />
                  </View>
                ))}
              </Animated.View>

              <View style={styles.streakLayer}>
                {STREAKS.map((streak, i) => (
                  <RedStreak key={`streak-${i}`} streak={streak} build={streakBuild} rush={rush} />
                ))}
              </View>

              <Animated.View
                style={[
                  styles.logoWrap,
                  {
                    opacity: logoOpacity,
                    transform: [{ translateY: logoY }, { scale: logoScale }],
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
                  styles.lightWash,
                  {
                    width: cinemaWidth * 0.38,
                    height: cinemaWidth * 0.38,
                    borderRadius: cinemaWidth * 0.19,
                    opacity: washOpacity,
                    transform: [{ scale: washScale }],
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
  webContainer: { backgroundColor: '#171717' },
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
  cinemaStage: {
    position: 'relative',
    backgroundColor: SPLASH_NAVY,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starField: { ...StyleSheet.absoluteFillObject },
  star: { position: 'absolute', backgroundColor: '#E8F3FF' },
  flare: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  flareHorizontal: { position: 'absolute', width: '100%', height: 1, backgroundColor: '#BFD9FF', opacity: 0.8 },
  flareVertical: { position: 'absolute', width: 1, height: '100%', backgroundColor: '#BFD9FF', opacity: 0.75 },
  flareDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#FFFFFF' },
  streakLayer: { ...StyleSheet.absoluteFillObject, zIndex: 2 },
  streakWrap: { position: 'absolute', height: 10, justifyContent: 'center' },
  streakGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,41,71,0.20)',
  },
  streakCore: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 999,
    backgroundColor: ALPFA_RED,
  },
  logoWrap: {
    zIndex: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  lightWash: {
    position: 'absolute',
    zIndex: 8,
    backgroundColor: '#FF5A70',
  },
});
