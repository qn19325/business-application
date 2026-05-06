import { getCurrentPracticeId } from '@/lib/auth';
import { db } from './index';
import { r2PendingDelete } from './schema';
import { eq } from 'drizzle-orm';

type DocumentRow = { id: string; r2Key: string };

export async function getDocument(documentId: string): Promise<DocumentRow | undefined> {
  const practiceId = await getCurrentPracticeId();
  const row = await db.query.document.findFirst({
    where: (table, { eq, and }) => and(eq(table.practiceId, practiceId), eq(table.id, documentId)),
  });
  return row ? { id: row.id, r2Key: row.r2Key } : undefined;
}

// No practiceId filter — this is a global cron operation that processes all practices.
export async function getPendingDeletes(): Promise<(typeof r2PendingDelete.$inferSelect)[]> {
  return await db.select().from(r2PendingDelete);
}

export async function deletePendingDelete(r2Key: string): Promise<void> {
  await db.delete(r2PendingDelete).where(eq(r2PendingDelete.r2Key, r2Key));
}
