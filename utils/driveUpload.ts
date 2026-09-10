import { PHOTO_UPLOAD_ENDPOINT, PHOTO_UPLOAD_API_KEY } from '../constants/config';

export type UploadResult = {
  success: boolean;
  message?: string;
};

// Uploads a locally captured photo to the ALPFA NJIT Drive backend.
export async function uploadPhotoToDrive(photoUri: string): Promise<UploadResult> {
  if (PHOTO_UPLOAD_ENDPOINT.includes('REPLACE-WITH-YOUR-BACKEND-URL')) {
    return {
      success: false,
      message: 'Photo upload is not configured yet. Set PHOTO_UPLOAD_ENDPOINT in constants/config.ts.',
    };
  }

  const formData = new FormData();
  formData.append('photo', {
    uri: photoUri,
    name: `alpfa-njit-${Date.now()}.jpg`,
    type: 'image/jpeg',
  } as unknown as Blob);

  try {
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
