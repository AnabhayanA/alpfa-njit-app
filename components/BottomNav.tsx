import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import useResponsive from '../utils/responsive';

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Home: 'home',
  Events: 'calendar',
  EBoard: 'people',
  About: 'information-circle',
};

const TAB_LABELS: Record<string, string> = {
  Home: 'Home',
  Events: 'Events',
  EBoard: 'E-Board',
  About: 'About',
};

export default function BottomNav({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const responsive = useResponsive();

  // Scroll state animation values
  const navTranslateY = useRef(new Animated.Value(0)).current;
  const navScale = useRef(new Animated.Value(1)).current;
  const navOpacity = useRef(new Animated.Value(1)).current;

  // Listen for scroll state from route params.
  // The route params are set from individual screens as they scroll.
  useEffect(() => {
    if (!state.routes[state.index]) {
      return;
    }

    const currentRoute = state.routes[state.index];
    const routeParams = currentRoute.params as any;
    const scrollState = routeParams?.navScrollState;

    if (scrollState === 'down') {
      Animated.parallel([
        Animated.timing(navTranslateY, {
          toValue: 10,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(navScale, {
          toValue: 0.96,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(navOpacity, {
          toValue: 0.94,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (scrollState === 'up') {
      Animated.parallel([
        Animated.timing(navTranslateY, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(navScale, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(navOpacity, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [state.index, state.routes, responsive, insets, navTranslateY, navScale, navOpacity]);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          alignItems: 'center',
          paddingTop: 0,
          paddingBottom: 10,
          transform: [{ translateY: navTranslateY }, { scale: navScale }],
          opacity: navOpacity,
        },
      ]}
    >
      <View
        style={[
          styles.navbar,
          {
            width: Math.min(Math.max(responsive.safeWidth - 8, 300), 440),
            height: responsive.isSmallPhone ? 60 : 64,
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
            <TouchableOpacity key={route.key} activeOpacity={0.8} onPress={onPress} style={styles.tab}>
              <View style={[styles.iconContainer, isFocused && styles.activeIconContainer]}>
                <Ionicons name={icon} size={responsive.iconSizes.md} color={isFocused ? '#FFFFFF' : '#A7A9BA'} />
              </View>
              <Text style={[styles.label, isFocused && styles.activeLabel, { fontSize: Math.min(9, responsive.fontSizes.xs) }]}>{labelText}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'transparent',
  },
  navbar: {
    backgroundColor: '#0F102E',
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 5,
    shadowColor: '#0F102E',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 34,
    height: 27,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconContainer: {
    backgroundColor: '#6E1B2D',
    borderRadius: 10,
  },
  label: { fontSize: 9, fontWeight: '700', color: '#A7A9BA', marginTop: 1 },
  activeLabel: { color: '#FFFFFF', fontWeight: '900' },
});