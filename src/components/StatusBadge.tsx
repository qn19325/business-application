import { Status } from '@/types/clients';

const statusDisplay: Record<Status, { color: string; label: string }> = {
  not_started: { color: 'bg-slate-500', label: 'Not Started' },
  in_progress: { color: 'bg-blue-500', label: 'In Progress' },
  awaiting_client: { color: 'bg-amber-400', label: 'Awaiting Client' },
  ready_to_file: { color: 'bg-indigo-500', label: 'Ready To File' },
  filed: { color: 'bg-green-500', label: 'Filed' },
};

interface StatusBadgeProps {
  status: Status;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <div className="flex flex-row">
      <div className={`my-auto mr-1 h-3 w-3 rounded-full ${statusDisplay[status].color}`}></div>
      <div>{statusDisplay[status].label}</div>
    </div>
  );
}
