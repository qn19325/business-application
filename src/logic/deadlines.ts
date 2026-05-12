import { SubmissionType } from '@/types/clients';

const MTD_Q1_MMDD = '08-07';
const MTD_Q2_MMDD = '11-07';
const MTD_Q3_MMDD = '02-07';
const MTD_Q4_MMDD = '05-07';

export function sa100Deadline(taxYear: number): Date {
  return new Date(Date.UTC(taxYear + 1, 0, 31));
}

export function mtdSubmissionDeadlines(
  taxYear: number,
): { submissionType: SubmissionType; deadline: Date }[] {
  return [
    { submissionType: SubmissionType.q_1, deadline: new Date(`${taxYear}-${MTD_Q1_MMDD}`) },
    { submissionType: SubmissionType.q_2, deadline: new Date(`${taxYear}-${MTD_Q2_MMDD}`) },
    { submissionType: SubmissionType.q_3, deadline: new Date(`${taxYear + 1}-${MTD_Q3_MMDD}`) },
    { submissionType: SubmissionType.q_4, deadline: new Date(`${taxYear + 1}-${MTD_Q4_MMDD}`) },
  ];
}
