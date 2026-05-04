'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentPracticeId } from '@/lib/auth';
import { getDocument } from '@/db/documents';
import { completeUpload, getDownloadUrl, prepareUpload } from '@/lib/document-lifecycle';

export async function getUploadUrl(checklistItemId: string, mimeType: string, size: number) {
  const practiceId = await getCurrentPracticeId();
  return await prepareUpload(checklistItemId, practiceId, { mimeType, size });
}

export async function recordUpload(
  checklistItemId: string,
  documentKey: string,
  originalFileName: string,
  mimeType: string,
  size: number,
) {
  const practiceId = await getCurrentPracticeId();

  await completeUpload(checklistItemId, practiceId, documentKey, {
    mimeType,
    size,
    originalFileName,
  });

  revalidatePath('/clients', 'layout');
}

export async function getDocumentDownloadUrl(documentId: string) {
  const document = await getDocument(documentId);
  const practiceId = await getCurrentPracticeId();

  if (!document) {
    throw new Error('Document not found');
  }

  if (document.practiceId !== practiceId) {
    throw new Error('Unauthorised');
  }

  return getDownloadUrl(document.r2Key);
}
