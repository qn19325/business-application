import { Client, Status, SA100TaxReturn, MTDTaxReturn } from '@/types/clients';

export function nextUnfiledReturn(client: Client): SA100TaxReturn | MTDTaxReturn | null {
  const unfiledReturn = client.taxReturns.find((taxReturn) => taxReturn.status !== Status.filed);

  return unfiledReturn ?? null;
}
