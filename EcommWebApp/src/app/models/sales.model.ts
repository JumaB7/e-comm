export interface SalesMonth {
  month: string;
  profitCents: number;
}

export interface SalesReport {
  totalSales: string;
  orderCount: number;
  profit: string;
  thisMonth: string;
  months: SalesMonth[];
}
