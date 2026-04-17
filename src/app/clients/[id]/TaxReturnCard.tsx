'use client';

import { MTDTaxReturn, SA100TaxReturn } from '@/types/clients';

// TODO: remove this when we move to real data and update to internal models vs api models
type TaxReturnCardProps =
  | (Omit<SA100TaxReturn, 'deadline'> & { deadline: string; name: string })
  | (Omit<MTDTaxReturn, 'deadline'> & { deadline: string; name: string });

export default function Card({
  name,
  id,
  deadline,
  status,
  startTaxYear,
  checkList,
  type,
}: TaxReturnCardProps) {
  return (
    <div>
      <p>{name}</p>
      <p>{deadline}</p>
      <p>{status}</p>
      <p>{startTaxYear}</p>
      <p>{type}</p>
    </div>
  );
}
