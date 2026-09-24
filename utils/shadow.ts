import { Platform, type ViewStyle } from 'react-native';

// Keep native shadows while using the supported CSS shadow property on web.
export default function shadow(color: string, opacity: number, radius: number, x = 0, y = 0): ViewStyle {
  if (Platform.OS !== 'web') {
    return { shadowColor: color, shadowOpacity: opacity, shadowRadius: radius, shadowOffset: { width: x, height: y } };
  }
  const hex = color.slice(1);
  const fullHex = hex.length === 3 ? hex.split('').map(char => char + char).join('') : hex;
  const rgb = [0, 2, 4].map(offset => parseInt(fullHex.slice(offset, offset + 2), 16));
  return { boxShadow: `${x}px ${y}px ${radius}px rgba(${rgb.join(', ')}, ${opacity})` };
}
