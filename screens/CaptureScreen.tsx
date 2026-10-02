import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, Image, Keyboard, KeyboardAvoidingView, Modal, PanResponder, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Asset as MediaAsset, requestPermissionsAsync as requestMediaLibraryPermissionsAsync } from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import { Canvas, ColorMatrix, Group, Image as SkiaImage, ImageFormat, RoundedRect, Text as SkiaText, matchFont, rect, rrect, useCanvasRef, useImage } from '@shopify/react-native-skia';
import { File, Paths } from 'expo-file-system';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useTheme from '../utils/useTheme';
import { explainPermissionSettings, openAppSettings } from '../utils/permissionSettings';
import { uploadPhotoToDrive } from '../utils/driveUpload';

function withLocationTimeout<T>(work: Promise<T>, milliseconds: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('GPS took too long. Try again or type a location.')), milliseconds);
    work.then(resolve, reject).finally(() => clearTimeout(timer));
  });
}

const FILTER_MATRICES: Record<string, number[]> = {
  Warm: [1.12, 0.05, 0, 0, 0.03, 0.02, 1.03, 0, 0, 0.01, 0, 0.02, 0.88, 0, 0, 0, 0, 0, 1, 0],
  Cool: [0.88, 0.02, 0.05, 0, 0, 0, 1.02, 0.04, 0, 0.01, 0.02, 0.04, 1.14, 0, 0.03, 0, 0, 0, 1, 0],
  'B&W': [0.2126, 0.7152, 0.0722, 0, 0, 0.2126, 0.7152, 0.0722, 0, 0, 0.2126, 0.7152, 0.0722, 0, 0, 0, 0, 0, 1, 0],
  Vintage: [0.393, 0.769, 0.189, 0, 0, 0.349, 0.686, 0.168, 0, 0, 0.272, 0.534, 0.131, 0, 0, 0, 0, 0, 1, 0],
  ALPFA: [0.95, 0.08, 0.02, 0, 0.02, 0.01, 0.82, 0.03, 0, 0, 0.08, 0.02, 0.92, 0, 0.02, 0, 0, 0, 1, 0],
};

const WEB_FILTERS: Record<string, string> = {
  Normal: 'none',
  Warm: 'sepia(0.22) saturate(1.18) brightness(1.04)',
  Cool: 'saturate(1.08) hue-rotate(10deg) brightness(1.02)',
  'B&W': 'grayscale(1)',
  Vintage: 'sepia(0.48) saturate(0.82) contrast(0.92) brightness(1.04)',
  ALPFA: 'contrast(1.08) saturate(1.22) hue-rotate(-8deg)',
};

function applyWebColorMatrix(context: CanvasRenderingContext2D, width: number, height: number, matrix?: number[]) {
  if (!matrix) return;
  const imageData = context.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    pixels[i] = Math.max(0, Math.min(255, r * matrix[0] + g * matrix[1] + b * matrix[2] + a * matrix[3] + matrix[4] * 255));
    pixels[i + 1] = Math.max(0, Math.min(255, r * matrix[5] + g * matrix[6] + b * matrix[7] + a * matrix[8] + matrix[9] * 255));
    pixels[i + 2] = Math.max(0, Math.min(255, r * matrix[10] + g * matrix[11] + b * matrix[12] + a * matrix[13] + matrix[14] * 255));
    pixels[i + 3] = Math.max(0, Math.min(255, r * matrix[15] + g * matrix[16] + b * matrix[17] + a * matrix[18] + matrix[19] * 255));
  }

  context.putImageData(imageData, 0, 0);
}

async function prepareWebPhoto(uri: string, filter: string, locationLabel?: string, locationPosition?: { x: number; y: number }) {
  const response = await fetch(uri);
  const sourceBlob = await response.blob();
  const objectUrl = URL.createObjectURL(sourceBlob);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = document.createElement('img');
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Could not load the selected photo.'));
      img.src = objectUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not prepare the photo.');

    // Draw the source first, then bake the same color matrix used by the native
    // Skia preview into the actual JPEG pixels. Canvas CSS filters can preview
    // correctly on web while still producing an unfiltered upload in some browsers.
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    applyWebColorMatrix(context, canvas.width, canvas.height, FILTER_MATRICES[filter]);

    if (locationLabel && locationPosition) {
      const scaleX = canvas.width / Math.max(window.innerWidth, 1);
      const scaleY = canvas.height / Math.max(window.innerHeight, 1);
      const fontSize = Math.max(19 * scaleX, 19);
      const x = locationPosition.x * scaleX;
      const y = (locationPosition.y + 24) * scaleY;
      context.font = `900 ${fontSize}px sans-serif`;
      context.textBaseline = 'alphabetic';
      context.lineWidth = Math.max(4 * scaleX, 3);
      context.strokeStyle = 'rgba(0,0,0,0.78)';
      context.strokeText(locationLabel, x, y);
      context.fillStyle = '#FFFFFF';
      context.fillText(locationLabel, x, y);
    }

    const outputBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not encode the photo.')), 'image/jpeg', 0.92);
    });
    return URL.createObjectURL(outputBlob);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

