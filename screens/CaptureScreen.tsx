import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, Keyboard, PanResponder, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Canvas, ColorMatrix, Image as SkiaImage, ImageFormat, Text as SkiaText, matchFont, useCanvasRef, useImage } from '@shopify/react-native-skia';
import { File, Paths } from 'expo-file-system';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useTheme from '../utils/useTheme';
import { uploadPhotoToDrive } from '../utils/driveUpload';
import {
  AlpfaDualCameraModule,
  AlpfaDualCameraView,
  type AlpfaDualCameraViewRef,
} from '../modules/alpfa-dual-camera';

const FILTER_MATRICES: Record<string, number[]> = {
  Warm: [
    1.12, 0.05, 0, 0, 0.03,
    0.02, 1.03, 0, 0, 0.01,
    0, 0.02, 0.88, 0, 0,
    0, 0, 0, 1, 0,
  ],
  Cool: [
    0.88, 0.02, 0.05, 0, 0,
    0, 1.02, 0.04, 0, 0.01,
    0.02, 0.04, 1.14, 0, 0.03,
    0, 0, 0, 1, 0,
  ],
  'B&W': [
    0.2126, 0.7152, 0.0722, 0, 0,
    0.2126, 0.7152, 0.0722, 0, 0,
    0.2126, 0.7152, 0.0722, 0, 0,
    0, 0, 0, 1, 0,
  ],
  Vintage: [
    0.393, 0.769, 0.189, 0, 0,
    0.349, 0.686, 0.168, 0, 0,
    0.272, 0.534, 0.131, 0, 0,
    0, 0, 0, 1, 0,
  ],
  ALPFA: [
    0.95, 0.08, 0.02, 0, 0.02,
    0.01, 0.82, 0.03, 0, 0,
    0.08, 0.02, 0.92, 0, 0.02,
    0, 0, 0, 1, 0,
  ],
};

const locationFont = Platform.OS === 'web'
  ? null
  : matchFont({
      fontFamily: Platform.OS === 'ios' ? 'Helvetica' : 'sans-serif',
      fontSize: 19,
      fontWeight: 'bold',
    });

