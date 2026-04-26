export const DocumentType = {
  p60: 'p60',
  p11d: 'p11d',
  bank_statements: 'bank_statements',
  self_employment: 'self_employment',
  rental: 'rental',
  dividends: 'dividends',
  pension: 'pension',
  capital_gains: 'capital_gains',
  income: 'income',
  expenses: 'expenses',
  mileage_log: 'mileage_log',
} as const;
export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];
