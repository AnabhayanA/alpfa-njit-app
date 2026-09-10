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
  SafeAreaView,
  StyleSheet,
  Text,
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
  const [loading, setLoading] = useState(true);
  const textOpacity = useRef(new Animated.Value(0)).current;
  const loadingWidth = useRef(new Animated.Value(0)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 700,
      delay: 450,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

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
        <StatusBar style={loading ? 'light' : colors.statusBarStyle} />

        <View style={[styles.appViewport, Platform.OS === 'web' && styles.webViewport]}>
        {loading ? (
          <Animated.View style={[styles.splash, { opacity: splashOpacity }]}>
            <Animated.View style={[styles.brandContainer, { opacity: textOpacity }]}>
              <Image
                source={require('./assets/images/ALPFANJITLOGO.png')}
                style={styles.splashLogo}
                resizeMode="contain"
              />
              <Text style={styles.chapter}>ALPFA NJIT</Text>
              <Text style={styles.tagline}>Building Leaders. Creating Opportunities.</Text>
            </Animated.View>

            <View style={styles.bottom}>
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
              <Text style={styles.loadingText}>Loading...</Text>
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
  container: { flex: 1, backgroundColor: '#0F102E' },
  webContainer: { backgroundColor: '#E7E1E2', paddingVertical: 24 },
  appViewport: { flex: 1, width: '100%' },
  webViewport: {
    width: '100%',
    maxWidth: 1200,
    minHeight: '100%',
    alignSelf: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#17182F',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },
  mainApp: { flex: 1, backgroundColor: '#F7F7F9' },
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F102E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandContainer: { alignItems: 'center' },
  splashLogo: {
    width: 132,
    height: 132,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    marginBottom: 22,
  },
  chapter: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', letterSpacing: 2 },
  tagline: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  bottom: { position: 'absolute', bottom: 55, width: '100%', alignItems: 'center' },
  loadingBar: {
    width: 130,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  loadingProgress: { height: '100%', backgroundColor: '#FFFFFF', borderRadius: 10 },
  loadingText: { color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 10, letterSpacing: 1 },
});