function FilteredPhotoPreview({
  uri,
  filter,
  canvasRef,
  locationLabel,
  locationPosition,
}: {
  uri: string;
  filter: string;
  canvasRef: ReturnType<typeof useCanvasRef>;
  locationLabel?: string;
  locationPosition: { x: number; y: number };
}) {
  const image = useImage(uri);
  const { width, height } = useWindowDimensions();
  const matrix = FILTER_MATRICES[filter];

  if (!image) {
    return <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />;
  }

  if (!matrix && !locationLabel) {
    return <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />;
  }

  return (
    <Canvas ref={canvasRef} style={StyleSheet.absoluteFill}>
      <SkiaImage image={image} x={0} y={0} width={width} height={height} fit="cover">
        {matrix && <ColorMatrix matrix={matrix} />}
      </SkiaImage>
      {locationLabel && locationFont && (
        <>
          <SkiaText
            x={locationPosition.x + 1.5}
            y={locationPosition.y + 25.5}
            text={locationLabel}
            font={locationFont}
            color="rgba(0,0,0,0.78)"
          />
          <SkiaText
            x={locationPosition.x}
            y={locationPosition.y + 24}
            text={locationLabel}
            font={locationFont}
            color="#FFFFFF"
          />
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
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('Normal');
  const [photoLocation, setPhotoLocation] = useState<{
    latitude: number;
    longitude: number;
    label: string;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const [locationPosition, setLocationPosition] = useState({ x: 28, y: 420 });
  const cameraFilters = ['Normal', 'Warm', 'Cool', 'B&W', 'Vintage', 'ALPFA'];

  const locationPanResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (event) => {
          const x = Math.max(16, Math.min(event.nativeEvent.pageX - 70, screenWidth - 170));
          const y = Math.max(insets.top + 70, Math.min(event.nativeEvent.pageY - 22, screenHeight - 300));
          setLocationPosition({ x, y });
        },
      }),
    [insets.top, screenHeight, screenWidth]
  );

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

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
        setPhotoLocation(null);
        setLocationMessage('');
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
      setSelectedFilter('Normal');
      setPhotoLocation(null);
      setLocationMessage('');
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
      if (photo?.uri) {
        setSelectedFilter('Normal');
        setPhotoLocation(null);
        setLocationMessage('');
        setPhotoUri(photo.uri);
      }
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
    setSelectedFilter('Normal');
    setPhotoUri(null);
    setStatus('idle');
    setStatusMessage('');
    setPhotoName('');
    setPhotoLocation(null);
    setLocationMessage('');
  };

  const confirmAndAddLocation = () => {
    const message = 'Your current city/region will be displayed on the photo and included when the photo is shared to the ALPFA NJIT Drive.';
    if (Platform.OS === 'web') {
      if (window.confirm('Add location to this photo?\n\n' + message)) {
        void addLocation();
      }
      return;
    }
    Alert.alert(
      'Add location to this photo?',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Add Location', onPress: addLocation },
      ]
    );
  };

  const addLocation = async () => {
    try {
      setLocationLoading(true);
      setLocationMessage('');

      const { status: permissionStatus } = await Location.requestForegroundPermissionsAsync();

      if (permissionStatus !== 'granted') {
        setLocationMessage('Location permission was not granted. You can still share the photo without a location.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = currentLocation.coords;
      const places = await Location.reverseGeocodeAsync({ latitude, longitude });
      const place = places[0];
      const label = place
        ? [place.city, place.region].filter(Boolean).join(', ')
        : 'Current location';

      setLocationPosition({ x: 28, y: Math.max(insets.top + 100, screenHeight * 0.5) });
      setPhotoLocation({ latitude, longitude, label: label || 'Current location' });
    } catch {
      setLocationMessage('Location could not be added. You can still share the photo without it.');
    } finally {
      setLocationLoading(false);
    }
  };

  const removeLocation = () => {
    setPhotoLocation(null);
    setLocationMessage('');
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

    let uploadUri = photoUri;
    if (Platform.OS !== 'web' && (selectedFilter !== 'Normal' || photoLocation)) {
      try {
        const snapshot = await filteredCanvasRef.current?.makeImageSnapshotAsync();
        if (!snapshot) {
          setStatus('error');
          setStatusMessage('The photo could not be prepared. Please try again.');
          return;
        }

        const bytes = snapshot.encodeToBytes(ImageFormat.JPEG, 92);
        const filteredFile = new File(
          Paths.cache,
          `alpfa-filtered-${Date.now()}.jpg`
        );
        filteredFile.write(bytes);
        uploadUri = filteredFile.uri;
      } catch {
        setStatus('error');
        setStatusMessage('The photo could not be prepared. Please try again.');
        return;
      }
    }

    const result = await uploadPhotoToDrive(uploadUri, cleanName);
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
        <FilteredPhotoPreview
          uri={photoUri}
          filter={selectedFilter}
          canvasRef={filteredCanvasRef}
          locationLabel={photoLocation?.label}
          locationPosition={locationPosition}
        />
        {photoLocation && status !== 'done' && (
          <View
            style={[
              styles.photoLocationStamp,
              { left: locationPosition.x - 8, top: locationPosition.y - 8 },
            ]}
            {...locationPanResponder.panHandlers}
          >
            <Ionicons name="location" size={19} color="#FFFFFF" />
            <Text style={styles.photoLocationStampText}>{photoLocation.label}</Text>
          </View>
        )}
        <TouchableOpacity style={[styles.closeButton, { top: insets.top + 12 }]} onPress={close}>
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <View
          style={[
            styles.previewFooter,
            {
              bottom: keyboardHeight,
              paddingBottom: nameFocused ? 12 : insets.bottom + 24,
            },
          ]}
        >
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
              {!nameFocused && <View style={styles.previewFilterPicker}>
                <Text style={styles.previewFilterLabel}>CHOOSE A FILTER</Text>
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
              </View>}
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
                  blurOnSubmit
                  onSubmitEditing={Keyboard.dismiss}
                />
                <Text style={styles.nameHint}>
                  {nameFocused ? 'Type the name, then tap Done.' : 'Required before the photo can be shared.'}
                </Text>
              </View>
              {!nameFocused && (
                <View style={styles.locationCard}>
                  {photoLocation ? (
                    <>
                      <View style={styles.locationInfo}>
                        <Ionicons name="location" size={18} color="#FFFFFF" />
                        <View style={styles.locationTextWrap}>
                          <Text style={styles.locationLabel}>LOCATION ADDED</Text>
                          <Text style={styles.locationValue}>{photoLocation.label}</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.removeLocationButton}
                        onPress={removeLocation}
                        disabled={status === 'uploading'}
                        accessibilityRole="button"
                        accessibilityLabel="Remove location from photo"
                      >
                        <Ionicons name="close" size={17} color="#FFFFFF" />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={styles.addLocationButton}
                      onPress={confirmAndAddLocation}
                      disabled={locationLoading || status === 'uploading'}
                      accessibilityRole="button"
                      accessibilityLabel="Add current location to photo"
                    >
                      {locationLoading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Ionicons name="location-outline" size={18} color="#FFFFFF" />
                      )}
                      <Text style={styles.addLocationText}>
                        {locationLoading ? 'Finding location...' : 'Add Location'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              {!nameFocused && Boolean(locationMessage) && (
                <Text style={styles.locationMessage}>{locationMessage}</Text>
              )}
              {status === 'error' && <Text style={styles.errorText}>{statusMessage}</Text>}
              {!nameFocused && <View style={styles.previewActions}>
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
              </View>}
            </>
          )}
        </View>
      </View>
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
    previewFilterPicker: { marginBottom: 12 },
    previewFilterLabel: { color: 'rgba(255,255,255,0.72)', fontSize: 10, fontWeight: '900', letterSpacing: 1.1, marginBottom: 8, paddingHorizontal: 2 },
    filterRow: { gap: 8, paddingBottom: 6 },
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
      borderColor: '#FFFFFF',
      borderWidth: 1.5,
      backgroundColor: 'rgba(0,0,0,0.88)',
      marginBottom: 0,
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
    locationCard: {
      minHeight: 48,
      marginBottom: 12,
      paddingHorizontal: 14,
      borderRadius: 16,
      backgroundColor: 'rgba(0,0,0,0.58)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.18)',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    addLocationButton: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    addLocationText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
    locationInfo: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10 },
    locationTextWrap: { flex: 1 },
    locationLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 9, fontWeight: '900', letterSpacing: 0.9 },
    locationValue: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', marginTop: 2 },
    removeLocationButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.12)' },
    locationMessage: { color: 'rgba(255,255,255,0.72)', fontSize: 11, textAlign: 'center', marginTop: -4, marginBottom: 10, lineHeight: 16 },
    photoLocationStamp: {
      position: 'absolute',
      zIndex: 8,
      maxWidth: '82%',
      minHeight: 44,
      paddingHorizontal: 8,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    photoLocationStampText: {
      color: '#FFFFFF',
      fontSize: 19,
      fontWeight: '900',
      textShadowColor: 'rgba(0,0,0,0.8)',
      textShadowOffset: { width: 1.5, height: 1.5 },
      textShadowRadius: 3,
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