const locationFont = Platform.OS === 'web' ? null : matchFont({
  fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'sans-serif',
  fontSize: 18,
  fontWeight: 'bold',
});

const cleanLocationLabel = (value: string) =>
  value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);

function FilteredPhotoPreview({ uri, filter, canvasRef, locationLabel, locationPosition, selfieUri }: {
  uri: string;
  filter: string;
  canvasRef: ReturnType<typeof useCanvasRef>;
  locationLabel?: string;
  locationPosition: { x: number; y: number };
  selfieUri?: string | null;
}) {
  const matrix = FILTER_MATRICES[filter];
  const { width, height } = useWindowDimensions();
  const selfieImage = Platform.OS === 'web' ? null : useImage(selfieUri || null);

  if (Platform.OS === 'web') {
    return (
      <Image
        source={{ uri }}
        style={[StyleSheet.absoluteFill, { filter: WEB_FILTERS[filter] || 'none' } as any]}
        resizeMode="cover"
      />
    );
  }

  const image = useImage(uri);
  if (!image) return <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />;
  // Dual photos must always render through Skia so the selfie is included in
  // both the preview and the exported Drive image.
  if (!matrix && !locationLabel && !selfieUri) return <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />;

  return (
    <Canvas ref={canvasRef} style={StyleSheet.absoluteFill}>
      <SkiaImage image={image} x={0} y={0} width={width} height={height} fit="cover">
        {matrix && <ColorMatrix matrix={matrix} />}
      </SkiaImage>
      {selfieImage && (
        <>
          <RoundedRect x={6} y={6} width={100} height={132} r={10} color="rgba(0,0,0,0.88)" />
          <Group clip={rrect(rect(8, 8, 96, 128), 8, 8)}>
            <SkiaImage image={selfieImage} x={8} y={8} width={96} height={128} fit="cover">
              {matrix && <ColorMatrix matrix={matrix} />}
            </SkiaImage>
          </Group>
        </>
      )}
      {locationLabel && locationFont && (
        <>
          <SkiaText x={locationPosition.x + 1.5} y={locationPosition.y + 25.5} text={locationLabel} font={locationFont} color="rgba(0,0,0,0.78)" />
          <SkiaText x={locationPosition.x} y={locationPosition.y + 24} text={locationLabel} font={locationFont} color="#FFFFFF" />
        </>
      )}
    </Canvas>
  );
}

