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

  const navWidth = Math.min(Math.max(responsive.safeWidth - 40, 280), 374);

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
        useNativeDriver: true,
      }),
      Animated.timing(navScale, {
        toValue: isDown ? 0.91 : 1,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(navOpacity, {
        toValue: isDown ? 0.94 : 1,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start();
  }, [navOpacity, navScale, navTranslateY, state.index, state.routes]);

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 10) + 4 }]}>
      <Animated.View
        style={[
          styles.navbar,
          isDark && styles.navbarDark,
          {
            width: navWidth,
            height: responsive.isSmallPhone ? 64 : 68,
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
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  navbar: {
    position: 'relative',
    backgroundColor: 'rgba(255,254,252,0.97)',
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#4A3727',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
    overflow: 'hidden',
  },
  navbarDark: {
    backgroundColor: 'rgba(10,16,36,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    shadowColor: '#000000',
    shadowOpacity: 0.35,
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
    height: 30,
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
