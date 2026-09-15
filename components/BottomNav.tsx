import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import useResponsive from '../utils/responsive';

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
  const glide = useRef(new Animated.Value(state.index)).current;
  const navTranslateY = useRef(new Animated.Value(0)).current;
  const navScale = useRef(new Animated.Value(1)).current;
  const navOpacity = useRef(new Animated.Value(1)).current;

  // Keep the five tabs visually closer together than the old full-width bar.
  const navWidth = Math.min(Math.max(responsive.safeWidth - 28, 286), 392);
  const innerWidth = navWidth - NAV_HORIZONTAL_PADDING * 2;
  const tabWidth = innerWidth / state.routes.length;
  const pillWidth = Math.min(48, Math.max(40, tabWidth - 14));

  useEffect(() => {
    Animated.timing(glide, {
      toValue: state.index,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [glide, state.index]);

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

  const indicatorX = glide.interpolate({
    inputRange: state.routes.map((_, index) => index),
    outputRange: state.routes.map((_, index) => index * tabWidth + (tabWidth - pillWidth) / 2),
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.navbar,
          {
            width: navWidth,
            height: responsive.isSmallPhone ? 58 : 61,
            paddingHorizontal: NAV_HORIZONTAL_PADDING,
            transform: [{ translateY: navTranslateY }, { scale: navScale }],
            opacity: navOpacity,
          },
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glidePill,
            {
              width: pillWidth,
              transform: [{ translateX: indicatorX }],
            },
          ]}
        />

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
                <Ionicons name={icon} size={20} color={isFocused ? '#8D102B' : '#8C8E8D'} />
              </View>
              <Text style={[styles.label, isFocused && styles.activeLabel, { fontSize: Math.min(8.5, responsive.fontSizes.xs) }]}>
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
    paddingBottom: 5,
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
  glidePill: {
    position: 'absolute',
    left: NAV_HORIZONTAL_PADDING,
    top: 6,
    height: 29,
    borderRadius: 12,
    backgroundColor: '#F4E9E8',
  },
  tab: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  iconContainer: {
    width: 32,
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
  activeLabel: {
    color: '#8D102B',
    fontWeight: '900',
  },
});
