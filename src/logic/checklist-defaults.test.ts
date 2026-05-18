import { describe, expect, it } from 'vitest';

import { Regime } from '@/types/clients';
import { DocumentType } from '@/types/documents';

import { getDefaultChecklist } from './checklist-defaults';

const sa100Checklist = [
  { documentType: DocumentType.p60, label: 'P60 (employment income)' },
  { documentType: DocumentType.p11d, label: 'P11D (benefits in kind, if applicable)' },
  { documentType: DocumentType.bank_statements, label: 'Bank statements' },
  { documentType: DocumentType.self_employment, label: 'Self-employment income and expenses' },
  { documentType: DocumentType.rental, label: 'Rental income and expenses' },
  { documentType: DocumentType.dividends, label: 'Dividend certificates' },
  { documentType: DocumentType.pension, label: 'Pension contribution statements' },
  { documentType: DocumentType.capital_gains, label: 'Capital gains records' },
];

const mtdChecklist = [
  { documentType: DocumentType.income, label: 'Sales/income records' },
  { documentType: DocumentType.expenses, label: 'Business expense receipts' },
  { documentType: DocumentType.bank_statements, label: 'Bank statements' },
  { documentType: DocumentType.mileage_log, label: 'Mileage log (if claiming vehicle expenses)' },
];

describe('getDefaultChecklist', () => {
  describe('mtd regime', () => {
    it('returns the correct list', () => {
      expect(getDefaultChecklist(Regime.mtd)).toEqual(mtdChecklist);
    });
  });
  describe('sa100 regime', () => {
    it('returns the correct list', () => {
      expect(getDefaultChecklist(Regime.sa100)).toEqual(sa100Checklist);
    });
  });
});
