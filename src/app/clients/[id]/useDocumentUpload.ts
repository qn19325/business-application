import { useState } from 'react';
import { getUploadUrl, recordUpload } from './actions';

export function useDocumentUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File, checklistItemId: string) {
    setIsUploading(true);
    setError(null);
    try {
      const { uploadUrl, documentKey } = await getUploadUrl(checklistItemId, file.type, file.size);
      const res = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      if (!res.ok) throw new Error('Upload to storage failed');
      await recordUpload(checklistItemId, documentKey, file.name, file.type, file.size);
    } catch (e) {
      const errMessage = e instanceof Error ? e.message : 'Upload Failed';
      setError(errMessage);
    } finally {
      setIsUploading(false);
    }
  }

  return { upload, isUploading, error };
}
