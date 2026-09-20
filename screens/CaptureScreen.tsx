import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Canvas, ColorMatrix, Image as SkiaImage, useImage } from '@shopify/react-native-skia';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useTheme from '../utils/useTheme';
import { uploadPhotoToDrive } from '../utils/driveUpload';
import {
  AlpfaDualCameraModule,
  AlpfaDualCameraView,
  type AlpfaDualCameraViewRef,
} from '../modules/alpfa-dual-camera';

const BLACK_AND_WHITE_MATRIX = [
  0.2126, 0.7152, 0.0722, 0, 0,
  0.2126, 0.7152, 0.0722, 0, 0,
  0.2126, 0.7152, 0.0722, 0, 0,
  0, 0, 0, 1, 0,
];

function FilteredPhotoPreview({ uri, filter }: { uri: string; filter: string }) {
  const image = useImage(uri);
  const { width, height } = useWindowDimensions();

  if (filter !== 'B&W' || !image) {
    return <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />;
  }

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <SkiaImage image={image} x={0} y={0} width={width} height={height} fit="cover">
        <ColorMatrix matrix={BLACK_AND_WHITE_MATRIX} />
      </SkiaImage>
    </Canvas>
  );
}

export default function CaptureScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const cameraRef = useRef<CameraView>(null);
  const dualCameraRef = useRef<AlpfaDualCameraViewRef>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [dualSupported, setDualSupported] = useState(false);
  const [dualMode, setDualMode] = useState(false);
  const [cameraMessage, setCameraMessage] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [photoName, setPhotoName] = useState('');
  const [nameFocused, setNameFocused] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Normal');
  const cameraFilters = ['Normal', 'Warm', 'Cool', 'B&W', 'Vintage', 'ALPFA'];

  useEffect(() => {
    const supported = Platform.OS === 'ios' && Boolean(AlpfaDualCameraModule?.isSupported());
    setDualSupported(supported);
    setDualMode(supported);
  }, []);

  const close = () => navigation.navigate('Home' as never);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setPhotoUri(null);
        setStatus('idle');
        setStatusMessage('');
        setPhotoName('');
      };
    }, [])
  );

  const pickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
      setStatus('idle');
      setStatusMessage('');
    }
  };

  const takePhoto = async () => {
    if (!cameraReady) return;
    try {
      const photo = dualMode
        ? await dualCameraRef.current?.capture()
        : await cameraRef.current?.takePictureAsync({ quality: 0.85 });
      if (photo?.uri) setPhotoUri(photo.uri);
    } catch {
      setCameraMessage('The photo could not be captured. Please try again.');
    }
  };

  const toggleFacing = () => {
    setCameraReady(false);
    setFacing((current) => current === 'back' ? 'front' : 'back');
  };

  const toggleCameraMode = () => {
    setCameraReady(false);
    setCameraMessage('');
    setDualMode((current) => !current);
  };

  const retake = () => {
    setPhotoUri(null);
    setStatus('idle');
    setStatusMessage('');
    setPhotoName('');
  };

  const upload = async () => {
    if (!photoUri) return;
    const cleanName = photoName.trim();
    if (!cleanName) {
      setStatus('error');
      setStatusMessage('Give the photo a name before sharing it.');
      return;
    }
    setStatus('uploading');
    const result = await uploadPhotoToDrive(photoUri, cleanName);
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
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FilteredPhotoPreview uri={photoUri} filter={selectedFilter} />
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
              <View style={[styles.nameCard, nameFocused && styles.nameCardFocused]}>
                <Text style={styles.nameLabel}>PHOTO NAME</Text>
                <TextInput
                  value={photoName}
                  onChangeText={(value) => {
                    setPhotoName(value);
                    if (status === 'error') {
                      setStatus('idle');
                      setStatusMessage('');
                    }
                  }}
                  placeholder="e.g. ALPFA Networking Night"
                  placeholderTextColor="rgba(255,255,255,0.48)"
                  style={styles.nameInput}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  maxLength={60}
                  editable={status !== 'uploading'}
                  returnKeyType="done"
                />
                <Text style={styles.nameHint}>Required before the photo can be shared.</Text>
              </View>
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
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      {dualMode ? (
        <AlpfaDualCameraView
          ref={dualCameraRef}
          style={StyleSheet.absoluteFill}
          onReady={() => setCameraReady(true)}
          onError={(event) => {
            setCameraMessage(event.nativeEvent.message);
            setDualMode(false);
            setCameraReady(false);
          }}
        />
      ) : (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          key={facing}
          facing={facing}
          mirror={facing === 'front'}
          onCameraReady={() => {
            setCameraReady(true);
            setCameraMessage('');
          }}
        />
      )}
      <TouchableOpacity style={[styles.closeButton, { top: insets.top + 12 }]} onPress={close}>
        <Ionicons name="close" size={22} color="#FFFFFF" />
      </TouchableOpacity>
      {!dualMode && (
        <TouchableOpacity
          style={[styles.flipCameraButton, { top: insets.top + 12 }]}
          onPress={toggleFacing}
          accessibilityRole="button"
          accessibilityLabel={`Switch to ${facing === 'back' ? 'front' : 'back'} camera`}
        >
          <Ionicons name="camera-reverse-outline" size={23} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {dualSupported && (
        <TouchableOpacity
          style={[styles.modeButton, { top: insets.top + 64 }]}
          onPress={toggleCameraMode}
          accessibilityRole="button"
          accessibilityLabel={dualMode ? 'Use one camera' : 'Use front and rear cameras'}
        >
          <Ionicons name={dualMode ? 'copy' : 'copy-outline'} size={16} color="#FFFFFF" />
          <Text style={styles.modeButtonText}>{dualMode ? 'DUAL' : 'SINGLE'}</Text>
        </TouchableOpacity>
      )}

      <View style={[styles.captureBar, { paddingBottom: insets.bottom + 24 }]}>
        {!dualMode && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {cameraFilters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, selectedFilter === filter && styles.filterChipSelected]}
                onPress={() => setSelectedFilter(filter)}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedFilter === filter }}
              >
                <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextSelected]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        <Text style={styles.hintText}>
          {cameraMessage || (dualMode ? 'Front + rear photo · shared to the ALPFA NJIT Drive' : 'Photos are shared to the ALPFA NJIT Google Drive')}
        </Text>
        <View style={styles.cameraActions}>
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={pickFromLibrary}
            accessibilityRole="button"
            accessibilityLabel="Choose a photo from your camera roll"
          >
            <Ionicons name="images-outline" size={25} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shutter} onPress={takePhoto} disabled={!cameraReady}>
            <View style={styles.shutterInner} />
          </TouchableOpacity>
          <View style={styles.actionSpacer} />
        </View>
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
    modeButton: {
      position: 'absolute',
      left: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      height: 34,
      borderRadius: 17,
      backgroundColor: 'rgba(110,27,45,0.88)',
      zIndex: 10,
    },
    modeButtonText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
    captureBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      alignItems: 'center',
      paddingTop: 18,
      backgroundColor: 'rgba(10,10,10,0.72)',
    },
    filterRow: { paddingHorizontal: 18, gap: 8, paddingBottom: 14 },
    filterChip: { paddingHorizontal: 14, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
    filterChipSelected: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
    filterText: { color: 'rgba(255,255,255,0.72)', fontSize: 11, fontWeight: '800' },
    filterTextSelected: { color: '#111111' },
    hintText: { color: 'rgba(255,255,255,0.85)', fontSize: 11, marginBottom: 16, textAlign: 'center', paddingHorizontal: 24 },
    cameraActions: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 28 },
    galleryButton: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
    actionSpacer: { width: 52, height: 52 },
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
    nameCard: {
      marginBottom: 14,
      padding: 14,
      borderRadius: 18,
      backgroundColor: 'rgba(0,0,0,0.58)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.18)',
    },
    nameLabel: { color: 'rgba(255,255,255,0.72)', fontSize: 10, fontWeight: '900', letterSpacing: 1.1, marginBottom: 7 },
    nameCardFocused: {
      borderColor: 'rgba(255,255,255,0.72)',
      borderWidth: 1.5,
    },
    nameInput: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
      paddingVertical: 10,
      paddingHorizontal: 0,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.42)',
    },
    nameHint: { color: 'rgba(255,255,255,0.55)', fontSize: 10, marginTop: 4 },
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
