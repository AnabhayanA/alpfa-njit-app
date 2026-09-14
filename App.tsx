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
const SPLASH_NAVY = '#050A18';
const ALPFA_RED = '#FF2947';

const STARS = [
  ['7%','10%',2,.75],['15%','22%',1,.45],['24%','8%',2,.62],['32%','31%',1,.42],['41%','14%',2,.55],
  ['50%','6%',1,.38],['58%','24%',2,.78],['67%','12%',1,.42],['76%','30%',2,.58],['88%','16%',1,.46],
  ['94%','34%',2,.66],['9%','41%',1,.38],['18%','54%',2,.62],['28%','45%',1,.42],['39%','60%',2,.72],
  ['50%','42%',1,.36],['61%','56%',2,.60],['72%','46%',1,.46],['83%','61%',2,.70],['93%','51%',1,.40],
  ['6%','72%',2,.54],['16%','85%',1,.36],['29%','75%',2,.68],['43%','91%',1,.40],['54%','78%',2,.62],
  ['66%','92%',1,.38],['78%','80%',2,.58],['91%','90%',1,.42],['22%','95%',2,.50],['73%','66%',1,.38],
  ['47%','26%',2,.62],['84%','38%',1,.40],['12%','64%',1,.45],['35%','20%',1,.50],['69%','34%',2,.56],
] as const;