export default function CaptureScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const cameraRef = useRef<CameraView>(null);
  const filteredCanvasRef = useCanvasRef();
  const completedPhotoUriRef = useRef<string | null>(null);
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [captureMode, setCaptureMode] = useState<'photo' | 'dual'>('photo');
  const [dualPrimaryUri, setDualPrimaryUri] = useState<string | null>(null);
  const [dualSelfieUri, setDualSelfieUri] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0);
  const [availableLenses, setAvailableLenses] = useState<string[]>([]);
  const [selectedLens, setSelectedLens] = useState<string | undefined>(undefined);
  const [zoomDialVisible, setZoomDialVisible] = useState(false);
  const zoomDialTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCameraTap = useRef(0);
  const pinchStartDistance = useRef<number | null>(null);
  const pinchStartZoom = useRef(0);
  const [cameraMessage, setCameraMessage] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [photoName, setPhotoName] = useState('');
  const [nameFocused, setNameFocused] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('Normal');
  const [photoLocation, setPhotoLocation] = useState<{ label: string } | null>(null);
  const [locationEditorOpen, setLocationEditorOpen] = useState(false);
  const [locationDraft, setLocationDraft] = useState('');
  const locationRequest = useRef(0);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const [locationPosition, setLocationPosition] = useState({ x: 28, y: Math.max(420, screenHeight * 0.68) });
  const cameraFilters = ['Normal', 'Warm', 'Cool', 'B&W', 'Vintage', 'ALPFA'];

  const locationPanResponder = React.useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (event) => {
      const x = Math.max(16, Math.min(event.nativeEvent.pageX - 70, screenWidth - 170));
      const y = Math.max(insets.top + 70, Math.min(event.nativeEvent.pageY - 22, screenHeight - 190));
      setLocationPosition({ x, y });
    },
  }), [insets.top, screenHeight, screenWidth]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, (event) => setKeyboardHeight(event.endCoordinates.height));
    const hideSubscription = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => { showSubscription.remove(); hideSubscription.remove(); };
  }, []);


  useFocusEffect(React.useCallback(() => {
    const refresh = () => { void getPermission().catch(() => setCameraMessage('Could not check camera access. Please try again.')); };
    refresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => subscription.remove();
  }, [getPermission]));

  const enableCamera = async () => {
    try {
      if (Platform.OS === 'web' && (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia)) {
        setCameraMessage('Camera access needs HTTPS or localhost and a browser that supports cameras.');
        return;
      }
      if (Platform.OS !== 'web' && permission && !permission.canAskAgain) {
        await openAppSettings();
        return;
      }
      const result = await requestPermission();
      if (!result.granted && Platform.OS === 'web') setCameraMessage('Allow camera access in this browser site settings, then try again.');
    } catch {
      setCameraMessage('Could not request camera access. Check your device or browser settings.');
    }
  };

  const close = () => navigation.navigate('Home' as never);

  const saveCompletedPhoto = async () => {
    if (Platform.OS === 'web') {
      setStatusMessage('Saving to Photos is available in the iPhone and Android app.');
      return;
    }
    const uri = completedPhotoUriRef.current;
    if (!uri) {
      setStatusMessage('The finished photo is no longer available to save.');
      return;
    }
    try {
      const permission = await requestMediaLibraryPermissionsAsync(true, ['photo']);
      if (!permission.granted) {
        setStatusMessage('Allow photo access to save this picture to your device.');
        return;
      }
      await MediaAsset.create(uri);
      setStatusMessage('Saved to Photos! It was also sent to the ALPFA NJIT Drive.');
    } catch {
      setStatusMessage('Could not save to Photos. Please try again.');
    }
  };

  const resetAfterUpload = () => {
    locationRequest.current++;
    setLocationEditorOpen(false);
    setLocationLoading(false);
    setPhotoUri(null);
    setDualPrimaryUri(null);
    setDualSelfieUri(null);
    setStatus('idle');
    setStatusMessage('');
    setPhotoName('');
    setPhotoLocation(null);
    setLocationMessage('');
    setSelectedFilter('Normal');
    setZoom(0);
    setCameraMessage('');
    completedPhotoUriRef.current = null;
    if (facing !== 'back') {
      setCameraReady(false);
      setFacing('back');
    }
  };

  useFocusEffect(React.useCallback(() => () => {
    locationRequest.current++;
    setLocationEditorOpen(false);
    setLocationLoading(false);
    setPhotoUri(null);
    setStatus('idle');
    setStatusMessage('');
    setPhotoName('');
    setPhotoLocation(null);
    setLocationMessage('');
  }, []));

  const pickFromLibrary = async () => {
    try {
      const access = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!access.granted) {
        if (!access.canAskAgain) {
          Alert.alert('Photos access needed', 'Allow ALPFA NJIT to access your photos in Settings so you can choose an image.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => { void openAppSettings(); } },
          ]);
        } else {
          Alert.alert('Photos access needed', 'Please allow photo library access to choose an image.');
        }
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.9,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setSelectedFilter('Normal');
        setPhotoLocation(null);
        setLocationMessage('');
        setPhotoUri(result.assets[0].uri);
        setStatus('idle');
        setStatusMessage('');
      }
    } catch {
      Alert.alert('Could not open Photos', 'Please try again or check ALPFA NJIT photo permissions in Settings.');
    }
  };

  const takePhoto = async () => {
    if (!cameraReady) {
      setCameraMessage('Camera is getting ready — try the shutter again in a moment.');
      return;
    }
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.85 });
      if (!photo?.uri) return;

      if (captureMode === 'dual' && !dualPrimaryUri) {
        setDualPrimaryUri(photo.uri);
        setCameraReady(false);
        setZoom(0);
        setFacing('front');
        setCameraMessage('Main photo captured — take your selfie.');
        return;
      }

      setSelectedFilter('Normal');
      setPhotoLocation(null);
      setLocationMessage('');
      if (captureMode === 'dual' && dualPrimaryUri) {
        setDualSelfieUri(photo.uri);
        setPhotoUri(dualPrimaryUri);
      } else {
        setPhotoUri(photo.uri);
      }
      setCameraMessage('');
    } catch { setCameraMessage('The photo could not be captured. Please try again.'); }
  };

  const selectCaptureMode = (mode: 'photo' | 'dual') => {
    setCaptureMode(mode);
    setDualPrimaryUri(null); setDualSelfieUri(null);
    setCameraMessage('');
    setZoom(0);
    if (facing !== 'back') {
      setCameraReady(false);
      setFacing('back');
    }
  };

  const toggleFacing = () => { setCameraReady(false); setZoom(0); setFacing((current) => current === 'back' ? 'front' : 'back'); };
  const handleCameraTap = () => {
    const now = Date.now();
    if (now - lastCameraTap.current < 300) {
      lastCameraTap.current = 0;
      toggleFacing();
      return;
    }
    lastCameraTap.current = now;
  };
  const MAX_CAMERA_ZOOM = 0.45;
  const isUltraWideSelected = Boolean(ultraWideLens && selectedLens === ultraWideLens);
  const displayZoom = isUltraWideSelected ? 0.5 : 1 + (Math.min(zoom, MAX_CAMERA_ZOOM) / MAX_CAMERA_ZOOM) * 4;
  const showZoomDial = () => {
    setZoomDialVisible(true);
    if (zoomDialTimer.current) clearTimeout(zoomDialTimer.current);
    zoomDialTimer.current = setTimeout(() => setZoomDialVisible(false), 1200);
  };
  const ultraWideLens = availableLenses.find((lens) => lens.toLowerCase().includes('ultrawide'));
  const wideLens = availableLenses.find((lens) => {
    const normalized = lens.toLowerCase();
    return normalized.includes('wideangle') && !normalized.includes('ultrawide');
  });
  const supportsUltraWide = Platform.OS === 'ios' && facing === 'back' && Boolean(ultraWideLens);
  const setDisplayZoom = (value: number) => {
    if (value === 0.5 && ultraWideLens) {
      setSelectedLens(ultraWideLens);
      setZoom(0);
      showZoomDial();
      return;
    }
    if (selectedLens === ultraWideLens && wideLens) setSelectedLens(wideLens);
    setZoom(Math.max(0, Math.min(MAX_CAMERA_ZOOM, ((value - 1) / 4) * MAX_CAMERA_ZOOM)));
    showZoomDial();
  };
  const cameraPanResponder = React.useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: (event) => event.nativeEvent.touches.length >= 2,
    onMoveShouldSetPanResponder: (event) => event.nativeEvent.touches.length >= 2,
    onPanResponderGrant: (event) => {
      if (event.nativeEvent.touches.length < 2) return;
      const [a, b] = event.nativeEvent.touches;
      pinchStartDistance.current = Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
      pinchStartZoom.current = zoom;
    },
    onPanResponderMove: (event) => {
      if (event.nativeEvent.touches.length < 2 || !pinchStartDistance.current) return;
      const [a, b] = event.nativeEvent.touches;
      const distance = Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
      const ratio = distance / pinchStartDistance.current;
      setZoom(Math.max(0, Math.min(MAX_CAMERA_ZOOM, pinchStartZoom.current + (ratio - 1) * 0.16)));
      showZoomDial();
    },
    onPanResponderRelease: () => { pinchStartDistance.current = null; },
    onPanResponderTerminate: () => { pinchStartDistance.current = null; },
  }), [zoom]);
  const swapDualPhotos = () => {
    if (captureMode !== 'dual' || !photoUri || !dualSelfieUri || status === 'uploading') return;
    const currentMain = photoUri;
    setPhotoUri(dualSelfieUri);
    setDualSelfieUri(currentMain);
  };
  const retake = () => { setSelectedFilter('Normal'); setPhotoUri(null); setDualPrimaryUri(null); setDualSelfieUri(null); setFacing('back'); setStatus('idle'); setStatusMessage(''); setPhotoName(''); setPhotoLocation(null); setLocationMessage(''); };

  const closeLocationEditor = () => {
    locationRequest.current++;
    setLocationLoading(false);
    setLocationEditorOpen(false);
    setLocationMessage('');
    Keyboard.dismiss();
  };

  const openLocationEditor = () => {
    locationRequest.current++;
    setLocationLoading(false);
    setLocationDraft(photoLocation?.label ?? '');
    setLocationMessage('');
    setLocationEditorOpen(true);
  };

  const saveLocation = () => {
    const label = cleanLocationLabel(locationDraft);
    if (!label) { setLocationMessage('Enter a location name first.'); return; }
    setLocationDraft(label);
    if (!photoLocation) setLocationPosition({ x: 28, y: Math.min(screenHeight - 190, Math.max(insets.top + 100, screenHeight * 0.68)) });
    setPhotoLocation({ label });
    setLocationMessage('');
    closeLocationEditor();
  };

  const addLocation = async () => {
    const request = ++locationRequest.current;
    setLocationLoading(true);
    setLocationMessage('');
    try {
      let label: string;
      if (Platform.OS === 'web') {
        if (!window.isSecureContext || !navigator.geolocation) {
          throw new Error('GPS needs an HTTPS link. You can type a location instead.');
        }
        const position = await withLocationTimeout(new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 15_000, maximumAge: 60_000 });
        }), 20_000);
        label = position.coords.latitude.toFixed(3) + ', ' + position.coords.longitude.toFixed(3);
      } else {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (request !== locationRequest.current) return;
        if (!permission.granted) {
          if (!permission.canAskAgain) explainPermissionSettings('Location');
          throw new Error('Location access is off. Type a location or allow access in Settings.');
        }
        const position = await withLocationTimeout(Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }), 15_000);
        const { latitude, longitude } = position.coords;
        // Geocoding must not discard a successful GPS result.
        const places = await withLocationTimeout(Location.reverseGeocodeAsync({ latitude, longitude }), 5_000).catch(() => []);
        const place = places[0];
        label = cleanLocationLabel(
          [place?.name, place?.city, place?.region]
            .filter(Boolean)
            .filter((part, index, parts) => parts.indexOf(part) === index)
            .join(', ')
        ) || latitude.toFixed(3) + ', ' + longitude.toFixed(3);
      }
      if (request === locationRequest.current) {
        setLocationDraft(label);
        setLocationMessage('Location found. Edit the text if you want, then tap Save Location.');
      }
    } catch (error) {
      if (request === locationRequest.current) setLocationMessage(error instanceof Error ? error.message : 'GPS is unavailable or blocked. You can type a location instead.');
    } finally {
      if (request === locationRequest.current) setLocationLoading(false);
    }
  };

  const removeLocation = () => { locationRequest.current++; setPhotoLocation(null); setLocationMessage(''); };

  const upload = async () => {
    if (!photoUri) return;
    const cleanName = photoName.trim();
    if (!cleanName) { setStatus('error'); setStatusMessage('Give the photo a name before sharing it.'); return; }
    setStatus('uploading');
    let uploadUri = photoUri;
    let webPreparedUri: string | null = null;
    if (Platform.OS === 'web' && (selectedFilter !== 'Normal' || photoLocation)) {
      try {
        webPreparedUri = await prepareWebPhoto(
          photoUri,
          selectedFilter,
          photoLocation?.label,
          locationPosition
        );
        uploadUri = webPreparedUri;
      } catch {
        setStatus('error');
        setStatusMessage('The filtered photo could not be prepared. Please try again.');
        return;
      }
    } else if (Platform.OS !== 'web' && (selectedFilter !== 'Normal' || photoLocation || dualSelfieUri)) {
      try {
        const snapshot = await filteredCanvasRef.current?.makeImageSnapshotAsync();
        if (!snapshot) { setStatus('error'); setStatusMessage('The photo could not be prepared. Please try again.'); return; }
        const bytes = snapshot.encodeToBytes(ImageFormat.JPEG, 92);
        const filteredFile = new File(Paths.cache, `alpfa-filtered-${Date.now()}.jpg`);
        filteredFile.write(bytes);
        uploadUri = filteredFile.uri;
      } catch { setStatus('error'); setStatusMessage('The photo could not be prepared. Please try again.'); return; }
    }
    const result = await uploadPhotoToDrive(uploadUri, cleanName);
    if (result.success) {
      completedPhotoUriRef.current = Platform.OS === 'web' ? null : uploadUri;
      setStatus('done');
      setStatusMessage('Photo sent to the ALPFA NJIT Drive!');
    } else if (webPreparedUri) {
      URL.revokeObjectURL(webPreparedUri);
    }
    else { setStatus('error'); setStatusMessage(result.message || 'Something went wrong. Try again.'); }
  };

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top + 24 }]}>
        <Ionicons name="camera-outline" size={48} color="rgba(255,255,255,0.75)" />
        <Text style={styles.permissionTitle}>Camera access needed</Text>{!!cameraMessage && <Text accessibilityRole="alert" style={styles.permissionText}>{cameraMessage}</Text>}
        <Text style={styles.permissionText}>Allow camera access so you can capture and share photos with the chapter.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={enableCamera}><Text style={styles.primaryButtonText}>{Platform.OS !== 'web' && !permission.canAskAgain ? 'Open Settings' : 'Allow Camera'}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.closeLink} onPress={close}><Text style={styles.closeLinkText}>Cancel</Text></TouchableOpacity>
      </View>
    );
  }

  if (photoUri) {
    return (
      <View style={styles.container}>
        <Modal visible={locationEditorOpen} transparent animationType="fade" onRequestClose={closeLocationEditor}>
          <KeyboardAvoidingView style={styles.locationEditorBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.locationEditorCard} accessibilityViewIsModal>
              <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 22 }}>
                <Text style={styles.permissionTitle}>{photoLocation ? 'Edit Location' : 'Add Location'}</Text>
                <Text style={styles.permissionText}>Type a place or use your current location. This text will appear on the shared photo.</Text>
                <TextInput accessibilityLabel="Photo location" value={locationDraft} onChangeText={value => { locationRequest.current++; setLocationLoading(false); setLocationDraft(value); setLocationMessage(''); }} placeholder="e.g. NJIT Campus Center" placeholderTextColor="rgba(255,255,255,0.48)" style={styles.nameInput} maxLength={60} returnKeyType="done" onSubmitEditing={saveLocation} />
                <TouchableOpacity style={styles.addLocationButton} onPress={addLocation} disabled={locationLoading} accessibilityRole="button">
                  {locationLoading && <ActivityIndicator color="#FFFFFF" />}
                  <Text style={styles.addLocationText}>{locationLoading ? 'Finding location...' : 'Use current location'}</Text>
                </TouchableOpacity>
                {!!locationMessage && <Text accessibilityRole="alert" style={styles.permissionText}>{locationMessage}</Text>}
                <TouchableOpacity style={[styles.primaryButton, { marginTop: 16, opacity: locationDraft.trim() ? 1 : 0.5 }]} onPress={saveLocation} disabled={!locationDraft.trim()} accessibilityRole="button"><Text style={styles.primaryButtonText}>Save Location</Text></TouchableOpacity>
                <TouchableOpacity style={styles.closeLink} onPress={closeLocationEditor} accessibilityRole="button"><Text style={styles.closeLinkText}>Cancel</Text></TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
        <FilteredPhotoPreview uri={photoUri} filter={selectedFilter} canvasRef={filteredCanvasRef} locationLabel={photoLocation?.label} locationPosition={locationPosition} selfieUri={captureMode === 'dual' ? dualSelfieUri : null} />
        {captureMode === 'dual' && dualSelfieUri && status !== 'done' && (
          <TouchableOpacity style={[styles.dualSwapButton, { top: insets.top + 12 }]} onPress={swapDualPhotos} accessibilityRole="button" accessibilityLabel="Swap main and inset Dual photos">
            <Ionicons name="swap-horizontal" size={20} color="#FFFFFF" />
            <Text style={styles.dualSwapText}>Swap</Text>
          </TouchableOpacity>
        )}
        {photoLocation && status !== 'done' && (
          <View style={[styles.photoLocationStamp, { left: locationPosition.x - 8, top: locationPosition.y - 8 }]} {...locationPanResponder.panHandlers}>
            <View style={styles.photoLocationStampPill}>
              <Ionicons name="location" size={16} color="#FFFFFF" />
              <Text style={styles.photoLocationStampText} numberOfLines={1}>{photoLocation.label}</Text>
            </View>
          </View>
        )}
        <TouchableOpacity style={[styles.closeButton, { top: insets.top + 12 }]} onPress={close}><Ionicons name="close" size={22} color="#FFFFFF" /></TouchableOpacity>
        <View style={[styles.previewFooter, { bottom: nameFocused ? keyboardHeight : insets.bottom + 76, paddingBottom: nameFocused ? 12 : 10 }]}>
          {status === 'done' ? (
            <View style={styles.centered}>
              <Ionicons name="checkmark-circle" size={40} color="#4ADE80" />
              <Text style={styles.statusTextLight}>{statusMessage}</Text>
              <TouchableOpacity style={styles.primaryButton} onPress={saveCompletedPhoto}><Text style={styles.primaryButtonText}>Save to Photos</Text></TouchableOpacity>
              <TouchableOpacity style={styles.closeLink} onPress={resetAfterUpload}><Text style={styles.closeLinkText}>Done</Text></TouchableOpacity>
            </View>
          ) : (
            <>
              {!nameFocused && <View style={styles.previewFilterPicker}>
                <Text style={styles.previewFilterLabel}>CHOOSE A FILTER</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                  {cameraFilters.map((filter) => (
                    <TouchableOpacity key={filter} style={[styles.filterChip, selectedFilter === filter && styles.filterChipSelected]} onPress={() => setSelectedFilter(filter)} accessibilityRole="button" accessibilityState={{ selected: selectedFilter === filter }}>
                      <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextSelected]}>{filter}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>}
              <View style={[styles.nameCard, nameFocused && styles.nameCardFocused]}>
                <Text style={styles.nameLabel}>PHOTO NAME</Text>
                <TextInput value={photoName} onChangeText={(value) => { setPhotoName(value); if (status === 'error') { setStatus('idle'); setStatusMessage(''); } }} placeholder="e.g. ALPFA Networking Night" placeholderTextColor="rgba(255,255,255,0.48)" style={styles.nameInput} onFocus={() => setNameFocused(true)} onBlur={() => setNameFocused(false)} maxLength={60} editable={status !== 'uploading'} returnKeyType="done" blurOnSubmit onSubmitEditing={Keyboard.dismiss} />
                <Text style={styles.nameHint}>{nameFocused ? 'Type the name, then tap Done.' : 'Required before the photo can be shared.'}</Text>
              </View>
              {!nameFocused && (
                <View style={styles.locationCard}>
                  {photoLocation ? (
                    <><TouchableOpacity style={styles.locationInfo} onPress={openLocationEditor} disabled={status === 'uploading'} accessibilityRole="button" accessibilityLabel="Edit photo location"><Ionicons name="location" size={18} color="#FFFFFF" /><View style={styles.locationTextWrap}><Text style={styles.locationLabel}>LOCATION - TAP TO EDIT</Text><Text style={styles.locationValue}>{photoLocation.label}</Text></View><Ionicons name="pencil" size={18} color="#FFFFFF" /></TouchableOpacity><TouchableOpacity style={styles.removeLocationButton} onPress={removeLocation} disabled={status === 'uploading'} accessibilityRole="button" accessibilityLabel="Remove location from photo"><Ionicons name="close" size={17} color="#FFFFFF" /></TouchableOpacity></>
                  ) : (
                    <TouchableOpacity style={styles.addLocationButton} onPress={openLocationEditor} disabled={locationLoading || status === 'uploading'} accessibilityRole="button" accessibilityLabel="Add or type a location for this photo">
                      {locationLoading ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Ionicons name="location-outline" size={18} color="#FFFFFF" />}
                      <Text style={styles.addLocationText}>{locationLoading ? 'Finding location...' : 'Add Location'}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              {!nameFocused && Boolean(locationMessage) && <Text style={styles.locationMessage}>{locationMessage}</Text>}
              {status === 'error' && <Text style={styles.errorText}>{statusMessage}</Text>}
              {!nameFocused && <View style={styles.previewActions}>
                <TouchableOpacity style={styles.secondaryButton} onPress={retake} disabled={status === 'uploading'}><Ionicons name="refresh" size={18} color="#FFFFFF" /><Text style={styles.secondaryButtonText}>Retake</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.primaryButton, styles.uploadButton]} onPress={upload} disabled={status === 'uploading'}>
                  {status === 'uploading' ? <ActivityIndicator color="#FFFFFF" /> : <><Ionicons name="cloud-upload-outline" size={18} color="#FFFFFF" /><Text style={styles.primaryButtonText}>Share to Drive</Text></>}
                </TouchableOpacity>
              </View>}
            </>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} key={facing} facing={facing} mirror={facing === 'front'} zoom={zoom} onMountError={({ message }) => { setCameraReady(false); setCameraMessage(message); }} onCameraReady={() => { setCameraReady(true); setCameraMessage(''); }} />
      <View style={styles.cameraGestureLayer} {...cameraPanResponder.panHandlers}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleCameraTap} accessibilityLabel="Camera preview. Pinch to zoom. Double tap to switch camera." />
      </View>
      <TouchableOpacity style={[styles.closeButton, { top: insets.top + 12 }]} onPress={close} accessibilityRole="button" accessibilityLabel="Close camera"><Ionicons name="close" size={22} color="#FFFFFF" /></TouchableOpacity>
      {!!cameraMessage && <View style={[styles.cameraMessagePill, { top: insets.top + 64 }]}><Text style={styles.cameraMessageText}>{cameraMessage}</Text></View>}
      {zoomDialVisible && (
        <View pointerEvents="none" style={[styles.zoomDial, { bottom: insets.bottom + 245 }]}>
          <View style={styles.zoomDialArc}>
            {Array.from({ length: 21 }).map((_, index) => (
              <View key={index} style={[styles.zoomTick, index % 5 === 0 && styles.zoomTickMajor, { transform: [{ rotate: `${-50 + index * 5}deg` }, { translateY: -37 }] }]} />
            ))}
          </View>
          <Text style={styles.zoomDialValue}>{displayZoom.toFixed(1)}×</Text>
        </View>
      )}
      <View style={[styles.captureBar, { bottom: insets.bottom + 76 }]}>
        <View style={styles.captureModeSelector}>
          {(['photo', 'dual'] as const).map((mode) => (
            <TouchableOpacity key={mode} onPress={() => selectCaptureMode(mode)} accessibilityRole="button" accessibilityLabel={mode === 'photo' ? 'Photo mode' : 'Dual photo mode'}>
              <Text style={[styles.captureModeText, captureMode === mode && styles.captureModeTextSelected]}>{mode.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {captureMode === 'dual' && <Text style={styles.dualHint}>{dualPrimaryUri ? 'SELFIE' : 'MAIN PHOTO'}</Text>}
        <View style={styles.lensControls}>
          {(supportsUltraWide ? [0.5, 1, 2, 5] : [1, 2, 5]).map((value) => {
            const selected = Math.abs(displayZoom - value) < 0.35;
            return (
              <TouchableOpacity key={value} style={[styles.lensButton, selected && styles.lensButtonSelected]} onPress={() => setDisplayZoom(value)} accessibilityRole="button" accessibilityLabel={`Zoom to ${value} times`}>
                <Text style={[styles.lensText, selected && styles.lensTextSelected]}>{value}×</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.cameraActions}>
          <TouchableOpacity style={styles.galleryButton} onPress={pickFromLibrary} accessibilityRole="button" accessibilityLabel="Choose a photo from your camera roll"><Ionicons name="images-outline" size={25} color="#FFFFFF" /></TouchableOpacity>
          <TouchableOpacity style={[styles.shutter, !cameraReady && styles.shutterNotReady]} onPress={takePhoto} accessibilityRole="button" accessibilityLabel="Take photo"><View pointerEvents="none" style={styles.shutterInner} /></TouchableOpacity>
          <TouchableOpacity style={styles.flipCameraButton} onPress={toggleFacing} accessibilityRole="button" accessibilityLabel={`Switch to ${facing === 'back' ? 'front' : 'back'} camera`}><Ionicons name="camera-reverse-outline" size={25} color="#FFFFFF" /></TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  permissionTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', marginTop: 16 },
  permissionText: { color: 'rgba(255,255,255,0.75)', fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 19 },
  cameraGestureLayer: { ...StyleSheet.absoluteFill, zIndex: 1 },
  captureModeSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 28, marginBottom: 10 },
  captureModeText: { color: 'rgba(255,255,255,0.62)', fontSize: 12, fontWeight: '800', letterSpacing: 1.1 },
  captureModeTextSelected: { color: '#FFD84A' },
  dualHint: { color: 'rgba(255,255,255,0.78)', fontSize: 9, fontWeight: '900', letterSpacing: 1.2, marginBottom: 8 },
  lensControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 18 },
  lensButton: { minWidth: 50, height: 50, paddingHorizontal: 12, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(18,18,18,0.72)' },
  lensButtonSelected: { backgroundColor: 'rgba(34,34,34,0.96)' },
  lensText: { color: 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: '800' },
  lensTextSelected: { color: '#FFD84A' },
  closeButton: { position: 'absolute', right: 16, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  flipCameraButton: { width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(18,18,18,0.76)', alignItems: 'center', justifyContent: 'center' },
  modeButton: { position: 'absolute', left: 16, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, height: 34, borderRadius: 17, backgroundColor: 'rgba(110,27,45,0.88)', zIndex: 10 },
  modeButtonText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  captureBar: { position: 'absolute', left: 0, right: 0, zIndex: 5, elevation: 5, alignItems: 'center', paddingHorizontal: 28, backgroundColor: 'transparent' },
  previewFilterPicker: { marginBottom: 12 },
  previewFilterLabel: { color: 'rgba(255,255,255,0.72)', fontSize: 10, fontWeight: '900', letterSpacing: 1.1, marginBottom: 8, paddingHorizontal: 2 },
  filterRow: { gap: 8, paddingBottom: 6 },
  filterChip: { paddingHorizontal: 14, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  filterChipSelected: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
  filterText: { color: 'rgba(255,255,255,0.72)', fontSize: 11, fontWeight: '800' },
  filterTextSelected: { color: '#111111' },
  cameraMessagePill: { position: 'absolute', alignSelf: 'center', maxWidth: '82%', zIndex: 10, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(0,0,0,0.62)' },
  cameraMessageText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  dualSwapButton: {
    position: 'absolute',
    left: 118,
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.68)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dualSwapText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },
  zoomDial: {
    position: 'absolute',
    alignSelf: 'center',
    width: 190,
    height: 92,
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 25,
  },
  zoomDialArc: {
    position: 'absolute',
    bottom: 4,
    width: 150,
    height: 75,
    borderTopLeftRadius: 150,
    borderTopRightRadius: 150,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255,255,255,0.42)',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  zoomTick: {
    position: 'absolute',
    bottom: 35,
    width: 1,
    height: 7,
    backgroundColor: 'rgba(255,255,255,0.62)',
  },
  zoomTickMajor: { height: 12, width: 2, backgroundColor: '#FFFFFF' },
  zoomDialValue: {
    color: '#FFD84D',
    fontSize: 18,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowRadius: 4,
    marginBottom: 12,
  },
  cameraActions: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 },
  galleryButton: { width: 54, height: 54, borderRadius: 18, backgroundColor: 'rgba(18,18,18,0.76)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  shutter: { width: 82, height: 82, borderRadius: 41, borderWidth: 4, borderColor: '#FFFFFF', backgroundColor: 'rgba(0,0,0,0.18)', alignItems: 'center', justifyContent: 'center' },
  shutterNotReady: { opacity: 0.62 },
  shutterInner: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#FFFFFF' },
  previewFooter: { position: 'absolute', left: 0, right: 0, paddingTop: 20, paddingHorizontal: 24, backgroundColor: 'rgba(0,0,0,0.55)' },
  nameCard: { marginBottom: 14, padding: 14, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.58)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  nameLabel: { color: 'rgba(255,255,255,0.72)', fontSize: 10, fontWeight: '900', letterSpacing: 1.1, marginBottom: 7 },
  nameCardFocused: { borderColor: '#FFFFFF', borderWidth: 1.5, backgroundColor: 'rgba(0,0,0,0.88)', marginBottom: 0 },
  nameInput: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', paddingVertical: 10, paddingHorizontal: 0, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.42)' },
  nameHint: { color: 'rgba(255,255,255,0.55)', fontSize: 10, marginTop: 4 },
  locationCard: { minHeight: 48, marginBottom: 12, paddingHorizontal: 14, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.58)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addLocationButton: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  addLocationText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  locationInfo: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10 },
  locationTextWrap: { flex: 1 },
  locationLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 9, fontWeight: '900', letterSpacing: 0.9 },
  locationValue: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', marginTop: 2 },
  removeLocationButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.12)' },
  locationEditorBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  locationEditorCard: { width: '100%', maxWidth: 440, maxHeight: '90%', backgroundColor: '#10182A', borderRadius: 22 },
  locationMessage: { color: 'rgba(255,255,255,0.72)', fontSize: 11, textAlign: 'center', marginTop: -4, marginBottom: 10, lineHeight: 16 },
  photoLocationStamp: { position: 'absolute', zIndex: 8, maxWidth: '86%', minHeight: 44, padding: 6, backgroundColor: 'transparent' },
  photoLocationStampPill: { maxWidth: '100%', minHeight: 38, paddingHorizontal: 14, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.92)', flexDirection: 'row', alignItems: 'center', gap: 6 },
  photoLocationStampText: { flexShrink: 1, color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  previewActions: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#6E1B2D', borderRadius: 999, paddingVertical: 14, paddingHorizontal: 22, marginTop: 16 },
  uploadButton: { flex: 1, marginTop: 0 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  secondaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 999, paddingVertical: 14, paddingHorizontal: 20 },
  secondaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  statusTextLight: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginTop: 12, textAlign: 'center' },
  errorText: { color: '#F87171', fontSize: 12, textAlign: 'center', marginBottom: 8 },
  closeLink: { marginTop: 18 },
  closeLinkText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '700' },
});
