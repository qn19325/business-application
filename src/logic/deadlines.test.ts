import { describe, expect, it } from 'vitest';

import type { MTDDeadlineEntry, SA100DeadlineEntry } from '@/types/calendar';
import type { Client, MTDSubmission, MTDTaxReturn, SA100TaxReturn } from '@/types/clients';
import { MtdSubmissionStatus, Regime, Status, SubmissionType } from '@/types/clients';

import {
  deadlineSubLine,
  getDeadlineEntries,
  groupDeadlinesByMonth,
  mtdPeriod,
  mtdSubmissionDeadlines,
  nextDeadline,
  sa100Deadline,
  taxYearShort,
} from './deadlines';

function makeReturn(overrides: Partial<SA100TaxReturn> = {}): SA100TaxReturn {
  return {
    id: '1',
    taxYear: 2024,
    checklist: [],
    regime: Regime.sa100,
    status: Status.not_started,
    ...overrides,
  };
}

function makeMtdReturn(overrides: Partial<MTDTaxReturn> = {}): MTDTaxReturn {
  return {
    id: '1',
    taxYear: 2024,
    checklist: [],
    regime: Regime.mtd,
    status: Status.not_started,
    submissions: [],
    ...overrides,
  };
}

function makeClient(overrides: Partial<Client> = {}): Client {
  return {
    id: 'client-1',
    niNumber: 'AB 12 34 56 C',
    firstName: 'Jane',
    lastName: 'Smith',
    email: null,
    phoneNumber: null,
    taxReturns: [],
    notes: null,
    ...overrides,
  };
}

describe('sa100Deadline', () => {
  describe('standard tax year', () => {
    it('returns 31 Jan of the year after the tax year', () => {
      expect(sa100Deadline(2024)).toEqual(new Date(Date.UTC(2025, 0, 31)));
    });
  });
  describe('century boundary', () => {
    it('handles a tax year where taxYear + 1 rolls over a century boundary', () => {
      expect(sa100Deadline(1999)).toEqual(new Date(Date.UTC(2000, 0, 31)));
    });
  });
});

describe('mtdSubmissionDeadlines', () => {
  describe('all quarterly types including cross-year deadlines', () => {
    it('returns 4 entries with the correct submissionType and deadline dates, including cross-year months for q_3 and q_4', () => {
      const mtdSubmissionDeadlinesArray: {
        submissionType: Exclude<SubmissionType, 'eops' | 'final_declaration'>;
        deadline: Date;
      }[] = [
        { submissionType: 'q_1', deadline: new Date(Date.UTC(2024, 7, 7)) },
        { submissionType: 'q_2', deadline: new Date(Date.UTC(2024, 10, 7)) },
        { submissionType: 'q_3', deadline: new Date(Date.UTC(2025, 1, 7)) },
        { submissionType: 'q_4', deadline: new Date(Date.UTC(2025, 4, 7)) },
      ];
      expect(mtdSubmissionDeadlines(2024)).toEqual(mtdSubmissionDeadlinesArray);
    });
  });
});

describe('nextDeadline', () => {
  describe('with an sa100 return', () => {
    it('when status is filed it returns null', () => {
      expect(nextDeadline(makeReturn({ status: Status.filed }))).toBe(null);
    });
    it('when status is not filed it returns the correct deadline date', () => {
      expect(nextDeadline(makeReturn({ status: Status.not_started }))).toEqual(
        new Date(Date.UTC(2025, 0, 31)),
      );
    });
  });
  describe('with an mtd return', () => {
    it('when there are no unfiled submissions it returns null', () => {
      expect(nextDeadline(makeMtdReturn())).toBe(null);
    });
    it('when the unfiled submission is a non-quarterly type (eops or final_declaration) it returns null', () => {
      const submission: MTDSubmission = {
        id: 'sub-1',
        submissionType: SubmissionType.eops,
        status: MtdSubmissionStatus.pending,
      };
      expect(nextDeadline(makeMtdReturn({ submissions: [submission] }))).toBe(null);
    });
    it('when there is an unfiled quarterly submission it returns the correct deadline date', () => {
      const submission: MTDSubmission = {
        id: 'sub-1',
        submissionType: SubmissionType.q_1,
        status: MtdSubmissionStatus.pending,
      };
      expect(nextDeadline(makeMtdReturn({ submissions: [submission] }))).toEqual(
        new Date(Date.UTC(2024, 7, 7)),
      );
    });
  });
});

