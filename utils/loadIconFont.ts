import { Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Font from 'expo-font';

export default async function loadIconFont(): Promise<void> {
  await Font.loadAsync(Ionicons.font);
  if (Platform.OS === 'web' && typeof document !== 'undefined' && document.fonts) {
    // Verify actual font bytes, not just the presence of an @font-face rule.
    const faces = await document.fonts.load('24px ionicons', typeof Ionicons.glyphMap.home === 'number' ? String.fromCodePoint(Ionicons.glyphMap.home) : Ionicons.glyphMap.home);
    if (faces.length === 0 || faces.some(face => face.status !== 'loaded')) {
      throw new Error('The Ionicons font could not be loaded.');
    }
  }
}
