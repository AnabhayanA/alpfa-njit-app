import React, { useEffect, useRef, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import { requestNotificationPermissions } from '../utils/eventNotifications';
import useTheme from '../utils/useTheme';

const INTRO_KEY = 'alpfa-njit:permission-intro:v1';

export default function FirstVisitPermissions() {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const dismissed = useRef(false);
  const running = useRef(false);
  const insecure = Platform.OS === 'web' && !window.isSecureContext;

  useEffect(() => {
    dismissed.current = false;
    let active = true;
    AsyncStorage.getItem(INTRO_KEY).then(value => {
      if (active) setVisible(value !== 'seen');
    }).catch(() => { if (active) setVisible(true); });
    return () => { active = false; dismissed.current = true; };
  }, []);

  const finish = () => {
    dismissed.current = true;
    setVisible(false);
    void AsyncStorage.setItem(INTRO_KEY, 'seen').catch(() => {
      // With storage blocked, the introduction may appear again on the next visit.
    });
  };

  const enable = async () => {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setMessages([]);
    const report = (message: string) => {
      if (!dismissed.current) setMessages(current => [...current, message]);
    };
    try {
      // Keep notifications first so the browser request retains the button's user gesture.
      try {
        const granted = await requestNotificationPermissions();
        report(granted ? 'Notifications allowed.' : Platform.OS === 'web'
          ? 'Browser notifications are unavailable or not allowed. In-page reminders still work while the page is open.'
          : 'Notifications not allowed. You can enable them later in Settings.');
      } catch { report('Notifications could not be enabled. You can try again from Notify me.'); }
      if (dismissed.current) return;

      try {
        if (Platform.OS === 'web') {
          if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
            report('Camera needs a secure HTTPS link and a supported browser.');
          } else {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            // This only checks permission; do not leave the camera running.
            stream.getTracks().forEach(track => track.stop());
            report('Camera allowed.');
          }
        } else {
          const result = await Camera.requestCameraPermissionsAsync();
          report(result.granted ? 'Camera allowed.' : 'Camera not allowed. You can enable it later from Capture.');
        }
      } catch { report('Camera unavailable or blocked. Check camera permission in your device or browser settings.'); }
      if (dismissed.current) return;

      try {
        if (Platform.OS === 'web') {
          if (!window.isSecureContext || !navigator.geolocation) {
            report('Location needs a secure HTTPS link and a supported browser.');
          } else {
            await new Promise<void>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(() => resolve(), reject, { timeout: 15_000, maximumAge: 60_000 });
            });
            report('Location allowed.');
          }
        } else {
          const result = await Location.requestForegroundPermissionsAsync();
          report(result.granted ? 'Location allowed.' : 'Location not allowed. You can enable it later from Add Location.');
        }
      } catch { report('Location unavailable or blocked. Check location services and site permission, then try Add Location.'); }
    } finally {
      running.current = false;
      if (!dismissed.current) { setBusy(false); setAttempted(true); }
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={finish}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: colors.background }]} accessibilityViewIsModal>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome to ALPFA NJIT</Text>
            <Text style={[styles.body, { color: colors.textSecondary }]}>Enable notifications for event reminders, camera access to take photos, and location to add a location to your photos. Each permission is optional.</Text>
            <Text style={[styles.body, { color: colors.textSecondary }]}>Location is only included in a shared photo when you choose Add Location.</Text>
            {Platform.OS === 'web' && <Text style={[styles.body, { color: colors.textSecondary }]}>Your browser will ask for access after you tap below. Keep this page open for web reminders.</Text>}
            {insecure && <Text style={[styles.body, { color: colors.textPrimary }]}>Open the HTTPS version of the shared link to enable camera and location. An HTTP address on another device cannot request them.</Text>}
            <View accessibilityLiveRegion="polite">
              {messages.map(message => <Text key={message} style={[styles.body, { color: colors.textPrimary }]}>{message}</Text>)}
            </View>
            {!attempted && <Pressable accessibilityRole="button" accessibilityState={{ disabled: busy }} disabled={busy} onPress={enable} style={[styles.enable, busy && styles.busy]}>
              <Text style={styles.enableText}>{busy ? 'Waiting for permissions...' : 'Enable permissions'}</Text>
            </Pressable>}
            <Pressable accessibilityRole="button" onPress={finish} style={styles.continue}>
              <Text style={[styles.continueText, { color: colors.textPrimary }]}>{attempted || busy ? 'Continue to app' : 'Not now'}</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 440, maxHeight: '90%', borderRadius: 24, overflow: 'hidden' },
  content: { padding: 24 },
  title: { fontSize: 24, fontWeight: '800' },
  body: { fontSize: 14, lineHeight: 21, marginTop: 14 },
  enable: { marginTop: 24, backgroundColor: '#8D102B', padding: 15, borderRadius: 12, alignItems: 'center' },
  busy: { opacity: 0.6 },
  enableText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  continue: { padding: 15, marginTop: 8, alignItems: 'center' },
  continueText: { fontSize: 15, fontWeight: '600' },
});
