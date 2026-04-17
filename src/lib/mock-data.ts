import { Client, Status, SubmissionType } from '@/types/clients';

const mtdClient: Client = {
  id: 'mtd0',
  niNumber: `AB 00 00 00 C`,
  name: `Client MTD 0`,
  email: `clientMTD0@mail.com`,
  taxReturns: [
    {
      id: 'mtd_0',
      deadline: new Date('2025-08-07'),
      status: Status.filed,
      startTaxYear: 2024,
      submissionType: SubmissionType.q_1,
      checkList: [
        { text: 'Sales/income records for the quarter', received: true },
        { text: 'Business expense receipts for the quarter', received: true },
        { text: 'Bank statements for the quarter', received: false },
        { text: 'Mileage log (if claiming vehicle expenses)', received: false },
      ],
    },
    {
      id: 'mtd_1',
      deadline: new Date('2025-11-07'),
      status: Status.in_progress,
      startTaxYear: 2024,
      submissionType: SubmissionType.q_2,
      checkList: [
        { text: 'Sales/income records for the quarter', received: true },
        { text: 'Business expense receipts for the quarter', received: true },
        { text: 'Bank statements for the quarter', received: false },
        { text: 'Mileage log (if claiming vehicle expenses)', received: false },
      ],
    },
    {
      id: 'mtd_2',
      deadline: new Date('2026-02-07'),
      status: Status.not_started,
      startTaxYear: 2024,
      submissionType: SubmissionType.q_3,
      checkList: [
        { text: 'Sales/income records for the quarter', received: true },
        { text: 'Business expense receipts for the quarter', received: true },
        { text: 'Bank statements for the quarter', received: false },
        { text: 'Mileage log (if claiming vehicle expenses)', received: false },
      ],
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
      id: 'sa100_0',
      deadline: new Date('2026-01-31'),
      status: Status.not_started,
      startTaxYear: 2025,
      checkList: [
        { text: 'P60 (employment income)', received: true },
        { text: 'P11D (benefits in kind, if applicable)', received: true },
        { text: 'Bank statements', received: true },
        { text: 'Self-employment income and expenses (if sole trader)', received: true },
        { text: 'Rental income and expenses (if landlord)', received: false },
        { text: 'Dividend certificates', received: false },
        { text: 'Pension contribution statements', received: false },
        { text: 'Capital gains records (if applicable)', received: false },
      ],
    },
  ],
  regime: 'SA100',
};

export const clients: Client[] = [mtdClient, sa100Client];
