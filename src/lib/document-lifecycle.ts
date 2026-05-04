import { getChecklistItem } from '@/db/clients';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { r2 } from '@/lib/r2';
import { randomUUID } from 'crypto';
import { db } from '@/db';
import { checklistItem, document, r2PendingDelete } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { deletePendingDelete, getPendingDeletes } from '@/db/documents';
import { ALLOWED_TYPES, MAX_FILE_SIZE } from './documents';

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
export async function prepareUpload(
  checklistItemId: string,
  practiceId: string,
  fileMetaData: UploadMetaData,
) {
  const item = await getChecklistItem(checklistItemId, practiceId);
  if (!item) throw new Error('Unauthorised');

  if (!ALLOWED_TYPES.includes(fileMetaData.mimeType as (typeof ALLOWED_TYPES)[number])) {
    throw new Error('The file type is not allowed');
  }

  if (fileMetaData.size > MAX_FILE_SIZE) {
    throw new Error('The file size is too large');
  }

  const documentKey = randomUUID();
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: documentKey,
    ContentType: fileMetaData.mimeType,
    ContentLength: fileMetaData.size,
  });
  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 900 });
  return { uploadUrl, documentKey };
}

export async function completeUpload(
  checklistItemId: string,
  practiceId: string,
  documentKey: string,
  fileMetaData: DocumentMetaData,
): Promise<void> {
  const item = await getChecklistItem(checklistItemId, practiceId);
  if (!item) throw new Error('Unauthorised');

  const res = await db.transaction(async (tx) => {
    const existing = await tx.query.document.findFirst({
      where: (table, { eq }) => eq(table.checklistItemId, checklistItemId),
    });

    if (existing) {
      await tx.delete(document).where(eq(document.id, existing.id));
      await tx.insert(r2PendingDelete).values({ practiceId: practiceId, r2Key: existing.r2Key });
    }

    await tx.insert(document).values({
      practiceId,
      checklistItemId,
      r2Key: documentKey,
      originalFileName: fileMetaData.originalFileName,
      mimeType: fileMetaData.mimeType,
      size: fileMetaData.size,
    });

    await tx
      .update(checklistItem)
      .set({ done: true })
      .where(and(eq(checklistItem.id, checklistItemId), eq(checklistItem.practiceId, practiceId)));

    return { oldR2Key: existing?.r2Key ?? null };
  });

  if (res.oldR2Key) {
    try {
      await r2.send(
        new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: res.oldR2Key }),
      );
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
      await r2.send(
        new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: entry.r2Key }),
      );
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

export async function getDownloadUrl(r2Key: string) {
  const getCommand = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: r2Key,
  });

  return await getSignedUrl(r2, getCommand, { expiresIn: 3600 });
}
