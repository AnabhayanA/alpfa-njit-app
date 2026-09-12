import React from 'react';
import { Platform, View } from 'react-native';
import { requireNativeView } from 'expo';
import type { AlpfaDualCameraViewProps, AlpfaDualCameraViewRef } from './AlpfaDualCamera.types';
// Expo's native-view type does not expose its imperative ref, but the runtime
// attaches view AsyncFunctions (including `capture`) to this ref.
const NativeView: React.ElementType = Platform.OS === 'ios'
  ? requireNativeView<AlpfaDualCameraViewProps>('AlpfaDualCamera')
  : View;
const AlpfaDualCameraView = React.forwardRef<AlpfaDualCameraViewRef, AlpfaDualCameraViewProps>((props, ref) => (
  <NativeView {...props} ref={ref as never} />
));
AlpfaDualCameraView.displayName = 'AlpfaDualCameraView';
export default AlpfaDualCameraView;
