import { getChecklistItem } from '@/db/clients';
import { randomUUID } from 'crypto';
import { deletePendingDelete, getPendingDeletes } from '@/db/documents';
import { deleteObject, getUploadUrl } from './r2';
import { validateDocument } from './documents';
import { DocumentMetaData, FileMetaData } from '@/types/documents';
import { attachDocument, markItemReceived } from '@/lib/checklist';

// Abandoned presigned URLs (browser crash after prepareUpload, before completeUpload)
// leave orphaned R2 objects. Accepted for Phase 1 — single user, cosmetic cost.
export async function prepareUpload(checklistItemId: string, fileMetaData: FileMetaData) {
  const item = await getChecklistItem(checklistItemId);
  if (!item) throw new Error('Unauthorised');

  const isDocumentValid = validateDocument(fileMetaData);
  if (!isDocumentValid.valid) {
    throw new Error(isDocumentValid.error);
  }

  const documentKey = randomUUID();
  const uploadUrl = await getUploadUrl(documentKey, fileMetaData.mimeType, fileMetaData.size);
  return { uploadUrl, documentKey };
}

export async function completeUpload(
  checklistItemId: string,
  documentKey: string,
  fileMetaData: DocumentMetaData,
): Promise<void> {
  const res = await attachDocument(checklistItemId, documentKey, fileMetaData);
  await markItemReceived(checklistItemId);

  if (res.oldR2Key) {
    try {
      await deleteObject(res.oldR2Key);
      await deletePendingDelete(res.oldR2Key);
    } catch (e) {
      console.error('Immediate R2 delete failed — will be retried by cleanup job:', e);
    }
  }
}

export async function drainPendingDeletes() {
  const pending = await getPendingDeletes();
  const results = await Promise.allSettled(
    pending.map(async (entry) => {
      await deleteObject(entry.r2Key);
      await deletePendingDelete(entry.r2Key);
      return entry.r2Key;
    }),
  );

  const succeeded = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  if (failed > 0) {
    results.forEach((r) => {
      if (r.status === 'rejected') console.error('R2 cleanup failed:', r.reason);
    });
  }

  return { processed: results.length, succeeded, failed };
}
