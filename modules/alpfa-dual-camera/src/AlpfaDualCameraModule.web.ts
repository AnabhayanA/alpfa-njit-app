import { registerWebModule, NativeModule } from 'expo';

// AlpfaDualCameraModule is not available on the web platform.
class AlpfaDualCameraModule extends NativeModule<{}> {}

export default registerWebModule(AlpfaDualCameraModule, 'AlpfaDualCameraModule');
