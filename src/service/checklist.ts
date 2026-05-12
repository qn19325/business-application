import * as checklistRepo from '@/repo/checklist-items';

async function loadOwnedItem(practiceId: string, itemId: string, clientId?: string) {
  const item = await checklistRepo.getChecklistItemOwnership(practiceId, itemId);
  if (!item) throw new Error('Unauthorised');
  if (clientId && item.clientId !== clientId) throw new Error('Unauthorised');
  return item;
}

export async function markItemReceived(
  practiceId: string,
  itemId: string,
  clientId?: string,
): Promise<void> {
  const item = await loadOwnedItem(practiceId, itemId, clientId);
  await checklistRepo.updateChecklistItemDone(practiceId, item.id, true);
}

export async function markItemOutstanding(
  practiceId: string,
  itemId: string,
  clientId?: string,
): Promise<void> {
  const item = await loadOwnedItem(practiceId, itemId, clientId);
  await checklistRepo.updateChecklistItemDone(practiceId, item.id, false);
}
