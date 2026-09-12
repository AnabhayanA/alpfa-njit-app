import type { ViewProps } from 'react-native';
export type DualCameraPhoto = { uri: string };
export type AlpfaDualCameraViewProps = ViewProps & {
  onReady?: () => void;
  onError?: (event: { nativeEvent: { message: string } }) => void;
};
export type AlpfaDualCameraViewRef = { capture(): Promise<DualCameraPhoto> };
