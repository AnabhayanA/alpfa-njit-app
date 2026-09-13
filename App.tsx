import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
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

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomNav {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Capture" component={CaptureScreen} />
      <Tab.Screen name="EBoard" component={EBoardScreen} />
      <Tab.Screen name="About" component={AboutScreen} />
    </Tab.Navigator>
  );
}

function MainApp() {
  return (
    <NavigationContainer>
      <Tabs />
    </NavigationContainer>
  );
}

export default function App() {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.72)).current;
  const leftShard = useRef(new Animated.Value(-420)).current;
  const rightShard = useRef(new Animated.Value(420)).current;
  const shimmer = useRef(new Animated.Value(-1)).current;
  const loadingWidth = useRef(new Animated.Value(0)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(leftShard, { toValue: -72, speed: 9, bounciness: 3, useNativeDriver: true }),
      Animated.spring(rightShard, { toValue: 72, speed: 9, bounciness: 3, useNativeDriver: true }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 650, delay: 180, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, delay: 180, speed: 10, bounciness: 5, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1200, delay: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: -1, duration: 0, delay: 650, useNativeDriver: true }),
      ]),
      { iterations: 1 }
    ).start();

    Animated.timing(loadingWidth, {
      toValue: 1,
      duration: 1800,
      delay: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 650,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => setLoading(false));
    }, 2600);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaProvider>
      <View style={[styles.container, Platform.OS === 'web' && styles.webContainer]}>
          <StatusBar style={loading ? 'dark' : colors.statusBarStyle} />

        <View style={[styles.appViewport, Platform.OS === 'web' && styles.webViewport]}>
        {loading ? (
          <Animated.View style={[styles.splash, { opacity: splashOpacity }]}>
            <Animated.View style={[styles.shard, styles.leftShard, { width: width * 1.18, height: Math.max(100, height * 0.16), transform: [{ translateX: leftShard }, { rotate: '-14deg' }] }]} />
            <Animated.View style={[styles.shard, styles.leftShardAccent, { width: width, transform: [{ translateX: leftShard }, { rotate: '-14deg' }] }]} />
            <Animated.View style={[styles.shard, styles.rightShard, { width: width * 1.18, height: Math.max(100, height * 0.16), transform: [{ translateX: rightShard }, { rotate: '-14deg' }] }]} />
            <Animated.View style={[styles.shard, styles.rightShardAccent, { width: width, transform: [{ translateX: rightShard }, { rotate: '-14deg' }] }]} />
            <Animated.View style={[styles.brandContainer, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
              <View style={[styles.splashLogoFrame, { width: Math.min(width * 0.62, height * 0.31, 280), height: Math.min(width * 0.62, height * 0.31, 280), borderRadius: Math.min(width * 0.1, 42) }]}>
                <Image
                  source={require('./assets/images/ALPFANJITLOGO.png')}
                  style={styles.splashLogo}
                  resizeMode="contain"
                />
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.logoShimmer,
                    {
                      transform: [
                        { translateX: shimmer.interpolate({ inputRange: [-1, 1], outputRange: [-300, 300] }) },
                        { rotate: '18deg' },
                      ],
                    },
                  ]}
                />
              </View>
            </Animated.View>
            <View style={[styles.loadingGroup, { bottom: Math.max(14, height * 0.025) }]}>
              <View style={styles.loadingBar}>
                <Animated.View
                  style={[
                    styles.loadingProgress,
                    {
                      width: loadingWidth.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.loadingText}>LEAD  •  CONNECT  •  BELONG  •  GROW</Text>
            </View>
          </Animated.View>
        ) : (
          <View style={[styles.mainApp, { backgroundColor: colors.background }]}>
            <MainApp />
          </View>
        )}
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F6F2' },
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
  mainApp: { flex: 1, backgroundColor: '#F7F7F9' },
  splash: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#F8F6F2',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  brandContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  splashLogoFrame: {
    width: 238,
    height: 238,
    borderRadius: 42,
    backgroundColor: '#0F102E',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    width: '100%',
    height: '100%',
  },
  shard: { position: 'absolute', height: 155 },
  leftShard: { top: '13%', left: '-55%', backgroundColor: '#0F102E' },
  leftShardAccent: { top: '22%', left: '-58%', height: 24, backgroundColor: '#C99731', opacity: 0.72 },
  rightShard: { bottom: '14%', right: '-55%', backgroundColor: '#6E1B2D' },
  rightShardAccent: { bottom: '23%', right: '-58%', height: 22, backgroundColor: '#0F102E', opacity: 0.9 },
  logoShimmer: { position: 'absolute', top: -50, bottom: -50, width: 34, backgroundColor: 'rgba(255,218,128,0.30)' },
  loadingGroup: { position: 'absolute', bottom: 16, left: 0, right: 0, alignItems: 'center' },
  loadingBar: {
    width: '86%',
    height: 3,
    backgroundColor: 'rgba(15,16,46,0.14)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  loadingProgress: { height: '100%', backgroundColor: '#6E1B2D', borderRadius: 10 },
  loadingText: { color: 'rgba(8,28,55,0.62)', fontSize: 8, marginTop: 9, letterSpacing: 1.1 },
});
