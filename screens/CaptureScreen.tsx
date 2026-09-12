import React, { useRef, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useTheme from '../utils/useTheme';
import { uploadPhotoToDrive } from '../utils/driveUpload';

export default function CaptureScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const close = () => navigation.navigate('Home' as never);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setPhotoUri(null);
        setStatus('idle');
        setStatusMessage('');
      };
    }, [])
  );

  const takePhoto = async () => {
    if (!cameraRef.current || !cameraReady) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
    if (photo?.uri) setPhotoUri(photo.uri);
  };

  const toggleFacing = () => {
    setCameraReady(false);
    setFacing((current) => current === 'back' ? 'front' : 'back');
  };

  const retake = () => {
    setPhotoUri(null);
    setStatus('idle');
    setStatusMessage('');
  };

  const upload = async () => {
    if (!photoUri) return;
    setStatus('uploading');
    const result = await uploadPhotoToDrive(photoUri);
    if (result.success) {
      setStatus('done');
      setStatusMessage('Photo sent to the ALPFA NJIT Drive!');
    } else {
      setStatus('error');
      setStatusMessage(result.message || 'Something went wrong. Try again.');
    }
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top + 24 }]}>
        <Ionicons name="camera-outline" size={48} color="rgba(255,255,255,0.75)" />
        <Text style={styles.permissionTitle}>Camera access needed</Text>
        <Text style={styles.permissionText}>
          Allow camera access so you can capture and share photos with the chapter.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.primaryButtonText}>Grant permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeLink} onPress={close}>
          <Text style={styles.closeLinkText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (photoUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <TouchableOpacity style={[styles.closeButton, { top: insets.top + 12 }]} onPress={close}>
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={[styles.previewFooter, { paddingBottom: insets.bottom + 24 }]}>
          {status === 'done' ? (
            <View style={styles.centered}>
              <Ionicons name="checkmark-circle" size={40} color="#4ADE80" />
              <Text style={styles.statusTextLight}>{statusMessage}</Text>
              <TouchableOpacity style={styles.primaryButton} onPress={close}>
                <Text style={styles.primaryButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {status === 'error' && <Text style={styles.errorText}>{statusMessage}</Text>}
              <View style={styles.previewActions}>
                <TouchableOpacity style={styles.secondaryButton} onPress={retake} disabled={status === 'uploading'}>
                  <Ionicons name="refresh" size={18} color="#FFFFFF" />
                  <Text style={styles.secondaryButtonText}>Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryButton, styles.uploadButton]}
                  onPress={upload}
                  disabled={status === 'uploading'}
                >
                  {status === 'uploading' ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" />
                      <Text style={styles.primaryButtonText}>Share to Drive</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        mirror={facing === 'front'}
        onCameraReady={() => setCameraReady(true)}
      />
      <TouchableOpacity style={[styles.closeButton, { top: insets.top + 12 }]} onPress={close}>
        <Ionicons name="close" size={22} color="#FFFFFF" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.flipCameraButton, { top: insets.top + 12 }]}
        onPress={toggleFacing}
        accessibilityRole="button"
        accessibilityLabel={`Switch to ${facing === 'back' ? 'front' : 'back'} camera`}
      >
        <Ionicons name="camera-reverse-outline" size={23} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={[styles.captureBar, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.hintText}>Photos are shared to the ALPFA NJIT Google Drive</Text>
        <TouchableOpacity style={styles.shutter} onPress={takePhoto} disabled={!cameraReady}>
          <View style={styles.shutterInner} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000000' },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
    permissionTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', marginTop: 16 },
    permissionText: { color: 'rgba(255,255,255,0.75)', fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 19 },
    closeButton: {
      position: 'absolute',
      right: 16,
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: 'rgba(0,0,0,0.45)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    flipCameraButton: {
      position: 'absolute',
      left: 16,
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: 'rgba(0,0,0,0.45)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    captureBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      alignItems: 'center',
      paddingTop: 18,
      backgroundColor: 'rgba(10,10,10,0.72)',
    },
    hintText: { color: 'rgba(255,255,255,0.85)', fontSize: 11, marginBottom: 16, textAlign: 'center', paddingHorizontal: 24 },
    shutter: {
      width: 74,
      height: 74,
      borderRadius: 37,
      borderWidth: 4,
      borderColor: '#8D102B',
      alignItems: 'center',
      justifyContent: 'center',
    },
    shutterInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#FFFFFF' },
    previewFooter: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingTop: 20,
      paddingHorizontal: 24,
      backgroundColor: 'rgba(0,0,0,0.55)',
    },
    previewActions: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: '#6E1B2D',
      borderRadius: 999,
      paddingVertical: 14,
      paddingHorizontal: 22,
      marginTop: 16,
    },
    uploadButton: { flex: 1, marginTop: 0 },
    primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
    secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: 999,
      paddingVertical: 14,
      paddingHorizontal: 20,
    },
    secondaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
    statusTextLight: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginTop: 12, textAlign: 'center' },
    errorText: { color: '#F87171', fontSize: 12, textAlign: 'center', marginBottom: 8 },
    closeLink: { marginTop: 18 },
    closeLinkText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '700' },
  });
