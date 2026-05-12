import { DeadlineEntry } from '@/types/calendarModels';
import {
  Client,
  Status,
  Regime,
  SubmissionType,
  TaxReturn,
  MTDSubmission,
  MtdSubmissionStatus,
} from '@/types/clients';
import { mtdSubmissionDeadlines, sa100Deadline } from '@/logic/deadlines';

export function nextDeadline(taxReturn: TaxReturn): Date | null {
  if (taxReturn.regime === Regime.sa100) {
    return taxReturn.status !== Status.filed ? sa100Deadline(taxReturn.taxYear) : null;
  }
  const unfiledSubmission = firstUnfiledSubmission(taxReturn.submissions);
  if (!unfiledSubmission) return null;
  const deadlines = mtdSubmissionDeadlines(taxReturn.taxYear);
  const match = deadlines.find((d) => d.submissionType === unfiledSubmission.submissionType);
  if (!match) throw new Error(`No deadline for submissionType ${unfiledSubmission.submissionType}`);
  return match.deadline;
}

export function isFiled(taxReturn: TaxReturn): boolean {
  return taxReturn.status === Status.filed;
}

export function regimeLabel(taxReturn: TaxReturn): string {
  return taxReturn.regime === Regime.mtd ? 'MTD' : 'SA100';
}

export function getDeadlineEntries(clients: Client[]): DeadlineEntry[] {
  const deadlineEntries: DeadlineEntry[] = clients.flatMap((client) => {
    return client.taxReturns.flatMap((taxReturn): DeadlineEntry[] => {
      if (taxReturn.regime === Regime.mtd) {
        const submissionDeadlines = mtdSubmissionDeadlines(taxReturn.taxYear);
        return taxReturn.submissions.map((submission) => {
          const submissionDeadline = submissionDeadlines.find(
            (deadline) => deadline.submissionType === submission.submissionType,
          );
          if (!submissionDeadline) {
            throw new Error(`No deadline for submissionType ${submission.submissionType}`);
          }

          return {
            name: `${client.firstName} ${client.lastName}`,
            id: submission.id,
            status: submission.status,
            deadline: submissionDeadline.deadline,
            taxYear: taxReturn.taxYear,
            regime: taxReturn.regime,
            submissionType: submission.submissionType,
          };
        });
      }

      return [
        {
          name: `${client.firstName} ${client.lastName}`,
          id: taxReturn.id,
          deadline: sa100Deadline(taxReturn.taxYear),
          status: taxReturn.status,
          taxYear: taxReturn.taxYear,
          regime: taxReturn.regime,
        },
      ];
    });
  });
  return deadlineEntries.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
}

export function firstUnfiledReturn(taxReturns: TaxReturn[]): TaxReturn | undefined {
  return taxReturns.find((taxReturn) => taxReturn.status !== Status.filed);
}

export function formatDeadline(d: Date): string {
  return d.toLocaleDateString('en-GB', { timeZone: 'UTC' });
}

export const mtdSubmissionTypes = [
  SubmissionType.q_1,
  SubmissionType.q_2,
  SubmissionType.q_3,
  SubmissionType.q_4,
];

export function mostRecentReturn(taxReturns: TaxReturn[]): TaxReturn | undefined {
  if (!taxReturns.length) return undefined;
  return taxReturns.reduce((prev, cur) => {
    return prev.taxYear > cur.taxYear ? prev : cur;
  });
}

function firstUnfiledSubmission(submissions: MTDSubmission[]): MTDSubmission | undefined {
  return submissions.find((submission) => submission.status !== MtdSubmissionStatus.submitted);
}
