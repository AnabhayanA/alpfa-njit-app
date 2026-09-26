import shadow from '../utils/shadow';
import { PanResponder, Platform } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import useResponsive from '../utils/responsive';
import useTheme from '../utils/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Home: 'home',
  Events: 'calendar',
  Capture: 'camera-outline',
  EBoard: 'people',
  About: 'information-circle',
};

const TAB_LABELS: Record<string, string> = {
  Home: 'Home',
  Events: 'Events',
  Capture: 'Share',
  EBoard: 'E-Board',
  About: 'About',
};

const NAV_HORIZONTAL_PADDING = 5;

export default function BottomNav({ state, descriptors, navigation }: BottomTabBarProps) {
  const responsive = useResponsive();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navTranslateY = useRef(new Animated.Value(0)).current;
  const navScale = useRef(new Animated.Value(1)).current;
  const navOpacity = useRef(new Animated.Value(1)).current;
  const lastGlideIndex = useRef(state.index);

  const navWidth = Math.min(Math.max(responsive.safeWidth - 72, 260), 350);

  const navigateToIndex = React.useCallback((index: number) => {
    const route = state.routes[index];
    if (!route || index === lastGlideIndex.current) return;
    lastGlideIndex.current = index;
    navigation.navigate(route.name);
  }, [navigation, state.routes]);

  const glideResponder = React.useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 5 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
    onPanResponderGrant: () => { lastGlideIndex.current = state.index; },
    onPanResponderMove: (event) => {
      const x = Math.max(0, Math.min(navWidth - 1, event.nativeEvent.locationX));
      const index = Math.min(state.routes.length - 1, Math.floor(x / (navWidth / state.routes.length)));
      navigateToIndex(index);
    },
    onPanResponderRelease: () => { lastGlideIndex.current = state.index; },
    onPanResponderTerminate: () => { lastGlideIndex.current = state.index; },
  }), [navWidth, navigateToIndex, state.index, state.routes.length]);

  useEffect(() => {
    const currentRoute = state.routes[state.index];
    const routeParams = currentRoute?.params as any;
    const scrollState = routeParams?.navScrollState;
    const isDown = scrollState === 'down';

    Animated.parallel([
      Animated.timing(navTranslateY, {
        toValue: isDown ? 7 : 0,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(navScale, {
        toValue: isDown ? 0.91 : 1,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(navOpacity, {
        toValue: isDown ? 0.94 : 1,
        duration: 240,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [navOpacity, navScale, navTranslateY, state.index, state.routes]);

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 10) + 4 }]}>
      <Animated.View
        {...glideResponder.panHandlers}
        style={[
          styles.navbar,
          isDark && styles.navbarDark,
          {
            width: navWidth,
            height: responsive.isSmallPhone ? 52 : 56,
            paddingHorizontal: NAV_HORIZONTAL_PADDING,
            transform: [{ translateY: navTranslateY }, { scale: navScale }],
            opacity: navOpacity,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const labelText =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : typeof options.title === 'string'
                ? options.title
                : TAB_LABELS[route.name] ?? route.name;
          const isFocused = state.index === index;
          const icon = TAB_ICONS[route.name] ?? 'ellipse';

          const onPress = () => {
            lastGlideIndex.current = index;
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity key={route.key} activeOpacity={0.78} onPress={onPress} style={styles.tab}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={icon}
                  size={isFocused ? 24 : 22}
                  color={isFocused ? (isDark ? '#FFFFFF' : '#111827') : (isDark ? '#A9B2C8' : '#8C8E8D')}
                />
              </View>
              <Text
                style={[
                  styles.label,
                  isDark && styles.labelDark,
                  isFocused && styles.activeLabel,
                  isFocused && isDark && styles.activeLabelDark,
                  { fontSize: Math.min(8.5, responsive.fontSizes.xs) },
                ]}
              >
                {labelText}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    paddingTop: 0,
    paddingHorizontal: 8,
    paddingBottom: 2,
  },
  navbar: {
    position: 'relative',
    backgroundColor: 'rgba(255,254,252,0.97)',
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadow('#4A3727', 0.14, 18, 0, 5),
    elevation: 8,
    overflow: 'hidden',
  },
  navbarDark: {
    backgroundColor: 'rgba(10,16,36,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    ...shadow('#000000', 0.35, 18, 0, 5),
  },
  tab: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  iconContainer: {
    width: 36,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#8C8E8D',
    marginTop: 0,
  },
  labelDark: { color: '#A9B2C8' },
  activeLabel: {
    color: '#111827',
    fontWeight: '900',
  },
  activeLabelDark: { color: '#FFFFFF' },
});