describe('getDeadlineEntries', () => {
  it('with an empty array returns an empty array', () => {
    expect(getDeadlineEntries([])).toStrictEqual([]);
  });
  describe('with a purely mtd client', () => {
    it('maps the returns correctly', () => {
      const submission: MTDSubmission = {
        id: 'sub-1',
        submissionType: SubmissionType.q_1,
        status: MtdSubmissionStatus.pending,
      };
      const client = makeClient({ taxReturns: [makeMtdReturn({ submissions: [submission] })] });
      expect(getDeadlineEntries([client])).toEqual([
        {
          name: 'Jane Smith',
          id: 'sub-1',
          clientId: 'client-1',
          status: MtdSubmissionStatus.pending,
          deadline: new Date(Date.UTC(2024, 7, 7)),
          taxYear: 2024,
          regime: Regime.mtd,
          submissionType: SubmissionType.q_1,
        },
      ]);
    });
    it('excludes non-quarterly submission types (eops and final_declaration)', () => {
      const submissions: MTDSubmission[] = [
        { id: 'sub-1', submissionType: SubmissionType.eops, status: MtdSubmissionStatus.pending },
        {
          id: 'sub-2',
          submissionType: SubmissionType.final_declaration,
          status: MtdSubmissionStatus.pending,
        },
      ];
      const client = makeClient({ taxReturns: [makeMtdReturn({ submissions })] });
      expect(getDeadlineEntries([client])).toEqual([]);
    });
  });
  describe('with a purely sa100 client', () => {
    it('maps the returns correctly', () => {
      const client = makeClient({ taxReturns: [makeReturn({ id: 'return-1' })] });
      expect(getDeadlineEntries([client])).toEqual([
        {
          name: 'Jane Smith',
          id: 'return-1',
          clientId: 'client-1',
          deadline: new Date(Date.UTC(2025, 0, 31)),
          status: Status.not_started,
          taxYear: 2024,
          regime: Regime.sa100,
        },
      ]);
    });
  });
  describe('with a mixed mtd and sa100 client', () => {
    it('maps the returns correctly', () => {
      const submission: MTDSubmission = {
        id: 'sub-1',
        submissionType: SubmissionType.q_1,
        status: MtdSubmissionStatus.pending,
      };
      const client = makeClient({
        taxReturns: [makeReturn({ id: 'return-1' }), makeMtdReturn({ submissions: [submission] })],
      });
      expect(getDeadlineEntries([client])).toEqual([
        {
          name: 'Jane Smith',
          id: 'sub-1',
          clientId: 'client-1',
          status: MtdSubmissionStatus.pending,
          deadline: new Date(Date.UTC(2024, 7, 7)),
          taxYear: 2024,
          regime: Regime.mtd,
          submissionType: SubmissionType.q_1,
        },
        {
          name: 'Jane Smith',
          id: 'return-1',
          clientId: 'client-1',
          deadline: new Date(Date.UTC(2025, 0, 31)),
          status: Status.not_started,
          taxYear: 2024,
          regime: Regime.sa100,
        },
      ]);
    });
  });
  it('returns entries sorted by deadline ascending', () => {
    const client = makeClient({
      taxReturns: [
        makeReturn({ id: 'return-2025', taxYear: 2024 }),
        makeReturn({ id: 'return-2024', taxYear: 2023 }),
      ],
    });
    expect(getDeadlineEntries([client]).map((e) => e.id)).toEqual(['return-2024', 'return-2025']);
  });
});

