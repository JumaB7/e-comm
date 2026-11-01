export type ChartKind = 'profit' | 'trend' | 'category';

export interface SalesDelta {
  text: string;
  up: boolean;
  flat: boolean;
}

export interface SalesStat {
  label: string;
  value: string;
  change: SalesDelta;
}

export interface SalesMonthPoint {
  month: string;
  salesRands: number;
  profitRands: number;
}

export interface SalesCategory {
  name: string;
  amount: string;
  share: number;
  amountRands: number;
}

export interface SalesReport {
  period: string;
  profitTotal: string;
  profitNote: string;
  months: SalesMonthPoint[];
  margin: string;
  marginNote: string;
  marginHealthy: boolean;
  grossProfit: string;
  productCosts: string;
  categories: SalesCategory[];
  repeatShare: string;
  repeatChange: SalesDelta;
  repeatFilled: number;
  newCustomers: number;
  returningCustomers: number;
  refundRate: string;
  stats: SalesStat[];
}
