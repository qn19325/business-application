import { type } from 'arktype';
import { Regime } from '@/types/clients';

export const NI_NUMBER_PATTERN =
  '[A-CEGHJ-PR-TW-Za-ceghj-pr-tw-z]{2}[\\s]?[0-9]{2}[\\s]?[0-9]{2}[\\s]?[0-9]{2}[\\s]?[A-Da-d]';
export const NI_NUMBER_REGEX = /^[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z]\d{6}[A-D]$/;

export const clientInputSchema = type({
  firstName: 'string >= 1',
  lastName: 'string >= 1',
  niNumber: type('string')
    .pipe((s) => s.replace(/\s+/g, '').toUpperCase())
    .to(NI_NUMBER_REGEX),
  email: type('string')
    .pipe((s) => s || undefined)
    .to('string.email | undefined'),
  phoneNumber: type('string')
    .pipe((s) => s || undefined)
    .to('string >= 1 | undefined'),
  regime: type.enumerated(...Object.values(Regime)),
});
export type CreateClientInput = typeof clientInputSchema.infer;
