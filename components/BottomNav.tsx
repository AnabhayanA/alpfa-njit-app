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

  const navWidth = Math.min(Math.max(responsive.safeWidth - 8, 300), 440);
  const innerWidth = navWidth - NAV_HORIZONTAL_PADDING * 2;
  const tabWidth = innerWidth / state.routes.length;
  const pillWidth = Math.min(50, Math.max(42, tabWidth - 14));

  useEffect(() => {
    Animated.timing(glide, {
      toValue: state.index,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [glide, state.index]);

  const indicatorX = glide.interpolate({
    inputRange: state.routes.map((_, index) => index),
    outputRange: state.routes.map((_, index) => index * tabWidth + (tabWidth - pillWidth) / 2),
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.navbar,
          {
            width: navWidth,
            height: responsive.isSmallPhone ? 60 : 64,
            paddingHorizontal: NAV_HORIZONTAL_PADDING,
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
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.78}
              onPress={onPress}
              style={styles.tab}
            >
              <View style={styles.iconContainer}>
                <Ionicons name={icon} size={21} color={isFocused ? '#8D102B' : '#8C8E8D'} />
              </View>
              <Text
                style={[
                  styles.label,
                  isFocused && styles.activeLabel,
                  { fontSize: Math.min(9, responsive.fontSizes.xs) },
                ]}
              >
                {labelText}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    paddingTop: 0,
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
  glidePill: {
    position: 'absolute',
    left: NAV_HORIZONTAL_PADDING,
    top: 7,
    height: 31,
    borderRadius: 13,
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
    width: 34,
    height: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8C8E8D',
    marginTop: 1,
  },
  activeLabel: {
    color: '#8D102B',
    fontWeight: '900',
  },
});
