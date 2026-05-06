import { getChecklistItem } from '@/db/clients';
import { randomUUID } from 'crypto';
import { db } from '@/db';
import { checklistItem, document, r2PendingDelete } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { deletePendingDelete, getPendingDeletes } from '@/db/documents';
import { ALLOWED_TYPES, MAX_FILE_SIZE } from './documents';
import { deleteObject, getUploadUrl } from './r2';

interface UploadMetaData {
  mimeType: string;
  size: number;
}

interface DocumentMetaData {
  mimeType: string;
  size: number;
  originalFileName: string;
}

// Abandoned presigned URLs (browser crash after prepareUpload, before completeUpload)
// leave orphaned R2 objects. Accepted for Phase 1 — single user, cosmetic cost.
export async function prepareUpload(checklistItemId: string, fileMetaData: UploadMetaData) {
  const item = await getChecklistItem(checklistItemId);
  if (!item) throw new Error('Unauthorised');

  if (!ALLOWED_TYPES.includes(fileMetaData.mimeType as (typeof ALLOWED_TYPES)[number])) {
    throw new Error('The file type is not allowed');
  }

  if (fileMetaData.size > MAX_FILE_SIZE) {
    throw new Error('The file size is too large');
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
  const item = await getChecklistItem(checklistItemId);
  if (!item) throw new Error('Unauthorised');

  const res = await db.transaction(async (tx) => {
    const existing = await tx.query.document.findFirst({
      where: (table, { eq }) => eq(table.checklistItemId, checklistItemId),
    });

    if (existing) {
      await tx.delete(document).where(eq(document.id, existing.id));
      await tx
        .insert(r2PendingDelete)
        .values({ practiceId: item.practiceId, r2Key: existing.r2Key });
    }

    await tx.insert(document).values({
      practiceId: item.practiceId,
      checklistItemId,
      r2Key: documentKey,
      originalFileName: fileMetaData.originalFileName,
      mimeType: fileMetaData.mimeType,
      size: fileMetaData.size,
    });

    await tx
      .update(checklistItem)
      .set({ done: true })
      .where(
        and(eq(checklistItem.id, checklistItemId), eq(checklistItem.practiceId, item.practiceId)),
      );

    return { oldR2Key: existing?.r2Key ?? null };
  });

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
