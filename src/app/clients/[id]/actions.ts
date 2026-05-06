'use server';

import { revalidatePath } from 'next/cache';
import { getDocument } from '@/db/documents';
import { completeUpload, prepareUpload } from '@/lib/document-lifecycle';
import { getDownloadUrl } from '@/lib/r2';

export async function getUploadUrl(checklistItemId: string, mimeType: string, size: number) {
  return await prepareUpload(checklistItemId, { mimeType, size });
}

export async function recordUpload(
  checklistItemId: string,
  documentKey: string,
  originalFileName: string,
  mimeType: string,
  size: number,
) {
  await completeUpload(checklistItemId, documentKey, {
    mimeType,
    size,
    originalFileName,
  });

  revalidatePath('/clients', 'layout');
}

export async function getDocumentDownloadUrl(documentId: string): Promise<string> {
  const document = await getDocument(documentId);

  if (!document) {
    throw new Error('Document not found');
  }

  return getDownloadUrl(document.r2Key);
}
