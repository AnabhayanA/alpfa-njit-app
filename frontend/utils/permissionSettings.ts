import { Alert, Linking } from 'react-native';

export async function openAppSettings(): Promise<void> {
  try {
    await Linking.openSettings();
  } catch {
    Alert.alert('Open Settings', 'Open your device Settings and select ALPFA NJIT to update permissions.');
  }
}

export function explainPermissionSettings(name: string): void {
  Alert.alert(`${name} access is off`, `Allow ${name.toLowerCase()} access for ALPFA NJIT in Settings to use this feature.`, [
    { text: 'Not Now', style: 'cancel' },
    { text: 'Open Settings', onPress: () => { void openAppSettings(); } },
  ]);
}
