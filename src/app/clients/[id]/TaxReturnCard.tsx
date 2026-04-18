'use client';

import { MTDTaxReturn, SA100TaxReturn } from '@/types/clients';
import { useState } from 'react';

// TODO: remove this when we move to real data and update to internal models vs api models
export type TaxReturnCardProps =
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
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <p onClick={() => setIsExpanded((isExpanded) => !isExpanded)}>{name}</p>
      <p>{deadline}</p>
      <p>{status}</p>
      <p>{startTaxYear}</p>
      <p>{type}</p>
      {isExpanded &&
        checkList.map((item) => {
          return (
            <div key={item.text}>
              <div>{item.text}</div>
              <div className={`${item.received ? 'bg-green-500' : 'bg-red-500'} h-4 w-4`}></div>
            </div>
          );
        })}
    </div>
  );
}
