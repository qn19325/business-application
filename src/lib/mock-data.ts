import { Client, Status, SubmissionType } from '@/types/clients';

const mtdClient: Client = {
  id: 'mtd0',
  niNumber: `AB 00 00 00 C`,
  name: `Client MTD 0`,
  email: `clientMTD0@mail.com`,
  taxReturns: [
    {
      deadline: new Date('2025-08-07'),
      status: Status.filed,
      startTaxYear: 2024,
      submissionType: SubmissionType.q_1,
    },
    {
      deadline: new Date('2025-11-07'),
      status: Status.in_progress,
      startTaxYear: 2024,
      submissionType: SubmissionType.q_2,
    },
    {
      deadline: new Date('2026-02-07'),
      status: Status.not_started,
      startTaxYear: 2024,
      submissionType: SubmissionType.q_3,
    },
  ],
  regime: 'MTD',
};

const sa100Client: Client = {
  id: 'sa1000',
  niNumber: `AB 00 00 01 C`,
  name: `Client SA100 0`,
  email: `clientSA1000@mail.com`,
  taxReturns: [
    {
      deadline: new Date('2026-01-31'),
      status: Status.not_started,
      startTaxYear: 2025,
    },
  ],
  regime: 'SA100',
};

export const clients: Client[] = [mtdClient, sa100Client];
