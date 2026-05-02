import { type } from 'arktype';
import { Regime } from '@/types/clients';

export const clientInputSchema = type({
  firstName: 'string >= 1',
  lastName: 'string >= 1',
  niNumber: type('string')
    .pipe((s) => s.replace(/\s+/g, '').toUpperCase())
    .to(/^[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z]\d{6}[A-D]$/),
  email: type('string')
    .pipe((s) => s || undefined)
    .to('string.email | undefined'),
  phoneNumber: type('string')
    .pipe((s) => s || undefined)
    .to('string >= 1 | undefined'),
  regime: type.enumerated(...Object.values(Regime)),
});
export type CreateClientInput = typeof clientInputSchema.infer;