const STREAKS = [
  { left:'-4%', top:'22%', rot:'16deg', len:150 },
  { left:'68%', top:'18%', rot:'-18deg', len:160 },
  { left:'-8%', top:'42%', rot:'6deg', len:135 },
  { left:'72%', top:'41%', rot:'-7deg', len:145 },
  { left:'0%', top:'66%', rot:'-16deg', len:155 },
  { left:'69%', top:'70%', rot:'17deg', len:150 },
  { left:'16%', top:'7%', rot:'58deg', len:135 },
  { left:'61%', top:'8%', rot:'122deg', len:135 },
  { left:'18%', top:'83%', rot:'-58deg', len:140 },
  { left:'60%', top:'82%', rot:'58deg', len:140 },
  { left:'-2%', top:'53%', rot:'11deg', len:95 },
  { left:'79%', top:'56%', rot:'-10deg', len:100 },
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

function CinematicAlpfaMark({ size }: { size: number }) {
  const barW = size * 0.12;
  const barH = size * 0.78;
  return (
    <View style={{ width: size, height: size * 0.88, alignItems: 'center', justifyContent: 'center' }}>
      <View style={[styles.redBar, { width: barW, height: barH, left: size * 0.22, top: size * 0.04, transform: [{ rotate: '31deg' }] }]} />
      <View style={[styles.redBar, { width: barW, height: barH, right: size * 0.22, top: size * 0.04, transform: [{ rotate: '-31deg' }] }]} />
      <View style={[styles.whiteSlash, { width: size * 0.42, height: Math.max(3, size * 0.022), bottom: size * 0.18, transform: [{ rotate: '-8deg' }] }]} />
      <Text style={[styles.alpfaWord, { fontSize: size * 0.11, letterSpacing: size * 0.015 }]}>ALPFA</Text>
    </View>
  );
}

export default function App() {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const [showSplash, setShowSplash] = useState(true);

  const starDrift = useRef(new Animated.Value(0)).current;
  const markOpacity = useRef(new Animated.Value(0)).current;
  const markScale = useRef(new Animated.Value(0.08)).current;
  const markY = useRef(new Animated.Value(30)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const streakBuild = useRef(new Animated.Value(0)).current;
  const rush = useRef(new Animated.Value(0)).current;
  const wash = useRef(new Animated.Value(0)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const drift = Animated.loop(
      Animated.sequence([
        Animated.timing(starDrift, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(starDrift, { toValue: 0, duration: 3000, easing: Easing.linear, useNativeDriver: true }),
      ])
    );
    drift.start();

    Animated.sequence([
      // 1. Stars only.
      Animated.delay(700),

      // 2. Tiny distant logo.
      Animated.parallel([
        Animated.timing(markOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(markScale, { toValue: 0.23, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(markY, { toValue: 14, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.delay(150),

      // 3. Approach with first faint streaks.
      Animated.parallel([
        Animated.timing(markScale, { toValue: 0.55, duration: 850, easing: Easing.bezier(0.2, 0.75, 0.22, 1), useNativeDriver: true }),
        Animated.timing(markY, { toValue: 0, duration: 850, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(streakBuild, { toValue: 0.28, duration: 850, useNativeDriver: true }),
      ]),

      // 4. Hero logo + tagline.
      Animated.parallel([
        Animated.timing(markScale, { toValue: 0.72, duration: 430, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(100),
          Animated.timing(taglineOpacity, { toValue: 1, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]),
      ]),
      Animated.delay(500),

      // 5. Red streaks build hard around the logo.
      Animated.parallel([
        Animated.timing(streakBuild, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(markScale, { toValue: 0.83, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.delay(160),

      // 6. Final push past camera.
      Animated.parallel([
        Animated.timing(rush, { toValue: 1, duration: 650, easing: Easing.bezier(0.18, 0.8, 0.1, 1), useNativeDriver: true }),
        Animated.timing(markScale, { toValue: 3.4, duration: 650, easing: Easing.bezier(0.18, 0.8, 0.1, 1), useNativeDriver: true }),
        Animated.timing(taglineOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(420),
          Animated.timing(wash, { toValue: 1, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]),
      ]),

      // 7. Light wash into Home.
      Animated.parallel([
        Animated.timing(markOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(wash, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(splashOpacity, { toValue: 0, duration: 420, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
    ]).start(() => {
      drift.stop();
      setShowSplash(false);
    });

    return () => drift.stop();
  }, [markOpacity, markScale, markY, rush, splashOpacity, starDrift, streakBuild, taglineOpacity, wash]);

  const markSize = Math.min(width * 0.70, 300);
  const starTranslateY = starDrift.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });
  const starScale = starDrift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.035] });
  const streakOpacity = streakBuild.interpolate({ inputRange: [0, 0.12, 1], outputRange: [0, 0.22, 1] });
  const streakScaleX = Animated.multiply(
    streakBuild.interpolate({ inputRange: [0, 1], outputRange: [0.08, 1] }),
    rush.interpolate({ inputRange: [0, 1], outputRange: [1, 4.8] })
  );
  const streakTranslateX = rush.interpolate({ inputRange: [0, 1], outputRange: [0, 95] });
  const washOpacity = wash.interpolate({ inputRange: [0, 1], outputRange: [0, 0.92] });
  const washScale = wash.interpolate({ inputRange: [0, 1], outputRange: [0.2, 3.8] });

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
              {STARS.map(([left, top, size, opacity], i) => (
                <View key={i} style={[styles.star, { left, top, width: size, height: size, borderRadius: size, opacity }]} />
              ))}
            </Animated.View>

            <View style={styles.streakLayer}>
              {STREAKS.map((s, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.streak,
                    {
                      left: s.left,
                      top: s.top,
                      width: s.len,
                      opacity: streakOpacity,
                      transform: [{ rotate: s.rot }, { translateX: streakTranslateX }, { scaleX: streakScaleX }],
                    },
                  ]}
                />
              ))}
            </View>

            <Animated.View style={[styles.markWrap, { opacity: markOpacity, transform: [{ translateY: markY }, { scale: markScale }] }]}>
              <CinematicAlpfaMark size={markSize} />
            </Animated.View>

            <Animated.View style={[styles.taglineWrap, { opacity: taglineOpacity }]}>
              <Text style={styles.tagline}>FAMILIA  ·  LEADERSHIP  ·  LEGACY</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.wash,
                {
                  width: Math.min(width, height) * 0.42,
                  height: Math.min(width, height) * 0.42,
                  borderRadius: Math.min(width, height) * 0.21,
                  opacity: washOpacity,
                  transform: [{ scale: washScale }],
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
  star: { position: 'absolute', backgroundColor: '#E6F1FF' },
  streakLayer: { ...StyleSheet.absoluteFillObject, zIndex: 2 },
  streak: {
    position: 'absolute',
    height: 3,
    borderRadius: 999,
    backgroundColor: ALPFA_RED,
  },
  markWrap: { zIndex: 4, alignItems: 'center', justifyContent: 'center' },
  redBar: {
    position: 'absolute',
    borderRadius: 3,
    backgroundColor: ALPFA_RED,
  },
  whiteSlash: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  alpfaWord: {
    color: '#FFFFFF',
    fontWeight: '900',
    position: 'absolute',
    top: '49%',
  },
  taglineWrap: {
    position: 'absolute',
    top: '66%',
    alignItems: 'center',
    zIndex: 5,
  },
  tagline: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.1,
  },
  wash: {
    position: 'absolute',
    zIndex: 10,
    backgroundColor: '#FF5A70',
  },
});
