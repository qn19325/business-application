import { db } from '@/db';
import { getChecklistItem } from '@/db/clients';
import { checklistItem, document, r2PendingDelete } from '@/db/schema';
import { DocumentMetaData } from '@/types/documents';
import { and, eq } from 'drizzle-orm';
import { deleteObject } from '@/lib/r2';
import { deletePendingDelete } from '@/db/documents';

export async function markItemReceived(itemId: string, clientId?: string) {
  const item = await getChecklistItem(itemId, clientId);
  if (!item) throw new Error('Unauthorised');

  const res = await db
    .update(checklistItem)
    .set({
      done: true,
    })
    .where(and(eq(checklistItem.practiceId, item.practiceId), eq(checklistItem.id, item.id)))
    .returning();

  if (!res.length) {
    throw new Error('Could not update item');
  }
}

export async function markItemOutstanding(itemId: string, clientId?: string) {
  const item = await getChecklistItem(itemId, clientId);
  if (!item) throw new Error('Unauthorised');

  const res = await db
    .update(checklistItem)
    .set({
      done: false,
    })
    .where(and(eq(checklistItem.practiceId, item.practiceId), eq(checklistItem.id, item.id)))
    .returning();

  if (!res.length) {
    throw new Error('Could not update item');
  }
}

export async function attachDocument(
  itemId: string,
  documentKey: string,
  fileMetaData: DocumentMetaData,
): Promise<{ oldR2Key: string | null }> {
  const item = await getChecklistItem(itemId);
  if (!item) throw new Error('Unauthorised');

  return await db.transaction(async (tx) => {
    const existing = await tx.query.document.findFirst({
      where: (table, { eq }) => eq(table.checklistItemId, itemId),
    });

    if (existing) {
      await tx.delete(document).where(eq(document.id, existing.id));
      await tx
        .insert(r2PendingDelete)
        .values({ practiceId: item.practiceId, r2Key: existing.r2Key });
    }

    await tx.insert(document).values({
      practiceId: item.practiceId,
      checklistItemId: itemId,
      r2Key: documentKey,
      originalFileName: fileMetaData.originalFileName,
      mimeType: fileMetaData.mimeType,
      size: fileMetaData.size,
    });

    return { oldR2Key: existing?.r2Key ?? null };
  });
}

export async function removeDocument(itemId: string) {
  const item = await getChecklistItem(itemId);
  if (!item) throw new Error('Unauthorised');

  const existing = await db.query.document.findFirst({
    where: (table, { eq }) => eq(table.checklistItemId, itemId),
  });
  if (!existing) throw new Error('No document found');

  await db.transaction(async (tx) => {
    await tx.delete(document).where(eq(document.id, existing.id));
    await tx.insert(r2PendingDelete).values({ practiceId: item.practiceId, r2Key: existing.r2Key });
  });

  try {
    await deleteObject(existing.r2Key);
    await deletePendingDelete(existing.r2Key);
  } catch (e) {
    console.error('Immediate R2 delete failed — will be retried by cleanup job:', e);
  }
}
