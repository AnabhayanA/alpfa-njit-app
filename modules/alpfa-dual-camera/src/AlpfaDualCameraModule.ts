import { requireOptionalNativeModule } from 'expo';
type NativeModule = { isSupported(): boolean };
export default requireOptionalNativeModule<NativeModule>('AlpfaDualCamera');
