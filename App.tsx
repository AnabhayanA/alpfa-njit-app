import React, { useCallback, useState } from 'react';
import { PanResponder, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import ALPFALoadingScreen from './components/ALPFALoadingScreen';
import BottomNav from './components/BottomNav';
import HomeScreen from './screens/HomeScreen';
import EventsScreen from './screens/EventsScreen';
import EBoardScreen from './screens/EBoardScreen';
import AboutScreen from './screens/AboutScreen';
import CaptureScreen from './screens/CaptureScreen';
import useTheme from './utils/useTheme';
import { ThemeProvider } from './utils/ThemeContext';

const Tab = createBottomTabNavigator();

function SwipeableScreen({ children, navigation, route }: any) {
  const routes = ['Home', 'Events', 'Capture', 'EBoard', 'About'];
  const index = routes.indexOf(route.name);
  const swipeDisabled = route.name === 'Capture';
  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          !swipeDisabled &&
          Math.abs(gesture.dx) > 18 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.8,
        onPanResponderRelease: (_, gesture) => {
          const isSwipe = Math.abs(gesture.dx) > 70 || Math.abs(gesture.vx) > 0.55;
          if (!isSwipe) return;
          if (gesture.dx < 0 && index < routes.length - 1) navigation.navigate(routes[index + 1]);
          if (gesture.dx > 0 && index > 0) navigation.navigate(routes[index - 1]);
        },
      }),
    [index, navigation, swipeDisabled]
  );

  return (
    <View style={styles.swipeScreen} {...panResponder.panHandlers}>
      {children}
    </View>
  );
}

const withSwipe = (Screen: React.ComponentType<any>) => (props: any) => (
  <SwipeableScreen navigation={props.navigation} route={props.route}>
    <Screen {...props} />
  </SwipeableScreen>
);

const SwipeHomeScreen = withSwipe(HomeScreen);
const SwipeEventsScreen = withSwipe(EventsScreen);
const SwipeCaptureScreen = withSwipe(CaptureScreen);
const SwipeEBoardScreen = withSwipe(EBoardScreen);
const SwipeAboutScreen = withSwipe(AboutScreen);

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomNav {...props} />}
    >
      <Tab.Screen name="Home" component={SwipeHomeScreen} />
      <Tab.Screen name="Events" component={SwipeEventsScreen} />
      <Tab.Screen name="Capture" component={SwipeCaptureScreen} />
      <Tab.Screen name="EBoard" component={SwipeEBoardScreen} />
      <Tab.Screen name="About" component={SwipeAboutScreen} />
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

function AppContent() {
  const { colors } = useTheme();
  const [showSplash, setShowSplash] = useState(true);

  const handleAnimationComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <SafeAreaProvider style={styles.safeArea}>
      <View
        style={[
          styles.container,
                    Platform.OS === 'web' && styles.webContainer,
        ]}
      >
        <StatusBar style={showSplash ? 'light' : colors.statusBarStyle} />

        {showSplash ? (
          <ALPFALoadingScreen onAnimationComplete={handleAnimationComplete} />
        ) : (
          <View style={[styles.appViewport, Platform.OS === 'web' && styles.webViewport]}>
            <View style={[styles.mainApp, { backgroundColor: colors.background }]}>
              <MainApp />
            </View>
          </View>
        )}
      </View>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  swipeScreen: {
    flex: 1,
    width: '100%',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#030817',
  },
  webContainer: {
    backgroundColor: '#171717',
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
  mainApp: {
    flex: 1,
  },
});
