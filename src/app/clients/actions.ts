'use server';

import { insertClient, type CreateClientInput } from '@/db/clients';
import { Regime } from '@/types/clients';
import { revalidatePath } from 'next/cache';

export type CreateClientResult = { success: true } | { success: false; error: string };

export default async function createClient(
  _prevState: CreateClientResult | null,
  formData: FormData,
): Promise<CreateClientResult> {
  const input: CreateClientInput = {
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    niNumber: formData.get('niNumber') as string,
    email: formData.get('email') as string,
    phoneNumber: (formData.get('phoneNumber') as string) || undefined,
    regime: formData.get('regime') as Regime,
  };

  try {
    await insertClient(input);
    revalidatePath('/clients');
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      console.error('createClient failed:', error.message);
    } else {
      console.error('createClient failed with non-Error', error);
    }
    return { success: false, error: 'Failed to create client' };
  }
}
