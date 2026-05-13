import { Client, Status } from '@/types/clients';
import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';
import {
  daysTillNextDeadline,
  firstUnfiledReturn,
  formatDate,
  mostRecentReturn,
} from '@/logic/tax-return';
import { nextDeadline } from '@/logic/deadlines';
import RegimeBadge from '@/components/RegimeBadge';
import { cols } from '@/app/clients/clientsGrid';
import Chevron from '@/components/Chevron';

interface ClientListItemProps {
  client: Client;
}

export default function ClientListItem(props: ClientListItemProps) {
  const unfiledReturn = firstUnfiledReturn(props.client.taxReturns);
  const deadlineDate = unfiledReturn ? nextDeadline(unfiledReturn) : null;
  const taxReturn = mostRecentReturn(props.client.taxReturns);

  return (
    <Link
      href={`/clients/${props.client.id}`}
      className={`${cols} items-center border-b border-slate-200 bg-white py-3 transition-colors hover:bg-slate-100`}
    >
      <div className="flex gap-2">
        <div className={`h-5 w-5 rounded-full bg-blue-300`} />
        <div className="text-sm font-medium text-slate-900">
          {props.client.firstName} {props.client.lastName}
        </div>
      </div>
      {taxReturn && <RegimeBadge regime={taxReturn.regime} />}
      {deadlineDate && (
        <div>
          <div className="text-sm font-medium text-slate-900">{formatDate(deadlineDate)}</div>
          <div className="mt-0.5 text-xs text-slate-400">{`${daysTillNextDeadline(deadlineDate)} days`}</div>
        </div>
      )}
      <StatusBadge status={unfiledReturn ? unfiledReturn.status : Status.filed} />
      <Chevron />
    </Link>
  );
}
