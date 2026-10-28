export interface SalesMonth {
  month: string;
  profitCents: number;
}

export interface SalesReport {
  totalSalesCents: number;
  orderCount: number;
  profitCents: number;
  thisMonthCents: number;
  months: SalesMonth[];
}
