import { db } from './index';
import { document } from './schema';
import { eq } from 'drizzle-orm';

export interface InsertDocumentInput {
  practiceId: string;
  checklistItemId: string;
  r2Key: string;
  originalFileName: string;
  mimeType: string;
  size: number;
}

export async function insertDocument(input: InsertDocumentInput): Promise<void> {
  await db.insert(document).values({
    practiceId: input.practiceId,
    checklistItemId: input.checklistItemId,
    r2Key: input.r2Key,
    originalFileName: input.originalFileName,
    mimeType: input.mimeType,
    size: input.size,
  });
}

export async function deleteDocument(documentId: string) {
  const [deleted] = await db.delete(document).where(eq(document.id, documentId)).returning();
  return deleted;
}

export async function getDocumentByChecklistItemId(checklistItemId: string) {
  return await db.query.document.findFirst({
    where: (table, { eq }) => eq(table.checklistItemId, checklistItemId),
  });
}

export async function getDocument(documentId: string) {
  return await db.query.document.findFirst({
    where: (table, { eq }) => eq(table.id, documentId),
  });
}
