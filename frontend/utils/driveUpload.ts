import { File } from 'expo-file-system';
import { Platform } from 'react-native';
import { PHOTO_UPLOAD_ENDPOINT, PHOTO_UPLOAD_API_KEY } from '../constants/config';

export type UploadResult = {
  success: boolean;
  message?: string;
};

// Uploads a locally captured photo to the ALPFA NJIT Drive backend.
export async function uploadPhotoToDrive(photoUri: string, photoName: string): Promise<UploadResult> {
  if (PHOTO_UPLOAD_ENDPOINT.includes('REPLACE-WITH-YOUR-BACKEND-URL')) {
    return {
      success: false,
      message: 'Photo upload is not configured yet. Set PHOTO_UPLOAD_ENDPOINT in constants/config.ts.',
    };
  }

  const safeName = photoName
    .trim()
    .replace(/[^a-zA-Z0-9 _-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60) || 'alpfa-photo';

  const formData = new FormData();
  formData.append('photoName', safeName);

  try {
    if (Platform.OS === 'web') {
      const photoResponse = await fetch(photoUri);
      const photoBlob = await photoResponse.blob();
      formData.append('photo', photoBlob, `${safeName}-${Date.now()}.jpg`);
    } else {
      // Expo's modern File object is a real Blob/FormDataPart. This avoids the
      // unsupported plain { uri, name, type } object in newer native runtimes.
      const photoFile = new File(photoUri);
      formData.append('photo', photoFile, `${safeName}-${Date.now()}.jpg`);
    }

    const response = await fetch(PHOTO_UPLOAD_ENDPOINT, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
        ...(PHOTO_UPLOAD_API_KEY ? { 'x-api-key': PHOTO_UPLOAD_API_KEY } : {}),
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      return { success: false, message: text || `Upload failed (${response.status}).` };
    }

    return { success: true };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Upload failed.' };
  }
}
