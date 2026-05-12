const TAX_YEAR_DEADLINE_MONTH_NUM = 4;
const TAX_YEAR_DEADLINE_DAY_NUM = 5;

export function currentTaxYear(today: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(today);

  const year = Number(parts.find((p) => p.type === 'year')!.value);
  const month = Number(parts.find((p) => p.type === 'month')!.value);
  const day = Number(parts.find((p) => p.type === 'day')!.value);

  if (
    month < TAX_YEAR_DEADLINE_MONTH_NUM ||
    (month === TAX_YEAR_DEADLINE_MONTH_NUM && day <= TAX_YEAR_DEADLINE_DAY_NUM)
  ) {
    return year - 1;
  }
  return year;
}
