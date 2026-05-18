import { describe, expect, it } from 'vitest';

import {
  MtdSubmissionStatus,
  Regime,
  Status,
  SubmissionType,
  type ChecklistItem,
} from '@/types/clients';

import {
  mapChecklist,
  mapClient,
  mapTaxReturn,
  type ChecklistItemRow,
  type ClientRow,
  type TaxReturnRow,
} from './clients';

function makeChecklistItemRow(
  num = 0,
  overrides: Partial<ChecklistItemRow> = {},
): ChecklistItemRow {
  return {
    id: `checklistItemId${num}`,
    label: `Checklist Item ${num}`,
    done: false,
    document: {
      id: `document ${num}`,
      originalFileName: `FileName${num}`,
      mimeType: 'application/pdf',
      size: 10_485_760,
    },
    ...overrides,
  };
}

function makeTaxReturnRow(num = 0, overrides: Partial<TaxReturnRow> = {}): TaxReturnRow {
  return {
    regime: Regime.sa100,
    id: `taxReturnId${num}`,
    taxYear: 2000 + num,
    status: Status.not_started,
    mtdSubmissions: [],
    checklistItems: [],
    ...overrides,
  };
}

function makeClientRow(num = 0, overrides: Partial<ClientRow> = {}): ClientRow {
  return {
    id: `clientId${num}`,
    niNumber: `AB${num}${num}CD${num}${num}E`,
    firstName: `First${num}`,
    lastName: `Last${num}`,
    email: `first${num}@example.com`,
    phoneNumber: `0${num}000000000`,
    notes: null,
    taxReturns: [],
    ...overrides,
  };
}

const baseMappedChecklistItem: ChecklistItem = {
  id: 'checklistItemId0',
  text: 'Checklist Item 0',
  done: false,
  document: {
    id: 'document 0',
    originalFileName: 'FileName0',
    mimeType: 'application/pdf',
    size: 10_485_760,
  },
};

const baseMappedTaxReturn = {
  id: 'taxReturnId0',
  taxYear: 2000,
  status: Status.not_started,
  checklist: [],
};

const baseMappedClient = {
  id: 'clientId0',
  niNumber: 'AB00CD00E',
  firstName: 'First0',
  lastName: 'Last0',
  email: 'first0@example.com',
  phoneNumber: '00000000000',
  notes: null,
  taxReturns: [],
};

describe('mapChecklist', () => {
  describe('with an empty array', () => {
    it('returns any empty array', () => expect(mapChecklist([])).toStrictEqual([]));
  });
  describe('with a populated array', () => {
    describe('and an item with no document', () => {
      it('returns the correctly mapped array', () => {
        expect(mapChecklist([makeChecklistItemRow(0, { document: null })])).toEqual([
          { ...baseMappedChecklistItem, document: undefined },
        ]);
      });
    });
    describe('and an item with a document', () => {
      it('returns the correctly mapped array', () => {
        expect(mapChecklist([makeChecklistItemRow(0)])).toEqual([baseMappedChecklistItem]);
      });
    });
  });
});

describe('mapTaxReturn', () => {
  describe('sa100 regime', () => {
    it('returns a correctly mapped SA100 tax return', () => {
      expect(mapTaxReturn(makeTaxReturnRow(0))).toEqual({
        ...baseMappedTaxReturn,
        regime: Regime.sa100,
      });
    });
    it('maps checklist items', () => {
      const row = makeTaxReturnRow(0, { checklistItems: [makeChecklistItemRow(0)] });
      expect(mapTaxReturn(row)).toEqual({
        ...baseMappedTaxReturn,
        regime: Regime.sa100,
        checklist: [baseMappedChecklistItem],
      });
    });
  });
  describe('mtd regime', () => {
    it('returns a correctly mapped MTD tax return with submissions', () => {
      const row = makeTaxReturnRow(0, {
        regime: Regime.mtd,
        mtdSubmissions: [
          {
            id: 'submissionId0',
            submissionType: SubmissionType.q_1,
            status: MtdSubmissionStatus.pending,
          },
        ],
      });
      expect(mapTaxReturn(row)).toEqual({
        ...baseMappedTaxReturn,
        regime: Regime.mtd,
        submissions: [
          {
            id: 'submissionId0',
            submissionType: SubmissionType.q_1,
            status: MtdSubmissionStatus.pending,
          },
        ],
      });
    });
  });
});

describe('mapClient', () => {
  describe('with no tax returns', () => {
    it('returns a correctly mapped client', () => {
      expect(mapClient(makeClientRow(0))).toEqual(baseMappedClient);
    });
  });
  describe('with null optional fields', () => {
    it('passes null email and phoneNumber through unchanged', () => {
      const row = makeClientRow(0, { email: null, phoneNumber: null });
      expect(mapClient(row)).toEqual({ ...baseMappedClient, email: null, phoneNumber: null });
    });
  });
  describe('with tax returns', () => {
    it('maps tax returns via mapTaxReturn', () => {
      const row = makeClientRow(0, { taxReturns: [makeTaxReturnRow(0)] });
      expect(mapClient(row)).toEqual({
        ...baseMappedClient,
        taxReturns: [{ ...baseMappedTaxReturn, regime: Regime.sa100 }],
      });
    });
  });
});
