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

// Splash uses only the red/color and white supplied logos.
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

export default function App() {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const [showSplash, setShowSplash] = useState(true);

  const intro = useRef(new Animated.Value(0)).current;
  const colorOpacity = useRef(new Animated.Value(0)).current;
  const whiteOpacity = useRef(new Animated.Value(0)).current;
  const exit = useRef(new Animated.Value(0)).current;
  const mascotScale = useRef(new Animated.Value(1)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(intro, {
          toValue: 1,
          duration: 760,
          easing: Easing.bezier(0.18, 0.82, 0.22, 1),
          useNativeDriver: true,
        }),
        Animated.timing(colorOpacity, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(620),
      Animated.parallel([
        Animated.timing(whiteOpacity, {
          toValue: 1,
          duration: 320,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(colorOpacity, {
          toValue: 0,
          duration: 320,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1150),
      Animated.parallel([
        Animated.timing(exit, {
          toValue: 1,
          duration: 760,
          easing: Easing.bezier(0.55, 0.03, 0.18, 1),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(220),
          Animated.timing(mascotScale, {
            toValue: 1.08,
            duration: 420,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(430),
          Animated.timing(splashOpacity, {
            toValue: 0,
            duration: 360,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start(() => setShowSplash(false));
  }, [colorOpacity, exit, intro, mascotScale, splashOpacity, whiteOpacity]);

  const logoWidth = Math.min(width * 0.84, 420);
  const logoHeight = Math.min(height * 0.36, 320);

  const leftDoor = exit.interpolate({ inputRange: [0, 1], outputRange: [0, -width * 0.72] });
  const rightDoor = exit.interpolate({ inputRange: [0, 1], outputRange: [0, width * 0.72] });
  const introScale = intro.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] });
  const introY = intro.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });

  return (
    <SafeAreaProvider>
      <View style={[styles.container, Platform.OS === 'web' && styles.webContainer]}>
        <StatusBar style={showSplash ? 'light' : colors.statusBarStyle} />

        <View style={[styles.appViewport, Platform.OS === 'web' && styles.webViewport]}>
          <View style={[styles.mainApp, { backgroundColor: colors.background }]}>
            <MainApp />
          </View>
        </View>

        {showSplash && (
          <Animated.View style={[styles.splash, { opacity: splashOpacity }]} pointerEvents="none">
            <Animated.View
              style={[
                styles.logoStage,
                {
                  width: logoWidth,
                  height: logoHeight,
                  transform: [
                    { translateY: introY },
                    { scale: introScale },
                    { scale: mascotScale },
                  ],
                },
              ]}
            >
              <Animated.Image
                source={LOGO_COLOR}
                resizeMode="contain"
                style={[styles.fullLogo, { opacity: colorOpacity }]}
              />

              <Animated.Image
                source={LOGO_WHITE}
                resizeMode="contain"
                style={[styles.fullLogo, { opacity: whiteOpacity }]}
              />

              <Animated.View
                style={[styles.doorHalf, styles.leftHalf, { transform: [{ translateX: leftDoor }] }]}
              >
                <Image source={LOGO_WHITE} resizeMode="contain" style={styles.doorImage} />
              </Animated.View>
              <Animated.View
                style={[styles.doorHalf, styles.rightHalf, { transform: [{ translateX: rightDoor }] }]}
              >
                <Image
                  source={LOGO_WHITE}
                  resizeMode="contain"
                  style={[styles.doorImage, { left: -logoWidth / 2 }]}
                />
              </Animated.View>
            </Animated.View>
          </Animated.View>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: SPLASH_NAVY,
    position: 'relative',
  },
  webContainer: {
    backgroundColor: '#201F1D',
  },
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SPLASH_NAVY,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 9999,
    elevation: 9999,
  },
  logoStage: { position: 'relative', overflow: 'visible' },
  fullLogo: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  doorHalf: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '50%',
    overflow: 'hidden',
  },
  leftHalf: { left: 0 },
  rightHalf: { right: 0 },
  doorImage: {
    position: 'absolute',
    top: 0,
    width: '200%',
    height: '100%',
  },
});
