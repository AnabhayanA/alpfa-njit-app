import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../utils/useTheme';

export default function ThemeToggle() {
  const { isDark, colors, toggleTheme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surfaceAlt, borderColor: colors.surfaceBorder }]}
      onPress={toggleTheme}
      activeOpacity={0.8}
    >
      <Ionicons name={isDark ? 'moon' : 'sunny'} size={16} color={colors.textPrimary} />
      <Text style={[styles.label, { color: colors.textPrimary }]}>
        {isDark ? 'Dark mode' : 'Light mode'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: 'flex-start',
  },
  label: { fontSize: 13, fontWeight: '700' },
});