describe('mtdPeriod', () => {
  it('should return the correct string for q_1', () => {
    expect(mtdPeriod[SubmissionType.q_1](2024)).toBe('6 Apr - 5 Jul 2024');
  });
  it('should return the correct string for q_2', () => {
    expect(mtdPeriod[SubmissionType.q_2](2024)).toBe('6 Jul - 5 Oct 2024');
  });
  it('should return the correct string for q_3', () => {
    expect(mtdPeriod[SubmissionType.q_3](2024)).toBe('6 Oct 2024 - 5 Jan 2025');
  });
  it('should return the correct string for q_4', () => {
    expect(mtdPeriod[SubmissionType.q_4](2024)).toBe('6 Jan - 5 Apr 2025');
  });
  it('should return the correct string for eops', () => {
    expect(mtdPeriod[SubmissionType.eops](2024)).toBe('2024-2025');
  });
  it('should return the correct string for final_declaration', () => {
    expect(mtdPeriod[SubmissionType.final_declaration](2024)).toBe('2024-2025');
  });
});

describe('taxYearShort', () => {
  describe('standard tax year', () => {
    it('returns the correct short format string', () => {
      expect(taxYearShort(2024)).toBe('2024-25');
    });
  });
});

describe('deadlineSubLine', () => {
  describe('with a mtd entry', () => {
    it('returns the correct string', () => {
      const entry: MTDDeadlineEntry = {
        name: 'Jane Smith',
        id: 'sub-1',
        clientId: 'client-1',
        deadline: new Date(Date.UTC(2024, 7, 7)),
        taxYear: 2024,
        regime: Regime.mtd,
        status: MtdSubmissionStatus.pending,
        submissionType: SubmissionType.q_1,
      };
      expect(deadlineSubLine(entry)).toBe('Q1 2024-25 · 6 Apr - 5 Jul 2024');
    });
  });
  describe('with a sa100 entry', () => {
    it('returns the correct string', () => {
      const entry: SA100DeadlineEntry = {
        name: 'Jane Smith',
        id: 'return-1',
        clientId: 'client-1',
        deadline: new Date(Date.UTC(2025, 0, 31)),
        taxYear: 2024,
        regime: Regime.sa100,
        status: Status.not_started,
      };
      expect(deadlineSubLine(entry)).toBe('SA100 2024-25 · 6 Apr 2024 - 5 Apr 2025');
    });
  });
});

describe('groupDeadlinesByMonth', () => {
  describe('empty input', () => {
    it('returns an empty object', () => {
      expect(groupDeadlinesByMonth([])).toEqual({});
    });
  });
  describe('populated input', () => {
    it('groups entries by month string', () => {
      const aug7Entry: MTDDeadlineEntry = {
        name: 'Jane Smith',
        id: 'sub-1',
        clientId: 'client-1',
        deadline: new Date(Date.UTC(2024, 7, 7)),
        taxYear: 2024,
        regime: Regime.mtd,
        status: MtdSubmissionStatus.pending,
        submissionType: SubmissionType.q_1,
      };
      const aug15Entry: SA100DeadlineEntry = {
        name: 'Jane Smith',
        id: 'return-1',
        clientId: 'client-1',
        deadline: new Date(Date.UTC(2024, 7, 15)),
        taxYear: 2024,
        regime: Regime.sa100,
        status: Status.not_started,
      };
      const novEntry: MTDDeadlineEntry = {
        name: 'Jane Smith',
        id: 'sub-2',
        clientId: 'client-1',
        deadline: new Date(Date.UTC(2024, 10, 7)),
        taxYear: 2024,
        regime: Regime.mtd,
        status: MtdSubmissionStatus.pending,
        submissionType: SubmissionType.q_2,
      };
      expect(groupDeadlinesByMonth([aug7Entry, aug15Entry, novEntry])).toEqual({
        'August 2024': [aug7Entry, aug15Entry],
        'November 2024': [novEntry],
      });
    });
  });
});
